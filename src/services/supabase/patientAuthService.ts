import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export function normalizePatientPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10)
  return digits ? `+91${digits}` : ''
}

export function isValidPatientPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))
}

export async function signUpPatient(phone: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase is not configured') }
  return supabase.auth.signUp({ phone: normalizePatientPhone(phone), password })
}

export async function signInPatientWithGoogle() {
  if (!supabase) return { data: { provider: null, url: null }, error: new Error('Supabase is not configured') }
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${appUrl}/patient` },
  })
}

export async function registerGooglePatient(input: {
  aadhaarNumber: string
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
}) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.rpc('register_google_patient', {
    p_aadhaar_number: input.aadhaarNumber,
    p_full_name: input.fullName,
    p_age: input.age,
    p_gender: input.gender,
    p_phone: input.phone,
    p_email: input.email,
    p_hospital_id: import.meta.env.VITE_DEFAULT_HOSPITAL_ID || null,
  })
  if (error) throw error
  return data
}

export async function registerManualPatient(input: {
  aadhaarNumber: string
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone: string
}) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.rpc('register_manual_patient', {
    p_aadhaar_number: input.aadhaarNumber,
    p_full_name: input.fullName,
    p_age: input.age,
    p_gender: input.gender,
    p_phone: input.phone,
    p_hospital_id: import.meta.env.VITE_DEFAULT_HOSPITAL_ID || null,
  })
  if (error) throw error
  return data
}

export async function signInPatient(phone: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error('Supabase is not configured') }
  return supabase.auth.signInWithPassword({ phone: normalizePatientPhone(phone), password })
}

export async function signOutPatient() {
  if (!supabase) return { error: new Error('Supabase is not configured') }
  return supabase.auth.signOut()
}

export async function linkPatientAccount(session: Session, patientId: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.rpc('link_patient_auth_user', {
    p_patient_id: patientId,
    p_auth_user_id: session.user.id,
  })
  if (error) throw error
}

export async function getCurrentPatientRecord() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase.rpc('get_current_patient')
}
