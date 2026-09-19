import { Stethoscope, Leaf } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { HistoryMode } from '../../types'

export function ModeSelectScreen() {
  const { language, historyMode, setMode, setStep } = useApp()
  const isHi = language === 'hi'

  const select = (mode: HistoryMode) => {
    setMode(mode)
    setStep('interview')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-6">
      <div className="max-w-2xl mx-auto kiosk-card animate-slide-up">
        <h2 className="text-2xl font-bold mb-2">
          {isHi ? 'इतिहास मोड चुनें' : 'Select History Mode'}
        </h2>
        <p className="text-medikiosk-muted mb-8">
          {isHi
            ? 'अपनी उपचार प्रणाली चुनें'
            : 'Choose your treatment system for specialized intake'}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => select('allopathic')}
            className={`touch-option min-h-[200px] ${historyMode === 'allopathic' ? 'touch-option-selected' : ''}`}
          >
            <Stethoscope className="w-12 h-12 text-medikiosk-primary" />
            <span className="text-xl font-bold">
              {isHi ? 'एलोपैथिक' : 'Allopathic'}
            </span>
            <span className="text-sm text-medikiosk-muted text-center">
              {isHi ? 'SOCRATES · ROS · HPI' : 'SOCRATES · ROS · HPI'}
            </span>
          </button>

          <button
            onClick={() => select('ayush')}
            className={`touch-option min-h-[200px] border-ayush-accent/30 ${historyMode === 'ayush' ? 'touch-option-selected border-ayush-accent bg-ayush-surface' : ''}`}
          >
            <Leaf className="w-12 h-12 text-ayush-accent" />
            <span className="text-xl font-bold text-ayush-primary">
              {isHi ? 'आयुष (आयurved)' : 'AYUSH (Ayurveda)'}
            </span>
            <span className="text-sm text-medikiosk-muted text-center">
              {isHi ? 'दशविध परीक्षा · प्रकृति · अग्नि' : 'Dashavidha Pariksha · Prakriti · Agni'}
            </span>
          </button>
        </div>

        <button onClick={() => setStep('consent')} className="w-full text-medikiosk-muted py-4 mt-6">
          ← {isHi ? 'वापस' : 'Back'}
        </button>
      </div>
    </div>
  )
}
