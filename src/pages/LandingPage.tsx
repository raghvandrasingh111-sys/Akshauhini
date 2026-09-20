import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Stethoscope,
  FileText,
  Languages,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  Mic,
  QrCode,
  AlertTriangle,
  Lock,
  Check,
  ChevronDown,
  Layers,
  FileCheck2,
  Workflow
} from 'lucide-react'

export function LandingPage() {
  // Interactive Live Simulator State
  const [activeTab, setActiveTab] = useState<'kiosk' | 'doctor' | 'ayush'>('doctor')
  const [selectedLanguage, setSelectedLanguage] = useState('hi')
  const [patientVolume, setPatientVolume] = useState<number>(180)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Unique IDs for accessibility
  const patientVolumeSliderId = useId()

  // ROI calculations
  const minutesPerPatientSaved = 4.5 // avg saved history taking mins
  const dailyHoursSaved = ((patientVolume * minutesPerPatientSaved) / 60).toFixed(1)
  const additionalConsults = Math.round(patientVolume * 0.35)
  const errorReduction = '82%'

  const languagesList = [
    { code: 'hi', name: 'हिन्दी (Hindi)', text: 'मुझे 3 दिन से सीने में भारीपन और सांस लेने में तकलीफ हो रही है।' },
    { code: 'en', name: 'English', text: 'Experiencing severe chest heaviness and shortness of breath for 3 days.' },
    { code: 'ta', name: 'தமிழ் (Tamil)', text: '3 நாட்களாக மார்பு பாரம் மற்றும் மூச்சுத் திணறல் உள்ளது.' },
    { code: 'bn', name: 'বাংলা (Bengali)', text: '৩ দিন ধরে বুকে ভারী ভাব এবং শ্বাসকষ্ট হচ্ছে।' },
    { code: 'mr', name: 'मराठी (Marathi)', text: 'गेल्या ३ दिवसांपासून छातीत जडपणा आणि श्वास घेण्यास त्रास होत आहे.' },
  ]

  const faqs = [
    {
      q: 'How does Sanjeevani integrate with our existing Hospital Management Information System (HMIS)?',
      a: 'Sanjeevani is built entirely on the ABDM (Ayushman Bharat Digital Mission) FHIR R4 interoperability standard. It integrates via standard REST and GraphQL webhooks to push structured digital intake records, OCR attachments, and Gemini summaries directly into any compliant HMIS/EHR system.'
    },
    {
      q: 'Can elderly or illiterate patients independently use the intake kiosk?',
      a: 'Yes. Sanjeevani features a conversational multilingual voice interface with real-time speech-to-text in 12+ Indian languages, accompanied by large high-contrast touch options, audio read-backs, and pictorial symptom selectors designed specifically for high-volume rural and urban Indian OPDs.'
    },
    {
      q: 'Does Sanjeevani replace doctor decision-making?',
      a: 'No. Sanjeevani is strictly an AI-assisted intake copilot. All AI-generated briefs, red-flag risk alerts, and historical summaries clearly display source provenance with full physician verification controls. The clinician retains complete medical authority and final diagnosis.'
    },
    {
      q: 'How does the AYUSH Prakriti and Dashavidha assessment work?',
      a: 'Sanjeevani contains a dedicated AYUSH module developed under the Ministry of Ayush framework. It captures Ahara (diet), Vihara (lifestyle), Agni (digestive fire), and Dosha symptoms during preliminary intake to present a standardized Dashavidha Pariksha summary alongside allopathic clinical records.'
    },
    {
      q: 'Is patient health data secure and compliant with Indian health privacy laws?',
      a: 'All data exchanges require explicit patient ABHA OTP/biometric consent. Records are encrypted end-to-end (AES-256 in transit and at rest) following National Health Authority (NHA) and Digital Personal Data Protection (DPDP) guidelines.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 font-sans selection:bg-teal-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[650px] h-[650px] bg-sky-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Banner Notice */}
      <div className="relative z-50 bg-gradient-to-r from-emerald-950/80 via-teal-900/60 to-emerald-950/80 border-b border-teal-500/20 px-4 py-2 text-xs md:text-sm text-center text-teal-200 flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-white">Smart India Hackathon SIH26047</span>
        <span className="text-teal-400/60">•</span>
        <span>Ministry of Ayush (AIIA) & ABDM FHIR R4 Ready</span>
        <span className="hidden sm:inline text-teal-400/60">•</span>
        <span className="hidden sm:inline bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full text-[11px] font-medium border border-teal-500/30">
          Live Clinical Intake Engine
        </span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0F1D]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-teal-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[14px] flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">Sanjeevani</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-medium">संजीवनी</span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide">AI Clinical Intake & Decision Copilot</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors">Live Simulation</a>
            <a href="#impact" className="hover:text-emerald-400 transition-colors">OPD Calculator</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/patient"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-teal-400" />
              <span>Patient Kiosk</span>
            </Link>
            <Link
              to="/doctor"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Physician Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Next-Generation OPD Intake & Clinical Briefing Engine</span>
            <span className="bg-teal-500/20 px-2 py-0.5 rounded text-[11px] text-teal-200">ABDM ABHA 2.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            Eliminate OPD Bottlenecks with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Voice-First AI Intake
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
            Sanjeevani transforms crowded hospital OPDs. Patients narrate complaints in 12+ Indian languages, scan past prescriptions, and verify ABHA records — delivering a ready, verified <strong>Gemini Diagnostic Brief</strong> before stepping into the doctor&apos;s cabin.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/patient"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <Mic className="w-5 h-5 text-emerald-100" />
              <span>Launch Patient Intake Kiosk</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/doctor"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 hover:border-teal-500/50 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Stethoscope className="w-5 h-5 text-teal-400" />
              <span>Doctor OPD Dashboard</span>
            </Link>
          </div>

          {/* Key Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/60">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">12+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Indian Regional Languages</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Voice STT & Devanagari UI</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
              <div className="text-2xl sm:text-3xl font-bold text-teal-300 mb-1">&lt; 90s</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Average Intake Time</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Automated history & triage</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
              <div className="text-2xl sm:text-3xl font-bold text-sky-400 mb-1">100%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">ABDM & FHIR R4</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Seamless ABHA consent flow</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-left">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">Dual-Mode</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Allopathy + AYUSH</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Prakriti & Dashavidha intake</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Simulator Showcase */}
      <section id="simulator" className="relative z-10 py-16 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
              Live Clinical Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-3">
              Experience the Clinical Intake Loop
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              See how patient voice input in regional languages instantly synthesizes into structured, high-trust diagnostic summaries for the doctor.
            </p>
          </div>

          {/* Interactive Simulator Shell */}
          <div className="bg-[#0D1527] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
            {/* Simulator Header & Tabs */}
            <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 pl-2 border-l border-slate-700">
                  SANJEEVANI-CORE // OPD-TRIAGE-ENGINE v1.4
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('kiosk')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'kiosk'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>1. Patient Voice Kiosk</span>
                </button>
                <button
                  onClick={() => setActiveTab('doctor')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'doctor'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>2. Doctor Clinical Workspace</span>
                </button>
                <button
                  onClick={() => setActiveTab('ayush')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'ayush'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3. AYUSH Dashavidha</span>
                </button>
              </div>
            </div>

            {/* Simulator Body */}
            <div className="p-6 md:p-8">
              {activeTab === 'kiosk' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Voice Simulation Panel */}
                  <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                        <span className="text-xs font-semibold uppercase text-red-400 tracking-wider">
                          Live Multilingual Voice Capture
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Sampling @ 16kHz</span>
                    </div>

                    {/* Language Selector */}
                    <div className="mb-4">
                      <label className="text-xs text-slate-400 block mb-2 font-medium">Select Patient Native Language:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {languagesList.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                              selectedLanguage === lang.code
                                ? 'bg-teal-950/80 border-teal-500 text-teal-200 ring-1 ring-teal-500'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulated Speech Wave & Transcript */}
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 mb-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-teal-400 font-medium">
                        <Mic className="w-4 h-4 text-teal-400" />
                        <span>Speech Recognition Transcript (Whisper / Sarvam AI):</span>
                      </div>
                      <p className="text-slate-200 text-base font-medium leading-relaxed italic">
                        &ldquo;{languagesList.find((l) => l.code === selectedLanguage)?.text}&rdquo;
                      </p>
                    </div>

                    {/* Extracted Symptom Tags */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 font-medium">Real-Time NLP Entity Extraction:</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3 h-3 text-red-400" /> Chest Heaviness (3d)
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3 h-3 text-red-400" /> Dyspnea on Exertion
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-teal-950/60 border border-teal-500/40 text-teal-300 font-medium">
                          Duration: Acute Subacute
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 font-medium">
                          Severity: Moderate-High (7/10)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Patient Mobile / Kiosk Card */}
                  <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-900/60 border border-teal-500/40 flex items-center justify-center font-bold text-teal-300">
                          RJ
                        </div>
                        <div>
                          <div className="font-semibold text-white">Ramesh Joshi</div>
                          <div className="text-xs text-slate-400">54 Y / Male • ABHA: 91-4829-1039-4920</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        Priority Triage (Red Flag)
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400 mb-1">OCR Scanned Prescription (Attached):</div>
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Cardiology_Discharge_2024.pdf
                          </span>
                          <span className="text-xs text-emerald-400 font-mono">Extracted 4 Rx</span>
                        </div>
                      </div>

                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
                        <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Token #42 Issued Successfully
                        </div>
                        <p className="text-xs text-slate-300">
                          Intake package pushed to Doctor Room #4 (Cardiology OPD). Estimated wait time: 8 mins.
                        </p>
                      </div>

                      <Link
                        to="/patient"
                        className="block w-full text-center py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-teal-900/30"
                      >
                        Try Real Patient Kiosk →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'doctor' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Doctor OPD Queue View */}
                  <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Live OPD Queue (Room #4)
                      </span>
                      <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                        4 Waiting
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500 text-left relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-white">#42 Ramesh Joshi (54/M)</span>
                          <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
                            PRIORITY
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">Chest Heaviness + Exertional Dyspnea (3d)</p>
                        <div className="text-[10px] text-teal-400 mt-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Gemini Summary Ready • ABHA Linked
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left opacity-75">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-200">#43 Sunita Sharma (48/F)</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                            WAITING
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">Chronic Knee Osteoarthritis Follow-up</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left opacity-75">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-200">#44 Arvind Patel (62/M)</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                            WAITING
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">Diabetes Type-2 Fasting Review + Neuropathy</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Gemini Clinical Brief Panel */}
                  <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-white">Patient Clinical Brief: Ramesh Joshi</h3>
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> ABHA Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">ABDM Consent ID: <span className="font-mono text-slate-300">CONS-9821-IND</span> (Expires in 2 hrs)</p>
                      </div>

                      <Link
                        to="/doctor"
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Open Full EMR Workspace →
                      </Link>
                    </div>

                    {/* Gemini Clinical Co-Pilot Box */}
                    <div className="bg-slate-950 rounded-xl p-5 border border-teal-500/30 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                          Gemini 2.5 Clinical Synthesis
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                          Source Provenance: Patient Voice + ABDM EHR
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-slate-200">
                        <div>
                          <strong className="text-teal-200">Chief Complaint:</strong> Patient reports subacute onset retrosternal chest heaviness for 3 days radiating to left shoulder, exacerbated by climbing stairs.
                        </div>
                        <div>
                          <strong className="text-amber-300">Red-Flag Alert:</strong> High index of suspicion for Unstable Angina / Acute Coronary Syndrome. Immediate 12-lead ECG and Troponin-I test recommended prior to routine medication refill.
                        </div>
                        <div>
                          <strong className="text-slate-300">Historical Context (ABDM):</strong> Known Hypertensive (on Telmisartan 40mg). Last HbA1c 7.1% (Dec 2024). No prior documented CAD.
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <Check className="w-4 h-4" /> Ready for one-click physician note approval
                      </span>
                      <span>Physician maintains final diagnostic authority</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ayush' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white text-base">Ayurvedic Prakriti & Dashavidha Intake</h3>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      Captured during multilingual intake through standardized Ayurvedic constitutional questions (AIIA Protocol).
                    </p>

                    <div className="space-y-3">
                      <div className="bg-amber-950/40 border border-amber-500/20 p-3 rounded-xl">
                        <div className="flex justify-between text-xs text-amber-300 font-semibold mb-1">
                          <span>Dosha Predominance (देह प्रकृति)</span>
                          <span>Vata-Pitta (वात-पित्त)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          <div className="bg-amber-500 h-full w-[55%]" title="Vata" />
                          <div className="bg-red-500 h-full w-[30%]" title="Pitta" />
                          <div className="bg-teal-500 h-full w-[15%]" title="Kapha" />
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Agni (Digestive Power):</span>
                          <span className="text-amber-200 font-medium">Vishamagni (विषमाग्नि)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kostha (Bowel Habit):</span>
                          <span className="text-slate-200">Krura (कठिन/बद्ध)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Nidra (Sleep Pattern):</span>
                          <span className="text-slate-200">Khandita (Disturbed)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
                    <h3 className="font-bold text-white text-base mb-2">Integrated Holistic Treatment Synthesis</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Sanjeevani harmonizes Allopathic clinical red flags with AYUSH supportive therapies for holistic chronic disease management.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-200">
                      <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30">
                        <span className="font-semibold text-teal-300">Allopathic Safety Gate:</span>
                        <p className="text-slate-300 mt-0.5">Emergency ECG ruling out acute ischemia must precede any dietary or lifestyle changes.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
                        <span className="font-semibold text-amber-300">AYUSH Adjuvant Care Recommendation:</span>
                        <p className="text-slate-300 mt-0.5">Arjuna Ksheerapaka (cardioprotective) & Medhya Rasayana for associated anxiety and Vata shamana under qualified Vaidya supervision.</p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        to="/patient/intake"
                        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg"
                      >
                        Explore AYUSH Intake Demo →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full">
            Key Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
            Engineered for India&apos;s Public & Private Healthcare Scale
          </h2>
          <p className="text-slate-300 text-base">
            From rural Primary Health Centers to apex institutes like AIIMS, Sanjeevani removes human data-entry latency at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-teal-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multilingual Voice-First Intake</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Patients speak naturally in Hindi, Tamil, Bengali, Marathi, or English. Advanced medical STT and NLP extract structured clinical history, duration, and pain scores.
            </p>
            <div className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <span>Supports 12+ Indic Dialects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-emerald-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ABHA & ABDM FHIR R4 Integration</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Seamless 14-digit ABHA number lookup with instant OTP consent. Pull longitudinal health records (EHR/PHR) directly to surface chronic comorbidities.
            </p>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>National Health Authority Compliant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-red-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Red-Flag Triage</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Intelligent detection of critical clinical signs (acute chest pain, dyspnea, stroke signs, septic shock) automatically bumps patients to Priority Queue with emergency audio alerts.
            </p>
            <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
              <span>Zero-Delay Emergency Escalation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-sky-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Gemini Clinical Brief Co-Pilot</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Transforms unstructured patient narrative and scanned records into concise, standardized SOAP notes with clear source citations for rapid physician review.
            </p>
            <div className="text-xs text-sky-400 font-semibold flex items-center gap-1">
              <span>Physician-in-the-Loop Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-amber-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">OCR Document & Lab Extraction</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Patients take photos of physical prescription slips, discharge summaries, or CBC/Lipid lab reports. OCR extracts dosages and flags out-of-range biomarkers automatically.
            </p>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <span>Digitizes Paper Medical History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/60 rounded-3xl p-7 border border-slate-800 hover:border-teal-500/40 transition-all group hover:bg-slate-900/90">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ayush + Allopathic Dual Framework</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Unified digital intake adhering to Ministry of Ayush protocols. Evaluates Dosha balance and lifestyle factors alongside standard ICD-10 diagnostic coding.
            </p>
            <div className="text-xs text-teal-400 font-semibold flex items-center gap-1">
              <span>Comprehensive Holistic Profiling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive OPD Time & ROI Calculator */}
      <section id="impact" className="relative z-10 py-16 bg-slate-950/70 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                OPD Efficiency Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Calculate Real Time Saved in Your Hospital OPD
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                By offloading 4–6 minutes of repetitive intake, history questions, and paper deciphering to Sanjeevani Kiosks, doctors focus purely on examination and treatment.
              </p>

              {/* Slider Control */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor={patientVolumeSliderId} className="text-xs font-semibold text-slate-300">
                    Daily OPD Patients per Doctor:
                  </label>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {patientVolume} patients/day
                  </span>
                </div>
                <input
                  id={patientVolumeSliderId}
                  type="range"
                  min="30"
                  max="350"
                  step="10"
                  value={patientVolume}
                  onChange={(e) => setPatientVolume(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>30 (Specialty Clinic)</span>
                  <span>180 (District Hospital)</span>
                  <span>350+ (Apex OPD)</span>
                </div>
              </div>
            </div>

            {/* Live Metrics Result Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 text-center flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">
                  {dailyHoursSaved} hrs
                </div>
                <div className="text-sm font-semibold text-white mb-1">Doctor Time Saved / Day</div>
                <p className="text-xs text-slate-400">Eliminating manual data-entry & repetitive history taking</p>
              </div>

              <div className="bg-gradient-to-br from-teal-950/80 to-slate-900 p-6 rounded-3xl border border-teal-500/30 text-center flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-300 mb-1">
                  +{additionalConsults}
                </div>
                <div className="text-sm font-semibold text-white mb-1">Extra Consultations Unlocked</div>
                <p className="text-xs text-slate-400">Reduced OPD queue backlog without physician burnout</p>
              </div>

              <div className="bg-gradient-to-br from-sky-950/80 to-slate-900 p-6 rounded-3xl border border-sky-500/30 text-center flex flex-col justify-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 mb-1">
                  {errorReduction}
                </div>
                <div className="text-sm font-semibold text-white mb-1">Intake Omission Drop</div>
                <p className="text-xs text-slate-400">Standardized checklists & automated red-flag alerts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Security Section */}
      <section id="architecture" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 border border-sky-500/30 px-3 py-1 rounded-full">
            Clinical Rigor & Compliance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
            Built for National Healthcare Standards
          </h2>
          <p className="text-slate-300 text-base">
            Every layer of Sanjeevani is architected for strict data sovereignty, verifiable provenance, and zero-compromise clinical safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Patient-Consented Access</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No historical health records are fetched without explicit patient ABHA OTP consent. Doctors request purpose-scoped, time-limited access with complete audit logging.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Granular purpose specifications
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Automatic consent expiration
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">FHIR R4 Diagnostic Bundles</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Intake summaries, vitals, allergies, and chief complaints are normalized into standard HL7 FHIR R4 resources ready for bidirectional EHR exchange.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> SNOMED-CT & ICD-10 compatible
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Standardized Observation schemas
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Clinician-in-the-Loop Design</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI-generated clinical briefs and suggested differentials are visibly tagged with source citations, requiring explicit doctor verification and approval.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Full provenance traceability
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Zero automated medication dispensing
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-16 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 mb-2">
              Everything You Need to Know
            </h2>
            <p className="text-slate-400 text-sm">
              Answers regarding deployment, interoperability, and clinical workflows.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-slate-100 font-semibold text-sm sm:text-base hover:text-teal-300"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pre-Footer Action Banner */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900/60 via-teal-900/60 to-slate-900 rounded-3xl p-8 sm:p-12 border border-teal-500/30 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Modernize Your Hospital OPD?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base">
              Try the live interactive patient kiosk or log in to the doctor clinical workspace right now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/patient"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Mic className="w-4 h-4 text-teal-700" />
                <span>Open Patient Kiosk</span>
              </Link>
              <Link
                to="/doctor"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Portal Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-lg text-white">Sanjeevani (संजीवनी)</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                AI-assisted clinical intake, multilingual speech-to-text, ABDM ABHA verification, and physician diagnostic intelligence for Indian Hospital OPDs.
              </p>
              <div className="text-xs text-slate-400 pt-1">
                Project ID: <span className="font-mono text-slate-300">SIH26047</span> • Ministry of Ayush (AIIA)
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/patient" className="hover:text-teal-300 transition-colors">Patient Kiosk / Intake</Link></li>
                <li><Link to="/patient/intake" className="hover:text-teal-300 transition-colors">Self-Service Portal</Link></li>
                <li><Link to="/doctor" className="hover:text-teal-300 transition-colors">Physician Login</Link></li>
                <li><Link to="/doctor/dashboard" className="hover:text-teal-300 transition-colors">OPD Queue & EMR</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">Standards & Tech</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>ABDM ABHA 2.0 Gateway</li>
                <li>HL7 FHIR R4 Bundles</li>
                <li>Gemini 2.5 Clinical Brief</li>
                <li>All India Institute of Ayurveda</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Sanjeevani AI. Built for Smart India Hackathon (SIH26047).
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> System Operational
              </span>
              <span>•</span>
              <span>DPDP Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
