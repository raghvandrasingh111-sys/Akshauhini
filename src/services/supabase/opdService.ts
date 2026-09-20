import { supabase } from '../../lib/supabase'
import { isUuid, toValidUuidOrNull } from '../../lib/uuid'
import type { DashboardMetrics, OpdVisit, QueueVisit } from '../../types/database'

export async function getDashboardMetrics(hospitalId: string): Promise<DashboardMetrics> {
  if (!supabase || !hospitalId || !isUuid(hospitalId)) {
    return { waiting: 0, inConsultation: 0, completed: 0, priorityAlerts: 0 }
  }

  const { data, error } = await supabase
    .from('opd_visits')
    .select('status, risk_level')
    .eq('hospital_id', hospitalId)
    .gte('arrival_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

  if (error || !data) {
    return { waiting: 0, inConsultation: 0, completed: 0, priorityAlerts: 0 }
  }

  return {
    waiting: data.filter((visit) => visit.status === 'waiting').length,
    inConsultation: data.filter((visit) => visit.status === 'in_consultation').length,
    completed: data.filter((visit) => visit.status === 'completed').length,
    priorityAlerts: data.filter((visit) => ['priority', 'emergency'].includes(visit.risk_level)).length,
  }
}

export async function getQueueForToday(hospitalId: string): Promise<QueueVisit[]> {
  if (!supabase || !hospitalId || !isUuid(hospitalId)) {
    return []
  }

  const { data, error } = await supabase
    .from('opd_visits')
    .select('*, patients(*)')
    .eq('hospital_id', hospitalId)
    .gte('arrival_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order('queue_position', { ascending: true })

  if (error) {
    return []
  }

  return (data as QueueVisit[]) ?? []
}

export async function updateVisitStatus(visitId: string, status: OpdVisit['status']) {
  const visitUuid = toValidUuidOrNull(visitId)
  if (!supabase || !visitUuid) {
    return { data: null, error: new Error('Valid visit UUID required') }
  }

  return supabase.from('opd_visits').update({ status, updated_at: new Date().toISOString() }).eq('id', visitUuid)
}
