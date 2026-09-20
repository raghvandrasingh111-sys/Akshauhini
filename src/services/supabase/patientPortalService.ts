import { supabase } from '../../lib/supabase'
import { toValidUuidOrNull } from '../../lib/uuid'
import type { ConsentRequest, MedicalDocument } from '../../types/database'

export interface PatientIntakeRecord {
  id: string
  language: string
  answers: Array<{
    questionId?: string
    question?: string
    question_text?: string
    answer?: string
    value?: string
    response?: string
    timestamp?: string
  }>
  clinical_summary: {
    chiefComplaint?: string
    hpi?: string
    pastHistory?: string
    medications?: string[]
    allergies?: string[]
    reviewOfSystems?: string
    priorInvestigations?: string
  } | null
  red_flags: Array<{ symptom?: string; severity?: string; message?: string }>
  is_emergency: boolean
  history_mode: string
  created_at: string
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

function readLocalPatientIntakes(patientId: string): PatientIntakeRecord[] {
  try {
    const raw = localStorage.getItem('sanjeevani_patient_intakes')
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>
    return parsed
      .filter((entry) => {
        const entryId = String((entry as Record<string, unknown>).patient_id ?? (entry as Record<string, unknown>).patientId ?? (entry as Record<string, unknown>).databaseId ?? '')
        return entryId === String(patientId)
      })
      .map((entry) => ({
        id: String(entry.id ?? 'local_intake'),
        language: String(entry.language ?? 'en'),
        answers: Array.isArray(entry.answers) ? (entry.answers as PatientIntakeRecord['answers']) : [],
        clinical_summary: (entry.clinical_summary as PatientIntakeRecord['clinical_summary']) ?? null,
        red_flags: Array.isArray(entry.red_flags) ? (entry.red_flags as PatientIntakeRecord['red_flags']) : [],
        is_emergency: Boolean(entry.is_emergency),
        history_mode: String(entry.history_mode ?? 'allopathic'),
        created_at: String(entry.created_at ?? new Date().toISOString()),
      }))
  } catch {
    return []
  }
}

export async function getPatientConsentRequests(patientId: string) {
  const patientUuid = toValidUuidOrNull(patientId)
  if (!patientUuid) return []

  const client = requireSupabase()
  const { data, error } = await client
    .from('consent_requests')
    .select('*')
    .eq('patient_id', patientUuid)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ConsentRequest[]
}

export async function respondToPatientConsent(requestId: string, status: 'granted' | 'denied') {
  const requestUuid = toValidUuidOrNull(requestId)
  if (!requestUuid) {
    throw new Error('Valid request UUID is required')
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from('consent_requests')
    .update({ status, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', requestUuid)
    .select('*')
    .single()
  if (error) throw error
  return data as ConsentRequest
}

export async function getPatientDocuments(patientId: string) {
  const patientUuid = toValidUuidOrNull(patientId)
  if (!patientUuid) return []

  const client = requireSupabase()
  const { data, error } = await client
    .from('medical_documents')
    .select('*')
    .eq('patient_id', patientUuid)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as MedicalDocument[]
}

export async function getPatientIntakes(patientId: string) {
  const patientUuid = toValidUuidOrNull(patientId)
  if (!patientUuid) {
    return readLocalPatientIntakes(patientId)
  }

  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('kiosk_intakes')
      .select('id, language, answers, clinical_summary, red_flags, is_emergency, history_mode, created_at')
      .eq('patient_id', patientUuid)
      .order('created_at', { ascending: false })

    if (error) {
      const localFallback = readLocalPatientIntakes(patientId)
      if (localFallback.length > 0) return localFallback
      throw error
    }

    const records = (data ?? []) as PatientIntakeRecord[]
    if (records.length > 0) return records
    return readLocalPatientIntakes(patientId)
  } catch (err) {
    console.warn('[PatientPortalService] Could not fetch intakes from Supabase, falling back to local storage:', err)
    return readLocalPatientIntakes(patientId)
  }
}

export async function uploadPatientDocument(params: {
  file: File
  patientId: string
  hospitalId?: string
  documentType: MedicalDocument['document_type']
  documentDate?: string
}) {
  const patientUuid = toValidUuidOrNull(params.patientId)
  if (!patientUuid) {
    throw new Error('Valid patient UUID is required for document upload')
  }

  const client = requireSupabase()
  const extension = params.file.name.split('.').pop() || 'png'
  const effectiveHospitalId = params.hospitalId?.trim() || import.meta.env.VITE_DEFAULT_HOSPITAL_ID?.trim() || 'default-hospital'
  const path = `${effectiveHospitalId}/${patientUuid}/patient-${crypto.randomUUID()}.${extension}`

  const upload = await client.storage.from('documents').upload(path, params.file, { upsert: false })
  if (upload.error) throw upload.error

  const { data, error } = await client
    .from('medical_documents')
    .insert({
      patient_id: patientUuid,
      document_type: params.documentType,
      file_name: params.file.name,
      storage_path: path,
      document_date: params.documentDate || new Date().toISOString(),
      source: 'patient_uploaded',
    })
    .select('*')
    .single()

  if (error) throw error
  return data as MedicalDocument
}
