import { useEffect, useState } from 'react'
import { AlertTriangle, Phone, X } from 'lucide-react'
import type { RedFlag } from '../../types'

interface EmergencyAlertProps {
  flags: RedFlag[]
  language: 'en' | 'hi'
  onClose?: () => void
}

export function EmergencyAlert({ flags, language, onClose }: EmergencyAlertProps) {
  const [secondsLeft, setSecondsLeft] = useState(3)

  useEffect(() => {
    if (flags.length === 0) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          onClose?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [flags.length, onClose])

  if (flags.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-slide-up">
      <div className="kiosk-card max-w-lg w-full border-4 border-medikiosk-emergency bg-medikiosk-emergency-light relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-medikiosk-emergency/10 hover:bg-medikiosk-emergency/20 text-medikiosk-emergency transition-colors"
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-medikiosk-emergency rounded-full emergency-pulse">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-medikiosk-emergency">
              {language === 'hi' ? '⚠️ आपातकालीन अलर्ट' : '⚠️ EMERGENCY ALERT'}
            </h2>
            <p className="text-medikiosk-emergency/80 font-medium">
              {language === 'hi'
                ? 'तत्काल चिकित्सा ध्यान आवश्यक'
                : 'Immediate medical attention required'}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 bg-white rounded-xl border-l-4 border-medikiosk-emergency"
            >
              <p className="font-semibold text-slate-900">{flag.symptom}</p>
              <p className="text-slate-700 mt-1">
                {language === 'hi' ? flag.messageHi : flag.message}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 p-4 bg-medikiosk-emergency text-white rounded-2xl">
          <Phone className="w-6 h-6" />
          <div>
            <p className="font-bold">
              {language === 'hi'
                ? 'प्राथमिकता ट्राइएज में भेजा जा रहा है…'
                : 'Routing to Priority Emergency Triage…'}
            </p>
            <p className="text-sm opacity-90">
              {language === 'hi'
                ? 'कृपया तुरंत ट्राइएज काउंटर पर जाएं'
                : 'Please proceed immediately to the triage counter'}
            </p>
          </div>
        </div>

        {/* Auto-dismiss countdown bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-medikiosk-emergency/70 font-medium mb-1">
            <span>{language === 'hi' ? 'स्वतः बंद हो जाएगा' : 'Auto-closing in'}</span>
            <span>{secondsLeft}s</span>
          </div>
          <div className="w-full h-1.5 bg-medikiosk-emergency/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-medikiosk-emergency rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / 3) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
