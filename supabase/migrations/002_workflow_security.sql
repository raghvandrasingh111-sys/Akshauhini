do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'hospitals')
    or not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'doctors')
    or not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'patients')
    or not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'opd_visits')
    or not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'consent_requests')
  then
    raise exception 'Migration 2 requires Migration 1 to be applied first';
  end if;
end;
$$;

alter table consent_requests add column if not exists updated_at timestamptz not null default now();
alter table doctors add column if not exists is_active boolean not null default true;
alter table audit_logs add column if not exists actor_user_id uuid references auth.users(id) on delete set null;

create or replace function public.create_or_update_doctor_profile(
  p_id uuid,
  p_full_name text,
  p_email text,
  p_registration_number text,
  p_specialization text,
  p_hospital_id uuid,
  p_role text default 'doctor',
  p_is_active boolean default true,
  p_avatar_url text default null
)
returns doctors
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.doctors (
    id,
    full_name,
    email,
    registration_number,
    specialization,
    hospital_id,
    role,
    is_active,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    p_id,
    p_full_name,
    p_email,
    p_registration_number,
    p_specialization,
    p_hospital_id,
    p_role,
    p_is_active,
    p_avatar_url,
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    registration_number = excluded.registration_number,
    specialization = excluded.specialization,
    hospital_id = excluded.hospital_id,
    role = excluded.role,
    is_active = excluded.is_active,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return (select d from public.doctors d where d.id = p_id);
end;
$$;

grant execute on function public.create_or_update_doctor_profile(
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  boolean,
  text
) to authenticated;

create table if not exists patient_intakes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  opd_visit_id uuid not null references opd_visits(id) on delete cascade,
  language text not null default 'en',
  status text not null default 'in_progress' check (status in ('in_progress', 'complete', 'reviewed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opd_visit_id)
);

create table if not exists intake_answers (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references patient_intakes(id) on delete cascade,
  question_id text not null,
  question text not null,
  answer text not null,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists ayush_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  opd_visit_id uuid not null references opd_visits(id) on delete cascade,
  assessment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(opd_visit_id)
);

create table if not exists authorized_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete cascade,
  hospital_id uuid not null references hospitals(id) on delete cascade,
  consent_request_id uuid not null references consent_requests(id) on delete cascade,
  record_types text[] not null default array[]::text[],
  authorized_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists patient_timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  hospital_id uuid not null references hospitals(id) on delete cascade,
  opd_visit_id uuid references opd_visits(id) on delete set null,
  event_type text not null,
  title text not null,
  description text,
  source_table text,
  source_id uuid,
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clinical_summaries_intake_id_fkey'
      and conrelid = 'public.clinical_summaries'::regclass
  ) then
    alter table clinical_summaries
      add constraint clinical_summaries_intake_id_fkey
      foreign key (intake_id) references patient_intakes(id) on delete set null;
  end if;
end;
$$;

create index if not exists idx_patient_intakes_visit on patient_intakes(opd_visit_id);
create index if not exists idx_intake_answers_intake on intake_answers(intake_id);
create index if not exists idx_authorized_records_lookup on authorized_records(patient_id, doctor_id, expires_at);
create index if not exists idx_timeline_patient_date on patient_timeline_events(patient_id, event_at desc);

drop trigger if exists set_consent_requests_updated_at on consent_requests;
create trigger set_consent_requests_updated_at before update on consent_requests
for each row execute procedure update_updated_at_column();
drop trigger if exists set_patient_intakes_updated_at on patient_intakes;
create trigger set_patient_intakes_updated_at before update on patient_intakes
for each row execute procedure update_updated_at_column();
drop trigger if exists set_ayush_assessments_updated_at on ayush_assessments;
create trigger set_ayush_assessments_updated_at before update on ayush_assessments
for each row execute procedure update_updated_at_column();

create or replace function current_doctor_hospital_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hospital_id from doctors where id = auth.uid();
$$;

create or replace function has_valid_record_access(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from authorized_records ar
    where ar.patient_id = target_patient_id
      and ar.doctor_id = auth.uid()
      and ar.hospital_id = current_doctor_hospital_id()
      and ar.revoked_at is null
      and ar.expires_at > now()
  );
$$;

alter table patient_intakes enable row level security;
alter table intake_answers enable row level security;
alter table ayush_assessments enable row level security;
alter table authorized_records enable row level security;
alter table patient_timeline_events enable row level security;

-- Replace the permissive bootstrap policies with hospital-scoped policies.
drop policy if exists "Doctors can view their hospital records" on hospitals;
drop policy if exists "Doctors can read patients within hospital" on patients;
drop policy if exists "Doctors can read queue records for their hospital" on opd_visits;
drop policy if exists "Doctors can manage consent events for their hospital" on consent_requests;
drop policy if exists "Doctors can manage documents for their hospital" on medical_documents;
drop policy if exists "Doctors can manage summaries for their hospital" on clinical_summaries;
drop policy if exists "Doctors can manage consultations for their hospital" on consultations;
drop policy if exists "Doctors can view ai summaries for their hospital" on ai_clinical_briefs;
drop policy if exists "Doctors can append audit logs" on audit_logs;
drop policy if exists "Doctors can view assigned hospital" on hospitals;
drop policy if exists "Doctors can read hospital patients" on patients;
drop policy if exists "Doctors can read hospital queue" on opd_visits;
drop policy if exists "Doctors can update own queue" on opd_visits;
drop policy if exists "Doctors can create consent requests" on consent_requests;
drop policy if exists "Doctors can read own consent requests" on consent_requests;
drop policy if exists "Doctors can update own consent requests" on consent_requests;
drop policy if exists "Doctors can read consented documents" on medical_documents;
drop policy if exists "Doctors can upload hospital documents" on medical_documents;
drop policy if exists "Doctors can read current hospital summaries" on clinical_summaries;
drop policy if exists "Doctors can update current hospital summaries" on clinical_summaries;
drop policy if exists "Doctors can manage own consultations" on consultations;
drop policy if exists "Doctors can read consented ai briefs" on ai_clinical_briefs;
drop policy if exists "Doctors can append own audit logs" on audit_logs;
drop policy if exists "Doctors can read own audit logs" on audit_logs;
drop policy if exists "Doctors can read current intake" on patient_intakes;
drop policy if exists "Doctors can update current intake" on patient_intakes;
drop policy if exists "Doctors can read intake answers" on intake_answers;
drop policy if exists "Doctors can read current ayush assessments" on ayush_assessments;
drop policy if exists "Doctors can manage own authorizations" on authorized_records;
drop policy if exists "Doctors can read hospital timeline" on patient_timeline_events;

create policy "Doctors can view assigned hospital" on hospitals
for select using (id = current_doctor_hospital_id());

create policy "Doctors can read hospital patients" on patients
for select using (
  exists (
    select 1 from opd_visits v
    where v.patient_id = patients.id
      and v.hospital_id = current_doctor_hospital_id()
  )
);

create policy "Doctors can read hospital queue" on opd_visits
for select using (hospital_id = current_doctor_hospital_id());

create policy "Doctors can update own queue" on opd_visits
for update using (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id())
with check (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id());

create policy "Doctors can create consent requests" on consent_requests
for insert with check (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id());

create policy "Doctors can read own consent requests" on consent_requests
for select using (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id());

create policy "Doctors can update own consent requests" on consent_requests
for update using (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id())
with check (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id());

create policy "Doctors can read consented documents" on medical_documents
for select using (has_valid_record_access(patient_id));

create policy "Doctors can upload hospital documents" on medical_documents
for insert with check (uploaded_by = auth.uid());

create policy "Doctors can read current hospital summaries" on clinical_summaries
for select using (
  exists (select 1 from opd_visits v where v.id = opd_visit_id and v.hospital_id = current_doctor_hospital_id())
);

create policy "Doctors can update current hospital summaries" on clinical_summaries
for update using (verified_by = auth.uid() or exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.doctor_id = auth.uid()
));

