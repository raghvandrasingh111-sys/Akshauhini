import { useState } from 'react'
import {
  CheckCircle2,
  Send,
  Volume2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Loader2,
  Stethoscope,
  Activity,
  UserCheck,
  RefreshCw,
  Cloud,
  CloudOff,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { saveIntakeToSupabase, type SyncStatus } from '../../services/supabaseService'

export function SummaryScreen() {
  const { language, identity, summary, reset, isEmergency, geminiLoading, interviewAnswers, redFlags, historyMode } = useApp()
  const isHi = language === 'hi'
  const [done, setDone] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  if (!summary) return null

  const speakSummary = () => {
    if ('speechSynthesis' in window) {
      const text = isHi
        ? `आपकी जानकारी सफलतापूर्वक दर्ज हो गई। मुख्य शिकायत: ${summary.chiefComplaint}. ${summary.geminiAnalysis?.clinicalImpression || ''}`
        : `Your information has been recorded. Chief complaint: ${summary.chiefComplaint}. ${summary.geminiAnalysis?.clinicalImpression || ''}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isHi ? 'hi-IN' : 'en-IN'
      speechSynthesis.speak(utterance)
    }
  }

  const handleComplete = async () => {
    // 1. Always save to localStorage first (works offline)
    localStorage.setItem(
      'medikiosk_physician_summaries',
      JSON.stringify([
        summary,
        ...JSON.parse(localStorage.getItem('medikiosk_physician_summaries') || '[]'),
      ])
    )

    setDone(true)

    // 2. Attempt cloud sync to Supabase
    if (identity) {
      const result = await saveIntakeToSupabase(
        summary,
        identity,
        interviewAnswers,
        redFlags,
        isEmergency,
        historyMode
      )
      setSyncStatus(result.status)
    }

    // Auto-reset for next patient after 8 seconds
    setTimeout(() => reset(), 8000)
  }

  // ── Completion / Thank-you screen ─────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <UserCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isHi ? 'धन्यवाद! 🙏' : 'Thank You! 🙏'}
          </h2>
          <p className="text-lg text-slate-600 mb-1">
            {identity?.name && <span className="font-semibold text-slate-800">{identity.name}</span>}
          </p>
          <p className="text-slate-500 mb-8">
            {isHi
              ? 'आपकी जानकारी सुरक्षित रूप से दर्ज हो गई। कृपया प्रतीक्षालय में बैठें — डॉक्टर जल्द बुलाएंगे।'
              : 'Your health information has been securely recorded. Please take a seat in the waiting area — the doctor will call you shortly.'}
          </p>

          {/* Token number visual */}
          <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-md">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
              {isHi ? 'आपका टोकन नंबर' : 'Your Token Number'}
            </p>
            <p className="text-6xl font-black text-slate-900">
              {String(Math.floor(Math.random() * 90) + 10).padStart(2, '0')}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {isHi ? 'स्क्रीन पर अपना नंबर देखते रहें' : 'Watch the display screen for your number'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Cloud sync status badge */}
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold border ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : syncStatus === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : syncStatus === null
                ? 'bg-slate-50 border-slate-200 text-slate-500 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {syncStatus === 'synced' ? (
                <><Cloud className="w-4 h-4" /> {isHi ? '☁️ क्लाउड में सुरक्षित' : '☁️ Synced to cloud'}</>
              ) : syncStatus === 'error' || syncStatus === 'offline' ? (
                <><CloudOff className="w-4 h-4" /> {isHi ? '⚠️ ऑफलाइन — स्थानीय रूप से सहेजा' : '⚠️ Offline — saved locally'}</>
              ) : (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isHi ? 'क्लाउड में सहेज रहे हैं…' : 'Syncing to cloud…'}</>
              )}
            </div>

            <button
              onClick={reset}
              className="kiosk-btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {isHi ? 'नया रोगी शुरू करें' : 'Start New Patient'}
            </button>
            <p className="text-xs text-slate-400">
              {isHi ? '(8 सेकंड में स्वतः रीसेट हो जाएगा)' : '(Auto-resets in 8 seconds)'}
            </p>
          </div>

        </div>
      </div>
    )
  }

  const gemini = summary.geminiAnalysis

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto kiosk-card animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-10 h-10 text-medikiosk-accent" />
          <div>
            <h2 className="text-2xl font-bold">
              {isHi ? 'इनटेक पूर्ण' : 'Intake Complete'}
            </h2>
            <p className="text-medikiosk-muted">
              {isHi ? 'डॉक्टर को सारांश भेज दिया गया' : 'Summary sent to physician dashboard'}
            </p>
          </div>
        </div>

        {/* Patient Identity Banner with ABHA */}
        {identity && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{identity.name}</span>
                {identity.isAbhaVerified ? (
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ABDM VERIFIED
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                    Manual Intake
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Age: {identity.age}y</span>
                <span className="capitalize">Gender: {identity.gender}</span>
                {identity.phone && <span>Phone: {identity.phone}</span>}
                {identity.address && <span>Loc: {identity.address}</span>}
              </div>
            </div>

            {identity.abhaId && (
              <div className="text-left sm:text-right">
                <div className="text-[10px] text-teal-300 uppercase tracking-wider font-semibold">ABHA ID</div>
                <div className="font-mono text-sm font-bold text-teal-100">{identity.abhaId}</div>
              </div>
            )}
          </div>
        )}

        {isEmergency && (
          <div className="mb-6 p-4 bg-medikiosk-emergency-light border-2 border-medikiosk-emergency rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-medikiosk-emergency" />
            <p className="font-bold text-medikiosk-emergency">
              {isHi ? 'आपातकालीन ट्राइएज में भेजा गया' : 'Routed to Emergency Triage'}
            </p>
          </div>
        )}

        {/* Gemini AI Clinical Key Points Section */}
        <div className="mb-6 p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950 text-base flex items-center gap-1.5">
                  <span>{isHi ? 'जेमिनी एआई: डॉक्टर के लिए मुख्य बिंदु' : 'Gemini AI: Clinical Key Points for Doctor'}</span>
                  <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    Clinical Co-Pilot
                  </span>
                </h3>
              </div>
            </div>

            {gemini && (
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                  gemini.urgencyLevel === 'Emergency'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : gemini.urgencyLevel === 'Urgent'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {gemini.urgencyLevel}
              </span>
            )}
          </div>

          {geminiLoading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">
                {isHi
                  ? 'जेमिनी एआई लक्षणों का विश्लेषण कर डॉक्टर के लिए नोट्स बना रहा है…'
                  : 'Gemini AI is analyzing symptoms & synthesizing doctor key points…'}
              </p>
            </div>
          ) : gemini ? (
            <div className="space-y-4 text-sm mt-3">
              <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  {isHi ? 'नैदानिक निष्कर्ष (Clinical Impression)' : 'Clinical Impression'}
                </span>
                <p className="text-slate-900 font-medium leading-relaxed">{gemini.clinicalImpression}</p>
                <p className="text-xs text-slate-500 mt-1 italic">Note: {gemini.urgencyReason}</p>
              </div>

              {/* Key Findings */}
              {gemini.keyFindings && gemini.keyFindings.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    {isHi ? 'मुख्य बिंदु (Key Findings)' : 'Key Findings'}
                  </span>
                  <ul className="space-y-1 bg-white/80 p-3 rounded-xl border border-indigo-50">
                    {gemini.keyFindings.map((kf, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-800 text-xs sm:text-sm">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differential Diagnoses */}
              {gemini.differentialDiagnoses && gemini.differentialDiagnoses.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    {isHi ? 'संभावित निदान (Differential Diagnoses)' : 'Differential Diagnoses'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {gemini.differentialDiagnoses.slice(0, 2).map((diff, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{diff.condition}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              diff.likelihood === 'High'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {diff.likelihood}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-tight">{diff.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Workup */}
              {gemini.recommendedWorkup && gemini.recommendedWorkup.length > 0 && (
                <div className="p-3 bg-white/90 rounded-xl border border-indigo-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1 mb-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {isHi ? 'डॉक्टर के लिए सुझाई गई जांचें (Recommended Workup)' : 'Recommended Diagnostic Workup'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {gemini.recommendedWorkup.map((test, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg font-medium"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 mb-6">
          <SummarySection label={isHi ? 'मुख्य शिकायत' : 'Chief Complaint'} value={summary.chiefComplaint} />
          <SummarySection label="HPI" value={summary.hpi} />
          <SummarySection label={isHi ? 'पिछला इतिहास' : 'Past History'} value={summary.pastHistory} />
          <SummarySection
            label={isHi ? 'दवाइयाँ' : 'Medications'}
            value={summary.medications.join(', ') || 'None'}
          />
          <SummarySection
            label={isHi ? 'एलर्जी' : 'Allergies'}
            value={summary.allergies.join(', ')}
          />
          <SummarySection label="ROS" value={summary.reviewOfSystems} />
          <SummarySection
            label={isHi ? 'पिछली जांच' : 'Prior Investigations'}
            value={summary.priorInvestigations}
          />

          {summary.ayushProfile && (
            <div className="p-4 bg-ayush-surface rounded-xl border border-ayush-accent/30">
              <h4 className="font-bold text-ayush-primary mb-2">
                {isHi ? 'आयुष प्रोफ़ाइल (दशविध)' : 'AYUSH Profile (Dashavidha)'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Prakriti: {summary.ayushProfile.prakriti}</span>
                <span>Agni: {summary.ayushProfile.agni}</span>
                <span>Koshtha: {summary.ayushProfile.koshtha}</span>
                <span>Nidra: {summary.ayushProfile.nidra}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={speakSummary} className="kiosk-btn-secondary w-full flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5" />
            {isHi ? 'ऑडियो पुष्टि सुनें' : 'Listen to Audio Confirmation'}
          </button>
          <button onClick={handleComplete} className="kiosk-btn-primary w-full flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            {isHi ? 'पूर्ण — प्रतीक्षा क्षेत्र में जाएं' : 'Done — Proceed to Waiting Area'}
          </button>
          <button onClick={reset} className="text-medikiosk-muted py-2">
            {isHi ? 'नया रोगी शुरू करें' : 'Start New Patient'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummarySection({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <p className="text-xs font-semibold text-medikiosk-primary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  )
}
