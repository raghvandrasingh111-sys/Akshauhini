import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { createDevelopmentDoctorProfile, getCurrentDoctorProfile } from '../services/supabase/authService'
import type { DoctorProfile } from '../types/database'

type AuthStatus = 'AUTH_LOADING' | 'AUTHENTICATED' | 'NOT_AUTHENTICATED' | 'DOCTOR_PROFILE_MISSING' | 'DATABASE_ERROR'

type AuthContextValue = {
  session: Session | null
  doctor: DoctorProfile | null
  status: AuthStatus
  error: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [status, setStatus] = useState<AuthStatus>('AUTH_LOADING')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setStatus('DATABASE_ERROR')
      setError('Supabase is not configured.')
      return
    }

    let active = true

    async function resolveSession(nextSession: Session | null) {
      if (!active) return
      setSession(nextSession)
      setDoctor(null)
      setError(null)

      if (!nextSession) {
        setStatus('NOT_AUTHENTICATED')
        return
      }

      setStatus('AUTH_LOADING')
      const result = await getCurrentDoctorProfile(nextSession)
      if (!active) return
      if (result.error) {
        if (import.meta.env.VITE_APP_MODE === 'development') {
          setDoctor(createDevelopmentDoctorProfile(nextSession))
          setStatus('AUTHENTICATED')
          return
        }
        setStatus(result.error.code === 'DOCTOR_PROFILE_MISSING' ? 'DOCTOR_PROFILE_MISSING' : 'DATABASE_ERROR')
        setError(result.error.message)
        return
      }

      setDoctor(result.data)
      setStatus('AUTHENTICATED')
    }

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setStatus('DATABASE_ERROR')
        setError(sessionError.message)
        return
      }
      void resolveSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        void resolveSession(null)
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void resolveSession(nextSession)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ session, doctor, status, error }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
