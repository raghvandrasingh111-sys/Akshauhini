import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  AppState,
  PatientIdentity,
  InterviewAnswer,
  ExtractedDocument,
  ClinicalSummary,
  Language,
  HistoryMode,
  KioskStep,
  GeminiDoctorKeyPoints,
} from '../types'
import { allopathicQuestions } from '../data/questions'
import { ayushQuestions } from '../data/ayushQuestions'
import { detectRedFlags, isEmergency } from '../services/triageEngine'
import { generateClinicalSummary, buildAyushProfile } from '../services/fhirGenerator'
import {
  analyzePatientIntakeWithGemini,
  generateSimulatedGeminiAnalysis,
} from '../services/geminiService'

const initialState: AppState = {
  step: 'welcome',
  language: 'hi',
  historyMode: 'allopathic',
  identity: null,
  consentGranted: false,
  interviewAnswers: [],
  currentQuestionIndex: 0,
  documents: [],
  redFlags: [],
  summary: null,
  isEmergency: false,
  voiceEnabled: true,
  isListening: false,
  geminiLoading: false,
}

type Action =
  | { type: 'SET_STEP'; step: KioskStep }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_MODE'; mode: HistoryMode }
  | { type: 'SET_IDENTITY'; identity: PatientIdentity }
  | { type: 'GRANT_CONSENT' }
  | { type: 'ADD_ANSWER'; answer: InterviewAnswer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'ADD_DOCUMENT'; document: ExtractedDocument }
  | { type: 'SET_LISTENING'; listening: boolean }
  | { type: 'TOGGLE_VOICE' }
  | { type: 'FINALIZE_SUMMARY'; initialAnalysis?: GeminiDoctorKeyPoints }
  | { type: 'SET_GEMINI_LOADING'; loading: boolean }
  | { type: 'SET_GEMINI_ANALYSIS'; analysis: GeminiDoctorKeyPoints }
  | { type: 'VERIFY_SUMMARY' }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_LANGUAGE':
      return { ...state, language: action.language }
    case 'SET_MODE':
      return { ...state, historyMode: action.mode }
    case 'SET_IDENTITY':
      return { ...state, identity: action.identity }
    case 'GRANT_CONSENT':
      return { ...state, consentGranted: true }
    case 'ADD_ANSWER': {
      const existingIndex = state.interviewAnswers.findIndex(
        (answer) => answer.questionId === action.answer.questionId
      )
      const answers = existingIndex === -1
        ? [...state.interviewAnswers, action.answer]
        : state.interviewAnswers.map((answer, index) =>
            index === existingIndex ? action.answer : answer
          )
      const flags = detectRedFlags(answers)
      return {
        ...state,
        interviewAnswers: answers,
        redFlags: flags,
        isEmergency: isEmergency(flags),
      }
    }
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 }
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
      }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.document] }
    case 'SET_LISTENING':
      return { ...state, isListening: action.listening }
    case 'TOGGLE_VOICE':
      return { ...state, voiceEnabled: !state.voiceEnabled }
    case 'FINALIZE_SUMMARY': {
      if (!state.identity) return state
      const ayush =
        state.historyMode === 'ayush' ? buildAyushProfile(state.interviewAnswers) : undefined
      const summary = generateClinicalSummary(
        state.identity,
        state.interviewAnswers,
        state.documents,
        state.redFlags,
        ayush,
        action.initialAnalysis
      )
      return { ...state, summary, step: 'summary', geminiLoading: !action.initialAnalysis }
    }
    case 'SET_GEMINI_LOADING':
      return {
        ...state,
        geminiLoading: action.loading,
        summary: state.summary ? { ...state.summary, geminiLoading: action.loading } : null,
      }
    case 'SET_GEMINI_ANALYSIS':
      return {
        ...state,
        geminiLoading: false,
        summary: state.summary
          ? { ...state.summary, geminiAnalysis: action.analysis, geminiLoading: false }
          : null,
      }
    case 'VERIFY_SUMMARY':
      return state.summary
        ? { ...state, summary: { ...state.summary, status: 'verified' }, step: 'complete' }
        : state
    case 'RESET':
      return { ...initialState, language: state.language }
    default:
      return state
  }
}

