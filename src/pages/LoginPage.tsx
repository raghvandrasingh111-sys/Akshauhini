import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, ClipboardList, Eye, EyeOff, HeartPulse, Loader2, LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react'
import { getCurrentDoctorProfile, signInDoctor, signOutDoctor, signUpDoctor } from '../services/supabase/authService'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('doctor@sanjeevani.demo')
  const [password, setPassword] = useState('demo123456')
  const [fullName, setFullName] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        setIsLoading(false)
        return
      }
      const { data, error: signUpError } = await signUpDoctor(email, password, fullName.trim())
      setIsLoading(false)
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      if (!data.session) {
        setMode('login')
        setError('Account created. Check your email to confirm the account, then log in.')
        return
      }
      if (import.meta.env.VITE_APP_MODE === 'development') {
        navigate('/doctor/dashboard')
        return
      }
      const profile = await getCurrentDoctorProfile(data.session)
      await signOutDoctor()
      setError(profile.error?.message ?? 'Account created. Your hospital administrator must activate your doctor profile before dashboard access.')
      return
    }

    const { data, error: signInError } = await signInDoctor(email, password)

    setIsLoading(false)

    if (signInError) {
      setError('Unable to sign in. Please verify your credentials and try again.')
      return
    }

    if (import.meta.env.VITE_APP_MODE !== 'development') {
      const profile = await getCurrentDoctorProfile(data.session)
      if (profile.error) {
        await signOutDoctor()
        setError(profile.error.message)
        return
      }
    }

    navigate('/doctor/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#0F5132] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-emerald-200/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"><HeartPulse className="h-5 w-5" /></span><span className="text-sm font-extrabold tracking-[0.18em]">SANJEEVANI</span></div>
        <div className="relative z-10 max-w-xl py-12"><div className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Physician workspace</div><h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] xl:text-6xl">Clinical intelligence, built around the physician.</h1><p className="mt-6 max-w-lg text-base leading-7 text-emerald-100">Access patient intake, authorized records, clinical timelines, and AI-assisted summaries from one focused workspace.</p><div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-bold"><Stethoscope className="h-4 w-4 text-emerald-200" /> DOCTOR PORTAL</div><span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[10px] font-semibold text-emerald-200">READY FOR REVIEW</span></div><div className="rounded-xl bg-white p-4 text-slate-800"><div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Patient workspace</div><div className="mt-1 text-sm font-bold">Clinical brief · consented records</div></div><BrainCircuit className="h-5 w-5 text-[#0D9488]" /></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-emerald-50 p-2"><div className="text-[9px] text-emerald-700">Intake</div><div className="mt-1 text-xs font-bold">Complete</div></div><div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] text-slate-400">Records</div><div className="mt-1 text-xs font-bold">Authorized</div></div><div className="rounded-lg bg-amber-50 p-2"><div className="text-[9px] text-amber-700">AI brief</div><div className="mt-1 text-xs font-bold">Verify</div></div></div></div></div><div className="mt-8 grid gap-3 text-sm text-emerald-50 sm:grid-cols-3"><div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-emerald-300" /> Physician-in-the-loop AI</div><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Consent-aware access</div><div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-emerald-300" /> Structured intake</div></div></div>
        <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-200"><LockKeyhole className="h-4 w-4" /> Secure access for authorized users.</div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between lg:justify-end"><Link to="/" className="flex items-center gap-2 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F5132] text-white"><HeartPulse className="h-4 w-4" /></span><span className="text-xs font-extrabold tracking-[0.16em] text-[#0F5132]">SANJEEVANI</span></Link><Link to="/" className="text-sm font-semibold text-slate-500 transition hover:text-[#0F5132]">Back to home</Link></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8"><div className="text-xs font-bold uppercase tracking-[0.17em] text-[#0D9488]">Authorized professionals only</div><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#0F5132]">{mode === 'login' ? 'Clinical Portal' : 'Create your account.'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Sign in to the Sanjeevani Clinical Portal.' : 'Set up Supabase access. Hospital approval is required for clinical access.'}</p></div>
          <form onSubmit={handleSubmit} className="space-y-5" aria-label={mode === 'login' ? 'Doctor login form' : 'Doctor account creation form'}>
            {mode === 'signup' && <div><label htmlFor="full-name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label><input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0F5132] focus:ring-4 focus:ring-emerald-900/10" placeholder="Dr. Priya Sharma" required /></div>}
            <div><label htmlFor="doctor-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="doctor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0F5132] focus:ring-4 focus:ring-emerald-900/10" placeholder="doctor@hospital.org" autoComplete="email" required /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="doctor-password" className="text-sm font-semibold text-slate-700">Password</label>{mode === 'login' && <button type="button" className="text-xs font-semibold text-[#0F5132] hover:underline" onClick={() => setError('Please contact your administrator to reset access.')}>Forgot password?</button>}</div><div className="relative"><input id="doctor-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0F5132] focus:ring-4 focus:ring-emerald-900/10" placeholder="Enter your password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">{error}</div>}
            <button type="submit" disabled={isLoading} className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#0A3E29] focus:outline-none focus:ring-4 focus:ring-emerald-900/15 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')} {!isLoading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}</button>
          </form>
          <div className="mt-7 text-center text-sm text-slate-500">{mode === 'login' ? 'Need a doctor account?' : 'Already have an account?'}{' '}<button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} className="font-bold text-[#0F5132] hover:underline">{mode === 'login' ? 'Create account' : 'Login'}</button></div>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure access for authorized users.</div>
        </div>
        <div className="flex justify-center gap-5 text-xs text-slate-400"><button type="button" className="hover:text-slate-600">Privacy Policy</button><button type="button" className="hover:text-slate-600">Terms of Use</button></div>
      </section>
    </div>
  )
}
