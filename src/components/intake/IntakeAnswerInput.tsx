import { Mic, Send, Volume2 } from 'lucide-react'
import type { InterviewQuestion, Language } from '../../types'
import { getOptionText } from '../../i18n'

interface IntakeAnswerInputProps {
  question: InterviewQuestion
  language: Language
  value: string
  onChange: (value: string) => void
  selectedValues: string[]
  onToggleMulti: (value: string) => void
  onChoiceSelect: (value: string) => void
  onSubmit: (value?: string) => void
  onVoice: () => void
  voiceEnabled: boolean
  isListening: boolean
}

export function IntakeAnswerInput({
  question,
  language,
  value,
  onChange,
  selectedValues,
  onToggleMulti,
  onChoiceSelect,
  onSubmit,
  onVoice,
  voiceEnabled,
  isListening,
}: IntakeAnswerInputProps) {
  if (question.type === 'choice' && question.options) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChoiceSelect(opt.value)}
            className="touch-option text-left !items-start hover:border-medikiosk-primary hover:bg-medikiosk-surface transition-all"
          >
            <span className="font-semibold text-lg text-slate-800">{getOptionText(question, opt.value, language)}</span>
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'multichoice' && question.options) {
    return (
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggleMulti(opt.value)}
                className={`p-4 rounded-xl border-2 text-left font-semibold text-base transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-medikiosk-primary bg-medikiosk-surface text-medikiosk-primary shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{getOptionText(question, opt.value, language)}</span>
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center border text-sm font-bold ${
                    isSelected
                      ? 'bg-medikiosk-primary text-white border-medikiosk-primary'
                      : 'border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSubmit()}
            disabled={selectedValues.length === 0}
            className="kiosk-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {language === 'hi' ? 'उत्तर दर्ज करें' : 'Save answer'}
          </button>
        </div>
      </div>
    )
  }

  if (question.type === 'yesno') {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {['yes', 'no'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChoiceSelect(option)}
            className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-lg font-bold text-slate-700 hover:border-medikiosk-primary hover:bg-medikiosk-surface transition-all"
          >
            {option === 'yes' ? (language === 'hi' ? 'हाँ' : 'Yes') : language === 'hi' ? 'नहीं' : 'No'}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'scale') {
    return (
      <div className="space-y-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-semibold text-slate-600 mb-3">
            {language === 'hi' ? 'अपना स्कोर चुनें' : 'Choose your score'}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={Number(value || 5)}
            onChange={(event) => onChange(String(event.target.value))}
            className="w-full accent-medikiosk-primary"
          />
          <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
            <span>1</span>
            <span className="text-lg font-extrabold text-medikiosk-primary">{value || '5'}</span>
            <span>10</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSubmit(value || '5')}
          className="kiosk-btn-primary"
        >
          <Send className="w-4 h-4" />
          {language === 'hi' ? 'उत्तर दर्ज करें' : 'Confirm answer'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder={language === 'hi' ? 'अपना जवाब लिखें या बोलें…' : 'Type or speak your answer…'}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none focus:border-medikiosk-primary focus:ring-4 focus:ring-medikiosk-primary/10 resize-none"
        />
        {voiceEnabled && (
          <button
            type="button"
            onClick={onVoice}
            className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
              isListening
                ? 'border-red-300 bg-red-50 text-red-600 animate-pulse'
                : 'border-slate-200 bg-white text-medikiosk-primary hover:border-medikiosk-primary hover:bg-medikiosk-surface'
            }`}
            aria-label={language === 'hi' ? 'आवाज़ दर्ज करें' : 'Use voice input'}
          >
            {isListening ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={!value.trim()}
          className="kiosk-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {language === 'hi' ? 'जमा करें' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