interface AppContextValue extends AppState {
  setStep: (step: KioskStep) => void
  setLanguage: (lang: Language) => void
  setMode: (mode: HistoryMode) => void
  setIdentity: (identity: PatientIdentity) => void
  grantConsent: () => void
  submitAnswer: (questionId: string, question: string, answer: string) => void
  nextQuestion: () => void
  previousQuestion: () => void
  addDocument: (doc: ExtractedDocument) => void
  finalizeSummary: () => Promise<void>
  refreshGeminiAnalysis: () => Promise<void>
  verifySummary: () => void
  reset: () => void
  toggleVoice: () => void
  setListening: (v: boolean) => void
  getQuestions: () => typeof allopathicQuestions
  physicianSummaries: ClinicalSummary[]
  loadDemoSummary: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEMO_SUMMARY_STORAGE = 'medikiosk_physician_summaries'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const getStoredSummaries = (): ClinicalSummary[] => {
    try {
      const raw = localStorage.getItem(DEMO_SUMMARY_STORAGE)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const saveSummary = useCallback((summary: ClinicalSummary) => {
    const existing = getStoredSummaries()
    localStorage.setItem(DEMO_SUMMARY_STORAGE, JSON.stringify([summary, ...existing]))
  }, [])

  const setStep = useCallback((step: KioskStep) => dispatch({ type: 'SET_STEP', step }), [])
  const setLanguage = useCallback((language: Language) => dispatch({ type: 'SET_LANGUAGE', language }), [])
  const setMode = useCallback((mode: HistoryMode) => dispatch({ type: 'SET_MODE', mode }), [])
  const setIdentity = useCallback((identity: PatientIdentity) => dispatch({ type: 'SET_IDENTITY', identity }), [])
  const grantConsent = useCallback(() => dispatch({ type: 'GRANT_CONSENT' }), [])
  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), [])
  const previousQuestion = useCallback(() => dispatch({ type: 'PREVIOUS_QUESTION' }), [])
  const toggleVoice = useCallback(() => dispatch({ type: 'TOGGLE_VOICE' }), [])
  const setListening = useCallback((listening: boolean) => dispatch({ type: 'SET_LISTENING', listening }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const submitAnswer = useCallback(
    (questionId: string, question: string, answer: string) => {
      dispatch({
        type: 'ADD_ANSWER',
        answer: { questionId, question, answer, timestamp: new Date().toISOString() },
      })
      dispatch({ type: 'NEXT_QUESTION' })
    },
    []
  )

  const addDocument = useCallback(
    (document: ExtractedDocument) => dispatch({ type: 'ADD_DOCUMENT', document }),
    []
  )

  const runGemini = useCallback(
    async (
      identity: PatientIdentity,
      answers: InterviewAnswer[],
      docs: ExtractedDocument[],
      flags: typeof state.redFlags
    ) => {
      dispatch({ type: 'SET_GEMINI_LOADING', loading: true })
      try {
        const analysis = await analyzePatientIntakeWithGemini({
          identity,
          answers,
          documents: docs,
          redFlags: flags,
        })
        dispatch({ type: 'SET_GEMINI_ANALYSIS', analysis })
      } catch (err) {
        console.error('[AppContext] Failed to run Gemini analysis:', err)
        const fallback = generateSimulatedGeminiAnalysis({
          identity,
          answers,
          documents: docs,
          redFlags: flags,
        })
        dispatch({ type: 'SET_GEMINI_ANALYSIS', analysis: fallback })
      }
    },
    []
  )

  const finalizeSummary = useCallback(async () => {
    dispatch({ type: 'FINALIZE_SUMMARY' })
    if (state.identity) {
      await runGemini(state.identity, state.interviewAnswers, state.documents, state.redFlags)
    }
  }, [state.identity, state.interviewAnswers, state.documents, state.redFlags, runGemini])

  const refreshGeminiAnalysis = useCallback(async () => {
    if (state.identity) {
      await runGemini(state.identity, state.interviewAnswers, state.documents, state.redFlags)
    }
  }, [state.identity, state.interviewAnswers, state.documents, state.redFlags, runGemini])

  const verifySummary = useCallback(() => {
    dispatch({ type: 'VERIFY_SUMMARY' })
  }, [])

  const getQuestions = useCallback(() => {
    const base = allopathicQuestions
    if (state.historyMode === 'ayush') return [...base.slice(0, 7), ...ayushQuestions]
    return base
  }, [state.historyMode])

  const loadDemoSummary = useCallback(() => {
    const demoIdentity: PatientIdentity = {
      abhaId: '91-1234-5678-9012',
      name: 'Ramesh Kumar Sharma (Demo)',
      age: 52,
      gender: 'male',
      isAbhaVerified: true,
      address: 'Indore, Madhya Pradesh',
    }
    const demoAnswers: InterviewAnswer[] = [
      {
        questionId: 'cc_body_area',
        question: 'Where are you feeling the trouble?',
        answer: '🫀 Chest / Heart (सीना / दिल का हिस्सा)',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'cc_main',
        question: 'Main complaint',
        answer: '3 din se severe chest pain aur saans phul rahi hai',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_sensation',
        question: 'Feeling or pain',
        answer: 'Heavy pressure or tightness (भारीपन या भारी दबाव)',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'cc_duration',
        question: 'Duration',
        answer: '1 to 3 days',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_onset',
        question: 'Onset',
        answer: '⚡ Suddenly (within minutes)',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_pattern',
        question: 'Pattern',
        answer: 'Worse when walking or exerting',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_severity',
        question: 'Severity',
        answer: '8',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_radiation',
        question: 'Radiation',
        answer: 'left_arm',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_associated',
        question: 'Associated symptoms',
        answer: '💦 Cold Sweating, 🫁 Shortness of breath, 🤢 Nausea',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'past_conditions',
        question: 'Existing conditions',
        answer: 'High Blood Pressure (BP), Diabetes / Sugar',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'med_current',
        question: 'Current medications',
        answer: 'Metformin 500mg BD, Amlodipine 5mg OD',
        timestamp: new Date().toISOString(),
      },
    ]
    const flags = detectRedFlags(demoAnswers)
    const geminiAnalysis = generateSimulatedGeminiAnalysis({
      identity: demoIdentity,
      answers: demoAnswers,
      redFlags: flags,
    })
    const summary = generateClinicalSummary(
      demoIdentity,
      demoAnswers,
      [],
      flags,
      undefined,
      geminiAnalysis
    )
    saveSummary(summary)
  }, [saveSummary])

  const value: AppContextValue = {
    ...state,
    setStep,
    setLanguage,
    setMode,
    setIdentity,
    grantConsent,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    addDocument,
    finalizeSummary,
    refreshGeminiAnalysis,
    verifySummary,
    reset,
    toggleVoice,
    setListening,
    getQuestions,
    physicianSummaries: getStoredSummaries(),
    loadDemoSummary,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
