import type { ClinicalSummary, DoctorAccessRequest, PatientIdentity } from '../types'

export interface PatientRegistryRecord {
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

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone))
}

export function getPatientId(phone: string): string {
  return normalizePhone(phone)
}

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

export function getPatientByPhone(phone: string): PatientRegistryRecord | null {
  const patientId = getPatientId(phone)
  return read<PatientRegistryRecord[]>(PATIENTS_KEY, []).find(
    (patient) => patient.patientId === patientId
  ) ?? null
}

export function registerOrLoginPatient(input: {
  phone: string
  name: string
  age: number
  gender: PatientIdentity['gender']
  address?: string
}): PatientRegistryRecord {
  const patientId = getPatientId(input.phone)
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

export function savePatientSummary(patientId: string, summary: ClinicalSummary): void {
  const patients = read<PatientRegistryRecord[]>(PATIENTS_KEY, [])
  write(
    PATIENTS_KEY,
    patients.map((patient) => patient.patientId === patientId
      ? { ...patient, summaries: [summary, ...patient.summaries], updatedAt: new Date().toISOString() }
      : patient)
  )
}

export function searchPatient(patientIdOrPhone: string): PatientRegistryRecord | null {
  const patientId = getPatientId(patientIdOrPhone)
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