import { createClient } from '@supabase/supabase-js'
import type {
  ClinicalSummary,
  PatientIdentity,
  InterviewAnswer,
  RedFlag,
} from '../types'

// ─── Supabase client (singleton) ─────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'offline' | 'error'

export interface SaveIntakeResult {
  status: SyncStatus
  id?: string
  error?: string
}

// ─── Save patient intake to Supabase ─────────────────────────────────────────

/**
 * Persists a completed patient intake to the patient_intakes Supabase table.
 * Falls back gracefully (returns 'offline') if Supabase is not configured or
 * unavailable — localStorage is always saved first by the caller.
 */
export async function saveIntakeToSupabase(
  summary: ClinicalSummary,
  identity: PatientIdentity,
  answers: InterviewAnswer[],
  redFlags: RedFlag[],
  isEmergency: boolean,
  historyMode: string
): Promise<SaveIntakeResult> {
  if (!supabase) {
    console.warn('[Supabase] Client not initialised — missing env vars.')
    return { status: 'offline', error: 'Supabase not configured' }
  }

  const row = {
    // Patient demographics
    patient_name: identity.name,
    patient_age: identity.age,
    patient_gender: identity.gender,
    abha_id: identity.abhaId ?? null,
    is_abha_verified: identity.isAbhaVerified ?? false,
    phone: identity.phone ?? null,
    address: identity.address ?? null,

    // Clinical summary fields
    chief_complaint: summary.chiefComplaint,
    hpi: summary.hpi,
    past_history: summary.pastHistory,
    medications: summary.medications,
    allergies: summary.allergies,
    review_of_systems: summary.reviewOfSystems,
    prior_investigations: summary.priorInvestigations,

    // Triage & urgency
    urgency_level: summary.geminiAnalysis?.urgencyLevel ?? 'Routine',
    is_emergency: isEmergency,
    history_mode: historyMode,

    // JSONB blobs
    interview_answers: answers,
    red_flags: redFlags,
    gemini_analysis: summary.geminiAnalysis ?? null,
    documents: summary.documents ?? [],
    fhir_bundle: summary.fhirBundle ?? null,
  }

  try {
    const { data, error } = await supabase
      .from('patient_intakes')
      .insert(row)
      .select('id')
      .single()

    if (error) {
      console.error('[Supabase] Insert failed:', error.message)
      return { status: 'error', error: error.message }
    }

    console.info('[Supabase] Intake saved id:', data?.id)
    return { status: 'synced', id: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Supabase] Exception during save:', msg)
    return { status: 'error', error: msg }
  }
}
