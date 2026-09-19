# Sanjeevani (संजीवनी) — AI Clinical Intake Platform

**Smart India Hackathon 2026 · Problem ID: SIH26047**  
Ministry of Ayush (AIIA) · MedTech / HealthTech

Sanjeevani (संजीवनी) is a first-mile clinical intake kiosk that offloads structured history-taking from overburdened OPD physicians. Powered by Google Gemini AI, ABDM ABHA identity verification, and FHIR R4 interoperability, patients narrate their history in local languages via voice or touch, scan paper records, and deliver a physician-ready diagnostic summary before consultation begins.

## Features

### Module A — Conversational History Engine
- Dual-mode **Voice + Touch** UI with Hindi/English/regional language support
- Adaptive clinical branching (SOCRATES pain framework)
- **AYUSH Dashavidha Pariksha** mode (Prakriti, Vikriti, Agni, Koshtha, etc.)
- Real-time **Red-Flag Triage Engine** (chest pain, dyspnea, stroke indicators)

### Module B — Document Digitization
- Multilingual OCR simulation for prescriptions, lab reports, discharge summaries
- Clinical entity extraction (diagnoses, medications, lab values)
- Chronological timeline with abnormal value flagging

### Module C — Structured Summary Generator
- Standardized physician summary (CC → HPI → Past History → Meds → Allergies → ROS)
- Editable draft on physician dashboard
- Bilingual audio confirmation for patients

### Module D — Consent & Interoperability
- DPDP Act 2023 compliant granular consent flow
- ABHA identity verification
- FHIR R4 bundle generation for EMR integration

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** for the Patient Kiosk.  
Switch to **Physician EMR** via the bottom navigation bar.

## Demo Flow (For Judges)

1. Open Patient Kiosk → Select **Hindi**
2. Click **Demo Mode** on identity screen
3. Grant all consent checkboxes
4. Select **Allopathic** or **AYUSH** mode
5. On interview Q1, click **Demo: "3 din se chest pain…"** or speak it
6. Continue through questions — watch **Emergency Alert** trigger
7. Scan a **Lab Report** on document screen
8. Generate summary → switch to **Physician EMR** tab
9. Review pre-populated structured summary with red flags

Alternatively, click **Load Demo Case** on the Physician Dashboard.

## Architecture

```
src/
├── components/
│   ├── kiosk/          # Patient-facing intake screens
│   ├── physician/        # EMR dashboard
│   └── ui/               # Shared UI primitives
├── context/              # Global state management
├── data/                 # Clinical question ontologies
├── services/
│   ├── triageEngine.ts   # Red-flag detection
│   ├── ocrService.ts     # Document processing
│   └── fhirGenerator.ts  # FHIR R4 bundle builder
└── types/                # TypeScript interfaces
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (see `DESIGN.md` for design system)
- **Routing:** React Router v6
- **Speech:** Web Speech API (ASR + TTS) with touch fallback
- **Storage:** localStorage (demo); production → FHIR API + ABDM

## Production Roadmap

| Component | Demo | Production |
|---|---|---|
| ASR | Web Speech API | AI4Bharat Bhashini / IndicWhisper |
| OCR | Simulated extraction | PaddleOCR + medical NER |
| LLM | Rule-based branching | Constrained LLM with clinical ontology |
| EMR | localStorage | HL7 FHIR R4 REST API |
| Auth | Manual ABHA entry | ABDM ABHA OAuth |

## License

Built for Smart India Hackathon 2026 — SIH26047.
