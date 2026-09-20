import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Search, Send, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { searchPatientByIdentifier } from '../../services/supabase/patientService'
import { requestPatientConsent } from '../../services/supabase/consentService'
import { getPatientConsentRequests } from '../../services/supabase/patientPortalService'
import type { ConsentRequest, PatientRecord } from '../../types/database'

export function DoctorAccessScreen() {
  const { setStep } = useApp()
  const { doctor } = useAuth()
  const [patientId, setPatientId] = useState('')
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [requests, setRequests] = useState<ConsentRequest[]>([])
  const [doctorName, setDoctorName] = useState(doctor?.full_name ?? 'Dr. Ananya Mehta')
  const [facility, setFacility] = useState(doctor ? 'Secure hospital access' : 'Sanjeevani OPD')
  const [purpose, setPurpose] = useState('Clinical consultation and continuity of care')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (doctor?.full_name) {
      setDoctorName(doctor.full_name)
    }
    if (doctor?.hospital_id) {
      setFacility('Hospital-authorized access')
    }
  }, [doctor])

  const findPatient = async () => {
    const value = patientId.trim()
    if (!value) {
      setError('Enter a patient ID, phone number, or ABHA ID.')
      setPatient(null)
      setRequests([])
      return
    }

    try {
      const result = await searchPatientByIdentifier(value)
      if (!result) {
        setPatient(null)
        setRequests([])
        setError('No patient found for this identifier.')
        return
      }

      setPatient(result)
      const consentRequests = await getPatientConsentRequests(result.id)
      setRequests(consentRequests)
      setError('')
    } catch (lookupError) {
      setPatient(null)
      setRequests([])
      setError(lookupError instanceof Error ? lookupError.message : 'Unable to search patient.')
    }
  }

  const requestAccess = async () => {
    if (!patient) {
      setError('Search for a patient before requesting access.')
      return
    }

    if (!doctor) {
      setError('Sign in as a doctor first to send a real access request.')
      return
    }

    setSending(true)
    setError('')

    try {
      const result = await requestPatientConsent({
        patientId: patient.id,
        hospitalId: doctor.hospital_id || import.meta.env.VITE_DEFAULT_HOSPITAL_ID || '00000000-0000-0000-0000-000000000001',
        purpose,
        requestedDataTypes: ['clinical_summary', 'documents', 'timeline', 'ai_clinical_brief'],
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      const nextRequests = await getPatientConsentRequests(patient.id)
      setRequests(nextRequests)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send access request.')
    } finally {
      setSending(false)
    }
  }

  const approved = requests.some((request) => request.status === 'granted')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4 md:p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setStep('welcome')} className="flex items-center gap-2 text-teal-200 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to patient kiosk
        </button>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <section className="bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-teal-100 text-teal-700"><ShieldCheck className="w-7 h-7" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-teal-700">Authorized clinical access</p>
                <h1 className="text-2xl font-bold">Doctor Portal</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">Search a patient by their phone-based Patient ID, then request permission before viewing clinical history.</p>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Patient phone / Patient ID</label>
            <div className="flex gap-2 mb-2">
              <input value={patientId} onChange={(event) => setPatientId(event.target.value)} placeholder="e.g. 9876543210" className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-none" />
              <button onClick={findPatient} className="px-4 rounded-xl bg-teal-700 text-white font-bold flex items-center gap-2"><Search className="w-4 h-4" />Search</button>
            </div>
            {error && <p className="text-xs text-rose-600 font-medium mb-4">{error}</p>}

            <div className="space-y-3 mt-6 pt-6 border-t border-slate-200">
              <h2 className="font-bold">Requesting clinician</h2>
              <input value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="Doctor name" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
              <input value={facility} onChange={(event) => setFacility(event.target.value)} placeholder="Hospital or clinic" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
              <textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none" />
              <button onClick={() => void requestAccess()} disabled={!patient || sending || requests.some((request) => request.status === 'pending')} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40"><Send className="w-4 h-4" />{sending ? 'Sending...' : 'Request patient approval'}</button>
            </div>
          </section>

          <section className="bg-white/10 border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest font-bold text-teal-200 mb-2">Consent gate</p>
            <h2 className="text-2xl font-bold mb-2">Patient-controlled access</h2>
            <p className="text-sm text-slate-300 mb-6">Clinical records stay hidden until the patient approves a specific doctor and purpose.</p>

            {!patient ? (
              <div className="min-h-56 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-center text-slate-400 px-8">Search for a patient to begin an authorization request.</div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white text-slate-900">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Patient located</p>
                  <p className="text-xl font-bold mt-1">{patient.full_name}</p>
                  <p className="text-sm text-slate-500">Patient ID: <span className="font-mono font-bold">{patient.patient_id}</span></p>
                </div>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 rounded-2xl bg-white/10 border border-white/15">
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="font-bold">{doctorName}</p><p className="text-xs text-slate-300">{facility} · {request.purpose}</p></div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${request.status === 'granted' ? 'bg-emerald-400/20 text-emerald-200' : request.status === 'denied' ? 'bg-rose-400/20 text-rose-200' : 'bg-amber-400/20 text-amber-200'}`}>{request.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {approved ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-300/30 text-emerald-100">
                    <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-5 h-5" /> Authorized clinical record</div>
                    <p className="text-sm mt-2">This patient has approved access for this doctor. The doctor can now open the patient record from the authenticated doctor dashboard.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/30 text-amber-100 text-sm">Request sent. The patient must approve it from the patient portal before the doctor can view the full record.</div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
