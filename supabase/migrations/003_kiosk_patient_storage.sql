-- Kiosk registration and intake storage.
-- Patient-facing writes go through SECURITY DEFINER functions so the base
-- tables remain protected by RLS.

create table if not exists kiosk_intakes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  language text not null default 'en',
  answers jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  clinical_summary jsonb,
  red_flags jsonb not null default '[]'::jsonb,
  is_emergency boolean not null default false,
  history_mode text not null default 'allopathic',
  status text not null default 'complete' check (status in ('in_progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table patients add column if not exists age integer;
alter table patients add column if not exists hospital_id uuid references hospitals(id) on delete set null;
create index if not exists idx_patients_hospital on patients(hospital_id);

create index if not exists idx_kiosk_intakes_patient_date
  on kiosk_intakes(patient_id, created_at desc);

alter table kiosk_intakes enable row level security;

drop policy if exists "Doctors can read authorized kiosk intakes" on kiosk_intakes;
create policy "Doctors can read authorized kiosk intakes" on kiosk_intakes
for select to authenticated using (
  has_valid_record_access(patient_id)
  or exists (
    select 1 from opd_visits v
    where v.patient_id = kiosk_intakes.patient_id
      and v.doctor_id = auth.uid()
  )
);

drop policy if exists "Doctors can read hospital patients" on patients;
create policy "Doctors can read hospital patients" on patients
for select to authenticated using (
  hospital_id = current_doctor_hospital_id()
  or exists (
    select 1 from opd_visits v
    where v.patient_id = patients.id
      and v.hospital_id = current_doctor_hospital_id()
  )
);

create or replace function register_kiosk_patient(
  p_patient_id text,
  p_full_name text,
  p_age integer,
  p_gender text,
  p_phone text,
  p_address text default null,
  p_abha_number text default null,
  p_abha_address text default null,
  p_hospital_id uuid default null
)
returns patients
language plpgsql
security definer
set search_path = public
as $$
declare
  result patients;
begin
  if p_patient_id is null or p_patient_id !~ '^[6-9][0-9]{9}$' then
    raise exception 'A valid 10-digit patient phone ID is required';
  end if;
  if length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Patient name is required';
  end if;
  if p_age is null or p_age < 1 or p_age > 120 then
    raise exception 'Patient age must be between 1 and 120';
  end if;

  insert into patients (patient_id, full_name, age, gender, phone, address, abha_number, abha_address, hospital_id)
  values (p_patient_id, trim(p_full_name), p_age, p_gender, p_phone, nullif(trim(p_address), ''), p_abha_number, p_abha_address, p_hospital_id)
  on conflict (patient_id) do update set
    full_name = excluded.full_name,
    age = excluded.age,
    gender = excluded.gender,
    phone = excluded.phone,
    address = excluded.address,
    abha_number = coalesce(excluded.abha_number, patients.abha_number),
    abha_address = coalesce(excluded.abha_address, patients.abha_address),
    hospital_id = coalesce(excluded.hospital_id, patients.hospital_id),
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function find_kiosk_patient(p_patient_id text)
returns patients
language sql
security definer
set search_path = public
as $$
  select * from patients where patient_id = p_patient_id limit 1;
$$;

create or replace function save_kiosk_intake(
  p_patient_id text,
  p_language text,
  p_answers jsonb,
  p_documents jsonb,
  p_clinical_summary jsonb,
  p_red_flags jsonb,
  p_is_emergency boolean,
  p_history_mode text
)
returns kiosk_intakes
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_uuid uuid;
  result kiosk_intakes;
begin
  select id into patient_uuid from patients where patient_id = p_patient_id;
  if patient_uuid is null then
    raise exception 'Patient registration not found';
  end if;

  insert into kiosk_intakes (patient_id, language, answers, documents, clinical_summary, red_flags, is_emergency, history_mode)
  values (patient_uuid, coalesce(p_language, 'en'), coalesce(p_answers, '[]'::jsonb), coalesce(p_documents, '[]'::jsonb), p_clinical_summary, coalesce(p_red_flags, '[]'::jsonb), coalesce(p_is_emergency, false), coalesce(p_history_mode, 'allopathic'))
  returning * into result;
  return result;
end;
$$;

revoke all on function register_kiosk_patient(text, text, integer, text, text, text, text, text, uuid) from public;
grant execute on function register_kiosk_patient(text, text, integer, text, text, text, text, text, uuid) to anon, authenticated;
revoke all on function find_kiosk_patient(text) from public;
grant execute on function find_kiosk_patient(text) to anon, authenticated;
revoke all on function save_kiosk_intake(text, text, jsonb, jsonb, jsonb, jsonb, boolean, text) from public;
grant execute on function save_kiosk_intake(text, text, jsonb, jsonb, jsonb, jsonb, boolean, text) to anon, authenticated;