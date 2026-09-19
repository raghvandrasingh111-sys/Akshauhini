import { useEffect, useState } from 'react'
import { LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOutDoctor } from '../services/supabase/authService'
import { getDashboardMetrics } from '../services/supabase/opdService'
import { getHospitalById } from '../services/supabase/hospitalService'
import type { DashboardMetrics } from '../types/database'

export function DoctorDashboardPage() {
  const navigate = useNavigate()
  const { doctor } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({ waiting: 0, inConsultation: 0, completed: 0, priorityAlerts: 0 })
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [hospitalName, setHospitalName] = useState('Hospital')

  useEffect(() => {
    if (!doctor) return
    if (doctor.isDevelopmentUser) {
      setHospitalName('Development Environment')
      setState('ready')
      return
    }
    let active = true
    Promise.all([getDashboardMetrics(doctor.hospital_id), getHospitalById(doctor.hospital_id)]).then(([result, hospital]) => {
      if (!active) return
      setMetrics(result)
      setHospitalName(hospital?.name ?? 'Hospital')
      setState('ready')
    }).catch((reason: unknown) => {
      if (!active) return
      setState('error')
      setError(reason instanceof Error ? reason.message : 'Unable to load dashboard metrics')
    })
    return () => { active = false }
  }, [doctor])

  async function logout() {
    await signOutDoctor()
    navigate('/doctor')
  }

  if (!doctor) return null
  const cards = [
    ['Waiting', metrics.waiting],
    ['In Consultation', metrics.inConsultation],
    ['Completed', metrics.completed],
    ['Priority Alerts', metrics.priorityAlerts],
  ]

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F5132]">SANJEEVANI · Doctor Portal</div><h1 className="mt-1 text-2xl font-semibold">Good morning, {doctor.full_name}</h1><p className="text-sm text-slate-500">{hospitalName}</p>{doctor.isDevelopmentUser && <p className="mt-1 text-xs font-medium text-amber-700">Development Doctor</p>}</div>
          <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div><div className="mt-3 text-3xl font-semibold">{state === 'loading' ? '...' : value}</div></div>)}
        </section>
        {state === 'error' && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Patient Discovery</h2><p className="mt-1 text-sm text-slate-500">Find a patient by ABHA ID before requesting consented record access.</p></div><button type="button" onClick={() => navigate('/doctor/patients/search')} className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-medium text-white"><Search className="h-4 w-4" /> Find Patient</button></div>
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold">Today&apos;s OPD Queue</h2><p className="mt-2 text-sm text-slate-500">{metrics.waiting + metrics.inConsultation + metrics.completed === 0 ? 'No OPD patients found for today.' : 'Queue metrics are loaded from Supabase.'}</p></section>
      </div>
    </main>
  )
}
