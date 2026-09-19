export type DoctorRole = 'doctor' | 'department_head' | 'admin'
export type HospitalStatus = 'active' | 'inactive' | 'maintenance'
export type VisitStatus = 'waiting' | 'priority' | 'in_consultation' | 'completed' | 'cancelled'
export type RiskLevel = 'normal' | 'warning' | 'priority' | 'emergency'

export interface Hospital {
  id: string
  name: string
  registration_number: string
  address: string
  phone: string
  email: string
  status: HospitalStatus
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: string
  full_name: string
  email: string
  registration_number: string
  specialization: string
  hospital_id: string
  role: DoctorRole
  is_active?: boolean
  isDevelopmentUser?: boolean
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface PatientRecord {
  id: string
  patient_id: string
  full_name: string
  date_of_birth: string | null
  gender: string
  phone: string | null
  email: string | null
  abha_number: string | null
  abha_address: string | null
  masked_abha: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface OpdVisit {
  id: string
  patient_id: string
  hospital_id: string
  doctor_id: string
  token_number: string
  chief_complaint: string
  status: VisitStatus
  risk_level: RiskLevel
  queue_position: number
  arrival_time: string
  consultation_started_at: string | null
  consultation_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface QueueVisit extends OpdVisit {
  patients: PatientRecord
}

export interface ConsentRequest {
  id: string
  patient_id: string
  doctor_id: string
  hospital_id: string
  purpose: string
  requested_data_types: string[]
  status: 'pending' | 'granted' | 'denied' | 'expired' | 'revoked'
  requested_at: string
  responded_at: string | null
  expires_at: string | null
  consent_reference: string | null
  created_at: string
}

export interface MedicalDocument {
  id: string
  patient_id: string
  opd_visit_id: string | null
  document_type: 'prescription' | 'lab_report' | 'discharge_summary' | 'diagnostic_report' | 'other'
  file_name: string
  storage_path: string
  document_date: string | null
  source: string
  ocr_text: string | null
  ocr_confidence: number | null
  metadata: Record<string, unknown>
  uploaded_by: string | null
  created_at: string
}

export interface ClinicalSummary {
  id: string
  patient_id: string
  opd_visit_id: string
  intake_id: string | null
  chief_complaint: string
  onset: string | null
  duration: string | null
  site: string | null
  character: string | null
  severity: string | null
  radiation: string | null
  associated_symptoms: string | null
  aggravating_factors: string | null
  relieving_factors: string | null
  red_flags: Record<string, unknown>[]
  review_of_systems: Record<string, unknown>
  medical_history: Record<string, unknown>
  medications: Record<string, unknown>
  allergies: Record<string, unknown>
  family_history: Record<string, unknown>
  social_history: Record<string, unknown>
  vitals: Record<string, unknown>
  ayush_assessment: Record<string, unknown>
  ai_generated: boolean
  physician_verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  waiting: number
  inConsultation: number
  completed: number
  priorityAlerts: number
}
