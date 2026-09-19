import { AlertTriangle, Phone } from 'lucide-react'
import type { RedFlag } from '../../types'

interface EmergencyAlertProps {
  flags: RedFlag[]
  language: 'en' | 'hi'
}

export function EmergencyAlert({ flags, language }: EmergencyAlertProps) {
  if (flags.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-slide-up">
      <div className="kiosk-card max-w-lg w-full border-4 border-medikiosk-emergency bg-medikiosk-emergency-light">
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
      </div>
    </div>
  )
}
