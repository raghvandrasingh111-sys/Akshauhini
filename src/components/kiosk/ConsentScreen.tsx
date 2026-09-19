import { useState } from 'react'
import { Shield, Volume2, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getConsentText, LANGUAGE_LOCALES, t } from '../../i18n'

const BASE_CONSENT_ITEMS = [
  {
    en: 'I consent to AI-assisted clinical history collection for this OPD visit.',
    hi: 'मैं इस OPD विज़िट के लिए AI-सहायता प्राप्त नैदानिक इतिहास संग्रह के लिए सहमति देता/देती हूँ।',
  },
  {
    en: 'I understand this is NOT a diagnosis — a doctor will review all information.',
    hi: 'मैं समझता/समझती हूँ कि यह निदान नहीं है — डॉक्टर सभी जानकारी की समीक्षा करेंगे।',
  },
  {
    en: 'I consent to temporary processing of voice/audio data, erased after summary submission.',
    hi: 'मैं सारांश जमा होने के बाद मिटाए जाने वाले अस्थायी आवाज/ऑडियो डेटा प्रसंस्करण के लिए सहमति देता/देती हूँ।',
  },
  {
    en: 'I consent to FHIR-standard data transmission to the hospital EMR system.',
    hi: 'मैं अस्पताल EMR प्रणाली में FHIR-मानक डेटा प्रसारण के लिए सहमति देता/देती हूँ।',
  },
  {
    en: 'I consent to link this clinical intake to my ABDM ABHA digital health record (HIP/HIU).',
    hi: 'मैं इस नैदानिक इनटेक को अपने ABDM ABHA डिजिटल स्वास्थ्य रिकॉर्ड (HIP/HIU) से जोड़ने की सहमति देता/देती हूँ।',
  },
]

export function ConsentScreen() {
  const { language, identity, grantConsent, setStep } = useApp()
  const isHi = language === 'hi'
  const [checked, setChecked] = useState<boolean[]>(BASE_CONSENT_ITEMS.map(() => false))
  const [audioPlayed, setAudioPlayed] = useState(false)

  const allChecked = checked.every(Boolean)

  const toggle = (i: number) => {
    const next = [...checked]
    next[i] = !next[i]
    setChecked(next)
  }

  const playAudio = () => {
    setAudioPlayed(true)
    if ('speechSynthesis' in window) {
      const text = isHi
        ? 'संजीवनी (Sanjeevani) आपका स्वास्थ्य इतिहास सुरक्षित रूप से एकत्र करेगा। यह निदान नहीं है।'
        : 'Sanjeevani will securely collect your health history. This is not a diagnosis.'
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = LANGUAGE_LOCALES[language]
      speechSynthesis.speak(utterance)
    }
  }

  const handleContinue = () => {
    grantConsent()
    setStep('mode-select')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-6">
      <div className="max-w-2xl mx-auto kiosk-card animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-medikiosk-primary" />
          <h2 className="text-2xl font-bold">
            {t(language, 'consent.title')}
          </h2>
        </div>
        <p className="text-medikiosk-muted mb-4">
          {isHi ? 'DPDP Act 2023 · ABDM अनुपालन' : 'DPDP Act 2023 · ABDM Compliant'}
        </p>

        {/* Patient Identity Confirmation Card */}
        {identity && (
          <div className="mb-6 p-4 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                {identity.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{identity.name}</span>
                  {identity.isAbhaVerified && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ABDM VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Age: {identity.age}y · {identity.gender}
                  {identity.abhaId && <span className="ml-2 font-mono text-teal-700">ABHA: {identity.abhaId}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={playAudio}
          className="flex items-center gap-2 px-4 py-3 mb-6 bg-medikiosk-surface rounded-xl text-medikiosk-primary font-medium w-full justify-center"
        >
          <Volume2 className="w-5 h-5" />
          {t(language, 'consent.listen')}
          {audioPlayed && <CheckCircle2 className="w-4 h-4 text-medikiosk-accent" />}
        </button>

        <div className="space-y-3 mb-8">
          {BASE_CONSENT_ITEMS.map((_, i) => (
            <label
              key={i}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                checked[i]
                  ? 'border-medikiosk-primary bg-medikiosk-surface'
                  : 'border-medikiosk-border'
              }`}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-1 w-5 h-5 accent-medikiosk-primary"
              />
              <span className="text-slate-700">{getConsentText(i, language)}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!allChecked}
          className="kiosk-btn-primary w-full"
        >
          {t(language, 'consent.continue')}
        </button>
        <button onClick={() => setStep('identity')} className="w-full text-medikiosk-muted py-3 mt-2">
          ← {t(language, 'back')}
        </button>
      </div>
    </div>
  )
}
