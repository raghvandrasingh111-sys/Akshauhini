import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { DoctorProfile } from '../../types/database'

export class DoctorAuthError extends Error {
  constructor(message: string, public readonly code: 'DOCTOR_PROFILE_MISSING' | 'INACTIVE_DOCTOR' | 'DATABASE_ERROR') {
    super(message)
  }
}

export function createDevelopmentDoctorProfile(session: Session): DoctorProfile {
  const fullName = typeof session.user.user_metadata?.full_name === 'string'
    ? session.user.user_metadata.full_name
    : session.user.email ?? 'Development Doctor'

  return {
    id: session.user.id,
    full_name: fullName,
    email: session.user.email ?? '',
    registration_number: '',
    specialization: 'Development Doctor',
    hospital_id: '',
    role: 'doctor',
    avatar_url: null,
    is_active: true,
    isDevelopmentUser: true,
    created_at: session.user.created_at,
    updated_at: session.user.updated_at ?? session.user.created_at,
  }
}

export async function signInDoctor(email: string, password: string) {
  if (!supabase) {
    return { data: { user: null, session: null }, error: new Error('Supabase is not configured') }
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpDoctor(email: string, password: string, fullName: string) {
  if (!supabase) {
    return { data: { user: null, session: null }, error: new Error('Supabase is not configured') }
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
}

export async function signOutDoctor() {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') }
  }

  return supabase.auth.signOut()
}

export async function getCurrentDoctorProfile(session?: Session | null): Promise<{ data: DoctorProfile | null; error: DoctorAuthError | null }> {
  if (!supabase) {
    return { data: null, error: new DoctorAuthError('Supabase is not configured', 'DATABASE_ERROR') }
  }

  const currentSession = session === undefined ? (await supabase.auth.getSession()).data.session : session
  if (!currentSession) {
    return { data: null, error: new DoctorAuthError('Session not available', 'DATABASE_ERROR') }
  }

  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', currentSession.user.id)
    .maybeSingle()

  if (error) {
    return { data: null, error: new DoctorAuthError(error.message, 'DATABASE_ERROR') }
  }

  if (!data) {
    return { data: null, error: new DoctorAuthError('Doctor profile not found. Please contact your hospital administrator.', 'DOCTOR_PROFILE_MISSING') }
  }

  if ('is_active' in data && data.is_active === false) {
    return { data: null, error: new DoctorAuthError('This doctor profile is inactive. Please contact your hospital administrator.', 'INACTIVE_DOCTOR') }
  }

  return { data: data as DoctorProfile, error: null }
}

export async function getDoctorSession() {
  if (!supabase) {
    return { data: { session: null }, error: new Error('Supabase is not configured') }
  }

  return supabase.auth.getSession()
}
