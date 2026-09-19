import { Mic, MicOff } from 'lucide-react'

interface VoiceIndicatorProps {
  isListening: boolean
  enabled: boolean
  onToggle: () => void
}

export function VoiceIndicator({ isListening, enabled, onToggle }: VoiceIndicatorProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isListening
          ? 'bg-medikiosk-emergency-light text-medikiosk-emergency animate-pulse'
          : enabled
            ? 'bg-medikiosk-surface text-medikiosk-primary'
            : 'bg-slate-100 text-slate-500'
      }`}
      aria-label={enabled ? 'Toggle voice input' : 'Voice disabled'}
    >
      {enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      {isListening ? 'Listening…' : enabled ? 'Voice On' : 'Touch Mode'}
    </button>
  )
}
