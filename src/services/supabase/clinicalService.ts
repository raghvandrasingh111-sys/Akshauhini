import { supabase } from '../../lib/supabase'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function getTodayIntake(visitId: string) {
  const client = requireSupabase()
  const { data, error } = await client.from('patient_intakes').select('*, intake_answers(*), ayush_assessments(*)').eq('opd_visit_id', visitId).maybeSingle()
  if (error) throw error
  return data
}

export async function getClinicalSummary(visitId: string) {
  const client = requireSupabase()
  const { data, error } = await client.from('clinical_summaries').select('*').eq('opd_visit_id', visitId).maybeSingle()
  if (error) throw error
  return data
}

export async function getPatientTimeline(patientId: string) {
  const client = requireSupabase()
  const { data, error } = await client.from('patient_timeline_events').select('*').eq('patient_id', patientId).order('event_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveConsultation(params: {
  patientId: string
  visitId: string
  doctorId: string
  consultationId?: string
  consultationNotes?: string
  diagnosis?: string
  treatmentPlan?: string
  status: 'draft' | 'in_progress' | 'completed' | 'follow_up'
}) {
  const client = requireSupabase()
  const payload = {
    patient_id: params.patientId,
    opd_visit_id: params.visitId,
    doctor_id: params.doctorId,
    consultation_notes: params.consultationNotes ?? null,
    diagnosis: params.diagnosis ?? null,
    treatment_plan: params.treatmentPlan ?? null,
    status: params.status,
    updated_at: new Date().toISOString(),
  }
  const query = params.consultationId
    ? client.from('consultations').update(payload).eq('id', params.consultationId)
    : client.from('consultations').insert(payload)
  const { data, error } = await query.select('*').single()
  if (error) throw error
  return data
}

export async function writeAuditLog(params: {
  patientId?: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  const client = requireSupabase()
  const user = await client.auth.getUser()
  if (!user.data.user) throw new Error('Authenticated doctor required')
  const { error } = await client.from('audit_logs').insert({
    actor_user_id: user.data.user.id,
    actor_id: null,
    patient_id: params.patientId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  })
  if (error) throw error
}
