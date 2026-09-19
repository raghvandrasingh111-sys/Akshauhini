import { FormEvent, useEffect, useState } from 'react'
import { ArrowUpRight, Check, FileImage, FileText, Fingerprint, HeartPulse, LockKeyhole, LogOut, ShieldCheck, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePatientAuth } from '../context/PatientAuthContext'
import { isValidPatientPhone, registerGooglePatient, signInPatientWithGoogle, signInPatient, signUpPatient } from '../services/supabase/patientAuthService'
import { getPatientConsentRequests, getPatientDocuments, respondToPatientConsent, uploadPatientDocument } from '../services/supabase/patientPortalService'
import type { ConsentRequest, MedicalDocument } from '../types/database'
import { abhaSdkService, type AbhaAuthMethod } from '../services/abhaSdkService'

export function PatientPortalPage() {
  const { session, patient, loading } = usePatientAuth()
  if (loading) return <CenteredMessage text="Securing your patient portal..." />
  return session && patient ? <PatientDashboard /> : <PatientLogin />
}

function PatientLogin() {
  const { session } = usePatientAuth()
  if (session) return <PatientProfileSetup />
  return <GooglePatientLogin />
}

function GooglePatientLogin() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const login = async () => {
    setBusy(true)
    const result = await signInPatientWithGoogle()
    if (result.error) { setError(result.error.message); setBusy(false) }
  }
  return <main className="min-h-screen bg-[#EAF4F0] px-4 py-10 text-slate-900"><div className="mx-auto max-w-md"><div className="mb-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F5132] text-white shadow-lg"><HeartPulse /></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Sanjeevani patient space</p><h1 className="mt-2 text-3xl font-black">Your health, your control.</h1><p className="mt-2 text-sm text-slate-500">Sign in once with Google. Your Aadhaar becomes your private Patient ID.</p></div><section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-teal-900/10"><div className="flex items-center gap-3 rounded-2xl bg-teal-50 p-4"><ShieldCheck className="h-6 w-6 text-teal-700" /><p className="text-sm font-semibold text-teal-900">Secure Google account, private clinical records, patient-controlled approval.</p></div>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button onClick={() => void login()} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#0F5132] px-4 py-4 font-bold text-white disabled:opacity-50"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-[#0F5132]">G</span>{busy ? 'Opening Google...' : 'Continue with Google'}</button><button onClick={() => navigate('/')} className="mt-6 w-full text-sm text-slate-500">Back to kiosk</button></section></div></main>
}

function PatientProfileSetup() {
  const { session } = usePatientAuth()
  const [fullName, setFullName] = useState(String(session?.user.user_metadata?.full_name ?? ''))
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [aadhaar, setAadhaar] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!/^\d{12}$/.test(aadhaar)) return setError('Enter a valid 12-digit Aadhaar number.')
    if (!isValidPatientPhone(phone)) return setError('Enter a valid 10-digit phone number.')
    if (!fullName.trim() || !age || Number(age) < 1 || Number(age) > 120) return setError('Enter your name and a valid age.')
    setBusy(true)
    try { await registerGooglePatient({ aadhaarNumber: aadhaar, fullName: fullName.trim(), age: Number(age), gender, phone, email: session?.user.email ?? '' }); window.location.reload() }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not save your patient profile.'); setBusy(false) }
  }
  return <main className="min-h-screen bg-[#EAF4F0] px-4 py-10 text-slate-900"><div className="mx-auto max-w-lg"><section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-teal-900/10"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">One-time setup</p><h1 className="mt-2 text-3xl font-black">Complete your patient profile</h1><p className="mt-2 text-sm text-slate-500">Signed in as {session?.user.email}. Aadhaar is used only as your unique Patient ID.</p></div><form onSubmit={save} className="space-y-4"><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Full name<input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-teal-600" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Aadhaar number<input value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" placeholder="12-digit Aadhaar" className="mt-2 w-full rounded-xl border-2 border-teal-200 px-4 py-3 font-mono outline-none focus:border-teal-600" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Age<input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-teal-600" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Sex<select value={gender} onChange={e => setGender(e.target.value as typeof gender)} className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Phone number<input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="10-digit mobile" className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-teal-600" /></label>{error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#0F5132] px-4 py-4 font-bold text-white disabled:opacity-50">{busy ? 'Saving securely...' : 'Create my Patient ID'}</button></form></section></div></main>
}

