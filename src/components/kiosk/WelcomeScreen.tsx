import { HeartPulse, Shield, Languages } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Language } from '../../types'
import { t } from '../../i18n'
import { useNavigate } from 'react-router-dom'

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
]

export function WelcomeScreen() {
  const { language, setLanguage } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-medikiosk-primary rounded-xl">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Sanjeevani</span>
              <span className="text-sm font-normal text-medikiosk-primary bg-medikiosk-surface px-2 py-0.5 rounded-md border border-medikiosk-primary/20">
                संजीवनी
              </span>
            </h1>
            <p className="text-xs text-medikiosk-muted font-medium">
              {t(language, 'brand.tagline')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-medikiosk-muted">
          <Shield className="w-4 h-4" />
          <span>ABDM · DPDP Compliant</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="kiosk-card max-w-2xl w-full text-center animate-slide-up">
          <div className="mb-8">
            <p className="text-medikiosk-primary font-semibold uppercase tracking-wider text-sm mb-2">
              Ministry of Ayush · AIIA
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {t(language, 'welcome.title')}
            </h2>
            <p className="text-lg text-medikiosk-muted">
              {t(language, 'welcome.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center mb-4 text-medikiosk-muted">
            <Languages className="w-5 h-5" />
            <span className="font-medium">{t(language, 'welcome.chooseLanguage')}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`touch-option ${language === lang.code ? 'touch-option-selected' : ''}`}
              >
                <span className="text-2xl font-bold">{lang.native}</span>
                <span className="text-sm text-medikiosk-muted">{lang.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button onClick={() => navigate('/patient')} className="w-full py-3 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 font-semibold hover:bg-teal-100 transition-colors">
              {t(language, 'welcome.patientPortal')}
            </button>
            <button onClick={() => navigate('/patient')} className="kiosk-btn-primary w-full">
              {t(language, 'welcome.continue')}
            </button>
            <button onClick={() => navigate('/doctor')} className="w-full py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:border-teal-500 hover:text-teal-700 transition-colors">
              {t(language, 'welcome.doctorPortal')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
