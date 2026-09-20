import { supabase } from '../../lib/supabase'
import { isUuid } from '../../lib/uuid'
import type { Hospital } from '../../types/database'

const FALLBACK_HOSPITAL: Hospital = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Development Hospital',
  registration_number: 'DEV-HOSP-001',
  address: 'Demo District Hospital',
  phone: '1800-000-000',
  email: 'demo@hospital.local',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export async function getHospitalById(hospitalId: string): Promise<Hospital | null> {
  if (!supabase || !hospitalId || !isUuid(hospitalId)) {
    return FALLBACK_HOSPITAL
  }

  const { data, error } = await supabase.from('hospitals').select('*').eq('id', hospitalId).maybeSingle()
  if (error) {
    console.warn('[HospitalService] Hospital fetch error:', error.message)
    return FALLBACK_HOSPITAL
  }
  return (data as Hospital | null) ?? {
    id: hospitalId,
    name: 'Hospital',
    registration_number: 'UNKNOWN',
    address: 'Hospital registration pending',
    phone: '',
    email: '',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
