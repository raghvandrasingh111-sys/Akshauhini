import { supabase } from '../../lib/supabase'
import { isUuid } from '../../lib/uuid'
import type { OpdVisit, PatientRecord } from '../../types/database'

export function normalizeAbhaNumber(value: string) {
  return value.replace(/\s+/g, '').replace(/-/g, '')
}

export function isValidAbhaNumber(value: string) {
  return /^\d{14}$/.test(normalizeAbhaNumber(value))
}

export async function searchPatientByABHA(abhaNumber: string): Promise<PatientRecord | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  const normalizedAbha = normalizeAbhaNumber(abhaNumber)
  if (!normalizedAbha) return null
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('abha_number', normalizedAbha)
    .maybeSingle()

  if (error) throw error
  return (data as PatientRecord | null) ?? null
}

export async function searchPatientByIdentifier(identifier: string): Promise<PatientRecord | null> {
  const value = identifier.trim()
  if (!value) return null

  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  // If user searched by primary UUID
  if (isUuid(value)) {
    const uuidResult = await supabase.from('patients').select('*').eq('id', value).maybeSingle()
    if (!uuidResult.error && uuidResult.data) {
      return uuidResult.data as PatientRecord
    }
  }

  const exactQuery = supabase.from('patients').select('*')
  const patientIdResult = await exactQuery.eq('patient_id', value.toUpperCase()).maybeSingle()
  if (patientIdResult.error) throw patientIdResult.error
  if (patientIdResult.data) return patientIdResult.data as PatientRecord

  // Also check phone match
  const phoneQuery = supabase.from('patients').select('*')
  const phoneResult = await phoneQuery.eq('phone', value).maybeSingle()
  if (!phoneResult.error && phoneResult.data) return phoneResult.data as PatientRecord

  const abhaInput = normalizeAbhaNumber(value)
  if (abhaInput) {
    const abhaResult = await supabase
      .from('patients')
      .select('*')
      .or(`abha_number.eq.${abhaInput},masked_abha.eq.${value}`)
      .maybeSingle()

    if (abhaResult.error) throw abhaResult.error
    if (abhaResult.data) return abhaResult.data as PatientRecord
  }

  return null
}

export async function getPatientById(patientId: string): Promise<PatientRecord | null> {
  const value = (patientId || '').trim()
  if (!value) return null

  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  // If UUID, query by id
  if (isUuid(value)) {
    const { data, error } = await supabase.from('patients').select('*').eq('id', value).maybeSingle()
    if (error) throw error
    if (data) return data as PatientRecord
  }

  // Fallback to patient_id / phone / abha
  const fallback = await searchPatientByIdentifier(value)
  return fallback
}

export async function getCurrentPatientVisit(patientId: string): Promise<OpdVisit | null> {
  const value = (patientId || '').trim()
  if (!value) return null
  if (!supabase) throw new Error('Supabase is not configured')

  let patientUuid = isUuid(value) ? value : null
  if (!patientUuid) {
    const patientRecord = await searchPatientByIdentifier(value)
    if (patientRecord && isUuid(patientRecord.id)) {
      patientUuid = patientRecord.id
    }
  }

  if (!patientUuid) return null

  const { data, error } = await supabase
    .from('opd_visits')
    .select('*')
    .eq('patient_id', patientUuid)
    .order('arrival_time', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as OpdVisit | null) ?? null
}
