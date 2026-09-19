-- Google-authenticated patient profiles with Aadhaar as the unique Patient ID.
alter table patients add column if not exists email text;
alter table patients add column if not exists aadhaar_number text;
create unique index if not exists idx_patients_aadhaar_number on patients(aadhaar_number) where aadhaar_number is not null;

create or replace function register_google_patient(
  p_aadhaar_number text,
  p_full_name text,
  p_age integer,
  p_gender text,
  p_phone text,
  p_email text,
  p_hospital_id uuid default null
)
returns patients
language plpgsql
security definer
set search_path = public
as $$
declare result patients;
begin
  if auth.uid() is null then raise exception 'Google account authentication required'; end if;
  if p_aadhaar_number is null or p_aadhaar_number !~ '^[0-9]{12}$' then raise exception 'Aadhaar must be 12 digits'; end if;
  if length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'Full name is required'; end if;
  if p_age is null or p_age < 1 or p_age > 120 then raise exception 'Age must be between 1 and 120'; end if;
  if p_email is null or lower(trim(p_email)) <> lower(coalesce(auth.jwt() ->> 'email', '')) then raise exception 'Email does not match authenticated account'; end if;

  insert into patients (patient_id, aadhaar_number, full_name, age, gender, phone, email, hospital_id, auth_user_id)
  values (p_aadhaar_number, p_aadhaar_number, trim(p_full_name), p_age, p_gender, p_phone, lower(trim(p_email)), p_hospital_id, auth.uid())
  on conflict (patient_id) do update set
    full_name = excluded.full_name, age = excluded.age, gender = excluded.gender,
    phone = excluded.phone, email = excluded.email, hospital_id = coalesce(excluded.hospital_id, patients.hospital_id),
    auth_user_id = coalesce(patients.auth_user_id, excluded.auth_user_id), updated_at = now()
  returning * into result;
  return result;
end;
$$;

create or replace function get_current_patient()
returns patients
language sql
security invoker
set search_path = public
as $$ select * from patients where auth_user_id = auth.uid() limit 1; $$;

revoke all on function register_google_patient(text, text, integer, text, text, text, uuid) from public;
grant execute on function register_google_patient(text, text, integer, text, text, text, uuid) to authenticated;
