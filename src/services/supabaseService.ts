import type {
  ClinicalSummary,
  PatientIdentity,
  InterviewAnswer,
  RedFlag,
} from '../types'
import { supabase } from '../lib/supabase'
import { isUuid, toValidUuidOrNull } from '../lib/uuid'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'offline' | 'error'

export interface SaveIntakeResult {
  status: SyncStatus
  id?: string
  error?: string
}

// ─── Save patient intake to Supabase ─────────────────────────────────────────

/**
 * Persists a completed patient intake to the kiosk_intakes Supabase table.
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
    let patientUuid: string | null = toValidUuidOrNull(identity.databaseId)

    if (!patientUuid && isUuid(identity.patientId)) {
      patientUuid = identity.patientId
    }

    // If not a direct UUID, look up patient UUID from database
    if (!patientUuid) {
      const patientKey = (identity.patientId || identity.phone || identity.abhaId || identity.abhaNumber || '').trim()
      if (patientKey) {
        const { data: patientRow, error: patientError } = await supabase
          .from('patients')
          .select('id')
          .or(`patient_id.eq.${patientKey},phone.eq.${patientKey},abha_number.eq.${patientKey}`)
          .maybeSingle()

        if (!patientError && patientRow && isUuid(patientRow.id)) {
          patientUuid = patientRow.id
        }
      }
    }

    if (!patientUuid) {
      const msg = 'Patient registration UUID not found for intake sync.'
      console.warn('[Supabase] Intake save skipped:', msg)
      return { status: 'offline', error: msg }
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
