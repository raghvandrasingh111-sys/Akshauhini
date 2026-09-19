import { supabase } from '../../lib/supabase'
import type { Hospital } from '../../types/database'

export async function getHospitalById(hospitalId: string): Promise<Hospital | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('hospitals').select('*').eq('id', hospitalId).maybeSingle()
  if (error) throw error
  return (data as Hospital | null) ?? null
}
