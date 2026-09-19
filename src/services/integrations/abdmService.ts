import { searchPatientByABHA } from '../supabase/patientService'
import type { PatientRecord } from '../../types/database'

export const abdmService = {
  async findPatientByABHA(abha: string): Promise<PatientRecord | null> {
    return searchPatientByABHA(abha)
  },

  async requestConsent() {
    throw new Error('ABDM consent integration is not connected; use the Supabase consent workflow.')
  },

  async getConsentStatus() {
    throw new Error('ABDM consent integration is not connected; use the Supabase consent workflow.')
  },

  async fetchAuthorizedRecords() {
    throw new Error('ABDM records integration is not connected; authorized records must be loaded through Supabase after consent.')
  },
}
