# Sanjeevani (संजीवनी) — AI Clinical Intake Platform

Sanjeevani is an AI-assisted digital patient intake and physician clinical dashboard built for Indian hospital OPDs. It is designed to streamline patient intake, surface clinically relevant information before consultation, and help doctors review patient history, documents, and AI-generated summaries with full accountability.

The physician-facing interface is not designed to replace clinical judgment. Instead, it supports doctors by organizing patient information, flagging urgent findings, and keeping the final medical decision in the physician's control.
It is also a first-mile clinical intake kiosk powered by Gemini AI, ABDM ABHA identity verification, and FHIR R4 interoperability. Patients can narrate their history in local languages via voice or touch, scan paper records, and deliver a physician-ready summary before consultation.
It offloads structured history-taking from overburdened OPD physicians and delivers a physician-ready diagnostic summary before consultation.

## Product Purpose

Sanjeevani enables a modern, hospital-grade workflow that moves patients from:

- patient registration and intake
- ABHA-based record lookup
- consented record access
- AI-generated clinical brief
- medical document review
- physician verification and consultation

without dropping the doctor into fragmented or low-trust systems.

## Google Patient Login Setup

The patient portal uses Supabase Google OAuth. The error `redirect_uri_mismatch` is fixed in provider configuration, not by changing the patient form.

1. In Google Cloud Console, open the OAuth 2.0 Web Client used by Supabase.
2. Add this exact **Authorized redirect URI**:

	```text
	https://mswfnhxtmahvckgjllqt.supabase.co/auth/v1/callback
	```

3. In Supabase Dashboard, open **Authentication → Providers → Google**, enable Google, and paste the same Google OAuth client ID and secret.
4. In Supabase **Authentication → URL Configuration**, add the app URLs:

	```text
	http://localhost:5173/patient
	https://YOUR_PRODUCTION_DOMAIN/patient
	```

5. Set `VITE_APP_URL` to the matching app origin, for example `http://localhost:5173` during development.
6. On Google Cloud's OAuth consent screen, add the test Gmail accounts under **Test users** while the app is in testing mode.

The Google callback must be the Supabase callback above. The app URL is only the final destination after Supabase completes authentication.

## Core Design Principles

- Clinical, readable, and information-dense interface
- Desktop-first OPD workflow with tablet support
- Strong hierarchy and minimal visual noise
- Clear provenance of information sources
- AI-generated content labeled and verifiable
- Privacy-aware, consent-driven data access
- High trust and accountability throughout the consultation workflow

## System Overview

Sanjeevani combines:

- multilingual patient intake via voice and touch
- AYUSH and allopathic clinical assessment flows
- red-flag symptom detection during intake
- OCR/document extraction for prescriptions and reports
- structured physician summaries from patient intake and medical records
- secure record access with patient consent management

## Physician Dashboard Goals

The doctor portal is built to help clinicians answer these questions quickly:

- Who is waiting and what is their urgency?
- Has this patient already provided enough intake information?
- Are there relevant historical records available?
- Is there an alert requiring review before consultation?
- What has the AI summarized, and what still needs physician verification?
- What documents and timeline details should be reviewed before the note is finalized?

## Key Features

### 1. OPD Queue and Clinical Prioritization
- Today's patient queue with waiting time and risk classification
- Priority patient identification for red-flag symptoms
- Queue filters for waiting, priority, in consultation, and completed patients
- Quick access to patient intake status and chief complaint overview

### 2. ABHA Patient Search
- Search by ABHA number, ABHA address, or patient identifier
- Secure patient lookup workflow
- Record availability and updated timestamp display
- Request access only after the doctor has a valid clinical need

### 3. Consent and Record Access
- Professional access request flow with purpose and requested record types
- Access duration controls and audit visibility
- Clear recommendation to obtain patient consent before record access
- Access grant and history tracking

### 4. Patient Clinical Workspace
- Unified patient record view for one consultation
- Patient header with demographic summary and token status
- Intake completion state and secure session indicators
- Unified access to records, AI summary, notes, and timeline

### 5. AI Clinical Brief
- Compact summary generated from intake + authorized records
- Clearly labeled as AI-generated and requiring physician verification
- Sections for chief complaint, relevant history, current intake, and missing information
- Source-backed summary generation with review links

### 6. Structured Clinical Summary
- Chief complaint and HPI sections
- Review of systems and red flags
- Medical history, medications, allergies, family history, and social history
- AYUSH assessment section with structured parameters
- Vitals and current consultation metadata

### 7. Medical Documents and Timeline
- Document viewer grouped by prescriptions, lab reports, discharge summaries, and other records
- OCR-extracted values with original source visibility
- Medical timeline for consultations, tests, hospitalizations, and current intake
- Clickable events to open source records

### 8. Consultation Workflow
- Start consultation mode from the patient workspace
- Sticky action bar for saving a draft, adding prescription, completing consultation, referral, and follow-up
- Clear distinction between patient-provided data and AI interpretation

