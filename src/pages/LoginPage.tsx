import { FormEvent, useState } from 'react'
import { HeartPulse, Loader2, ShieldCheck } from 'lucide-react'
import { getCurrentDoctorProfile, signInDoctor, signOutDoctor, signUpDoctor } from '../services/supabase/authService'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F5132] text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Secure access</div>
              <div className="text-xl font-semibold text-slate-900">SANJEEVANI</div>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight text-slate-900">{mode === 'login' ? 'Doctor Portal Login' : 'Create Doctor Account'}</div>
          <p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Sign in to access the clinical dashboard and patient workflows.' : 'Create your secure Supabase account. Hospital approval is required for clinical access.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0F5132] focus:bg-white"
              placeholder="Dr. Priya Sharma"
              required
            />
          </div>}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0F5132] focus:bg-white"
              placeholder="doctor@hospital.org"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0F5132] focus:bg-white"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-4 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Login to Dashboard' : 'Create Account')}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          {mode === 'login' ? 'Need a doctor account?' : 'Already have an account?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} className="font-semibold text-[#0F5132]">
            {mode === 'login' ? 'Create account' : 'Login'}
          </button>
        </div>

      </div>
    </div>
  )
}
