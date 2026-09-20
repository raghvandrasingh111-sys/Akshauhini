import { supabase } from '../../lib/supabase'
import { isUuid, toValidUuidOrNull } from '../../lib/uuid'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function getTodayIntake(visitId: string) {
  if (!isUuid(visitId)) return null
  const client = requireSupabase()
  const { data, error } = await client.from('patient_intakes').select('*, intake_answers(*), ayush_assessments(*)').eq('opd_visit_id', visitId).maybeSingle()
  if (error) throw error
  return data
}

export async function getClinicalSummary(visitId: string) {
  if (!isUuid(visitId)) return null
  const client = requireSupabase()
  const { data, error } = await client.from('clinical_summaries').select('*').eq('opd_visit_id', visitId).maybeSingle()
  if (error) throw error
  return data
}

export async function getPatientTimeline(patientId: string) {
  if (!isUuid(patientId)) return []
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
  const patientUuid = toValidUuidOrNull(params.patientId)
  const hospitalUuid = toValidUuidOrNull(params.hospitalId)
  if (!patientUuid || !hospitalUuid) {
    console.warn('[ClinicalService] Timeline event skipped due to missing valid UUIDs')
    return
  }

  const client = requireSupabase()
  const { error } = await client.from('patient_timeline_events').insert({
    patient_id: patientUuid,
    hospital_id: hospitalUuid,
    opd_visit_id: toValidUuidOrNull(params.opdVisitId),
    event_type: params.eventType,
    title: params.title,
    description: params.description ?? null,
    source_table: params.sourceTable ?? null,
    source_id: toValidUuidOrNull(params.sourceId),
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
  const patientUuid = toValidUuidOrNull(params.patientId)
  const visitUuid = toValidUuidOrNull(params.visitId)
  const doctorUuid = toValidUuidOrNull(params.doctorId)
  const consultationUuid = toValidUuidOrNull(params.consultationId)

  if (!patientUuid || !visitUuid || !doctorUuid) {
    throw new Error('Valid patient, visit, and doctor UUIDs are required.')
  }

  const client = requireSupabase()
  const payload = {
    patient_id: patientUuid,
    opd_visit_id: visitUuid,
    doctor_id: doctorUuid,
    consultation_notes: params.consultationNotes ?? null,
    diagnosis: params.diagnosis ?? null,
    treatment_plan: params.treatmentPlan ?? null,
    status: params.status,
    updated_at: new Date().toISOString(),
  }
  const query = consultationUuid
    ? client.from('consultations').update(payload).eq('id', consultationUuid)
    : client.from('consultations').insert(payload)
  const { data, error } = await query.select('*').single()
  if (error) throw error

  try {
    const hospitalId = await client.from('opd_visits').select('hospital_id').eq('id', visitUuid).single()
    const resolvedHospitalId = hospitalId.data?.hospital_id ?? null
    if (resolvedHospitalId && isUuid(resolvedHospitalId)) {
      await createPatientTimelineEvent({
        patientId: patientUuid,
        hospitalId: resolvedHospitalId,
        opdVisitId: visitUuid,
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
    patientId: patientUuid,
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
  if (!supabase) return
  try {
    const client = supabase
    const user = await client.auth.getUser()
    const actorUuid = toValidUuidOrNull(user.data.user?.id)
    if (!actorUuid) return

    const { error } = await client.from('audit_logs').insert({
      actor_id: actorUuid,
      patient_id: toValidUuidOrNull(params.patientId),
      action: params.action,
      entity_type: params.entityType,
      entity_id: toValidUuidOrNull(params.entityId),
      metadata: params.metadata ?? {},
    })
    if (error) {
      console.warn('[ClinicalService] Audit log write skipped:', error.message)
    }
  } catch (err) {
    console.warn('[ClinicalService] Audit log exception caught:', err)
  }
}
