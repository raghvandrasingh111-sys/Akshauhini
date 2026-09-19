-- Let an authenticated patient review their own kiosk questions and answers.
drop policy if exists "Patients can read own kiosk intakes" on kiosk_intakes;
create policy "Patients can read own kiosk intakes" on kiosk_intakes
for select to authenticated using (
  exists (
    select 1 from patients p
    where p.id = kiosk_intakes.patient_id
      and p.auth_user_id = auth.uid()
  )
);
