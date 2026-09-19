import { useEffect, useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentPatientVisit, getPatientById } from '../services/supabase/patientService'
import { getConsentStatus, grantConsent, requestPatientConsent } from '../services/supabase/consentService'
import { getPatientTimeline, writeAuditLog } from '../services/supabase/clinicalService'
import type { ConsentRequest, OpdVisit, PatientRecord } from '../types/database'

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { doctor } = useAuth()
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [currentVisit, setCurrentVisit] = useState<OpdVisit | null>(null)
  const [consent, setConsent] = useState<ConsentRequest | null>(null)
  const [timelineCount, setTimelineCount] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'not_found' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const currentDoctor = doctor
    const currentPatientId = patientId
    if (!currentPatientId || !currentDoctor) return
    let active = true
    async function load() {
      try {
        const result = await getPatientById(currentPatientId!)
        if (!result) {
          setState('not_found')
          return
        }
        const [consentResult, visit] = await Promise.all([
          getConsentStatus(result.id, currentDoctor!.id),
          getCurrentPatientVisit(result.id),
        ])
        if (!active) return
        setPatient(result)
        setCurrentVisit(visit)
        await writeAuditLog({ patientId: result.id, action: 'PATIENT_ACCESSED', entityType: 'patient', entityId: result.id })
        setConsent((consentResult.data as ConsentRequest | null) ?? null)
        if (consentResult.data?.status === 'granted') {
          const timeline = await getPatientTimeline(result.id)
          if (active) setTimelineCount(timeline.length)
        }
        setState('ready')
      } catch (error) {
        if (active) {
          setState('error')
          setMessage(error instanceof Error ? error.message : 'Database error')
        }
      }
    }
    void load()
    return () => { active = false }
  }, [doctor, patientId])

  async function requestConsent() {
    if (!patient || !doctor) return
    const result = await requestPatientConsent({
      patientId: patient.id,
      hospitalId: doctor.hospital_id,
      purpose: 'Clinical consultation',
      requestedDataTypes: ['authorized_records', 'medical_documents', 'patient_timeline', 'ai_clinical_brief'],
    })
    if (result.error) {
      setMessage(result.error.message)
      return
    }
    setConsent(result.data as ConsentRequest)
  }

  async function simulateConsent() {
    if (!consent || import.meta.env.VITE_ABDM_MODE !== 'development') return
    const result = await grantConsent(consent.id)
    if (result.error) {
      setMessage(result.error.message)
      return
    }
    setConsent(result.data as ConsentRequest)
  }

  if (state === 'loading') return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Loading patient identity...</div>
  if (state === 'not_found') return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Patient not found</div>
  if (state === 'error') return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-red-700">{message}</div>
  if (!patient) return null

  const granted = consent?.status === 'granted'
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/doctor/patients/search')} className="mb-6 text-sm font-medium text-[#0F5132]">Back to patient search</button>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Patient identity</div><h1 className="mt-1 text-3xl font-semibold">{patient.full_name}</h1><p className="mt-1 text-sm text-slate-600">{patient.gender ?? 'Gender not recorded'} · Patient ID: {patient.patient_id}</p></div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">ABHA: {patient.masked_abha ?? 'Masked identifier unavailable'}</div>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current OPD visit</div>
            <div className="mt-2 font-medium text-slate-800">{currentVisit ? `${currentVisit.token_number} · ${currentVisit.status.replace('_', ' ')}` : 'No current OPD visit'}</div>
            {currentVisit && <div className="mt-1 text-slate-600">{currentVisit.chief_complaint}</div>}
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800"><LockKeyhole className="h-4 w-4" /> Patient record access requires consent.</div>
            {!granted && <p className="mt-1 text-sm text-amber-700">Identity is visible. Medical records remain locked.</p>}
          </div>
          {consent?.status === 'pending' && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">Consent request pending.</div>}
          {message && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
          {!consent && <button type="button" onClick={() => void requestConsent()} className="mt-5 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-medium text-white">Request Patient Consent</button>}
          {consent?.status === 'pending' && import.meta.env.VITE_ABDM_MODE === 'development' && <button type="button" onClick={() => void simulateConsent()} className="mt-5 rounded-xl border border-[#0F5132] bg-white px-4 py-2.5 text-sm font-medium text-[#0F5132]">Simulate Patient Consent</button>}
          {granted && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" /> Development / Test Consent</div><p className="mt-2 text-sm text-emerald-700">Authorized records unlocked. Timeline events available: {timelineCount}.</p></div>}
        </section>
      </div>
    </main>
  )
}
