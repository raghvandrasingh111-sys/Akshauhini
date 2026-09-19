import { useState, useEffect } from 'react'
import {
  Stethoscope,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Edit3,
  RefreshCw,
  User,
  ShieldCheck,
  Sparkles,
  Key,
  Activity,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import type { ClinicalSummary } from '../../types'
import {
  getGeminiApiKey,
  setGeminiApiKey,
  generateSimulatedGeminiAnalysis,
  analyzePatientIntakeWithGemini,
} from '../../services/geminiService'

export function PhysicianDashboard() {
  const [summaries, setSummaries] = useState<ClinicalSummary[]>([])
  const [selected, setSelected] = useState<ClinicalSummary | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedHpi, setEditedHpi] = useState('')
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [customApiKey, setCustomApiKey] = useState(getGeminiApiKey())
  const [isReanalyzing, setIsReanalyzing] = useState(false)

  const loadSummaries = () => {
    try {
      const raw = localStorage.getItem('medikiosk_physician_summaries')
      const parsed: ClinicalSummary[] = raw ? JSON.parse(raw) : []
      setSummaries(parsed)
      if (parsed.length > 0 && !selected) {
        setSelected(parsed[0])
        setEditedHpi(parsed[0].hpi)
      }
    } catch {
      setSummaries([])
    }
  }

  useEffect(() => {
    loadSummaries()
    const interval = setInterval(loadSummaries, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected) setEditedHpi(selected.hpi)
  }, [selected])

  const handleVerify = () => {
    if (!selected) return
    const updated = { ...selected, status: 'verified' as const, hpi: editedHpi }
    const next = summaries.map((s) => (s.id === selected.id ? updated : s))
    localStorage.setItem('medikiosk_physician_summaries', JSON.stringify(next))
    setSummaries(next)
    setSelected(updated)
    setEditMode(false)
  }

  const handleSaveApiKey = () => {
    setGeminiApiKey(customApiKey)
    setApiKeyModalOpen(false)
    alert('Gemini API Key updated successfully!')
  }

  const handleReanalyzeWithGemini = async () => {
    if (!selected) return
    setIsReanalyzing(true)
    try {
      const fakeIdentity = {
        name: selected.patientId,
        age: 52,
        gender: 'male' as const,
        abhaId: selected.patientId.startsWith('91-') ? selected.patientId : undefined,
      }
      const fakeAnswers = [
        {
          questionId: 'cc_main',
          question: 'Main complaint',
          answer: selected.chiefComplaint,
          timestamp: new Date().toISOString(),
        },
        {
          questionId: 'hpi',
          question: 'HPI',
          answer: selected.hpi,
          timestamp: new Date().toISOString(),
        },
      ]
      const freshAnalysis = await analyzePatientIntakeWithGemini({
        identity: fakeIdentity,
        answers: fakeAnswers,
        documents: selected.documents,
        redFlags: selected.redFlags,
      })

      const updated = { ...selected, geminiAnalysis: freshAnalysis }
      const next = summaries.map((s) => (s.id === selected.id ? updated : s))
      localStorage.setItem('medikiosk_physician_summaries', JSON.stringify(next))
      setSummaries(next)
      setSelected(updated)
    } catch (err) {
      console.error('Failed to re-analyze with Gemini:', err)
    } finally {
      setIsReanalyzing(false)
    }
  }

  const loadDemo = () => {
    const demoIdentity = {
      name: 'Ramesh Kumar Sharma',
      age: 52,
      gender: 'male' as const,
      abhaId: '91-1234-5678-9012',
      isAbhaVerified: true,
      address: 'Indore, MP',
    }

    const demoFlags = [
      {
        id: 'rf_chest_pain',
        symptom: 'Chest Pain',
        severity: 'critical' as const,
        message: 'Acute chest pain detected — possible cardiac emergency.',
        messageHi: 'तीव्र सीने का दर्द — संभावित हृदय आपातकाल।',
      },
      {
        id: 'rf_cardiac_radiation',
        symptom: 'Chest Pain with Radiation',
        severity: 'critical' as const,
        message: 'Chest pain radiating to arm — high suspicion for ACS.',
        messageHi: 'सीने का दर्द हाथ तक — ACS की संभावना।',
      },
    ]

    const demoAnswers = [
      {
        questionId: 'cc_main',
        question: 'Main complaint',
        answer: '3 din se severe chest pain aur saans phul rahi hai',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_sensation',
        question: 'Sensation',
        answer: 'Heavy pressure or tightness',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'cc_duration',
        question: 'Duration',
        answer: '1 to 3 days',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_severity',
        question: 'Severity',
        answer: '8',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_radiation',
        question: 'Radiation',
        answer: 'left_arm',
        timestamp: new Date().toISOString(),
      },
    ]

    const geminiAnalysis = generateSimulatedGeminiAnalysis({
      identity: demoIdentity,
      answers: demoAnswers,
      redFlags: demoFlags,
    })

    const demo: ClinicalSummary = {
      id: `demo_${Date.now()}`,
      patientId: '91-1234-5678-9012',
      createdAt: new Date().toISOString(),
      chiefComplaint: '3 din se severe chest pain aur saans phul rahi hai',
      hpi: 'Duration: 1-3d. Onset: sudden. Severity: 8/10. Radiation: left_arm. Sensation: Heavy pressure',
      pastHistory: 'Hypertension; Diabetes Mellitus',
      medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD'],
      allergies: ['Penicillin'],
      reviewOfSystems: 'Cold sweating present; Breathlessness on exertion',
      priorInvestigations: 'Hemoglobin: 9.2 g/dL (ABNORMAL); WBC: 11200 /cumm (ABNORMAL)',
      redFlags: demoFlags,
      geminiAnalysis,
      documents: [],
      fhirBundle: {
        resourceType: 'Bundle',
        type: 'document',
        entry: [],
      },
      status: 'draft',
    }
    const next = [demo, ...summaries]
    localStorage.setItem('medikiosk_physician_summaries', JSON.stringify(next))
    setSummaries(next)
    setSelected(demo)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-medikiosk-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-medikiosk-primary" />
          <div>
            <h1 className="text-xl font-bold">Physician EMR Dashboard</h1>
            <p className="text-sm text-medikiosk-muted">MediKiosk · FHIR R4 · Gemini AI Co-Pilot</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-medium transition-colors"
            title="Configure Google Gemini API Key"
          >
            <Key className="w-4 h-4" />
            Gemini API Key
          </button>
          <button
            onClick={loadSummaries}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={loadDemo}
            className="px-4 py-2 rounded-lg bg-medikiosk-primary hover:bg-medikiosk-primary-dark text-white font-medium text-sm transition-colors shadow-sm"
          >
            Load Demo Case
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-80 bg-white border-r border-medikiosk-border overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-700">Patient Queue</h2>
            <p className="text-sm text-medikiosk-muted">{summaries.length} intake(s)</p>
          </div>
          {summaries.length === 0 ? (
            <div className="p-6 text-center text-medikiosk-muted">
              <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No patients yet.</p>
              <p className="text-sm mt-1">Complete kiosk intake or load demo.</p>
            </div>
          ) : (
            summaries.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-4 border-b hover:bg-medikiosk-surface transition-colors ${
                  selected?.id === s.id ? 'bg-medikiosk-surface border-l-4 border-l-medikiosk-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">{s.patientId}</p>
                      {s.patientId?.startsWith('91-') && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> ABHA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-medikiosk-muted truncate max-w-[200px]">
                      {s.chiefComplaint}
                    </p>
                  </div>
                  {s.redFlags.length > 0 && (
                    <AlertTriangle className="w-5 h-5 text-medikiosk-emergency shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-xs text-medikiosk-muted">
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-medikiosk-muted">
              Select a patient from the queue
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
              {selected.redFlags.length > 0 && (
                <div className="p-4 bg-medikiosk-emergency-light border-2 border-medikiosk-emergency rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-6 h-6 text-medikiosk-emergency" />
                    <h3 className="font-bold text-medikiosk-emergency text-lg">
                      RED FLAG ALERT — Priority Triage
                    </h3>
                  </div>
                  {selected.redFlags.map((f) => (
                    <p key={f.id} className="text-slate-800 mb-1">
                      • <strong>{f.symptom}:</strong> {f.message}
                    </p>
                  ))}
                </div>
              )}

              {/* Gemini AI Clinical Co-Pilot Panel */}
              {selected.geminiAnalysis && (
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl border border-indigo-500/30 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-indigo-500/20 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-lg text-white">Gemini AI Clinical Co-Pilot</h2>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            v1.5 Flash
                          </span>
                        </div>
                        <p className="text-xs text-indigo-200/70">
                          Automated clinical synthesis & differential diagnostic support for examining doctor
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                          selected.geminiAnalysis.urgencyLevel === 'Emergency'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                            : selected.geminiAnalysis.urgencyLevel === 'Urgent'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        }`}
                      >
                        <Activity className="w-4 h-4" />
                        {selected.geminiAnalysis.urgencyLevel}
                      </span>
                      <button
                        onClick={handleReanalyzeWithGemini}
                        disabled={isReanalyzing}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-xs font-semibold text-white border border-indigo-400/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Re-run synthesis with Gemini"
                      >
                        {isReanalyzing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>Re-Analyze</span>
                      </button>
                    </div>
                  </div>

                  {/* Clinical Impression */}
                  <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                      Doctor Key Impression
                    </span>
                    <p className="text-slate-100 font-medium text-base leading-relaxed">
                      {selected.geminiAnalysis.clinicalImpression}
                    </p>
                    <p className="text-xs text-indigo-200/80 mt-1 italic">
                      Urgency Justification: {selected.geminiAnalysis.urgencyReason}
                    </p>
                  </div>

                  {/* Key Findings */}
                  {selected.geminiAnalysis.keyFindings.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                        Core Symptom & Timeline Breakdown
                      </span>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {selected.geminiAnalysis.keyFindings.map((kf, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200 flex items-start gap-2"
                          >
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{kf}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Differential Diagnoses */}
                  {selected.geminiAnalysis.differentialDiagnoses.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                        Top Differential Diagnoses
                      </span>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {selected.geminiAnalysis.differentialDiagnoses.map((d, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-slate-800/80 border border-indigo-400/20 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="font-bold text-xs text-white">{d.condition}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    d.likelihood === 'High'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : d.likelihood === 'Moderate'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {d.likelihood}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">{d.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pertinent Positives & Negatives */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                        Pertinent Positives
                      </span>
                      <ul className="space-y-1 text-xs text-emerald-100/90">
                        {selected.geminiAnalysis.pertinentPositives.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">+</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Pertinent Negatives
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {selected.geminiAnalysis.pertinentNegatives.map((n, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-500 font-bold">−</span>
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Workup */}
                  {selected.geminiAnalysis.recommendedWorkup.length > 0 && (
                    <div className="mb-5 p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-400/20">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                        Immediate Recommended Diagnostic Workup
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.geminiAnalysis.recommendedWorkup.map((w, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/10 font-medium"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Questions for Doctor */}
                  {selected.geminiAnalysis.suggestedDoctorQuestions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-400/20">
                      <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                        Recommended Next Probing Questions for Doctor
                      </span>
                      <ul className="space-y-1.5 text-xs text-purple-100/90">
                        {selected.geminiAnalysis.suggestedDoctorQuestions.map((q, i) => (
                          <li key={i} className="flex items-start gap-2 italic">
                            <span className="text-purple-400 font-bold not-italic">Q{i + 1}:</span>
                            <span>"{q}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-card border border-medikiosk-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Structured Clinical Summary</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-medikiosk-border text-sm hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      {editMode ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={handleVerify}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-medikiosk-accent text-white text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Accept
                    </button>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Patient / Health Record ID</span>
                    <div className="font-mono font-bold text-slate-800 text-sm">{selected.patientId}</div>
                  </div>
                  {selected.patientId?.startsWith('91-') && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> ABDM KYC Verified
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Chief Complaint" value={selected.chiefComplaint} highlight />
                  <Field label="Status" value={selected.status.toUpperCase()} />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-medikiosk-primary uppercase">HPI</label>
                  {editMode ? (
                    <textarea
                      value={editedHpi}
                      onChange={(e) => setEditedHpi(e.target.value)}
                      className="w-full mt-1 p-3 border-2 border-medikiosk-primary rounded-xl min-h-[80px]"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-slate-50 rounded-xl">{selected.hpi}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Field label="Past History" value={selected.pastHistory} />
                  <Field label="Review of Systems" value={selected.reviewOfSystems} />
                  <Field label="Medications" value={selected.medications.join(', ')} />
                  <Field label="Allergies" value={selected.allergies.join(', ')} />
                  <Field label="Prior Investigations" value={selected.priorInvestigations} colSpan />
                </div>

                {selected.ayushProfile && (
                  <div className="mt-4 p-4 bg-ayush-surface rounded-xl">
                    <h4 className="font-bold text-ayush-primary mb-2">AYUSH Dashavidha Pariksha</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Object.entries(selected.ayushProfile).map(([k, v]) => (
                        <span key={k}>
                          <strong className="capitalize">{k}:</strong> {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-medikiosk-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-medikiosk-primary" />
                  <h3 className="font-bold">FHIR R4 Bundle Preview</h3>
                </div>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-64">
                  {JSON.stringify(selected.fhirBundle, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Gemini API Key Configuration Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Google Gemini API Key</h3>
                <p className="text-xs text-slate-500">Configure live AI clinical analysis</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Enter your Gemini API key below to enable real-time synthesis using Google's models. If left blank, the platform automatically utilizes its built-in clinical intelligence fallback engine.
            </p>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                API Key
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none font-mono text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Obtain a key at{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  aistudio.google.com
                </a>
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  highlight,
  colSpan,
}: {
  label: string
  value: string
  highlight?: boolean
  colSpan?: boolean
}) {
  return (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="text-xs font-semibold text-medikiosk-primary uppercase">{label}</label>
      <p
        className={`mt-1 p-3 rounded-xl ${
          highlight ? 'bg-medikiosk-surface font-semibold text-lg' : 'bg-slate-50'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
