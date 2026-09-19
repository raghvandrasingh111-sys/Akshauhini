import { supabase } from '../../lib/supabase'
import { writeAuditLog } from './clinicalService'

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

  const user = await supabase.auth.getUser()
  if (!user.data.user) return { data: null, error: new Error('Authenticated doctor required') }

  const result = await supabase.from('consent_requests').insert({
    patient_id: params.patientId,
    doctor_id: user.data.user.id,
    hospital_id: params.hospitalId,
    purpose: params.purpose,
    requested_data_types: params.requestedDataTypes,
    status: 'pending',
    requested_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    consent_reference: `consent-${Date.now()}`,
  }).select('*').single()
  if (!result.error && result.data) {
    await writeAuditLog({ patientId: params.patientId, action: 'CONSENT_REQUESTED', entityType: 'consent_request', entityId: result.data.id })
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

  const result = await supabase
    .from('consent_requests')
    .update({
      status: 'granted',
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', consentId)
    .select('*')
    .single()
  if (!result.error && result.data && import.meta.env.VITE_ABDM_MODE === 'development') {
    await writeAuditLog({ patientId: result.data.patient_id, action: 'CONSENT_GRANTED', entityType: 'consent_request', entityId: consentId })
  }
  return result
}

export async function getConsentStatus(patientId: string, doctorId: string) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  return supabase
    .from('consent_requests')
    .select('*')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}