### 9. AI Assistant Panel
- Safe actions such as summarizing intake, reviewing prior records, or surfacing missing information
- Source-aware explanations and citations for AI output
- No autonomous diagnosis or prescribing behavior

### 10. Emergency and Notification Center
- Priority alert workflow for red-flag intake cases
- Emergency center for urgent patients
- Hospital notifications for new patients, consent changes, document processing, and intake events

### 11. Audit and Accountability
- Access history for patient record requests and grant events
- Record of AI-generated summary creation and physician edits
- Transparent clinical provenance and secure session markers

## User Experience Flow

A typical doctor workflow is:

1. Open the physician dashboard.
2. Review the OPD queue and identify priority patients.
3. Search for a patient through ABHA lookup or queue selection.
4. Request and receive patient consent before viewing sensitive records.
5. Review clinical alerts, AI summary, records, and timeline.
6. Confirm or edit the AI-generated brief.
7. Start consultation and document the patient encounter.
8. Save a draft, add treatment notes, or complete the consultation.

## Design System

### Brand
- Product: Sanjeevani
- Primary color: #0F5132
- Secondary color: #0D9488
- Background: #F8FAFC
- Surface: #FFFFFF
- Primary text: #0F172A
- Secondary text: #64748B
- Border: #E2E8F0
- Emergency: #DC3545
- Warning: #F59E0B
- Success: #16A34A

### Typography
- Inter or Manrope
- Strong hierarchy for clinical readability
- Compact but accessible spacing

### Visual Direction
- Professional healthcare EMR aesthetic
- Calm clinical presentation
- Subtle depth and hierarchy
- High information density without clutter

## Application Layout

The dashboard follows a persistent shell:

```text
┌────────────────────────────────────────────────────────────────────┐
│ SANJEEVANI                 Search Patient          Alerts  Dr. Sharma │
├───────────────────────┬──────────────────────────────────────────────┤
│ Sidebar               │ Main clinical workspace                     │
│ • Dashboard           │                                            │
│ • Patient Queue       │ OPD overview / queue / patient details      │
│ • ABHA Patients       │                                            │
│ • Consultations       │                                            │
│ • Records             │                                            │
│ • AI Summaries        │                                            │
│ • Emergencies         │                                            │
│ • Reports             │                                            │
│ • Settings            │                                            │
└───────────────────────┴──────────────────────────────────────────────┘
```

## Demo Data

For development and demo purposes, include realistic sample patient data such as:

- A**** Kumar
- Age: 42
- Gender: Male
- Token: A-142
- Chief complaint: abdominal pain
- Prior records: 3
- Intake status: complete
- Risk: routine

This data must be clearly labeled as DEMO DATA.

## Data States

The dashboard should support the following UI states:

- loading
- success
- empty
- error
- unauthorized
- consent_required
- consent_granted
- record_unavailable
- ai_processing
- ai_complete

## Security and Privacy

The system emphasizes safe clinical data handling:

- masked sensitive identifiers
- ABHA lookup with access boundary controls
- consent-based record access
- secure session indicators
- audit trail for access, AI generation, and physician edits
- no full Aadhaar or identity exposure in the UI

## Error and Loading Experience

The UI should always communicate state clearly:

- Retrieving authorized records...
- Generating clinical summary...
- Unable to retrieve records.
- Patient consent is required before accessing health information.
- AI summary could not be generated. Continue with original patient intake.

Errors must not block the clinical workflow entirely.

## Component Architecture

The application should be built using reusable React and TypeScript components, including:

- DoctorLayout
- Sidebar
- TopNavigation
- PatientQueue
- PatientSearch
- ABHAPatientSearch
- ConsentModal
- PatientHeader
- ClinicalAlert
- AIClinicalBrief
- ClinicalSummary
- HPISection
- VitalsCard
- MedicationList
- AllergyList
- AYUSHAssessment
- MedicalDocuments
- DocumentViewer
- MedicalTimeline
- IntakeSummary
- EmergencyAlert
- AIClinicalAssistant
- ConsultationWorkspace
- AuditTimeline
- NotificationPanel

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Local state management for demo workflows
- Optional future API integration for FHIR, ABHA, and AI services

## Project Structure

```bash
src/
├── components/
│   ├── kiosk/
│   ├── physician/
│   └── ui/
├── context/
├── data/
├── services/
├── types/
├── pages/
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open the app in the browser:

```text
http://localhost:5173
```

## Design Reference

The product visual system and UI research notes are documented in [DESIGN.md](DESIGN.md).

## Acceptance Criteria

The final physician dashboard should feel like a serious hospital-grade clinical product and should:

- surface patient queue and urgency clearly
- support ABHA-based lookup and consent flow
- expose authorized records without exposing sensitive data prematurely
- display a physician-verifiable AI summary
- provide a single, unified clinical workspace for patient review and consultation
- distinguish patient-provided data from AI-generated interpretation
- include audit trail and accountable record access
- be suitable for desktop-first clinical use with tablet resilience

## License

This project is a healthcare prototype and is intended for demonstration, evaluation, and further product development in the context of digital OPD workflow design.
