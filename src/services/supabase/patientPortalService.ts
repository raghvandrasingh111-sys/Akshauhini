import { supabase } from '../../lib/supabase'
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
  const client = requireSupabase()
  const { data, error } = await client
    .from('consent_requests')
    .select('*')
    .eq('patient_id', patientId)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ConsentRequest[]
}

export async function respondToPatientConsent(requestId: string, status: 'granted' | 'denied') {
  const client = requireSupabase()
  const { data, error } = await client
    .from('consent_requests')
    .update({ status, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select('*')
    .single()
  if (error) throw error
  return data as ConsentRequest
}

export async function getPatientDocuments(patientId: string) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('medical_documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as MedicalDocument[]
}

export async function getPatientIntakes(patientId: string) {
  try {
    const client = requireSupabase()
    const { data, error } = await client
      .from('kiosk_intakes')
      .select('id, language, answers, clinical_summary, red_flags, is_emergency, history_mode, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      const localFallback = readLocalPatientIntakes(patientId)
      if (localFallback.length > 0) return localFallback
      throw error
    }

    const records = (data ?? []) as PatientIntakeRecord[]
    if (records.length > 0) return records

    return readLocalPatientIntakes(patientId)
  } catch {
    return readLocalPatientIntakes(patientId)
  }
}

export async function uploadPatientDocument(params: {
  file: File
  hospitalId: string
  patientId: string
  documentType: MedicalDocument['document_type']
}) {
  const client = requireSupabase()
  const effectiveHospitalId = params.hospitalId?.trim() || import.meta.env.VITE_DEFAULT_HOSPITAL_ID?.trim() || 'default-hospital'
  const extension = params.file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${effectiveHospitalId}/${params.patientId}/patient-${crypto.randomUUID()}.${extension}`
  const upload = await client.storage.from('medical-documents').upload(path, params.file, {
    upsert: false,
    contentType: params.file.type,
  })
  if (upload.error) throw upload.error

  const { data, error } = await client.from('medical_documents').insert({
    patient_id: params.patientId,
    document_type: params.documentType,
    file_name: params.file.name,
    storage_path: path,
    source: 'patient_uploaded',
    uploaded_by: null,
  }).select('*').single()
  if (error) {
    await client.storage.from('medical-documents').remove([path])
    throw error
  }
  return data as MedicalDocument
}

export async function createPatientDocumentUrl(storagePath: string) {
  const client = requireSupabase()
  const { data, error } = await client.storage.from('medical-documents').createSignedUrl(storagePath, 300)
  if (error) throw error
  return data.signedUrl
}
