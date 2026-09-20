import { supabase } from '../../lib/supabase'
import type { MedicalDocument } from '../../types/database'

const bucket = 'medical-documents'

export async function uploadMedicalDocument(params: {
  file: File
  hospitalId: string
  patientId: string
  visitId?: string
  documentType: MedicalDocument['document_type']
}) {
  if (!supabase) throw new Error('Supabase is not configured')
  const extension = params.file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${params.hospitalId}/${params.patientId}/${crypto.randomUUID()}.${extension}`
  const upload = await supabase.storage.from(bucket).upload(path, params.file, { upsert: false, contentType: params.file.type })
  if (upload.error) throw upload.error

  const { data, error } = await supabase.from('medical_documents').insert({
    patient_id: params.patientId,
    opd_visit_id: params.visitId ?? null,
    document_type: params.documentType,
    file_name: params.file.name,
    storage_path: path,
    source: 'uploaded',
    uploaded_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  }).select('*').single()
  if (error) {
    await supabase.storage.from(bucket).remove([path])
    throw error
  }
  return data as MedicalDocument
}

export async function getMedicalDocumentUrl(storagePath: string, expiresInSeconds = 300) {
  if (!supabase) throw new Error('Supabase is not configured')

  const candidates = [bucket, 'documents']
  let lastError: Error | null = null

  for (const bucketName of candidates) {
    const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(storagePath, expiresInSeconds)
    if (!error) return data.signedUrl

    const message = error.message ?? 'Unknown storage error'
    if (!/object.*not found|not found|does not exist|no such object/i.test(message)) {
      throw error
    }
    lastError = new Error(message)
  }

  if (lastError) throw lastError
  throw new Error('Unable to resolve document URL')
}

export async function deleteMedicalDocument(document: Pick<MedicalDocument, 'id' | 'storage_path'>) {
  if (!supabase) throw new Error('Supabase is not configured')
  const storageResult = await supabase.storage.from(bucket).remove([document.storage_path])
  if (storageResult.error) throw storageResult.error
  const { error } = await supabase.from('medical_documents').delete().eq('id', document.id)
  if (error) throw error
}
