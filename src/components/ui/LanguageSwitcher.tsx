import { Languages } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Language } from '../../types'

const LANGUAGES: { code: Language; short: string; label: string }[] = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'hi', short: 'हिं', label: 'हिन्दी' },
  { code: 'ta', short: 'த', label: 'தமிழ்' },
  { code: 'te', short: 'తె', label: 'తెలుగు' },
  { code: 'bn', short: 'ব', label: 'বাংলা' },
]

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useApp()

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-sm">
      <Languages className="h-4 w-4 text-[#0F5132]" />
      {!compact && <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:inline">Lang</span>}
      <div className="flex items-center gap-1">
        {LANGUAGES.map((option) => (
          <button
            key={option.code}
            type="button"
            aria-label={`Switch language to ${option.label}`}
            onClick={() => setLanguage(option.code)}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
              language === option.code
                ? 'bg-[#0F5132] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {compact ? option.short : option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
