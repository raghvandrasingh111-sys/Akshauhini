import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Fingerprint,
  HeartPulse,
  Languages,
  LockKeyhole,
  Mic2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Volume2,
} from 'lucide-react'

const workflow = [
  { number: '01', title: 'Patient Intake', text: 'Voice and touch guided history-taking in a calm, familiar flow.', icon: Mic2 },
  { number: '02', title: 'Clinical Structuring', text: 'Conversation becomes organized HPI, symptoms, vitals, and risk signals.', icon: ClipboardList },
  { number: '03', title: 'Authorized Records', text: 'Consent-aware access brings relevant documents into context.', icon: LockKeyhole },
  { number: '04', title: 'AI Clinical Brief', text: 'A reviewable draft surfaces history, gaps, and source context.', icon: BrainCircuit },
  { number: '05', title: 'Physician Review', text: 'The doctor verifies the story before making a clinical decision.', icon: Stethoscope },
  { number: '06', title: 'Consultation', text: 'The visit starts with more clarity and less reconstruction.', icon: Check },
]

const trustItems = ['AI-assisted clinical intake', 'Multilingual patient interaction', 'Physician-in-the-loop', 'Consent-aware records', 'Structured clinical information']

function ProductWindow() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] rounded-[28px] border border-white/60 bg-white/90 p-3 shadow-[0_30px_90px_rgba(3,48,32,0.24)] backdrop-blur">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-[#f6f9f8]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F5132] text-white"><HeartPulse className="h-3.5 w-3.5" /></div><span className="text-[10px] font-bold tracking-[0.14em] text-slate-700">SANJEEVANI</span></div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-500">Secure clinical workspace</span></div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-[0.86fr_1.14fr]">
          <div className="rounded-2xl bg-[#0F5132] p-4 text-white">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-200">Today&apos;s intake</div>
            <div className="mt-8 text-2xl font-semibold tracking-tight">A clearer<br />starting point.</div>
            <div className="mt-8 space-y-2">
              {['Patient voice', 'Structured HPI', 'Clinical signals'].map((item, index) => <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-[10px] text-emerald-50"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d9f99d] text-[#0F5132]">{index + 1}</span>{item}</div>)}
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">AI clinical brief</span><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">Verify</span></div>
              <div className="mt-3 h-2 w-4/5 rounded-full bg-slate-200" /><div className="mt-2 h-2 w-3/5 rounded-full bg-slate-100" />
              <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-emerald-50 p-2"><div className="text-[9px] text-emerald-700">Chief complaint</div><div className="mt-1 text-[10px] font-semibold text-slate-700">Abdominal pain</div></div><div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] text-slate-400">Duration</div><div className="mt-1 text-[10px] font-semibold text-slate-700">3 days</div></div></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-200 bg-white p-3"><FileText className="h-4 w-4 text-[#0D9488]" /><div className="mt-3 text-[10px] font-semibold text-slate-700">Medical documents</div><div className="mt-1 text-[9px] text-slate-400">Consent-aware</div></div><div className="rounded-2xl border border-slate-200 bg-white p-3"><ShieldCheck className="h-4 w-4 text-[#0F5132]" /><div className="mt-3 text-[10px] font-semibold text-slate-700">Physician review</div><div className="mt-1 text-[9px] text-slate-400">Always in control</div></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) { return <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0D9488]"><span className="h-px w-7 bg-[#0D9488]" />{children}</div> }

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#F8FAFC]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Sanjeevani home"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F5132] text-white shadow-lg shadow-emerald-950/10"><HeartPulse className="h-5 w-5" /></span><span className="text-sm font-extrabold tracking-[0.16em] text-[#0F5132]">SANJEEVANI</span></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex"><a href="#workflow" className="transition hover:text-[#0F5132]">How it works</a><a href="#about" className="transition hover:text-[#0F5132]">Features</a><a href="#patient-experience" className="transition hover:text-[#0F5132]">For patients</a><a href="#privacy" className="transition hover:text-[#0F5132]">Privacy &amp; Security</a><a href="#about" className="transition hover:text-[#0F5132]">About</a></nav>
          <Link to="/patient/intake" className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#0A3E29]">Start Intake <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </header>

      <main>
        <section id="product" className="relative border-b border-slate-200/70 px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute right-[-14%] top-[-20%] h-[500px] w-[500px] rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 animate-[fadeUp_0.7s_ease-out_both]">
              <SectionLabel>Clinical intelligence platform</SectionLabel>
              <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.03] tracking-[-0.04em] text-[#0F5132] sm:text-6xl lg:text-[76px]">From patient conversation to <span className="text-[#0D9488]">clinical clarity.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Sanjeevani transforms patient conversations, medical documents, and authorized health records into structured clinical information physicians can review and act on.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3"><Link to="/patient/intake" className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#0A3E29]">Start Patient Intake <ArrowRight className="h-4 w-4" /></Link><a href="#workflow" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#0D9488] hover:text-[#0F5132]">See how it works <ChevronRight className="h-4 w-4" /></a></div>
              <div className="mt-10 flex items-center gap-3 text-sm text-slate-500"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[#0F5132]"><Sparkles className="h-4 w-4" /></span><span><strong className="text-slate-700">AI-assisted</strong> clinical intake, with the physician in control.</span></div>
            </div>
            <div className="relative z-10 animate-[fadeUp_0.9s_0.1s_ease-out_both]"><ProductWindow /><div className="absolute -bottom-7 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#0D9488]"><Volume2 className="h-4 w-4" /></span><div><div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Patient voice</div><div className="text-xs font-semibold text-slate-700">Natural conversation, structured safely</div></div></div></div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-5 py-5 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">{trustItems.map((item) => <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Check className="h-4 w-4 text-[#16A34A]" />{item}</div>)}</div></section>

        <section id="about" className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><SectionLabel>Why it matters</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#0F5132] sm:text-5xl">Clinical conversations contain more information than most systems capture.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[{ icon: Mic2, title: 'Patient conversation is unstructured', text: 'Important context can be scattered across language, memory, and the limited time available at registration.' }, { icon: FileText, title: 'Medical documents are fragmented', text: 'Reports, prescriptions, and discharge summaries often sit outside the physician’s immediate workspace.' }, { icon: Stethoscope, title: 'Physicians reconstruct the story', text: 'Clinicians spend valuable consultation time assembling a narrative before they can focus on the patient.' }].map(({ icon: Icon, title, text }) => <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#0F5132]"><Icon className="h-5 w-5" /></span><h3 className="mt-6 text-lg font-bold text-slate-800">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>

        <section id="workflow" className="bg-[#0F5132] px-5 py-20 text-white lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><SectionLabel>One connected workflow</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">From the first question to the consultation.</h2><p className="mt-5 text-base leading-7 text-emerald-100">A structured path for patient voice, clinical information, and physician review.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 md:grid-cols-3 lg:grid-cols-6">{workflow.map(({ number, title, text, icon: Icon }) => <div key={number} className="group min-h-[190px] bg-[#0F5132] p-5 transition hover:bg-[#0A3E29]"><div className="flex items-center justify-between"><span className="text-xs font-bold text-emerald-300">{number}</span><Icon className="h-4 w-4 text-emerald-200" /></div><h3 className="mt-12 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-emerald-100/70 transition group-hover:text-white">{text}</p></div>)}</div></div></section>

        <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><SectionLabel>Patient experience</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#0F5132] sm:text-5xl">Healthcare should begin with listening.</h2><p className="mt-5 max-w-lg leading-7 text-slate-600">The patient-facing experience is designed to feel simple, respectful, and familiar, even when the clinical information being gathered is complex.</p><div className="mt-8 space-y-4">{[{ icon: Mic2, title: 'Voice', text: 'Patients speak naturally, with guided prompts when they need them.' }, { icon: Fingerprint, title: 'Touch', text: 'Clear, accessible interactions support patients who prefer a visual flow.' }, { icon: Languages, title: 'Multilingual', text: 'Built for diverse Indian language contexts and real-world OPD environments.' }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0D9488]"><Icon className="h-5 w-5" /></span><div><h3 className="font-bold text-slate-800">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div>)}</div></div><div className="rounded-[28px] border border-slate-200 bg-[#eaf4f1] p-5 shadow-inner"><div className="mx-auto max-w-md rounded-[24px] border border-slate-200 bg-white p-4 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-[#0F5132]" /><span className="text-xs font-bold tracking-widest text-[#0F5132]">SANJEEVANI</span></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">VOICE ON</span></div><div className="py-8 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0F5132] text-white shadow-xl shadow-emerald-900/20"><Mic2 className="h-8 w-8" /></div><div className="mt-6 text-lg font-bold text-slate-800">Tell us what brings you in today.</div><p className="mt-2 text-sm text-slate-500">You can speak in the language that feels most comfortable.</p></div><div className="flex gap-2 border-t border-slate-100 pt-4"><div className="h-2 flex-1 rounded-full bg-[#0F5132]" /><div className="h-2 flex-1 rounded-full bg-emerald-100" /><div className="h-2 flex-1 rounded-full bg-emerald-100" /><div className="h-2 flex-1 rounded-full bg-emerald-100" /></div></div></div></div></section>

        <section id="physicians" className="border-t border-slate-200 bg-white px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><SectionLabel>Physician experience</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#0F5132] sm:text-5xl">Give physicians the clinical story, not another pile of data.</h2></div><div className="mt-12"><ProductWindow /></div></div></section>

        <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2"><article className="rounded-[28px] bg-[#0F5132] p-8 text-white lg:p-10"><SectionLabel>AI, with accountability</SectionLabel><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">AI that assists the physician. Not replaces them.</h2><p className="mt-5 max-w-lg leading-7 text-emerald-100">Sanjeevani helps summarize, structure, organize, and surface missing information. Every clinical brief remains a draft for physician verification.</p><div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">AI-generated draft</span><span className="rounded-full bg-amber-300/20 px-2 py-1 text-[10px] font-bold text-amber-200">Physician verification required</span></div><div className="mt-5 space-y-2"><div className="h-2 w-4/5 rounded-full bg-white/30" /><div className="h-2 w-3/5 rounded-full bg-white/15" /><div className="h-2 w-2/3 rounded-full bg-white/15" /></div></div></article><article className="rounded-[28px] border border-slate-200 bg-white p-8 lg:p-10"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0F5132]"><ShieldCheck className="h-6 w-6" /></div><h3 className="mt-7 text-2xl font-extrabold text-slate-800">The physician stays in control.</h3><div className="mt-6 space-y-4">{['Summarization and clinical structuring', 'Missing information surfaced for review', 'Timeline organization with source context', 'No autonomous diagnosis or prescribing'].map((item) => <div key={item} className="flex items-start gap-3 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />{item}</div>)}</div></article></div></section>

        <section id="hospitals" className="bg-[#f1f7f4] px-5 py-20 lg:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.2fr]"><div><SectionLabel>Built for India&apos;s clinical context</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#0F5132] sm:text-5xl">Structured care, including AYUSH context.</h2><p className="mt-5 max-w-lg leading-7 text-slate-600">AYUSH assessments are represented as structured clinical information, so they can sit alongside the broader patient story.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{['Prakriti', 'Vikriti', 'Agni', 'Koshtha', 'Ahara', 'Vihara'].map((item, index) => <div key={item} className="rounded-2xl border border-emerald-100 bg-white p-5"><div className="text-xs font-bold text-[#0D9488]">0{index + 1}</div><div className="mt-8 font-bold text-slate-800">{item}</div><div className="mt-1 text-xs text-slate-400">Structured assessment</div></div>)}</div></div></section>

        <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><SectionLabel>Context, not clutter</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#0F5132] sm:text-5xl">Bring the patient&apos;s clinical history into context.</h2><p className="mt-5 leading-7 text-slate-600">Authorized records can be brought into the physician workspace when appropriate consent and access are present.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{['Prescriptions', 'Lab Reports', 'Discharge Summaries', 'Diagnostic Reports', 'Clinical Timeline'].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5"><FileText className="h-5 w-5 text-[#0D9488]" /><div className="mt-8 text-sm font-bold text-slate-800">{item}</div><div className="mt-2 text-xs leading-5 text-slate-500">Consent-aware access</div></div>)}</div></div></section>

        <section className="border-y border-slate-200 bg-white px-5 py-16 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-5">{[{ icon: ShieldCheck, title: 'Consent-aware access' }, { icon: UserRound, title: 'Role-based access' }, { icon: ClipboardList, title: 'Audit trails' }, { icon: LockKeyhole, title: 'Protected documents' }, { icon: Stethoscope, title: 'Physician-controlled decisions' }].map(({ icon: Icon, title }) => <div key={title} className="flex items-center gap-3"><Icon className="h-5 w-5 text-[#0F5132]" /><span className="text-sm font-semibold text-slate-700">{title}</span></div>)}</div></section>

        <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-5xl rounded-[32px] bg-[#0F5132] px-6 py-14 text-center text-white shadow-2xl shadow-emerald-950/10 sm:px-12"><div className="mx-auto max-w-2xl"><SectionLabel>Next step</SectionLabel><h2 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Begin a better clinical intake experience.</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-emerald-100">Start with your story and move through a calm, structured patient experience.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#0F5132] transition hover:-translate-y-0.5">Start Patient Intake <ArrowRight className="h-4 w-4" /></Link><a href="#product" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Explore Sanjeevani</a></div></div></div></section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><Link to="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F5132] text-white"><HeartPulse className="h-4 w-4" /></span><span className="text-sm font-extrabold tracking-[0.16em] text-[#0F5132]">SANJEEVANI</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">AI-assisted patient case-taking and clinical intelligence for modern hospitals and AYUSH healthcare.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500"><a href="#product" className="hover:text-[#0F5132]">Product</a><Link to="/login" className="hover:text-[#0F5132]">Patient Intake</Link><a href="#hospitals" className="hover:text-[#0F5132]">Privacy</a><a href="#about" className="hover:text-[#0F5132]">Terms</a><a href="#about" className="hover:text-[#0F5132]">Contact</a></div></div><div className="mx-auto mt-8 max-w-7xl border-t border-slate-100 pt-5 text-xs text-slate-400">© 2026 Sanjeevani. Physician-in-the-loop clinical intelligence.</div></footer>
    </div>
  )
}
