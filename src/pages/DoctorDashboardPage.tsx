import { useEffect, useMemo, useState } from 'react'
import { Activity, Bell, Gauge, LogOut, Search, ShieldCheck, Stethoscope, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { signOutDoctor } from '../services/supabase/authService'
import { getDashboardMetrics, getQueueForToday } from '../services/supabase/opdService'
import { getHospitalById } from '../services/supabase/hospitalService'
import { searchPatientByIdentifier } from '../services/supabase/patientService'
import { getHealthPulseSummary } from '../services/healthPulseService'
import type { DashboardMetrics, QueueVisit } from '../types/database'

export function DoctorDashboardPage() {
  const navigate = useNavigate()
  const { doctor } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({ waiting: 0, inConsultation: 0, completed: 0, priorityAlerts: 0 })
  const [queue, setQueue] = useState<QueueVisit[]>([])
  const [healthPulse, setHealthPulse] = useState<{ totalCases: number; topConditions: Array<{ condition: string; count: number; trend: string; changePercent: number | null; reason: string }> } | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'error'>('idle')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [hospitalName, setHospitalName] = useState('Hospital')
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today')

  useEffect(() => {
    if (!doctor) return
    if (doctor.isDevelopmentUser) {
      setHospitalName('Development Environment')
      setState('ready')
      return
    }
    let active = true
    Promise.all([
      getDashboardMetrics(doctor.hospital_id),
      getQueueForToday(doctor.hospital_id),
      getHealthPulseSummary(doctor.hospital_id, period),
      getHospitalById(doctor.hospital_id),
    ]).then(([result, queueData, pulse, hospital]) => {
      if (!active) return
      setMetrics(result)
      setQueue(queueData)
      setHealthPulse({
        totalCases: pulse.totalCases,
        topConditions: pulse.topConditions.map((signal) => ({
          condition: signal.condition,
          count: signal.count,
          trend: signal.trend,
          changePercent: signal.changePercent,
          reason: signal.reason,
        })),
      })
      setHospitalName(hospital?.name ?? 'Hospital')
      setState('ready')
    }).catch((reason: unknown) => {
      if (!active) return
      setState('error')
      setError(reason instanceof Error ? reason.message : 'Unable to load dashboard metrics')
    })
    return () => { active = false }
  }, [doctor, period])

  const filteredQueue = useMemo(() => queue.slice(0, 5), [queue])

  async function handlePatientSearch() {
    const value = searchValue.trim()
    if (!value) {
      setSearchState('error')
      setError('Enter a Patient ID or ABHA ID.')
      return
    }

    setSearchState('searching')
    try {
      const patient = await searchPatientByIdentifier(value)
      if (!patient) {
        setSearchState('not_found')
        setError('Patient not found.')
        return
      }
      setSearchState('found')
      navigate(`/doctor/patient/${patient.id}`)
    } catch (searchError) {
      setSearchState('error')
      setError(searchError instanceof Error ? searchError.message : 'Unable to search patient')
    }
  }

  async function logout() {
    await signOutDoctor()
    navigate('/doctor')
  }

  if (!doctor) return null

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#0F5132] p-2 text-white"><Stethoscope className="h-5 w-5" /></div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F5132]">Sanjeevani</div>
              <div className="text-sm text-slate-500">{hospitalName} · {doctor.full_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"><Bell className="h-4 w-4" /> 3 alerts</div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Secure session</div>
            <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Navigation</div>
            {[
              ['Overview', 'overview'],
              ['OPD Queue', 'queue'],
              ['Patient Search', 'search'],
              ['Consultations', 'consultations'],
              ['Health Pulse', 'pulse'],
              ['Records', 'records'],
              ['Alerts', 'alerts'],
              ['Audit', 'audit'],
              ['Settings', 'settings'],
            ].map(([label, value]) => (
              <button key={value} type="button" onClick={() => navigate(value === 'search' ? '/doctor/patients/search' : '/doctor/dashboard')} className="mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <span>{label}</span>
                {value === 'pulse' && <TrendingUp className="h-4 w-4 text-[#0F5132]" />}
              </button>
            ))}
          </aside>

          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                ['Total Consultations', metrics.waiting + metrics.inConsultation + metrics.completed || 0],
                ['Waiting', metrics.waiting],
                ['In Consultation', metrics.inConsultation],
                ['Completed', metrics.completed],
                ['Priority alerts', metrics.priorityAlerts],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</div>
                  <div className="mt-3 text-3xl font-bold text-slate-900">{state === 'loading' ? '...' : value}</div>
                </div>
              ))}
            </section>

            {state === 'error' && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Patient Search</div>
                  <h2 className="mt-1 text-xl font-bold">Find patient by Patient ID / ABHA</h2>
                </div>
                <button type="button" onClick={() => navigate('/doctor/patients/search')} className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-medium text-white"><Search className="h-4 w-4" /> Search</button>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="PAT-DEV-0001 or ABHA ID" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0F5132] focus:bg-white" />
                <button type="button" disabled={searchState === 'searching'} onClick={() => void handlePatientSearch()} className="rounded-xl bg-[#0F5132] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
                  {searchState === 'searching' ? 'Searching...' : 'Search'}
                </button>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Priority Patients</div>
                    <h3 className="mt-1 text-xl font-bold">Immediate attention</h3>
                  </div>
                  <Gauge className="h-5 w-5 text-[#0F5132]" />
                </div>
                <div className="space-y-3">
                  {filteredQueue.length === 0 ? <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No priority visits available.</div> : filteredQueue.map((visit) => (
                    <div key={visit.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900">{visit.patients?.patient_id ?? 'Unknown patient'}</div>
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">{visit.risk_level}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-500">{visit.patients?.full_name ?? 'Patient'}</div>
                      <div className="mt-2 text-sm text-slate-700">{visit.chief_complaint}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Health Pulse</div>
                    <h3 className="mt-1 text-xl font-bold">Disease trend intelligence</h3>
                  </div>
                  <div className="flex gap-2">
                    {(['today', '7d', '30d'] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${period === value ? 'bg-[#0F5132] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {value === 'today' ? 'Today' : value === '7d' ? '7d' : '30d'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 rounded-xl bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current period</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{healthPulse?.totalCases ?? 0}</div>
                  <div className="text-sm text-slate-500">total consultations</div>
                </div>

                <div className="space-y-3">
                  {healthPulse && healthPulse.topConditions.length > 0 ? healthPulse.topConditions.map((signal) => (
                    <div key={signal.condition} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-900">{signal.condition}</div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">{signal.trend}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{signal.count} cases · {signal.changePercent === null ? 'insufficient data' : `${signal.changePercent >= 0 ? '+' : ''}${signal.changePercent.toFixed(1)}% vs baseline`}</div>
                      <div className="mt-2 text-xs text-slate-500">{signal.reason}</div>
                    </div>
                  )) : <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Insufficient historical data to detect a trend.</div>}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Today&apos;s OPD</div>
                  <h3 className="mt-1 text-xl font-bold">Queue summary</h3>
                </div>
                <Activity className="h-5 w-5 text-[#0F5132]" />
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Waiting', metrics.waiting],
                  ['In consultation', metrics.inConsultation],
                  ['Completed', metrics.completed],
                  ['Priority alerts', metrics.priorityAlerts],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
