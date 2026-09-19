import { supabase } from '../../lib/supabase'
import type { DashboardMetrics, OpdVisit, QueueVisit } from '../../types/database'

export async function getDashboardMetrics(hospitalId: string): Promise<DashboardMetrics> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('opd_visits')
    .select('status, risk_level')
    .eq('hospital_id', hospitalId)
    .gte('arrival_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

  if (error || !data) {
    throw error ?? new Error('Unable to load dashboard metrics')
  }

  return {
    waiting: data.filter((visit) => visit.status === 'waiting').length,
    inConsultation: data.filter((visit) => visit.status === 'in_consultation').length,
    completed: data.filter((visit) => visit.status === 'completed').length,
    priorityAlerts: data.filter((visit) => ['priority', 'emergency'].includes(visit.risk_level)).length,
  }
}

export async function getQueueForToday(hospitalId: string): Promise<QueueVisit[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('opd_visits')
    .select('*, patients(*)')
    .eq('hospital_id', hospitalId)
    .gte('arrival_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order('queue_position', { ascending: true })

  if (error) {
    throw error
  }

  return (data as QueueVisit[]) ?? []
}

export async function updateVisitStatus(visitId: string, status: OpdVisit['status']) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }

  return supabase.from('opd_visits').update({ status, updated_at: new Date().toISOString() }).eq('id', visitId)
}
