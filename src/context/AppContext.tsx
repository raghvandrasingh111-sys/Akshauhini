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
} from '../types'
import { allopathicQuestions } from '../data/questions'
import { ayushQuestions } from '../data/ayushQuestions'
import { detectRedFlags, isEmergency } from '../services/triageEngine'
import { generateClinicalSummary, buildAyushProfile } from '../services/fhirGenerator'

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
}

type Action =
  | { type: 'SET_STEP'; step: KioskStep }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_MODE'; mode: HistoryMode }
  | { type: 'SET_IDENTITY'; identity: PatientIdentity }
  | { type: 'GRANT_CONSENT' }
  | { type: 'ADD_ANSWER'; answer: InterviewAnswer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'ADD_DOCUMENT'; document: ExtractedDocument }
  | { type: 'SET_LISTENING'; listening: boolean }
  | { type: 'TOGGLE_VOICE' }
  | { type: 'FINALIZE_SUMMARY' }
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
      const answers = [...state.interviewAnswers, action.answer]
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
        ayush
      )
      return { ...state, summary, step: 'summary' }
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
  addDocument: (doc: ExtractedDocument) => void
  finalizeSummary: () => void
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

  const finalizeSummary = useCallback(() => {
    dispatch({ type: 'FINALIZE_SUMMARY' })
  }, [])

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
      name: 'Demo Patient (Judge)',
      age: 52,
      gender: 'male',
    }
    const demoAnswers: InterviewAnswer[] = [
      {
        questionId: 'cc_main',
        question: 'Main complaint',
        answer: '3 din se severe chest pain aur saans phul rahi hai',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'cc_duration',
        question: 'Duration',
        answer: '1-3d',
        timestamp: new Date().toISOString(),
      },
      {
        questionId: 'hpi_onset',
        question: 'Onset',
        answer: 'sudden',
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
    ]
    const flags = detectRedFlags(demoAnswers)
    const summary = generateClinicalSummary(demoIdentity, demoAnswers, [], flags)
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
    addDocument,
    finalizeSummary,
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
