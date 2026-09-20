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

export async function createPatientTimelineEvent(params: {
  patientId: string
  hospitalId: string
  opdVisitId?: string | null
  eventType: string
  title: string
  description?: string
  sourceTable?: string
  sourceId?: string
  eventAt?: string
}) {
  const client = requireSupabase()
  const { error } = await client.from('patient_timeline_events').insert({
    patient_id: params.patientId,
    hospital_id: params.hospitalId,
    opd_visit_id: params.opdVisitId ?? null,
    event_type: params.eventType,
    title: params.title,
    description: params.description ?? null,
    source_table: params.sourceTable ?? null,
    source_id: params.sourceId ? params.sourceId : null,
    event_at: params.eventAt ?? new Date().toISOString(),
  })
  if (error) {
    console.error('[ClinicalService] Timeline event failed:', error.message)
    throw error
  }
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

  try {
    const hospitalId = await client.from('opd_visits').select('hospital_id').eq('id', params.visitId).single()
    const resolvedHospitalId = hospitalId.data?.hospital_id ?? null
    if (resolvedHospitalId) {
      await createPatientTimelineEvent({
        patientId: params.patientId,
        hospitalId: resolvedHospitalId,
        opdVisitId: params.visitId,
        eventType: params.status === 'completed' ? 'consultation_completed' : 'consultation_draft',
        title: params.status === 'completed' ? 'Doctor Consultation' : 'Consultation Draft Saved',
        description: params.status === 'completed'
          ? `Completed consultation: ${params.diagnosis ?? 'Clinical review completed'}`
          : `Draft consultation saved: ${params.diagnosis ?? 'Initial assessment notes created'}`,
        sourceTable: 'consultations',
        sourceId: data.id,
      })
    }
  } catch (timelineError) {
    console.error('[ClinicalService] Consultation timeline update failed:', timelineError)
  }

  await writeAuditLog({
    patientId: params.patientId,
    action: params.status === 'completed' ? 'CONSULTATION_COMPLETED' : 'CONSULTATION_DRAFT_SAVED',
    entityType: 'consultation',
    entityId: data.id,
    metadata: { status: params.status },
  })

  return data
}

export async function writeAuditLog(params: {
  patientId?: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const client = requireSupabase()
  const user = await client.auth.getUser()
  if (!user.data.user) throw new Error('Authenticated doctor required')
  const { error } = await client.from('audit_logs').insert({
    actor_id: user.data.user.id,
    patient_id: params.patientId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  })
  if (error) {
    // Audit failure must not block patient identity and consent workflows.
    console.error('[ClinicalService] Audit log write failed:', error.message)
  }
}
