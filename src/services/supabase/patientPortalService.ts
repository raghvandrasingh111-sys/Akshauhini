import { supabase } from '../../lib/supabase'
import type { ConsentRequest, MedicalDocument } from '../../types/database'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
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

export async function uploadPatientDocument(params: {
  file: File
  hospitalId: string
  patientId: string
  documentType: MedicalDocument['document_type']
}) {
  const client = requireSupabase()
  const extension = params.file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${params.hospitalId}/${params.patientId}/patient-${crypto.randomUUID()}.${extension}`
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
