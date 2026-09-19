import { useState, useEffect, useCallback } from 'react'
import { Mic, Send, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ProgressBar } from '../ui/ProgressBar'
import { VoiceIndicator } from '../ui/VoiceIndicator'
import { EmergencyAlert } from './EmergencyAlert'

const DEMO_PHRASES: Record<string, string> = {
  cc_main: '3 din se severe chest pain aur saans phul rahi hai',
  hpi_aggravating: 'Chalne se badh jata hai',
  hpi_relieving: 'Aaram karne se thoda kam hota hai',
  med_current: 'Metformin aur BP ki dawai',
  allergy: 'Penicillin se allergy',
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
  const [showEmergency, setShowEmergency] = useState(false)

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
      utterance.lang = isHi ? 'hi-IN' : 'en-IN'
      speechSynthesis.speak(utterance)
    },
    [voiceEnabled, isHi]
  )

  useEffect(() => {
    if (question) {
      speak(isHi ? question.text.hi : question.text.en)
    }
  }, [question, isHi, speak])

  const handleSubmit = (value?: string) => {
    if (!question) return
    const answer = value ?? input.trim()
    if (!answer) return

    submitAnswer(
      question.id,
      isHi ? question.text.hi : question.text.en,
      answer
    )
    setInput('')

    if (currentQuestionIndex >= questions.length - 1) {
      setStep('documents')
    }
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(isHi ? 'आवाज़ पहचान उपलब्ध नहीं — टच मोड उपयोग करें' : 'Voice not available — use touch mode')
      return
    }
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof webkitSpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof webkitSpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = isHi ? 'hi-IN' : 'en-IN'
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

  useEffect(() => {
    if (!question) setStep('documents')
  }, [question, setStep])

  if (!question) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-4 md:p-6">
      {showEmergency && <EmergencyAlert flags={redFlags} language={isHi ? 'hi' : 'en'} />}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <VoiceIndicator
            isListening={isListening}
            enabled={voiceEnabled}
            onToggle={toggleVoice}
          />
          {historyMode === 'ayush' && (
            <span className="px-3 py-1 bg-ayush-surface text-ayush-primary rounded-full text-sm font-medium">
              AYUSH Mode
            </span>
          )}
        </div>

        <ProgressBar
          current={currentQuestionIndex + 1}
          total={questions.length}
          label={isHi ? 'साक्षात्कार प्रगति' : 'Interview Progress'}
        />

        <div className="kiosk-card mt-6 animate-slide-up">
          <p className="text-sm text-medikiosk-primary font-semibold uppercase mb-2">
            {isHi ? `प्रश्न ${currentQuestionIndex + 1}/${questions.length}` : `Question ${currentQuestionIndex + 1}/${questions.length}`}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-relaxed">
            {isHi ? question.text.hi : question.text.en}
          </h2>

          {question.type === 'choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSubmit(opt.value)}
                  className="touch-option text-left !items-start"
                >
                  <span className="font-semibold text-lg">{isHi ? opt.hi : opt.en}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'yesno' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => handleSubmit('yes')} className="kiosk-btn-primary">
                {isHi ? 'हाँ' : 'Yes'}
              </button>
              <button onClick={() => handleSubmit('no')} className="kiosk-btn-secondary">
                {isHi ? 'नहीं' : 'No'}
              </button>
            </div>
          )}

          {question.type === 'scale' && (
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleSubmit(String(n))}
                  className={`py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                    n >= 7
                      ? 'border-medikiosk-emergency text-medikiosk-emergency hover:bg-medikiosk-emergency-light'
                      : 'border-medikiosk-border hover:border-medikiosk-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {(question.type === 'text' || question.type === 'scale') && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={isHi ? 'यहाँ टाइप करें या बोलें…' : 'Type or speak here…'}
                  className="flex-1 px-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg"
                />
                {voiceEnabled && (
                  <button
                    onClick={startVoice}
                    className={`p-4 rounded-xl ${isListening ? 'bg-medikiosk-emergency text-white animate-pulse' : 'bg-medikiosk-surface text-medikiosk-primary'}`}
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim()}
                  className="p-4 rounded-xl bg-medikiosk-primary text-white disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button onClick={fillDemo} className="text-sm text-medikiosk-secondary underline">
                {isHi ? '🎤 डेमो: "3 din se chest pain…"' : '🎤 Demo: "3 din se chest pain…"'}
              </button>
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
          className="flex items-center gap-2 mx-auto mt-6 text-medikiosk-primary font-medium"
        >
          {isHi ? 'दस्तावेज़ स्कैन पर जाएं' : 'Skip to Document Scan'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
