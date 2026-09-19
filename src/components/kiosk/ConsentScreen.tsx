import { useState } from 'react'
import { Shield, Volume2, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CONSENT_ITEMS = [
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
]

export function ConsentScreen() {
  const { language, grantConsent, setStep } = useApp()
  const isHi = language === 'hi'
  const [checked, setChecked] = useState<boolean[]>(CONSENT_ITEMS.map(() => false))
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
        ? 'MediKiosk आपका स्वास्थ्य इतिहास सुरक्षित रूप से एकत्र करेगा। यह निदान नहीं है।'
        : 'MediKiosk will securely collect your health history. This is not a diagnosis.'
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isHi ? 'hi-IN' : 'en-IN'
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
            {isHi ? 'सहमति और गोपनीयता' : 'Consent & Privacy'}
          </h2>
        </div>
        <p className="text-medikiosk-muted mb-6">
          {isHi ? 'DPDP Act 2023 · ABDM अनुपालन' : 'DPDP Act 2023 · ABDM Compliant'}
        </p>

        <button
          onClick={playAudio}
          className="flex items-center gap-2 px-4 py-3 mb-6 bg-medikiosk-surface rounded-xl text-medikiosk-primary font-medium w-full justify-center"
        >
          <Volume2 className="w-5 h-5" />
          {isHi ? 'ऑडियो में सुनें' : 'Listen to Consent (Audio)'}
          {audioPlayed && <CheckCircle2 className="w-4 h-4 text-medikiosk-accent" />}
        </button>

        <div className="space-y-3 mb-8">
          {CONSENT_ITEMS.map((item, i) => (
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
              <span className="text-slate-700">{isHi ? item.hi : item.en}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!allChecked}
          className="kiosk-btn-primary w-full"
        >
          {isHi ? 'सहमति दें और जारी रखें' : 'Grant Consent & Continue'}
        </button>
        <button onClick={() => setStep('identity')} className="w-full text-medikiosk-muted py-3 mt-2">
          ← {isHi ? 'वापस' : 'Back'}
        </button>
      </div>
    </div>
  )
}