create policy "Doctors can manage own consultations" on consultations
for all using (doctor_id = auth.uid() and exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.hospital_id = current_doctor_hospital_id()
)) with check (doctor_id = auth.uid());

create policy "Doctors can read consented ai briefs" on ai_clinical_briefs
for select using (has_valid_record_access(patient_id));

create policy "Doctors can append own audit logs" on audit_logs
for insert with check (actor_user_id = auth.uid() or actor_id = auth.uid());

create policy "Doctors can read own audit logs" on audit_logs
for select using (actor_user_id = auth.uid() or actor_id = auth.uid());

create policy "Doctors can read current intake" on patient_intakes
for select using (exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.hospital_id = current_doctor_hospital_id()
));

create policy "Doctors can update current intake" on patient_intakes
for update using (exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.doctor_id = auth.uid()
));

create policy "Doctors can read intake answers" on intake_answers
for select using (exists (
  select 1 from patient_intakes i join opd_visits v on v.id = i.opd_visit_id
  where i.id = intake_id and v.hospital_id = current_doctor_hospital_id()
));

create policy "Doctors can read current ayush assessments" on ayush_assessments
for select using (exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.hospital_id = current_doctor_hospital_id()
));

create policy "Doctors can manage own authorizations" on authorized_records
for all using (doctor_id = auth.uid() and hospital_id = current_doctor_hospital_id())
with check (
  doctor_id = auth.uid()
  and hospital_id = current_doctor_hospital_id()
  and exists (
    select 1
    from consent_requests cr
    where cr.id = consent_request_id
      and cr.patient_id = authorized_records.patient_id
      and cr.doctor_id = auth.uid()
      and cr.hospital_id = current_doctor_hospital_id()
      and cr.status = 'granted'
      and (cr.expires_at is null or cr.expires_at > now())
  )
);

create policy "Doctors can read hospital timeline" on patient_timeline_events
for select using (hospital_id = current_doctor_hospital_id() and (has_valid_record_access(patient_id) or exists (
  select 1 from opd_visits v where v.id = opd_visit_id and v.doctor_id = auth.uid()
)));

insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Doctors can read medical documents" on storage.objects;
drop policy if exists "Doctors can upload medical documents" on storage.objects;
drop policy if exists "Doctors can delete medical documents" on storage.objects;
drop policy if exists "Doctors can read private medical documents" on storage.objects;
drop policy if exists "Doctors can upload private medical documents" on storage.objects;
drop policy if exists "Doctors can delete own medical documents" on storage.objects;

create policy "Doctors can read private medical documents" on storage.objects
for select to authenticated using (
  bucket_id = 'medical-documents'
  and has_valid_record_access((storage.foldername(name))[2]::uuid)
);

create policy "Doctors can upload private medical documents" on storage.objects
for insert to authenticated with check (
  bucket_id = 'medical-documents'
  and (storage.foldername(name))[1] = current_doctor_hospital_id()::text
  and exists (
    select 1 from opd_visits v
    where v.patient_id = (storage.foldername(name))[2]::uuid
      and v.hospital_id = current_doctor_hospital_id()
  )
);

create policy "Doctors can delete own medical documents" on storage.objects
for delete to authenticated using (
  bucket_id = 'medical-documents'
  and owner_id = auth.uid()::text
);
