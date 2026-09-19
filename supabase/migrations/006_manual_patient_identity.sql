-- Manual patient signup: Supabase phone/password auth plus Aadhaar Patient ID.
create or replace function register_manual_patient(
  p_aadhaar_number text,
  p_full_name text,
  p_age integer,
  p_gender text,
  p_phone text,
  p_hospital_id uuid default null
)
returns patients
language plpgsql
security definer
set search_path = public
as $$
declare result patients; normalized_phone text;
begin
  if auth.uid() is null then raise exception 'Patient authentication required'; end if;
  normalized_phone := right(regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g'), 10);
  if p_aadhaar_number is null or p_aadhaar_number !~ '^[0-9]{12}$' then raise exception 'Aadhaar must be 12 digits'; end if;
  if length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'Full name is required'; end if;
  if p_age is null or p_age < 1 or p_age > 120 then raise exception 'Age must be between 1 and 120'; end if;
  if normalized_phone <> right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 10) then raise exception 'Phone does not match the authenticated account'; end if;

  if exists (select 1 from patients where patient_id = p_aadhaar_number and auth_user_id is not null and auth_user_id <> auth.uid()) then
    raise exception 'This Aadhaar is already linked to another patient account';
  end if;

  insert into patients (patient_id, aadhaar_number, full_name, age, gender, phone, hospital_id, auth_user_id)
  values (p_aadhaar_number, p_aadhaar_number, trim(p_full_name), p_age, p_gender, right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 10), p_hospital_id, auth.uid())
  on conflict (patient_id) do update set
    full_name = excluded.full_name, age = excluded.age, gender = excluded.gender,
    phone = excluded.phone, hospital_id = coalesce(excluded.hospital_id, patients.hospital_id),
    auth_user_id = coalesce(patients.auth_user_id, excluded.auth_user_id), updated_at = now()
  returning * into result;
  return result;
end;
$$;

revoke all on function register_manual_patient(text, text, integer, text, text, uuid) from public;
grant execute on function register_manual_patient(text, text, integer, text, text, uuid) to authenticated;
