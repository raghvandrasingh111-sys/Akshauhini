import { supabase } from '../../lib/supabase'
import type { Hospital } from '../../types/database'

export async function getHospitalById(hospitalId: string): Promise<Hospital | null> {
  if (!supabase || !hospitalId || hospitalId.trim() === '') {
    return {
      id: 'demo-hospital',
      name: 'Development Hospital',
      registration_number: 'DEV-HOSP-001',
      address: 'Demo District Hospital',
      phone: '1800-000-000',
      email: 'demo@hospital.local',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabase.from('hospitals').select('*').eq('id', hospitalId).maybeSingle()
  if (error) throw error
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
