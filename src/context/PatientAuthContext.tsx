import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getCurrentPatientRecord, signOutPatient } from '../services/supabase/patientAuthService'
import { fromSupabasePatient, type PatientRegistryRecord } from '../services/patientRegistryService'

type PatientAuthValue = {
  session: Session | null
  patient: PatientRegistryRecord | null
  loading: boolean
  signOut: () => Promise<void>
}

const PatientAuthContext = createContext<PatientAuthValue | null>(null)

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [patient, setPatient] = useState<PatientRegistryRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    const resolve = async (nextSession: Session | null) => {
      setSession(nextSession)
      if (!nextSession) {
        setPatient(null)
        setLoading(false)
        return
      }
      const result = await getCurrentPatientRecord()
      if (active) {
        setPatient(result.data ? fromSupabasePatient(result.data as Record<string, unknown>) : null)
        setLoading(false)
      }
    }
    void supabase.auth.getSession().then(({ data }) => void resolve(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') void resolve(nextSession)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await signOutPatient()
    setSession(null)
    setPatient(null)
  }

  return <PatientAuthContext.Provider value={{ session, patient, loading, signOut }}>{children}</PatientAuthContext.Provider>
}

export function usePatientAuth() {
  const value = useContext(PatientAuthContext)
  if (!value) throw new Error('usePatientAuth must be used inside PatientAuthProvider')
  return value
}
