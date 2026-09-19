import { CheckCircle2, Send, Volume2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function SummaryScreen() {
  const { language, identity, summary, verifySummary, reset, isEmergency } = useApp()
  const isHi = language === 'hi'

  if (!summary) return null

  const speakSummary = () => {
    if ('speechSynthesis' in window) {
      const text = isHi
        ? `आपकी जानकारी सफलतापूर्वक दर्ज हो गई। मुख्य शिकायत: ${summary.chiefComplaint}`
        : `Your information has been recorded. Chief complaint: ${summary.chiefComplaint}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isHi ? 'hi-IN' : 'en-IN'
      speechSynthesis.speak(utterance)
    }
  }

  const handleComplete = () => {
    verifySummary()
    localStorage.setItem(
      'medikiosk_physician_summaries',
      JSON.stringify([
        summary,
        ...JSON.parse(localStorage.getItem('medikiosk_physician_summaries') || '[]'),
      ])
    )
  }

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
