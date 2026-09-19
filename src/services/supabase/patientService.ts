import { supabase } from '../../lib/supabase'
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
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('abha_number', normalizedAbha)
    .maybeSingle()

  if (error) throw error
  return (data as PatientRecord | null) ?? null
}

export async function searchPatientByIdentifier(identifier: string): Promise<PatientRecord | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  const normalized = identifier.replace(/\D/g, '').slice(-10)
  const query = supabase.from('patients').select('*')
  const { data, error } = normalized.length === 10
    ? await query.or(`patient_id.eq.${normalized},phone.eq.${normalized},abha_number.eq.${normalized}`).maybeSingle()
    : await query.eq('patient_id', identifier.trim()).maybeSingle()
  if (error) throw error
  return (data as PatientRecord | null) ?? null
}

export async function getPatientById(patientId: string): Promise<PatientRecord | null> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.from('patients').select('*').eq('id', patientId).single()

  if (error) {
    throw error
  }

  return data as PatientRecord
}

export async function getCurrentPatientVisit(patientId: string): Promise<OpdVisit | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('opd_visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('arrival_time', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as OpdVisit | null) ?? null
}

