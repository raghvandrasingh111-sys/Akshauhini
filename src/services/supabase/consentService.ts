import { supabase } from '../../lib/supabase'
import { isUuid, toValidUuidOrNull } from '../../lib/uuid'
import { ensureDoctorProfileForSession, FALLBACK_HOSPITAL_ID } from './authService'
import { writeAuditLog } from './clinicalService'

async function ensureHospitalRecord(hospitalId: string) {
  const validHospitalId = toValidUuidOrNull(hospitalId) ?? FALLBACK_HOSPITAL_ID

  if (!supabase) {
    return validHospitalId
  }

  const { error } = await supabase.from('hospitals').upsert({
    id: validHospitalId,
    name: 'Development Hospital',
    registration_number: 'DEV-HOSP-001',
    address: 'Demo District Hospital',
    phone: '1800-000-000',
    email: 'demo@hospital.local',
    status: 'active',
  }, { onConflict: 'id' })

  if (error) {
    console.warn('[ConsentService] Failed to ensure hospital record:', error.message)
  }

  return validHospitalId
}

export async function requestPatientConsent(params: {
  patientId: string
  doctorId?: string
  hospitalId: string
  purpose: string
  requestedDataTypes: string[]
}) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const patientUuid = toValidUuidOrNull(params.patientId)
  if (!patientUuid) {
    return { data: null, error: new Error('A valid patient UUID is required') }
  }

  const user = await supabase.auth.getUser()
  if (!user.data.user || !isUuid(user.data.user.id)) {
    return { data: null, error: new Error('Authenticated doctor required') }
  }

  try {
    await ensureDoctorProfileForSession((await supabase.auth.getSession()).data.session)
  } catch (createError) {
    return { data: null, error: new Error(createError instanceof Error ? createError.message : 'Unable to create doctor profile for consent request') }
  }

  // Ensure valid hospitalId. In development, fall back to the default hospital record
  // instead of rejecting the request because a profile hasn't been fully assigned yet.
  let hospitalUuid = toValidUuidOrNull(params.hospitalId)
    ?? toValidUuidOrNull(import.meta.env.VITE_DEFAULT_HOSPITAL_ID)

  if (!hospitalUuid) {
    const docProfile = await supabase.from('doctors').select('hospital_id').eq('id', user.data.user.id).maybeSingle()
    hospitalUuid = toValidUuidOrNull(docProfile.data?.hospital_id) ?? FALLBACK_HOSPITAL_ID
  }

  hospitalUuid = await ensureHospitalRecord(hospitalUuid)

  const result = await supabase.from('consent_requests').insert({
    patient_id: patientUuid,
    doctor_id: user.data.user.id,
    hospital_id: hospitalUuid,
    purpose: params.purpose,
    requested_data_types: params.requestedDataTypes,
    status: 'pending',
    requested_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    consent_reference: `consent-${Date.now()}`,
  }).select('*').single()
  if (!result.error && result.data) {
    await writeAuditLog({ patientId: patientUuid, action: 'CONSENT_REQUESTED', entityType: 'consent_request', entityId: result.data.id })
  }
  return result
}

export async function grantConsent(consentId: string) {
  if (import.meta.env.VITE_ABDM_MODE !== 'development') {
    return { data: null, error: new Error('Development consent simulation is disabled') }
  }
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const consentUuid = toValidUuidOrNull(consentId)
  if (!consentUuid) {
    return { data: null, error: new Error('Invalid consent ID') }
  }

  const result = await supabase
    .from('consent_requests')
    .update({
      status: 'granted',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', consentUuid)
    .select('*')
    .single()
  if (!result.error && result.data && import.meta.env.VITE_ABDM_MODE === 'development') {
    await writeAuditLog({ patientId: result.data.patient_id, action: 'CONSENT_GRANTED', entityType: 'consent_request', entityId: consentUuid })
  }
  return result
}

export async function getConsentStatus(patientId: string, doctorId: string) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  const patientUuid = toValidUuidOrNull(patientId)
  const doctorUuid = toValidUuidOrNull(doctorId)

  if (!patientUuid || !doctorUuid) {
    return { data: null, error: null }
  }

  return supabase
    .from('consent_requests')
    .select('*')
    .eq('patient_id', patientUuid)
    .eq('doctor_id', doctorUuid)
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}
