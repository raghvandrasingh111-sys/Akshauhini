create extension if not exists pgcrypto;

create table if not exists hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text not null unique,
  address text not null,
  phone text,
  email text,
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists doctors (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  registration_number text not null unique,
  specialization text not null,
  hospital_id uuid not null references hospitals(id),
  role text not null default 'doctor' check (role in ('doctor', 'department_head', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null unique,
  full_name text not null,
  date_of_birth date,
  gender text,
  phone text,
  email text,
  abha_number text,
  abha_address text,
  masked_abha text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opd_visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  hospital_id uuid not null references hospitals(id),
  doctor_id uuid not null references doctors(id),
  token_number text not null,
  chief_complaint text not null,
  status text not null default 'waiting' check (status in ('waiting', 'priority', 'in_consultation', 'completed', 'cancelled')),
  risk_level text not null default 'normal' check (risk_level in ('normal', 'warning', 'priority', 'emergency')),
  queue_position integer not null default 0,
  arrival_time timestamptz not null default now(),
  consultation_started_at timestamptz,
  consultation_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consent_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  doctor_id uuid not null references doctors(id),
  hospital_id uuid not null references hospitals(id),
  purpose text not null,
  requested_data_types text[] not null default array[]::text[],
  status text not null default 'pending' check (status in ('pending', 'granted', 'denied', 'expired', 'revoked')),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz,
  consent_reference text,
  created_at timestamptz not null default now()
);

create table if not exists medical_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  opd_visit_id uuid references opd_visits(id),
  document_type text not null check (document_type in ('prescription', 'lab_report', 'discharge_summary', 'diagnostic_report', 'other')),
  file_name text not null,
  storage_path text not null,
  document_date timestamptz,
  source text not null default 'uploaded',
  ocr_text text,
  ocr_confidence numeric(5,4),
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references doctors(id),
  created_at timestamptz not null default now()
);

create table if not exists clinical_summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  opd_visit_id uuid not null references opd_visits(id),
  intake_id uuid,
  chief_complaint text not null,
  onset text,
  duration text,
  site text,
  character text,
  severity text,
  radiation text,
  associated_symptoms text,
  aggravating_factors text,
  relieving_factors text,
  red_flags jsonb not null default '[]'::jsonb,
  review_of_systems jsonb not null default '{}'::jsonb,
  medical_history jsonb not null default '{}'::jsonb,
  medications jsonb not null default '{}'::jsonb,
  allergies jsonb not null default '{}'::jsonb,
  family_history jsonb not null default '{}'::jsonb,
  social_history jsonb not null default '{}'::jsonb,
  vitals jsonb not null default '{}'::jsonb,
  ayush_assessment jsonb not null default '{}'::jsonb,
  ai_generated boolean not null default true,
  physician_verified boolean not null default false,
  verified_by uuid references doctors(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  opd_visit_id uuid not null references opd_visits(id),
  doctor_id uuid not null references doctors(id),
  consultation_notes text,
  diagnosis text,
  treatment_plan text,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed', 'follow_up')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_clinical_briefs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  opd_visit_id uuid not null references opd_visits(id),
  summary text not null,
  confidence numeric(5,4),
  model_name text not null,
  generated_by text not null default 'ai',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references doctors(id),
  patient_id uuid references patients(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_opd_visits_hospital_status on opd_visits(hospital_id, status);
create index if not exists idx_opd_visits_patient on opd_visits(patient_id);
create index if not exists idx_opd_visits_doctor on opd_visits(doctor_id);
create index if not exists idx_patients_abha on patients(abha_number, masked_abha);
create index if not exists idx_consent_requests_hospital on consent_requests(hospital_id, status);
create index if not exists idx_consent_requests_doctor_patient on consent_requests(doctor_id, patient_id, requested_at desc);
create index if not exists idx_medical_documents_patient on medical_documents(patient_id, created_at desc);
create index if not exists idx_clinical_summaries_visit on clinical_summaries(opd_visit_id);
create index if not exists idx_consultations_visit on consultations(opd_visit_id);
create index if not exists idx_ai_clinical_briefs_visit on ai_clinical_briefs(opd_visit_id);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id, created_at desc);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_hospitals_updated_at on hospitals;
create trigger set_hospitals_updated_at before update on hospitals
for each row execute procedure update_updated_at_column();

drop trigger if exists set_doctors_updated_at on doctors;
create trigger set_doctors_updated_at before update on doctors
for each row execute procedure update_updated_at_column();

drop trigger if exists set_patients_updated_at on patients;
create trigger set_patients_updated_at before update on patients
for each row execute procedure update_updated_at_column();

drop trigger if exists set_opd_visits_updated_at on opd_visits;
create trigger set_opd_visits_updated_at before update on opd_visits
for each row execute procedure update_updated_at_column();

drop trigger if exists set_clinical_summaries_updated_at on clinical_summaries;
create trigger set_clinical_summaries_updated_at before update on clinical_summaries
for each row execute procedure update_updated_at_column();

drop trigger if exists set_consultations_updated_at on consultations;
create trigger set_consultations_updated_at before update on consultations
for each row execute procedure update_updated_at_column();

alter table hospitals enable row level security;
alter table doctors enable row level security;
alter table patients enable row level security;
alter table opd_visits enable row level security;
alter table consent_requests enable row level security;
alter table medical_documents enable row level security;
alter table clinical_summaries enable row level security;
alter table consultations enable row level security;
alter table ai_clinical_briefs enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "Doctors can view their hospital records" on hospitals;
create policy "Doctors can view their hospital records" on hospitals
for select using (false);

drop policy if exists "Doctors can view their own profile" on doctors;
create policy "Doctors can view their own profile" on doctors
for select using (auth.uid() = id);

drop policy if exists "Doctors can read patients within hospital" on patients;
create policy "Doctors can read patients within hospital" on patients
for select using (false);

drop policy if exists "Doctors can read queue records for their hospital" on opd_visits;
create policy "Doctors can read queue records for their hospital" on opd_visits
for select using (false);

drop policy if exists "Doctors can manage consent events for their hospital" on consent_requests;
create policy "Doctors can manage consent events for their hospital" on consent_requests
for all using (false) with check (false);

drop policy if exists "Doctors can manage documents for their hospital" on medical_documents;
create policy "Doctors can manage documents for their hospital" on medical_documents
for all using (false) with check (false);

drop policy if exists "Doctors can manage summaries for their hospital" on clinical_summaries;
create policy "Doctors can manage summaries for their hospital" on clinical_summaries
for all using (false) with check (false);

drop policy if exists "Doctors can manage consultations for their hospital" on consultations;
create policy "Doctors can manage consultations for their hospital" on consultations
for all using (false) with check (false);

drop policy if exists "Doctors can view ai summaries for their hospital" on ai_clinical_briefs;
create policy "Doctors can view ai summaries for their hospital" on ai_clinical_briefs
for select using (false);

drop policy if exists "Doctors can append audit logs" on audit_logs;
create policy "Doctors can append audit logs" on audit_logs
for insert with check (false);
