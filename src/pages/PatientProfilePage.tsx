import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'
import { getCurrentPatientVisit, getPatientById } from '../services/supabase/patientService'
import { getConsentStatus, grantConsent, requestPatientConsent } from '../services/supabase/consentService'
import { createPatientTimelineEvent, getPatientTimeline, saveConsultation, writeAuditLog } from '../services/supabase/clinicalService'
import { getPatientDocuments, getPatientIntakes, type PatientIntakeRecord } from '../services/supabase/patientPortalService'
import { getMedicalDocumentUrl } from '../services/supabase/documentService'
import { compareClinicalData } from '../services/clinicalComparisonService'
import { analyzePatientIntakeWithGemini, generateSimulatedGeminiAnalysis } from '../services/geminiService'
import { detectRedFlags } from '../services/triageEngine'
import type { ExtractedDocument } from '../types'
import type { ConsentRequest, MedicalDocument, OpdVisit, PatientRecord } from '../types/database'

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { doctor } = useAuth()
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [currentVisit, setCurrentVisit] = useState<OpdVisit | null>(null)
  const [consent, setConsent] = useState<ConsentRequest | null>(null)
  const [timeline, setTimeline] = useState<Array<Record<string, unknown>>>([])
  const [documents, setDocuments] = useState<MedicalDocument[]>([])
  const [intakes, setIntakes] = useState<PatientIntakeRecord[]>([])
  const [brief, setBrief] = useState<ReturnType<typeof generateSimulatedGeminiAnalysis> | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'not_found' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [consultationOpen, setConsultationOpen] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState('')
  const [consultationAssessment, setConsultationAssessment] = useState('')
  const [consultationPlan, setConsultationPlan] = useState('')
  const [consultationFollowUp, setConsultationFollowUp] = useState('')
  const [consultationReferral, setConsultationReferral] = useState('')
  const [consultationSaving, setConsultationSaving] = useState(false)
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null)

  async function openDocument(doc: MedicalDocument) {
    try {
      setOpeningDocumentId(doc.id)
      const signedUrl = await getMedicalDocumentUrl(doc.storage_path, 600)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open document.')
    } finally {
      setOpeningDocumentId(null)
    }
  }

  useEffect(() => {
    const currentDoctor = doctor
    const currentPatientId = patientId
    const doctorId = currentDoctor?.id
    if (!currentPatientId || !doctorId) return

    const patientIdToLookup = currentPatientId
    const doctorIdToUse = doctorId

    let active = true
    async function load() {
      try {
        const result = await getPatientById(patientIdToLookup)
        if (!result) {
          setState('not_found')
          return
        }

        const [consentResult, visit, patientTimeline, patientDocuments, patientIntakes] = await Promise.all([
          getConsentStatus(result.id, doctorIdToUse),
          getCurrentPatientVisit(result.id),
          getPatientTimeline(result.id),
          getPatientDocuments(result.id),
          getPatientIntakes(result.id),
        ])

        if (!active) return

        setPatient(result)
        setCurrentVisit(visit)
        setTimeline(patientTimeline)
        setDocuments(patientDocuments)
        setIntakes(patientIntakes)
        setConsent((consentResult.data as ConsentRequest | null) ?? null)

        void writeAuditLog({ patientId: result.id, action: 'PATIENT_ACCESSED', entityType: 'patient', entityId: result.id }).catch((error: unknown) => {
          console.error('[PatientProfile] Audit log unavailable:', error)
        })

        if (consentResult.data?.status === 'granted') {
          const latest = patientIntakes[0]
          const answers = Array.isArray(latest?.answers) ? latest.answers : []
          const redFlags = Array.isArray(latest?.red_flags) ? latest.red_flags : []
          const profileIdentity = {
            name: result.full_name,
            age: result.date_of_birth ? new Date().getFullYear() - new Date(result.date_of_birth).getFullYear() : 0,
            gender: (result.gender === 'female' || result.gender === 'other' ? result.gender : 'male') as 'male' | 'female' | 'other',
            phone: result.phone ?? undefined,
            address: result.address ?? undefined,
            isAbhaVerified: Boolean(result.abha_number || result.masked_abha),
            abhaId: result.abha_number ?? result.masked_abha ?? undefined,
          }

          const normalizedAnswers = answers.map((entry) => ({
            questionId: entry.questionId ?? entry.question ?? 'question',
            question: entry.question ?? entry.question_text ?? 'Question',
            answer: entry.answer ?? entry.value ?? entry.response ?? 'No answer recorded',
            timestamp: entry.timestamp ?? latest?.created_at ?? new Date().toISOString(),
          }))

          const normalizedRedFlags = redFlags.map((flag, index) => ({
            id: `${result.id}-${index}`,
            symptom: flag.symptom ?? 'Clinical concern',
            severity: ((flag.severity ?? 'moderate') as 'critical' | 'urgent' | 'moderate'),
            message: flag.message ?? 'Attention needed',
            messageHi: flag.message ?? 'ध्यान दें',
          }))

          const normalizedDocuments: ExtractedDocument[] = patientDocuments.map((doc): ExtractedDocument => ({
            id: doc.id,
            type: doc.document_type === 'prescription'
              ? 'prescription'
              : doc.document_type === 'lab_report'
                ? 'lab_report'
                : 'discharge_summary',
            fileName: doc.file_name,
            rawText: doc.ocr_text ?? '',
            entities: [],
            confidence: doc.ocr_confidence ?? 0,
          }))

          try {
            const generatedBrief = await analyzePatientIntakeWithGemini({
              identity: profileIdentity,
              answers: normalizedAnswers,
              redFlags: normalizedRedFlags,
              documents: normalizedDocuments,
            })
            setBrief(generatedBrief)
          } catch {
            setBrief(generateSimulatedGeminiAnalysis({
              identity: profileIdentity,
              answers: normalizedAnswers,
              redFlags: normalizedRedFlags,
              documents: normalizedDocuments,
            }))
          }
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
    return () => {
      active = false
    }
  }, [doctor, patientId])

  const granted = consent?.status === 'granted'
  const latestIntake = intakes[0]
  const previousIntake = intakes[1]
  const previousSummary = previousIntake?.clinical_summary ?? {}
  const latestSummary = latestIntake?.clinical_summary ?? {}
  const intakeAnswers = useMemo(() => Array.isArray(latestIntake?.answers) ? latestIntake.answers : [], [latestIntake])
  const triageFlags = useMemo(() => {
    if (!latestIntake) return []
    const rawFlags = Array.isArray(latestIntake.red_flags) ? latestIntake.red_flags : []
    return rawFlags.length > 0 ? rawFlags : detectRedFlags(
      Array.isArray(latestIntake.answers) ? latestIntake.answers.map((entry) => ({
        questionId: String(entry.questionId ?? entry.question ?? 'question'),
        question: String(entry.question ?? entry.question_text ?? 'Question'),
        answer: String(entry.answer ?? entry.value ?? entry.response ?? 'No answer recorded'),
        timestamp: String(entry.timestamp ?? latestIntake.created_at),
      })) : []
    )
  }, [latestIntake])

  const chiefComplaint = String(
    latestSummary.chiefComplaint
      ?? intakeAnswers.find((entry) => (entry.questionId ?? entry.question ?? '').toLowerCase().includes('chief') || (entry.question ?? '').toLowerCase().includes('complaint'))?.answer
      ?? currentVisit?.chief_complaint
      ?? 'No chief complaint recorded'
  )
  const symptomRow = intakeAnswers.reduce<Record<string, string>>((acc, entry) => {
    const key = String(entry.questionId ?? entry.question ?? '').trim()
    const answer = String(entry.answer ?? entry.value ?? entry.response ?? '').trim()
    if (key && answer) acc[key] = answer
    return acc
  }, {})

  const changedFields = useMemo(
    () => compareClinicalData(
      {
        chiefComplaint: previousSummary.chiefComplaint ?? '',
        hpi: previousSummary.hpi ?? '',
        medicines: previousSummary.medications?.join(', ') ?? '',
        allergies: previousSummary.allergies?.join(', ') ?? '',
        reviewOfSystems: previousSummary.reviewOfSystems ?? '',
      },
      {
        chiefComplaint: latestSummary.chiefComplaint ?? '',
        hpi: latestSummary.hpi ?? '',
        medicines: latestSummary.medications?.join(', ') ?? '',
        allergies: latestSummary.allergies?.join(', ') ?? '',
        reviewOfSystems: latestSummary.reviewOfSystems ?? '',
      }
    ),
    [latestSummary, previousSummary]
  )

  async function handleConsultationAction(status: 'draft' | 'completed') {
    if (!patient || !doctor || !currentVisit) return

    setConsultationSaving(true)
    setMessage('')

    try {
      await saveConsultation({
        patientId: patient.id,
        visitId: currentVisit.id,
        doctorId: doctor.id,
        consultationNotes: consultationNotes,
        diagnosis: consultationAssessment || 'Clinical review in progress',
        treatmentPlan: consultationPlan || consultationFollowUp || 'Follow-up to be finalized',
        status,
      })

      if (status === 'completed') {
        await createPatientTimelineEvent({
          patientId: patient.id,
          hospitalId: doctor.hospital_id,
          opdVisitId: currentVisit.id,
          eventType: 'doctor_consultation',
          title: 'Doctor Consultation',
          description: `Assessment: ${consultationAssessment || 'Clinical review completed'}; Plan: ${consultationPlan || 'Follow-up plan documented'}`,
          sourceTable: 'consultations',
        })
      }

      if (status === 'completed') {
        setConsultationOpen(false)
      }
      setMessage(status === 'completed' ? 'Consultation completed and timeline updated.' : 'Consultation draft saved.')
      setConsultationNotes('')
      setConsultationAssessment('')
      setConsultationPlan('')
      setConsultationFollowUp('')
      setConsultationReferral('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save consultation.')
    } finally {
      setConsultationSaving(false)
    }
  }

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

  function trigagePriorityLabel(flags: Array<{ message?: string; severity?: string }>) {
    if (!flags.length) return 'LOW'
    const highest = flags.reduce((best, flag) => {
      const order = { critical: 3, urgent: 2, moderate: 1 }
      const current = order[(flag.severity ?? '').toLowerCase() as keyof typeof order] ?? 0
      return current > best ? current : best
    }, 0)

    if (highest >= 3) return 'HIGH'
    if (highest === 2) return 'MEDIUM'
    return 'LOW'
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('/doctor/patients/search')} className="text-sm font-medium text-[#0F5132]">Back to patient search</button>
          <LanguageSwitcher compact />
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Patient identity</div>
              <h1 className="mt-1 text-3xl font-semibold">{patient.full_name}</h1>
              <p className="mt-1 text-sm text-slate-600">{patient.gender ?? 'Gender not recorded'} · Patient ID: {patient.patient_id}</p>
            </div>
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
          {granted && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" /> Consent authorized</div><p className="mt-2 text-sm text-emerald-700">Authorized records unlocked. Timeline events: {timeline.length} · Intake records: {intakes.length}.</p></div>}
        </section>

        {granted && (
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Latest intake" value={chiefComplaint} />
            <StatCard icon={<Activity className="h-5 w-5" />} label="Timeline" value={`${timeline.length} events`} />
            <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Documents" value={`${documents.length} uploaded`} />
          </div>
        )}

        {granted && latestIntake && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0F5132]">
                  <ClipboardList className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Latest intake</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  {new Date(latestIntake.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Chief complaint</div>
                  <p className="mt-2 font-semibold text-slate-900">{chiefComplaint}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoPill label="Symptoms" value={Object.values(symptomRow).filter(Boolean).slice(0, 3).join(', ') || 'No symptom data'} />
                  <InfoPill label="Severity" value={symptomRow.hpi_severity ? String(symptomRow.hpi_severity) : (latestSummary.hpi ?? 'Not recorded')} />
                  <InfoPill label="Trend" value={symptomRow.cc_duration ? String(symptomRow.cc_duration) : 'Not recorded'} />
                  <InfoPill label="Source" value={latestIntake.history_mode === 'ayush' ? 'AYUSH intake' : 'Patient reported'} />
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Symptom details</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    {Object.entries(symptomRow).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium capitalize text-slate-700">{key.replace(/_/g, ' ')}</span>
                        <span className="text-right text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#0F5132]">
                <Activity className="h-5 w-5" />
                <h2 className="text-xl font-bold">Triage</h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Priority</div>
                  <div className="mt-2 text-lg font-bold text-amber-900">
                    {trigagePriorityLabel(triageFlags)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Clinical attention</div>
                  <p className="mt-2">
                    {triageFlags.length > 0
                      ? triageFlags.map((flag: { message?: string }) => String(flag.message ?? '')).join(' ')
                      : 'No red flags detected during the intake review.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {granted && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#0F5132]">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-xl font-bold">AI clinical brief</h2>
              </div>
              {brief ? (
                <div className="space-y-4 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Clinical impression</div>
                    <p className="mt-2 font-medium text-slate-900">{brief.clinicalImpression}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoPill label="Urgency" value={brief.urgencyLevel} />
                    <InfoPill label="Reason" value={brief.urgencyReason} />
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Key findings</div>
                    <ul className="space-y-2">
                      {(brief.keyFindings ?? []).map((item) => <li key={item} className="rounded-xl bg-slate-50 px-3 py-2">{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Recommended workup</div>
                    <ul className="space-y-2">
                      {(brief.recommendedWorkup ?? []).map((item) => <li key={item} className="flex items-start gap-2"><ArrowRight className="mt-0.5 h-4 w-4 text-[#0F5132]" /> <span>{item}</span></li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">AI clinical brief unavailable.</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-xl font-bold text-slate-900">What changed</div>
              {changedFields.length > 0 ? (
                <div className="space-y-3">
                  {changedFields.map((change) => (
                    <div key={change.field} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-800">{change.field}</div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">{change.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{change.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No meaningful change has been detected across the recent intake history.</div>
              )}
            </div>
          </section>
        )}

        {granted && (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-xl font-bold">Clinical timeline</div>
              {timeline.length > 0 ? (
                <div className="space-y-3">
                  {timeline.map((event) => (
                    <div key={String((event as Record<string, unknown>).id ?? JSON.stringify(event))} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{String((event as Record<string, unknown>).event_type ?? 'event')}</div>
                      <div className="mt-2 text-sm text-slate-800">{String((event as Record<string, unknown>).description ?? 'No details')}</div>
                      <div className="mt-2 text-xs text-slate-500">{String((event as Record<string, unknown>).event_at ?? (event as Record<string, unknown>).created_at ?? 'recent')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No timeline events are available yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xl font-bold">Consultation</div>
                <button type="button" onClick={() => setConsultationOpen((current) => !current)} className="rounded-xl bg-[#0F5132] px-3 py-2 text-xs font-semibold text-white">{consultationOpen ? 'Hide' : 'Start Consultation'}</button>
              </div>

              {consultationOpen && (
                <div className="space-y-3">
                  <input value={consultationAssessment} onChange={(event) => setConsultationAssessment(event.target.value)} placeholder="Assessment / diagnosis" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]" />
                  <textarea value={consultationNotes} onChange={(event) => setConsultationNotes(event.target.value)} placeholder="Clinical notes" rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]" />
                  <textarea value={consultationPlan} onChange={(event) => setConsultationPlan(event.target.value)} placeholder="Plan" rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]" />
                  <input value={consultationFollowUp} onChange={(event) => setConsultationFollowUp(event.target.value)} placeholder="Follow-up" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]" />
                  <input value={consultationReferral} onChange={(event) => setConsultationReferral(event.target.value)} placeholder="Referral" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F5132]" />

                  <div className="flex gap-3">
                    <button type="button" onClick={() => void handleConsultationAction('draft')} disabled={consultationSaving} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50">Save Draft</button>
                    <button type="button" onClick={() => void handleConsultationAction('completed')} disabled={consultationSaving} className="flex-1 rounded-xl bg-[#0F5132] px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">Complete Consultation</button>
                  </div>
                </div>
              )}

              {message && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}
            </div>
          </section>
        )}

        {granted && (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-xl font-bold">Document record</div>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-800">{doc.file_name}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{doc.document_type}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void openDocument(doc)}
                          disabled={openingDocumentId === doc.id}
                          className="rounded-lg border border-[#0F5132] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F5132] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {openingDocumentId === doc.id ? 'Opening...' : 'Open'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No medical documents have been uploaded for this patient.</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#0F5132]">
                <Stethoscope className="h-5 w-5" />
                <div className="text-xl font-bold">Symptom details</div>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                {Object.entries(symptomRow).length > 0 ? Object.entries(symptomRow).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="font-medium text-slate-700">{key.replace(/_/g, ' ')}</span>
                    <span className="text-right text-slate-900">{value}</span>
                  </div>
                )) : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Symptom details are not available for this intake.</div>}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#0F5132]">{icon}<span className="text-xs font-bold uppercase tracking-[0.18em]">{label}</span></div>
      <div className="mt-3 text-base font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}