export function LegacyPatientLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [showAbha, setShowAbha] = useState(false)
  const [abhaId, setAbhaId] = useState('')
  const [abhaMethod, setAbhaMethod] = useState<AbhaAuthMethod>('MOBILE_OTP')
  const [abhaTxn, setAbhaTxn] = useState<string | null>(null)
  const [abhaOtp, setAbhaOtp] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!isValidPatientPhone(phone)) return setError('Enter a valid 10-digit Indian mobile number.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.')
    setBusy(true)
    const result = mode === 'login' ? await signInPatient(phone, password) : await signUpPatient(phone, password)
    setBusy(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Confirm the phone OTP, then sign in to continue.')
    } else if (mode === 'signup') {
      setMessage('Account secured. Complete your patient profile from the kiosk to link it.')
    }
  }

  const startAbhaLogin = async () => {
    if (!abhaId.trim()) return setError('Enter your ABHA number or ABHA address.')
    setBusy(true)
    setError('')
    try {
      const result = await abhaSdkService.authInit({ authMethod: abhaMethod, healthid: abhaId.trim() })
      setAbhaTxn(result.txnId)
      setMessage('OTP sent. Enter it below to verify your ABHA identity.')
    } catch (abhaError) {
      setError(abhaError instanceof Error ? abhaError.message : 'ABHA verification could not start.')
    } finally {
      setBusy(false)
    }
  }

  const confirmAbhaLogin = async () => {
    if (!abhaTxn || abhaOtp.length < 6) return
    setBusy(true)
    setError('')
    try {
      const result = await abhaSdkService.confirmOtp({ txnId: abhaTxn, otp: abhaOtp }, abhaMethod)
      const profile = await abhaSdkService.getAccountProfile(result.token)
      setMessage(`ABHA verified for ${profile.name}. Continue with your password account to securely open the dashboard.`)
      setShowAbha(false)
      setAbhaTxn(null)
      setPhone(profile.mobile ?? phone)
      setMode('login')
    } catch (abhaError) {
      setError(abhaError instanceof Error ? abhaError.message : 'Invalid ABHA OTP.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-[#EAF4F0] px-4 py-8 text-slate-900 md:py-14">
    <div className="mx-auto max-w-md">
      <div className="mb-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F5132] text-white shadow-lg"><HeartPulse className="h-7 w-7" /></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Sanjeevani patient space</p><h1 className="mt-2 text-3xl font-black tracking-tight">Your health, your control.</h1><p className="mt-2 text-sm text-slate-500">Sign in securely to manage records and approvals.</p></div>
      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-teal-900/10 md:p-7">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"><button onClick={() => { setMode('login'); setError(''); setMessage('') }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Sign in</button><button onClick={() => { setMode('signup'); setError(''); setMessage('') }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'signup' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Sign up</button></div>
        <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mobile number<input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="9876543210" className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 outline-none transition focus:border-teal-600" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 outline-none transition focus:border-teal-600" /></label>{mode === 'signup' && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Confirm password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3.5 outline-none transition focus:border-teal-600" /></label>}{error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#0F5132] px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-900/15 disabled:opacity-50">{busy ? 'Please wait...' : mode === 'login' ? 'Sign in securely' : 'Create secure account'}</button></form>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        <button onClick={() => { setShowAbha(!showAbha); setError('') }} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 px-4 py-3.5 font-bold text-teal-800 transition hover:bg-teal-100"><Fingerprint className="h-5 w-5" />Fast login with ABHA</button>
        {showAbha && <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-4"><p className="text-sm font-bold text-slate-900">Verify your ABHA identity</p><p className="mt-1 text-xs text-slate-500">ABHA verification is fast; your password still protects the portal.</p><div className="mt-3 flex gap-2"><input value={abhaId} onChange={e => setAbhaId(e.target.value)} placeholder="ABHA number or address" className="min-w-0 flex-1 rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm" /><select value={abhaMethod} onChange={e => setAbhaMethod(e.target.value as AbhaAuthMethod)} className="rounded-xl border border-teal-200 bg-white px-2 text-xs"><option value="MOBILE_OTP">Mobile OTP</option><option value="AADHAAR_OTP">Aadhaar OTP</option></select></div>{abhaTxn && <input value={abhaOtp} onChange={e => setAbhaOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" className="mt-3 w-full rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm" />}{abhaTxn ? <button onClick={() => void confirmAbhaLogin()} disabled={busy || abhaOtp.length < 6} className="mt-3 w-full rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Verifying...' : 'Confirm ABHA OTP'}</button> : <button onClick={() => void startAbhaLogin()} disabled={busy} className="mt-3 w-full rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50">Send ABHA OTP</button>}</div>}
        <button onClick={() => navigate('/')} className="mt-6 w-full text-sm text-slate-500 hover:text-slate-900">Back to kiosk</button>
      </section>
      <p className="mt-5 text-center text-xs text-slate-500"><LockKeyhole className="mr-1 inline h-3.5 w-3.5" /> Password protected · Consent first · Private records</p>
    </div></main>
}

function PatientDashboard() {
  const { patient, signOut } = usePatientAuth()
  const [section, setSection] = useState<'overview' | 'documents' | 'approvals'>('overview')
  const [documents, setDocuments] = useState<MedicalDocument[]>([])
  const [requests, setRequests] = useState<ConsentRequest[]>([])
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<MedicalDocument['document_type']>('lab_report')

  useEffect(() => {
    if (!patient?.databaseId) return
    Promise.all([getPatientDocuments(patient.databaseId), getPatientConsentRequests(patient.databaseId)])
      .then(([docs, consentRequests]) => { setDocuments(docs); setRequests(consentRequests) })
      .catch(error => setMessage(error instanceof Error ? error.message : 'Unable to load portal data'))
      .finally(() => setBusy(false))
  }, [patient?.databaseId])

  if (!patient?.databaseId) return <CenteredMessage text="Your patient profile is not linked yet. Complete registration at the kiosk first." />

  const upload = async () => {
    if (!selectedFile || !patient.hospitalId || !patient.databaseId) { setMessage('Your hospital link is missing. Please contact the clinic desk.'); return }
    try {
      const doc = await uploadPatientDocument({ file: selectedFile, hospitalId: patient.hospitalId, patientId: patient.databaseId, documentType })
      setDocuments(current => [doc, ...current]); setSelectedFile(null); setMessage('Document uploaded securely.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed') }
  }

  const respond = async (requestId: string, status: 'granted' | 'denied') => {
    try {
      const updated = await respondToPatientConsent(requestId, status)
      setRequests(current => current.map(request => request.id === requestId ? updated : request))
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update approval') }
  }

  return <main className="min-h-screen bg-[#F3F8F6] text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#0F5132] p-2 text-white"><HeartPulse className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Sanjeevani patient space</p><h1 className="text-xl font-black">Good to see you, {patient.name.split(' ')[0]}</h1></div></div><button onClick={() => void signOut()} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><LogOut className="h-4 w-4" /> Sign out</button></div></header>
    <div className="mx-auto max-w-7xl p-6 md:p-8"><section className="relative overflow-hidden rounded-[2rem] bg-[#0B2924] p-8 text-white shadow-xl md:p-10"><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" /><div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-300">Private health command center</p><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight md:text-6xl">You decide who gets to see your story.</h2><p className="mt-4 max-w-xl text-teal-100/70">Upload records once, keep them organized, and approve every clinical access request with a clear purpose.</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"><p className="text-xs uppercase tracking-wider text-teal-200">Patient ID</p><p className="mt-2 font-mono text-2xl font-bold">{patient.patientId}</p><p className="mt-2 text-xs text-teal-100/60">Share only with trusted care teams</p></div></div></section>
      <nav className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">{([['overview','Overview'],['documents','My documents'],['approvals',`Approvals ${requests.filter(r => r.status === 'pending').length ? `(${requests.filter(r => r.status === 'pending').length})` : ''}`]] as const).map(([key, label]) => <button key={key} onClick={() => setSection(key)} className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold ${section === key ? 'bg-[#0F5132] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>)}</nav>
      {message && <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">{message}</div>}
      {busy ? <div className="py-16 text-center text-slate-500">Loading your private space...</div> : section === 'overview' ? <Overview documents={documents} requests={requests} onSection={setSection} /> : section === 'documents' ? <Documents documents={documents} selectedFile={selectedFile} setSelectedFile={setSelectedFile} documentType={documentType} setDocumentType={setDocumentType} upload={upload} /> : <Approvals requests={requests} respond={respond} />}
    </div></main>
}

function Overview({ documents, requests, onSection }: { documents: MedicalDocument[]; requests: ConsentRequest[]; onSection: (section: 'documents' | 'approvals') => void }) { return <div className="mt-6 grid gap-5 md:grid-cols-3"><PortalCard icon={<FileText />} title="Your documents" value={String(documents.length)} text="Private reports and prescriptions" action="Open documents" onClick={() => onSection('documents')} /><PortalCard icon={<ShieldCheck />} title="Permission center" value={String(requests.filter(r => r.status === 'pending').length)} text="Requests waiting for your decision" action="Review approvals" onClick={() => onSection('approvals')} /><PortalCard icon={<LockKeyhole />} title="Security" value="ON" text="Password-protected Supabase account" action="Protected by design" /></div> }
function PortalCard({ icon, title, value, text, action, onClick }: { icon: JSX.Element; title: string; value: string; text: string; action: string; onClick?: () => void }) { return <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between text-teal-700"><span className="rounded-xl bg-teal-50 p-3">{icon}</span><ArrowUpRight className="h-5 w-5 text-slate-300" /></div><p className="mt-6 text-sm font-bold text-slate-500">{title}</p><p className="mt-1 text-4xl font-black">{value}</p><p className="mt-2 text-sm text-slate-500">{text}</p>{onClick ? <button onClick={onClick} className="mt-6 text-sm font-bold text-teal-700">{action} →</button> : <p className="mt-6 text-sm font-bold text-emerald-600">{action}</p>}</article> }
function Documents({ documents, selectedFile, setSelectedFile, documentType, setDocumentType, upload }: { documents: MedicalDocument[]; selectedFile: File | null; setSelectedFile: (file: File | null) => void; documentType: MedicalDocument['document_type']; setDocumentType: (type: MedicalDocument['document_type']) => void; upload: () => void }) { return <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-3xl border-2 border-dashed border-teal-300 bg-white p-8"><UploadCloud className="h-10 w-10 text-teal-700" /><h2 className="mt-5 text-2xl font-black">Add a health record</h2><p className="mt-2 text-sm text-slate-500">PDF, PNG, JPG up to your clinic storage limit.</p><input type="file" accept="application/pdf,image/png,image/jpeg" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} className="mt-6 block w-full text-sm" /><select value={documentType} onChange={e => setDocumentType(e.target.value as MedicalDocument['document_type'])} className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="lab_report">Lab report</option><option value="prescription">Prescription</option><option value="discharge_summary">Discharge summary</option><option value="other">Other</option></select><button onClick={upload} disabled={!selectedFile} className="mt-5 w-full rounded-xl bg-[#0F5132] px-4 py-3 font-bold text-white disabled:opacity-40">Upload securely</button></div><div className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Record library</h2><div className="mt-5 space-y-3">{documents.length ? documents.map(doc => <div key={doc.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-white p-2 text-teal-700">{doc.file_name.endsWith('.pdf') ? <FileText /> : <FileImage />}</span><div><p className="font-bold">{doc.file_name}</p><p className="text-xs capitalize text-slate-500">{doc.document_type.replace('_', ' ')} · {new Date(doc.created_at).toLocaleDateString()}</p></div></div><Check className="h-5 w-5 text-emerald-600" /></div>) : <p className="py-12 text-center text-sm text-slate-400">Your secure library is ready for its first document.</p>}</div></div></section> }
function Approvals({ requests, respond }: { requests: ConsentRequest[]; respond: (id: string, status: 'granted' | 'denied') => void }) { return <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-black">Who wants access?</h2><p className="mt-2 text-sm text-slate-500">Review the doctor, hospital, purpose, and requested data before deciding.</p><div className="mt-6 space-y-4">{requests.length ? requests.map(request => <article key={request.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-lg font-black">{request.purpose}</p><p className="mt-1 text-sm text-slate-500">Requested {new Date(request.requested_at).toLocaleString()}</p><div className="mt-3 flex flex-wrap gap-2">{request.requested_data_types.map(type => <span key={type} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{type.replace(/_/g, ' ')}</span>)}</div></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${request.status === 'pending' ? 'bg-amber-50 text-amber-700' : request.status === 'granted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{request.status}</span></div>{request.status === 'pending' && <div className="mt-5 flex gap-3"><button onClick={() => respond(request.id, 'granted')} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">Approve access</button><button onClick={() => respond(request.id, 'denied')} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700">Deny</button></div>}</article>) : <p className="py-16 text-center text-sm text-slate-400">No doctor access requests right now.</p>}</div></section> }
function CenteredMessage({ text }: { text: string }) { return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-600">{text}</div> }
