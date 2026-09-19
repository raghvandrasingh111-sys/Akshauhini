import { useState, useEffect, useCallback } from 'react'
import { Mic, Send, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ProgressBar } from '../ui/ProgressBar'
import { VoiceIndicator } from '../ui/VoiceIndicator'
import { EmergencyAlert } from './EmergencyAlert'
import { getOptionText, getQuestionSubtext, getQuestionText, LANGUAGE_LOCALES, t } from '../../i18n'

const DEMO_PHRASES: Record<string, string> = {
  cc_main: '3 din se severe chest pain aur saans phul rahi hai, thanda paseena aa raha hai',
  med_current: 'Metformin 500mg aur BP ki goli (Amlodipine)',
  allergy: 'Penicillin se daane aate hain (Allergy)',
  past_surgery: 'Appendix surgery 2019 mein',
}

export function InterviewScreen() {
  const {
    language,
    voiceEnabled,
    isListening,
    toggleVoice,
    setListening,
    submitAnswer,
    getQuestions,
    currentQuestionIndex,
    redFlags,
    isEmergency,
    setStep,
    historyMode,
  } = useApp()

  const isHi = language === 'hi'
  const questions = getQuestions()
  const question = questions[currentQuestionIndex]
  const [input, setInput] = useState('')
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])
  const [showEmergency, setShowEmergency] = useState(false)

  // Reset multi-select state on question change
  useEffect(() => {
    setSelectedMulti([])
    setInput('')
  }, [currentQuestionIndex])

  useEffect(() => {
    if (isEmergency && redFlags.length > 0) {
      setShowEmergency(true)
      const timer = setTimeout(() => setShowEmergency(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [isEmergency, redFlags.length])

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !('speechSynthesis' in window)) return
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = LANGUAGE_LOCALES[language]
      speechSynthesis.speak(utterance)
    },
    [voiceEnabled, isHi]
  )

  useEffect(() => {
    if (question) {
      speak(getQuestionText(question, language))
    }
  }, [question, isHi, speak])

  const handleSubmit = (value?: string) => {
    if (!question) return
    const answer = value ?? input.trim()
    if (!answer) return

    submitAnswer(
      question.id,
      getQuestionText(question, language),
      answer
    )
    setInput('')
    setSelectedMulti([])

    if (currentQuestionIndex >= questions.length - 1) {
      setStep('documents')
    }
  }

  const handleMultiToggle = (val: string) => {
    if (val === 'none') {
      setSelectedMulti(['none'])
      return
    }
    const filtered = selectedMulti.filter((v) => v !== 'none')
    if (filtered.includes(val)) {
      setSelectedMulti(filtered.filter((v) => v !== val))
    } else {
      setSelectedMulti([...filtered, val])
    }
  }

  const handleMultiSubmit = () => {
    if (!question || selectedMulti.length === 0) return
    // Format human-friendly string
    const labels = selectedMulti.map((val) => {
      const opt = question.options?.find((o) => o.value === val)
      return opt ? getOptionText(question, val, language) : val
    })
    handleSubmit(labels.join(', '))
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(t(language, 'interview.voiceUnavailable'))
      return
    }
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof webkitSpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof webkitSpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = LANGUAGE_LOCALES[language]
    recognition.interimResults = false

    setListening(true)
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const fillDemo = () => {
    if (question && DEMO_PHRASES[question.id]) {
      setInput(DEMO_PHRASES[question.id])
    }
  }

  // Fast forward all questions for judges in 1 click
  const fastForwardInterview = () => {
    const demoAnswers: Record<string, string> = {
      cc_body_area: isHi ? '🫀 सीना / दिल का हिस्सा' : '🫀 Chest / Heart',
      cc_main: '3 din se severe chest pain aur saans phul rahi hai',
      hpi_sensation: isHi ? 'भारीपन या भारी दबाव' : 'Heavy pressure or tightness',
      cc_duration: '1 to 3 days',
      hpi_onset: '⚡ Suddenly (within minutes)',
      hpi_pattern: 'Worse when walking or exerting',
      hpi_severity: '8',
      hpi_radiation: 'left_arm',
      hpi_associated: '💦 Cold Sweating, 🫁 Shortness of breath, 🤢 Nausea',
      past_conditions: 'High Blood Pressure (BP), Diabetes / Sugar',
      med_current: 'Metformin 500mg BD, Amlodipine 5mg OD',
      allergy: 'Penicillin (NKDA otherwise)',
    }

    questions.forEach((q) => {
      const ans = demoAnswers[q.id] || (q.options ? q.options[0].value : 'None')
      submitAnswer(q.id, getQuestionText(q, language), ans)
    })
    setStep('documents')
  }

  useEffect(() => {
    if (!question) setStep('documents')
  }, [question, setStep])

  if (!question) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-4 md:p-6">
      {showEmergency && <EmergencyAlert flags={redFlags} language={isHi ? 'hi' : 'en'} onClose={() => setShowEmergency(false)} />}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <VoiceIndicator
            isListening={isListening}
            enabled={voiceEnabled}
            onToggle={toggleVoice}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={fastForwardInterview}
              className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold border border-amber-300 transition-colors shadow-sm"
              title="Auto-fill all questions with cardiac presentation for testing"
            >
              ⚡ Fast Demo (Fill All)
            </button>
            {historyMode === 'ayush' && (
              <span className="px-3 py-1 bg-ayush-surface text-ayush-primary rounded-full text-sm font-medium">
                AYUSH Mode
              </span>
            )}
          </div>
        </div>

        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
          label={t(language, 'interview.progress')}
        />

        <div className="kiosk-card mt-6 animate-slide-up">
          <p className="text-sm text-medikiosk-primary font-semibold uppercase mb-1">
            {t(language, 'interview.question')} {currentQuestionIndex + 1}/{questions.length}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-relaxed">
            {getQuestionText(question, language)}
          </h2>
          {question.subtext && (
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {getQuestionSubtext(question, language)}
            </p>
          )}

          {/* Single Choice Options */}
          {question.type === 'choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSubmit(opt.value)}
                  className="touch-option text-left !items-start hover:border-medikiosk-primary hover:bg-medikiosk-surface transition-all"
                >
                  <span className="font-semibold text-lg text-slate-800">{getOptionText(question, opt.value, language)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Multi-Choice / Multi-Select Chips */}
          {question.type === 'multichoice' && question.options && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((opt) => {
                  const isSelected = selectedMulti.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleMultiToggle(opt.value)}
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

              <button
                onClick={handleMultiSubmit}
                disabled={selectedMulti.length === 0}
                className="kiosk-btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
              >
                <span>{t(language, 'interview.confirm')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Yes/No Choice */}
          {question.type === 'yesno' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => handleSubmit('yes')} className="kiosk-btn-primary py-4 text-xl">
                {t(language, 'interview.yes')}
              </button>
              <button onClick={() => handleSubmit('no')} className="kiosk-btn-secondary py-4 text-xl">
                {t(language, 'interview.no')}
              </button>
            </div>
          )}

          {/* Scale 1-10 with Severity Visual Cues */}
          {question.type === 'scale' && (
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => handleSubmit(String(n))}
                    className={`py-4 rounded-xl font-bold text-xl border-2 transition-all shadow-sm ${
                      n >= 7
                        ? 'border-rose-400 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-600'
                        : n >= 4
                        ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:border-amber-500'
                        : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 px-1 pt-1">
                <span className="text-emerald-700">1-3: {isHi ? 'हल्का (Mild)' : 'Mild'}</span>
                <span className="text-amber-700">4-6: {isHi ? 'मध्यम (Moderate)' : 'Moderate'}</span>
                <span className="text-rose-700 font-bold">7-10: {isHi ? 'तेज / असहनीय (Severe)' : 'Severe / Emergency'}</span>
              </div>
            </div>
          )}

          {/* Open Text / Voice Input */}
          {(question.type === 'text' || question.type === 'scale') && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={t(language, 'interview.type')}
                  className="flex-1 px-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg"
                />
                {voiceEnabled && (
                  <button
                    type="button"
                    onClick={startVoice}
                    className={`p-4 rounded-xl transition-transform active:scale-95 ${
                      isListening
                        ? 'bg-medikiosk-emergency text-white animate-pulse'
                        : 'bg-medikiosk-surface text-medikiosk-primary'
                    }`}
                    title="Speak using microphone"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!input.trim()}
                  className="p-4 rounded-xl bg-medikiosk-primary text-white disabled:opacity-50 hover:bg-medikiosk-primary-dark transition-colors"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              {DEMO_PHRASES[question.id] && (
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-sm text-medikiosk-secondary hover:underline font-medium flex items-center gap-1"
                >
                  <span>🎤 {isHi ? 'डेमो त्वरित उत्तर भरें:' : 'Quick Demo Response:'}</span>
                  <span className="italic">"{DEMO_PHRASES[question.id]}"</span>
                </button>
              )}
            </div>
          )}

          {redFlags.length > 0 && !showEmergency && (
            <div className="mt-6 p-4 bg-medikiosk-emergency-light border border-medikiosk-emergency/30 rounded-xl">
              <p className="font-semibold text-medikiosk-emergency">
                ⚠️ {redFlags.length} {isHi ? 'रेड-फ्लैग पहचाने गए' : 'red flag(s) detected'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setStep('documents')}
          className="flex items-center gap-2 mx-auto mt-6 text-medikiosk-primary font-medium hover:underline"
        >
          {t(language, 'interview.skip')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
