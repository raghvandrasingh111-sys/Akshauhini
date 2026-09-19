-- Secure patient accounts, private uploads, and patient-controlled consent.
alter table patients add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;
create index if not exists idx_patients_auth_user on patients(auth_user_id);

create or replace function link_patient_auth_user(p_patient_id text, p_auth_user_id uuid)
returns patients
language plpgsql
security definer
set search_path = public
as $$
declare result patients;
begin
  if auth.uid() is null or auth.uid() <> p_auth_user_id then
    raise exception 'Authenticated patient session required';
  end if;
  if right(regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g'), 10) <> p_patient_id then
    raise exception 'The signed-in phone does not match this Patient ID';
  end if;
  update patients set auth_user_id = p_auth_user_id, updated_at = now()
  where patient_id = p_patient_id
  returning * into result;
  if result.id is null then raise exception 'Patient registration not found'; end if;
  return result;
end;
$$;

create or replace function get_current_patient()
returns patients
language sql
security invoker
set search_path = public
as $$
  select * from patients where auth_user_id = auth.uid() limit 1;
$$;

alter table patients enable row level security;
drop policy if exists "Patients can view own identity" on patients;
create policy "Patients can view own identity" on patients
for select to authenticated using (auth_user_id = auth.uid());

drop policy if exists "Doctors can read hospital patients" on patients;
create policy "Doctors can read hospital patients" on patients
for select to authenticated using (
  auth_user_id = auth.uid()
  or hospital_id = current_doctor_hospital_id()
  or exists (select 1 from opd_visits v where v.patient_id = patients.id and v.hospital_id = current_doctor_hospital_id())
);

-- Patient view/response access to requests addressed to their linked account.
drop policy if exists "Patients can read own consent requests" on consent_requests;
create policy "Patients can read own consent requests" on consent_requests
for select to authenticated using (
  exists (select 1 from patients p where p.id = consent_requests.patient_id and p.auth_user_id = auth.uid())
);

drop policy if exists "Patients can respond to own consent requests" on consent_requests;
create policy "Patients can respond to own consent requests" on consent_requests
for update to authenticated using (
  exists (select 1 from patients p where p.id = consent_requests.patient_id and p.auth_user_id = auth.uid())
) with check (
  exists (select 1 from patients p where p.id = consent_requests.patient_id and p.auth_user_id = auth.uid())
  and status in ('granted', 'denied', 'revoked')
);

-- Private patient document metadata and storage access.
drop policy if exists "Patients can read own documents" on medical_documents;
create policy "Patients can read own documents" on medical_documents
for select to authenticated using (
  exists (select 1 from patients p where p.id = medical_documents.patient_id and p.auth_user_id = auth.uid())
);

drop policy if exists "Patients can create own documents" on medical_documents;
create policy "Patients can create own documents" on medical_documents
for insert to authenticated with check (
  exists (select 1 from patients p where p.id = medical_documents.patient_id and p.auth_user_id = auth.uid())
);

drop policy if exists "Patients can delete own documents" on medical_documents;
create policy "Patients can delete own documents" on medical_documents
for delete to authenticated using (
  exists (select 1 from patients p where p.id = medical_documents.patient_id and p.auth_user_id = auth.uid())
);

create or replace function patient_storage_path_patient_id(path text)
returns uuid
language sql immutable
as $$
  select nullif((storage.foldername(path))[2], '')::uuid;
$$;

drop policy if exists "Patients can upload private medical documents" on storage.objects;
create policy "Patients can upload private medical documents" on storage.objects
for insert to authenticated with check (
  bucket_id = 'medical-documents'
  and exists (
    select 1 from patients p
    where p.id = patient_storage_path_patient_id(name)
      and p.auth_user_id = auth.uid()
  )
);

drop policy if exists "Patients can read private medical documents" on storage.objects;
create policy "Patients can read private medical documents" on storage.objects
for select to authenticated using (
  bucket_id = 'medical-documents'
  and (
    exists (select 1 from patients p where p.id = patient_storage_path_patient_id(name) and p.auth_user_id = auth.uid())
    or has_valid_record_access(patient_storage_path_patient_id(name))
  )
);

drop policy if exists "Patients can delete private medical documents" on storage.objects;
create policy "Patients can delete private medical documents" on storage.objects
for delete to authenticated using (
  bucket_id = 'medical-documents'
  and exists (select 1 from patients p where p.id = patient_storage_path_patient_id(name) and p.auth_user_id = auth.uid())
);

-- Replace the kiosk bootstrap functions with authenticated-only versions.
create or replace function register_kiosk_patient(
  p_patient_id text, p_full_name text, p_age integer, p_gender text, p_phone text,
  p_address text default null, p_abha_number text default null,
  p_abha_address text default null, p_hospital_id uuid default null
)
returns patients
language plpgsql
security definer
set search_path = public
as $$
declare result patients;
begin
  if auth.uid() is null or right(regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g'), 10) <> p_patient_id then
    raise exception 'Authenticated phone is required for this Patient ID';
  end if;
  insert into patients (patient_id, full_name, age, gender, phone, address, abha_number, abha_address, hospital_id, auth_user_id)
  values (p_patient_id, trim(p_full_name), p_age, p_gender, p_phone, nullif(trim(p_address), ''), p_abha_number, p_abha_address, p_hospital_id, auth.uid())
  on conflict (patient_id) do update set
    full_name = excluded.full_name, age = excluded.age, gender = excluded.gender,
    phone = excluded.phone, address = excluded.address,
    abha_number = coalesce(excluded.abha_number, patients.abha_number),
    abha_address = coalesce(excluded.abha_address, patients.abha_address),
    hospital_id = coalesce(excluded.hospital_id, patients.hospital_id),
    auth_user_id = coalesce(patients.auth_user_id, excluded.auth_user_id), updated_at = now()
  returning * into result;
  return result;
end;
$$;

create or replace function save_kiosk_intake(
  p_patient_id text, p_language text, p_answers jsonb, p_documents jsonb,
  p_clinical_summary jsonb, p_red_flags jsonb, p_is_emergency boolean, p_history_mode text
)
returns kiosk_intakes
language plpgsql
security definer
set search_path = public
as $$
declare patient_uuid uuid; result kiosk_intakes;
begin
  select id into patient_uuid from patients where patient_id = p_patient_id and auth_user_id = auth.uid();
  if patient_uuid is null then raise exception 'Authenticated patient access required'; end if;
  insert into kiosk_intakes (patient_id, language, answers, documents, clinical_summary, red_flags, is_emergency, history_mode)
  values (patient_uuid, coalesce(p_language, 'en'), coalesce(p_answers, '[]'::jsonb), coalesce(p_documents, '[]'::jsonb), p_clinical_summary, coalesce(p_red_flags, '[]'::jsonb), coalesce(p_is_emergency, false), coalesce(p_history_mode, 'allopathic'))
  returning * into result;
  return result;
end;
$$;

revoke all on function register_kiosk_patient(text, text, integer, text, text, text, text, text, uuid) from public;
grant execute on function register_kiosk_patient(text, text, integer, text, text, text, text, text, uuid) to authenticated;
revoke all on function find_kiosk_patient(text) from public;
grant execute on function find_kiosk_patient(text) to authenticated;
revoke all on function save_kiosk_intake(text, text, jsonb, jsonb, jsonb, jsonb, boolean, text) from public;
grant execute on function save_kiosk_intake(text, text, jsonb, jsonb, jsonb, jsonb, boolean, text) to authenticated;
