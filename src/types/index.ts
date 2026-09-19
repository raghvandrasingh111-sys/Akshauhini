export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn'

export type HistoryMode = 'allopathic' | 'ayush'

export type KioskStep =
  | 'welcome'
  | 'identity'
  | 'consent'
  | 'mode-select'
  | 'interview'
  | 'documents'
  | 'summary'
  | 'complete'
  | 'doctor-access'

export type AccessRequestStatus = 'pending' | 'approved' | 'denied'

export interface DoctorAccessRequest {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  facility: string
  purpose: string
  status: AccessRequestStatus
  createdAt: string
  respondedAt?: string
}

export interface PatientIdentity {
  patientId?: string
  abhaId?: string
  abhaNumber?: string
  abhaAddress?: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  phone?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
  profilePhoto?: string
  qrCode?: string
  isAbhaVerified?: boolean
  verificationMethod?: 'aadhaar_otp' | 'mobile_otp' | 'demo' | 'manual'
  verificationTimestamp?: string
}

export interface InterviewAnswer {
  questionId: string
  question: string
  answer: string
  timestamp: string
}

export interface RedFlag {
  id: string
  symptom: string
  severity: 'critical' | 'urgent' | 'moderate'
  message: string
  messageHi: string
}

export interface ExtractedDocument {
  id: string
  type: 'prescription' | 'lab_report' | 'discharge_summary'
  fileName: string
  date?: string
  entities: ClinicalEntity[]
  rawText: string
  confidence: number
}

export interface ClinicalEntity {
  type: 'diagnosis' | 'medication' | 'lab_value' | 'procedure' | 'allergy'
  label: string
  value: string
  unit?: string
  isAbnormal?: boolean
  referenceRange?: string
}

export interface GeminiDifferential {
  condition: string
  likelihood: 'High' | 'Moderate' | 'Low'
  reason: string
}

export interface GeminiDoctorKeyPoints {
  clinicalImpression: string
  urgencyLevel: 'Emergency' | 'Urgent' | 'Routine'
  urgencyReason: string
  keyFindings: string[]
  pertinentPositives: string[]
  pertinentNegatives: string[]
  differentialDiagnoses: GeminiDifferential[]
  recommendedWorkup: string[]
  suggestedDoctorQuestions: string[]
  generatedAt?: string
}

export interface ClinicalSummary {
  id: string
  patientId: string
  createdAt: string
  chiefComplaint: string
  hpi: string
  pastHistory: string
  medications: string[]
  allergies: string[]
  reviewOfSystems: string
  priorInvestigations: string
  ayushProfile?: AyushProfile
  redFlags: RedFlag[]
  documents: ExtractedDocument[]
  fhirBundle: FHIRBundle
  status: 'draft' | 'verified' | 'amended'
  geminiAnalysis?: GeminiDoctorKeyPoints
  geminiLoading?: boolean
}

export interface AyushProfile {
  prakriti: string
  vikriti: string
  agni: string
  koshtha: string
  aharaVihara: string
  nidra: string
  satva: string
  sara: string
  samhanana: string
  pramana: string
}

export interface FHIRBundle {
  resourceType: 'Bundle'
  type: 'document'
  entry: FHIREntry[]
}

export interface FHIREntry {
  resource: {
    resourceType: string
    id: string
    [key: string]: unknown
  }
}

export interface InterviewQuestion {
  id: string
  text: { en: string; hi: string }
  subtext?: { en: string; hi: string }
  type: 'text' | 'choice' | 'multichoice' | 'scale' | 'yesno'
  options?: { en: string; hi: string; value: string; icon?: string }[]
  branch?: Record<string, string>
  redFlagValues?: string[]
  category: 'chief_complaint' | 'hpi' | 'past_history' | 'ros' | 'medications' | 'allergies' | 'ayush'
}

export interface AppState {
  step: KioskStep
  language: Language
  historyMode: HistoryMode
  identity: PatientIdentity | null
  consentGranted: boolean
  interviewAnswers: InterviewAnswer[]
  currentQuestionIndex: number
  documents: ExtractedDocument[]
  redFlags: RedFlag[]
  summary: ClinicalSummary | null
  isEmergency: boolean
  voiceEnabled: boolean
  isListening: boolean
  geminiLoading?: boolean
}
