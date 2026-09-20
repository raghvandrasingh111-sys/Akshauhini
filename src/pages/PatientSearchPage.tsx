import { FormEvent, useState } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { searchPatientByIdentifier } from '../services/supabase/patientService'
import type { PatientRecord } from '../types/database'

export function PatientSearchPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [state, setState] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setPatient(null)
    if (!identifier.trim()) {
      setState('error')
      setMessage('Enter a Patient ID, phone number, or ABHA ID.')
      return
    }

    setState('searching')
    setMessage('')
    try {
      const result = await searchPatientByIdentifier(identifier)
      if (!result) {
        setState('not_found')
        setMessage('Patient not found')
        return
      }
      setPatient(result)
      setState('found')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Database error')
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Patient discovery</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Find Patient</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <button type="button" onClick={() => navigate('/doctor/dashboard')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">Dashboard</button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Patient ID, phone, or ABHA number"
              aria-label="Patient identifier"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0F5132] focus:bg-white"
            />
            <button type="submit" disabled={state === 'searching'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
              <Search className="h-4 w-4" />
              {state === 'searching' ? 'Searching...' : 'Search Patient'}
            </button>
          </form>

          {message && <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${state === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{message}</div>}

          {patient && state === 'found' && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" /> Patient Found</div>
              <div className="mt-4 text-xl font-semibold">{patient.full_name}</div>
              <div className="mt-1 text-sm text-slate-600">{patient.gender ?? 'Gender not recorded'}</div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">Patient ID</dt><dd className="mt-1 font-medium">{patient.patient_id}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-slate-500">ABHA</dt><dd className="mt-1 font-medium">{patient.masked_abha ?? 'Masked identifier unavailable'}</dd></div>
                {patient.phone && <div><dt className="text-xs uppercase tracking-wide text-slate-500">Phone</dt><dd className="mt-1 font-medium">{patient.phone}</dd></div>}
              </dl>
              <p className="mt-5 text-sm text-slate-700">Record access requires patient consent.</p>
              <button type="button" onClick={() => navigate(`/doctor/patient/${patient.id}`)} className="mt-4 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-medium text-white">Open Patient</button>
            </div>
          )}

          {state === 'not_found' && <button type="button" onClick={() => { setIdentifier(''); setState('idle'); setMessage('') }} className="mt-4 text-sm font-medium text-[#0F5132]">Try another patient identifier</button>}
        </section>
      </div>
    </main>
  )
}
