import type {
  ClinicalSummary,
  PatientIdentity,
  InterviewAnswer,
  RedFlag,
} from '../types'
import { supabase } from '../lib/supabase'

// ─── Supabase client (singleton) ─────────────────────────────────────────────

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

  try {
    const patientKey = identity.databaseId ?? identity.patientId ?? identity.abhaId ?? identity.phone
    let patientUuid: string | null = null

    if (identity.databaseId) {
      patientUuid = identity.databaseId
    } else if (patientKey) {
      const { data: patientRow, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .or(`patient_id.eq.${patientKey},phone.eq.${patientKey},abha_number.eq.${patientKey}`)
        .maybeSingle()

      if (patientError) {
        throw patientError
      }
      patientUuid = (patientRow as { id?: string } | null)?.id ?? null
    }

    if (!patientUuid) {
      const msg = 'Patient registration not found for intake sync.'
      console.warn('[Supabase] Intake save skipped:', msg)
      return { status: 'error', error: msg }
    }

    const row = {
      patient_id: patientUuid,
      language: 'en',
      answers: answers,
      documents: summary.documents ?? [],
      clinical_summary: {
        chiefComplaint: summary.chiefComplaint,
        hpi: summary.hpi,
        pastHistory: summary.pastHistory,
        medications: summary.medications,
        allergies: summary.allergies,
        reviewOfSystems: summary.reviewOfSystems,
        priorInvestigations: summary.priorInvestigations,
        geminiAnalysis: summary.geminiAnalysis ?? null,
      },
      red_flags: redFlags,
      is_emergency: isEmergency,
      history_mode: historyMode,
    }

    const { data, error } = await supabase
      .from('kiosk_intakes')
      .insert(row)
      .select('id')
      .single()

    if (error) {
      console.error('[Supabase] Kiosk intake insert failed:', error.message)
      return { status: 'error', error: error.message }
    }

    console.info('[Supabase] Kiosk intake saved id:', data?.id)
    return { status: 'synced', id: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Supabase] Exception during intake save:', msg)
    return { status: 'error', error: msg }
  }
}
