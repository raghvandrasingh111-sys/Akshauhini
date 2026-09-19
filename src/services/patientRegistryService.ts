import type { ClinicalSummary, DoctorAccessRequest, PatientIdentity } from '../types'
import { supabase } from '../lib/supabase'

export interface PatientRegistryRecord {
  databaseId?: string
  hospitalId?: string
  patientId: string
  phone: string
  name: string
  age: number
  gender: PatientIdentity['gender']
  address?: string
  createdAt: string
  updatedAt: string
  summaries: ClinicalSummary[]
}

const PATIENTS_KEY = 'sanjeevani_patient_registry'
const ACCESS_REQUESTS_KEY = 'sanjeevani_doctor_access_requests'
const PATIENT_INTAKES_KEY = 'sanjeevani_patient_intakes'

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone))
}

export function getPatientId(phone: string): string {
  return normalizePhone(phone)
}

function fromSupabasePatient(patient: Record<string, unknown>): PatientRegistryRecord {
  const defaultHospitalId = typeof import.meta.env.VITE_DEFAULT_HOSPITAL_ID === 'string'
    ? import.meta.env.VITE_DEFAULT_HOSPITAL_ID.trim()
    : ''

  return {
    databaseId: String(patient.id),
    hospitalId: typeof patient.hospital_id === 'string' && patient.hospital_id.trim()
      ? patient.hospital_id
      : (defaultHospitalId || undefined),
    patientId: String(patient.patient_id),
    phone: String(patient.phone ?? patient.patient_id),
    name: String(patient.full_name),
    age: typeof patient.age === 'number'
      ? patient.age
      : patient.date_of_birth
        ? new Date().getFullYear() - new Date(String(patient.date_of_birth)).getFullYear()
        : 0,
    gender: patient.gender === 'female' || patient.gender === 'other' ? patient.gender : 'male',
    address: typeof patient.address === 'string' ? patient.address : undefined,
    createdAt: String(patient.created_at),
    updatedAt: String(patient.updated_at),
    summaries: [],
  }
}

export { fromSupabasePatient }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function getPatientByPhone(phone: string): Promise<PatientRegistryRecord | null> {
  const patientId = getPatientId(phone)
  if (supabase) {
    const { data, error } = await supabase.rpc('find_kiosk_patient', { p_patient_id: patientId })
    if (!error && data) return fromSupabasePatient(data as Record<string, unknown>)
    if (error) console.warn('[PatientRegistry] Supabase lookup failed:', error.message)
    return null
  }
  return read<PatientRegistryRecord[]>(PATIENTS_KEY, []).find(
    (patient) => patient.patientId === patientId
  ) ?? null
}

export async function registerOrLoginPatient(input: {
  phone: string
  name: string
  age: number
  gender: PatientIdentity['gender']
  address?: string
  abhaNumber?: string
  abhaAddress?: string
}): Promise<PatientRegistryRecord> {
  const patientId = getPatientId(input.phone)
  if (supabase) {
    const { data, error } = await supabase.rpc('register_kiosk_patient', {
      p_patient_id: patientId,
      p_full_name: input.name,
      p_age: input.age,
      p_gender: input.gender,
      p_phone: patientId,
      p_address: input.address ?? null,
      p_abha_number: input.abhaNumber ?? null,
      p_abha_address: input.abhaAddress ?? null,
      p_hospital_id: import.meta.env.VITE_DEFAULT_HOSPITAL_ID || null,
    })
    if (!error && data) return fromSupabasePatient(data as Record<string, unknown>)
    if (error) console.warn('[PatientRegistry] Supabase registration failed:', error.message)
    if (error) throw error
  }
  const patients = read<PatientRegistryRecord[]>(PATIENTS_KEY, [])
  const existing = patients.find((patient) => patient.patientId === patientId)
  const now = new Date().toISOString()
  const record: PatientRegistryRecord = {
    patientId,
    phone: patientId,
    name: input.name,
    age: input.age,
    gender: input.gender,
    address: input.address,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    summaries: existing?.summaries ?? [],
  }
  const next = existing
    ? patients.map((patient) => patient.patientId === patientId ? record : patient)
    : [record, ...patients]
  write(PATIENTS_KEY, next)
  return record
}

export async function savePatientSummary(
  patientId: string,
  summary: ClinicalSummary,
  input: {
    language: string
    answers: unknown[]
    documents: unknown[]
    redFlags: unknown[]
    isEmergency: boolean
    historyMode: string
  }
): Promise<void> {
  const intakeEntry = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    patient_id: patientId,
    language: input.language,
    answers: input.answers,
    documents: input.documents,
    clinical_summary: summary,
    red_flags: input.redFlags,
    is_emergency: input.isEmergency,
    history_mode: input.historyMode,
    created_at: new Date().toISOString(),
  }

  const existingIntakes = read<Array<Record<string, unknown>>>(PATIENT_INTAKES_KEY, [])
  write(PATIENT_INTAKES_KEY, [intakeEntry, ...existingIntakes.filter((entry) => entry.patient_id !== patientId)])

  if (supabase) {
    const { error } = await supabase.rpc('save_kiosk_intake', {
      p_patient_id: patientId,
      p_language: input.language,
      p_answers: input.answers,
      p_documents: input.documents,
      p_clinical_summary: summary,
      p_red_flags: input.redFlags,
      p_is_emergency: input.isEmergency,
      p_history_mode: input.historyMode,
    })
    if (!error) return
    console.warn('[PatientRegistry] Supabase intake save failed:', error.message)
    return
  }

  const patients = read<PatientRegistryRecord[]>(PATIENTS_KEY, [])
  write(
    PATIENTS_KEY,
    patients.map((patient) => patient.patientId === patientId
      ? { ...patient, summaries: [summary, ...patient.summaries], updatedAt: new Date().toISOString() }
      : patient)
  )
}

export async function searchPatient(patientIdOrPhone: string): Promise<PatientRegistryRecord | null> {
  const patientId = getPatientId(patientIdOrPhone)
  if (supabase) {
    const { data, error } = await supabase.rpc('find_kiosk_patient', { p_patient_id: patientId })
    if (!error && data) return fromSupabasePatient(data as Record<string, unknown>)
    if (error) console.warn('[PatientRegistry] Supabase search failed:', error.message)
    return null
  }
  return read<PatientRegistryRecord[]>(PATIENTS_KEY, []).find(
    (patient) => patient.patientId === patientId
  ) ?? null
}

export function createAccessRequest(input: Omit<DoctorAccessRequest, 'id' | 'status' | 'createdAt'>): DoctorAccessRequest {
  const request: DoctorAccessRequest = {
    ...input,
    id: `access_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  write(ACCESS_REQUESTS_KEY, [request, ...getAccessRequests()])
  return request
}

export function getAccessRequests(patientId?: string): DoctorAccessRequest[] {
  const requests = read<DoctorAccessRequest[]>(ACCESS_REQUESTS_KEY, [])
  return patientId ? requests.filter((request) => request.patientId === patientId) : requests
}

export function respondToAccessRequest(requestId: string, status: 'approved' | 'denied'): void {
  write(
    ACCESS_REQUESTS_KEY,
    getAccessRequests().map((request) => request.id === requestId
      ? { ...request, status, respondedAt: new Date().toISOString() }
      : request)
  )
}