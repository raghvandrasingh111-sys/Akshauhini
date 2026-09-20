import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ProgressBar } from '../ui/ProgressBar'
import { VoiceIndicator } from '../ui/VoiceIndicator'
import { EmergencyAlert } from './EmergencyAlert'
import { IntakeAnswerInput } from '../intake/IntakeAnswerInput'
import { getQuestionSubtext, getQuestionText, LANGUAGE_LOCALES, t } from '../../i18n'
import { playQuestionAudio, speechToText } from '../../services/sarvamSpeechService'

export function InterviewScreen() {
  const {
    language,
    voiceEnabled,
    isListening,
    toggleVoice,
    setListening,
    submitAnswer,
    previousQuestion,
    getQuestions,
    currentQuestionIndex,
    redFlags,
    isEmergency,
    setStep,
    historyMode,
    step,
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
    async (text: string) => {
      if (!voiceEnabled) return
      await playQuestionAudio(text, language)
    },
    [voiceEnabled, language]
  )

  useEffect(() => {
    if (question) {
      void speak(getQuestionText(question, language))
    }
  }, [question, language, voiceEnabled, speak])

  const handleSubmit = (value?: string) => {
    if (!question) return

    const answerValue =
      question.type === 'multichoice'
        ? (selectedMulti.length > 0 ? selectedMulti.join(', ') : value ?? input.trim())
        : (value ?? input.trim())

    if (!answerValue.trim()) return

    submitAnswer(
      question.id,
      getQuestionText(question, language),
      answerValue
    )
    setInput('')
    setSelectedMulti([])

    if (currentQuestionIndex >= questions.length - 1) {
      setStep('summary')
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

  const startVoice = async () => {
    const hasSarvamConfig = !!(
      (import.meta.env.VITE_SARVAM_API_KEY && import.meta.env.VITE_SARVAM_API_KEY.trim()) ||
      (import.meta.env.VITE_SARVAM_PROXY_URL && import.meta.env.VITE_SARVAM_PROXY_URL.trim())
    )

    if (hasSarvamConfig) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        const chunks: BlobPart[] = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
          stream.getTracks().forEach((track) => track.stop())
          setListening(true)

          try {
            const transcript = await speechToText(blob, language)
            if (transcript) {
              setInput(transcript)
            }
          } catch (error) {
            console.warn('[InterviewScreen] Sarvam STT failed, falling back to browser recognition:', error)
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition =
                (window as unknown as { SpeechRecognition?: typeof webkitSpeechRecognition; webkitSpeechRecognition?: typeof webkitSpeechRecognition }).SpeechRecognition ||
                (window as unknown as { webkitSpeechRecognition?: typeof webkitSpeechRecognition }).webkitSpeechRecognition

              if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.lang = LANGUAGE_LOCALES[language]
                recognition.interimResults = false
                recognition.onresult = (event: SpeechRecognitionEvent) => {
                  const transcript = event.results[0][0].transcript
                  setInput(transcript)
                  setListening(false)
                }
                recognition.onerror = () => setListening(false)
                recognition.onend = () => setListening(false)
                recognition.start()
                return
              }
            }
          } finally {
            setListening(false)
          }
        }

        setListening(true)
        mediaRecorder.start()
        setTimeout(() => {
          mediaRecorder.stop()
        }, 5000)
        return
      } catch (error) {
        console.warn('[InterviewScreen] Media capture unavailable, falling back to browser recognition:', error)
      }
    }

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

  useEffect(() => {
    if (!question && step !== 'summary' && step !== 'complete') {
      setStep('documents')
    }
  }, [question, step, setStep])

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

          <IntakeAnswerInput
            question={question}
            language={language}
            value={input}
            onChange={setInput}
            selectedValues={selectedMulti}
            onToggleMulti={handleMultiToggle}
            onChoiceSelect={handleSubmit}
            onSubmit={handleSubmit}
            onVoice={startVoice}
            voiceEnabled={voiceEnabled}
            isListening={isListening}
          />

          {redFlags.length > 0 && !showEmergency && (
            <div className="mt-6 p-4 bg-medikiosk-emergency-light border border-medikiosk-emergency/30 rounded-xl">
              <p className="font-semibold text-medikiosk-emergency">
                ⚠️ {redFlags.length} {isHi ? 'रेड-फ्लैग पहचाने गए' : 'red flag(s) detected'}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 text-medikiosk-primary font-medium hover:underline disabled:opacity-40 disabled:no-underline"
          >
            <ChevronLeft className="w-4 h-4" />
            {t(language, 'back')}
          </button>
          <button
            onClick={() => setStep('documents')}
            className="flex items-center gap-2 text-medikiosk-primary font-medium hover:underline"
          >
            {t(language, 'interview.skip')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
