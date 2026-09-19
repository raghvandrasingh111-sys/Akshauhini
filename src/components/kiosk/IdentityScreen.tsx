import { useState, useEffect } from 'react'
import {
  UserCheck,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Fingerprint,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings,
  X,
  ExternalLink,
  Search,
  UserRoundPlus,
  KeyRound,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  abhaSdkService,
  normalizeAbhaGender,
  calculateAgeFromDob,
  type AbhaAuthMethod,
  type AbhaAccountProfile,
} from '../../services/abhaSdkService'
import { t } from '../../i18n'
import {
  getAccessRequests,
  getPatientByPhone,
  isValidPhone,
  registerOrLoginPatient,
  respondToAccessRequest,
  type PatientRegistryRecord,
} from '../../services/patientRegistryService'
import type { DoctorAccessRequest } from '../../types'
import { linkPatientAccount, signInPatient, signUpPatient } from '../../services/supabase/patientAuthService'

export function IdentityScreen() {
  const { language, setIdentity, setStep } = useApp()
  const isHi = language === 'hi'

  // Input & Form State
  const [tab, setTab] = useState<'abha' | 'manual'>('manual')
  const [abhaInput, setAbhaInput] = useState('')
  const [authMethod, setAuthMethod] = useState<AbhaAuthMethod>('AADHAAR_OTP')
  
  // Verification States
  const [loading, setLoading] = useState(false)
  const [txnId, setTxnId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpTimer, setOtpTimer] = useState(60)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [verifiedProfile, setVerifiedProfile] = useState<AbhaAccountProfile | null>(null)

  // Manual Form States (auto-filled upon ABHA verification)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [patientRecord, setPatientRecord] = useState<PatientRegistryRecord | null>(null)
  const [accessRequests, setAccessRequests] = useState<DoctorAccessRequest[]>([])
  const [phoneError, setPhoneError] = useState('')
  const [accountMode, setAccountMode] = useState<'signup' | 'login'>('signup')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Sandbox / Live settings modal
  const [showConfig, setShowConfig] = useState(false)
  const [useSimulation, setUseSimulation] = useState(abhaSdkService.getConfig().useSimulation)
  const [customHost, setCustomHost] = useState(abhaSdkService.getConfig().baseUrl)

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (txnId && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [txnId, otpTimer])

  // Save SDK Config
  const handleSaveConfig = () => {
    abhaSdkService.setConfig({
      useSimulation,
      baseUrl: customHost.trim(),
    })
    setShowConfig(false)
  }

  const findExistingPatient = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number.')
      return
    }
    const existing = await getPatientByPhone(phone)
    setPatientRecord(existing)
    setAccessRequests(getAccessRequests(existing?.patientId ?? phone))
    setPhoneError(existing ? '' : 'No patient found. Complete the form to create a new Patient ID.')
    if (existing) {
      setName(existing.name)
      setAge(String(existing.age))
      setGender(existing.gender)
      setAddress(existing.address ?? '')
    }
  }

  const respondToRequest = (requestId: string, status: 'approved' | 'denied') => {
    respondToAccessRequest(requestId, status)
    setAccessRequests((requests) => requests.map((request) => request.id === requestId
      ? { ...request, status, respondedAt: new Date().toISOString() }
      : request))
  }

  // Quick Preset Selector for Hackathon Judges
  const selectPreset = (id: string) => {
    setAbhaInput(id)
    setOtpError(null)
  }

  // Step 1: Initiate ABDM ABHA Verification
  const handleInitiateVerification = async (targetId?: string) => {
    const healthid = (targetId || abhaInput).trim()
    if (!healthid) return

    setLoading(true)
    setOtpError(null)

    try {
      const res = await abhaSdkService.authInit({
        authMethod,
        healthid,
      })
      setTxnId(res.txnId)
      setOtpTimer(60)
      setOtp('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ABHA verification initiation failed.'
      setOtpError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Confirm OTP
  const handleConfirmOtp = async () => {
    if (!txnId || !otp.trim()) return

    setLoading(true)
    setOtpError(null)

    try {
      const confirmRes = await abhaSdkService.confirmOtp(
        {
          txnId,
          otp: otp.trim(),
        },
        authMethod
      )

      // Step 3: Fetch Profile using authenticated Token
      const profile = await abhaSdkService.getAccountProfile(confirmRes.token)
      setVerifiedProfile(profile)

      // Auto-populate demographic fields
      setName(profile.name)
      const calculatedAge = calculateAgeFromDob(profile.yearOfBirth, profile.monthOfBirth, profile.dayOfBirth)
      setAge(calculatedAge.toString())
      setGender(normalizeAbhaGender(profile.gender))
      if (profile.mobile) setPhone(profile.mobile)
      if (profile.address) {
        const fullAddr = [profile.address, profile.districtName, profile.stateName, profile.pincode]
          .filter(Boolean)
          .join(', ')
        setAddress(fullAddr)
      }

      setTxnId(null) // Close OTP modal
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
      setOtpError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!txnId) return
    setLoading(true)
    setOtpError(null)
    try {
      await abhaSdkService.resendAuthOtp({
        authMethod,
        txnId,
      })
      setOtpTimer(60)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend OTP.'
      setOtpError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Final Continue to Consent Screen
  const handleContinue = async () => {
    if (!name || !age || !isValidPhone(phone)) {
      setPhoneError('A valid phone number is required to create your Patient ID.')
      return
    }
    if (password.length < 8) {
      setPhoneError('Create a password with at least 8 characters.')
      return
    }
    if (accountMode === 'signup' && password !== confirmPassword) {
      setPhoneError('Passwords do not match.')
      return
    }

    try {
      const authResult = accountMode === 'signup'
        ? await signUpPatient(phone, password)
        : await signInPatient(phone, password)
      if (authResult.error) throw authResult.error
      if (!authResult.data.session) {
        throw new Error('Confirm the phone OTP sent by Supabase, then sign in again.')
      }
      const patient = await registerOrLoginPatient({
        phone,
        name,
        age: parseInt(age, 10),
        gender,
        address: address || undefined,
        abhaNumber: verifiedProfile?.healthIdNumber,
        abhaAddress: verifiedProfile?.healthId,
      })
      await linkPatientAccount(authResult.data.session, patient.patientId)

      setIdentity({
        patientId: patient.patientId,
        abhaId: verifiedProfile?.healthIdNumber || verifiedProfile?.healthId || abhaInput || undefined,
        abhaNumber: verifiedProfile?.healthIdNumber,
        abhaAddress: verifiedProfile?.healthId,
        name,
        age: parseInt(age, 10),
        gender,
        phone: phone || undefined,
        address: address || undefined,
        district: verifiedProfile?.districtName,
        state: verifiedProfile?.stateName,
        pincode: verifiedProfile?.pincode,
        profilePhoto: verifiedProfile?.profilePhoto,
        qrCode: verifiedProfile?.qrCode,
        isAbhaVerified: Boolean(verifiedProfile),
        verificationMethod: verifiedProfile
          ? authMethod === 'AADHAAR_OTP'
            ? 'aadhaar_otp'
            : 'mobile_otp'
          : 'manual',
        verificationTimestamp: verifiedProfile ? new Date().toISOString() : undefined,
      })

      setStep('consent')
    } catch (error) {
      setPhoneError(error instanceof Error ? error.message : 'Unable to save patient registration.')
    }
  }

  // Fast 1-click Demo Mode for Judges
  const handleJudgeFastDemo = async (presetId: string = '91-1234-5678-9012') => {
    setLoading(true)
    try {
      const res = await abhaSdkService.authInit({
        authMethod: 'AADHAAR_OTP',
        healthid: presetId,
      })
      const confirmRes = await abhaSdkService.confirmOtp(
        {
          txnId: res.txnId,
          otp: '123456',
        },
        'AADHAAR_OTP'
      )
      const profile = await abhaSdkService.getAccountProfile(confirmRes.token)
      setVerifiedProfile(profile)
      setName(profile.name)
      setAge(calculateAgeFromDob(profile.yearOfBirth).toString())
      setGender(normalizeAbhaGender(profile.gender))
      setPhone(profile.mobile || '9829012345')
      setAddress(`${profile.address || ''}, ${profile.districtName || ''}, ${profile.stateName || ''}`)
    } catch {
      // Fallback
      setName('Ramesh Kumar Sharma')
      setAge('45')
      setGender('male')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto kiosk-card animate-slide-up relative">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-medikiosk-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-medikiosk-primary">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
            {tab === 'abha' && (
              <div className="mb-6 rounded-2xl border-2 border-teal-200 bg-teal-50/60 p-5 space-y-3">
                <p className="text-sm font-bold text-slate-900">Protect this patient account</p>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-1">
                  <button type="button" onClick={() => setAccountMode('signup')} className={`rounded-lg py-2 text-xs font-bold ${accountMode === 'signup' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Create account</button>
                  <button type="button" onClick={() => setAccountMode('login')} className={`rounded-lg py-2 text-xs font-bold ${accountMode === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Existing patient login</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-xl border-2 border-teal-200 bg-white px-4 py-3 text-sm focus:border-teal-600 focus:outline-none" />
                  {accountMode === 'signup' && <input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="w-full rounded-xl border-2 border-teal-200 bg-white px-4 py-3 text-sm focus:border-teal-600 focus:outline-none" />}
                </div>
              </div>
            )}

                {t(language, 'identity.title')}
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ABDM ABHA Network Integrated · Technoculture SDK</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(true)}
            title="Configure ABDM Gateway / Simulator"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: ABDM ABHA vs Manual */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => setTab('abha')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              tab === 'abha'
                ? 'bg-white text-medikiosk-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-medikiosk-primary" />
            {t(language, 'identity.abhaTab')}
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              tab === 'manual'
                ? 'bg-white text-medikiosk-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <><UserRoundPlus className="w-4 h-4" /> {t(language, 'identity.phoneLogin')}</>
          </button>
        </div>

        {tab === 'manual' && (
          <div className="mb-6 p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/60 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-600 text-white">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t(language, 'identity.phoneLogin')}</h3>
                <p className="text-xs text-slate-600 mt-1">{t(language, 'identity.newPatientHint')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                  setPhoneError('')
                }}
                placeholder="10-digit mobile number"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-teal-300 focus:border-teal-600 focus:outline-none text-base"
              />
              <button
                type="button"
                onClick={findExistingPatient}
                className="px-4 rounded-xl bg-white border-2 border-teal-600 text-teal-800 font-semibold flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t(language, 'identity.findPatient')}
              </button>
            </div>
            {phoneError && <p className="text-xs text-rose-600 font-medium">{phoneError}</p>}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setAccountMode('signup')} className={`rounded-lg py-2 text-xs font-bold ${accountMode === 'signup' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Create account</button>
              <button type="button" onClick={() => setAccountMode('login')} className={`rounded-lg py-2 text-xs font-bold ${accountMode === 'login' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'}`}>Existing patient login</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-xl border-2 border-teal-200 bg-white px-4 py-3 text-sm focus:border-teal-600 focus:outline-none" />
              {accountMode === 'signup' && <input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="w-full rounded-xl border-2 border-teal-200 bg-white px-4 py-3 text-sm focus:border-teal-600 focus:outline-none" />}
            </div>
            {patientRecord && (
              <div className="p-3 rounded-xl bg-white border border-emerald-200 text-sm">
                <p className="font-semibold text-emerald-800">Existing patient found: {patientRecord.name}</p>
                <p className="text-xs text-slate-600 mt-1">{t(language, 'identity.patientId')}: <span className="font-mono font-bold">{patientRecord.patientId}</span></p>
              </div>
            )}
            {accessRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Doctor access requests</p>
                {accessRequests.map((request) => (
                  <div key={request.id} className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">{request.doctorName} · {request.facility}</p>
                      <p className="text-slate-600 mt-0.5">{request.purpose}</p>
                      <p className="text-slate-500 mt-1 capitalize">Status: {request.status}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => respondToRequest(request.id, 'approved')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">Approve</button>
                        <button type="button" onClick={() => respondToRequest(request.id, 'denied')} className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 text-xs font-bold">Deny</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ABDM ABHA VERIFICATION */}
        {tab === 'abha' && (
          <div className="space-y-6">
            {!verifiedProfile ? (
              <div className="space-y-5 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 p-5 rounded-2xl border-2 border-teal-200/80">
                {/* Info Bar */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-600 text-white mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {isHi ? 'ABHA आईडी या आधार से तुरंत सत्यापन' : 'Instant Verification via ABDM ABHA'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isHi
                        ? '14 अंकों का ABHA नंबर या ABHA पता दर्ज करें। जनसांख्यिकी डेटा स्वतः भर जाएगा।'
                        : 'Enter 14-digit ABHA Number (91-XXXX-XXXX-XXXX) or ABHA Address. Demographics auto-sync seamlessly.'}
                    </p>
                  </div>
                </div>

                {/* ABHA Input Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {isHi ? 'ABHA नंबर / ABHA पता / 12-अंक आधार' : 'ABHA Number / ABHA Address / 12-Digit Aadhaar'} *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                    <input
                      type="text"
                      value={abhaInput}
                      onChange={(e) => setAbhaInput(e.target.value)}
                      placeholder="e.g. 91-1234-5678-9012 or ramesh.sharma@abdm"
                      className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border-2 border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none text-base font-mono tracking-wide"
                    />
                  </div>
                </div>

                {/* Quick Presets for Demo */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {isHi ? 'डेमो प्रोफाइल चुनें:' : 'Quick Judge Presets:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectPreset('91-1234-5678-9012')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 transition-colors shadow-2xs"
                  >
                    Ramesh Sharma (91-1234...)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPreset('91-9876-5432-1098')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 transition-colors shadow-2xs"
                  >
                    Anita Patel (91-9876...)
                  </button>
                </div>

                {/* Authentication Method Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {isHi ? 'सत्यापन विधि (Auth Method)' : 'Verification Method (Auth Method)'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('AADHAAR_OTP')}
                      className={`p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                        authMethod === 'AADHAAR_OTP'
                          ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                      }`}
                    >
                      <Fingerprint
                        className={`w-6 h-6 ${
                          authMethod === 'AADHAAR_OTP' ? 'text-teal-600' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">Aadhaar OTP</div>
                        <div className="text-[11px] text-slate-500">{isHi ? 'UIDAI लिंक मोबाइल' : 'UIDAI linked mobile'}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthMethod('MOBILE_OTP')}
                      className={`p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                        authMethod === 'MOBILE_OTP'
                          ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                      }`}
                    >
                      <Smartphone
                        className={`w-6 h-6 ${
                          authMethod === 'MOBILE_OTP' ? 'text-teal-600' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">ABHA Mobile OTP</div>
                        <div className="text-[11px] text-slate-500">{isHi ? 'पंजीकृत मोबाइल' : 'ABHA registered phone'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Trigger OTP Action */}
                <button
                  type="button"
                  onClick={() => handleInitiateVerification()}
                  disabled={!abhaInput.trim() || loading}
                  className="kiosk-btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 disabled:opacity-50"
                >
                  {loading ? (
                    <RotateCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  {isHi ? 'सत्यापन शुरू करें (Generate OTP)' : 'Verify with ABDM (Generate OTP)'}
                </button>
              </div>
            ) : (
              /* Verified ABHA Digital Health Card Preview */
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 shadow-xl border border-teal-500/30">
                  {/* Watermark / Badge */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold text-sm">
                        आ
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-teal-300 font-semibold">
                          Government of India · ABDM
                        </div>
                        <div className="text-sm font-bold tracking-tight">Ayushman Bharat Health Account</div>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      KYC VERIFIED
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Patient Name
                        </span>
                        <div className="text-xl font-bold text-white tracking-wide">{verifiedProfile.name}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400">ABHA Number: </span>
                          <span className="font-mono font-bold text-teal-200">
                            {verifiedProfile.healthIdNumber || '91-1234-5678-9012'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">ABHA Address: </span>
                          <span className="font-mono text-white">{verifiedProfile.healthId || 'patient@abdm'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400">Gender: </span>
                          <span className="font-medium capitalize">{normalizeAbhaGender(verifiedProfile.gender)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Year of Birth: </span>
                          <span className="font-medium">{verifiedProfile.yearOfBirth}</span>
                        </div>
                        {verifiedProfile.districtName && (
                          <div>
                            <span className="text-slate-400">Location: </span>
                            <span className="font-medium">
                              {verifiedProfile.districtName}, {verifiedProfile.stateName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Code Preview */}
                    <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-md">
                      <div
                        className="w-20 h-20"
                        dangerouslySetInnerHTML={{ __html: verifiedProfile.qrCode || '' }}
                      />
                      <span className="text-[9px] font-bold text-slate-700 mt-1 uppercase tracking-tighter">
                        Scan at OPD
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>DPDP Act 2023 Compliant · HIU-HIP Token Linked</span>
                    <button
                      type="button"
                      onClick={() => setVerifiedProfile(null)}
                      className="text-teal-300 hover:text-white underline"
                    >
                      {isHi ? 'अलग ABHA से सत्यापित करें' : 'Change / Verify Another'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    {isHi
                      ? 'रोगी का जनसांख्यिकी डेटा ABDM सर्वर से सफलतापूर्वक सत्यापित और लिंक कर दिया गया है। नीचे दिए गए विवरण की पुष्टि करें और जारी रखें।'
                      : 'Patient demographic details successfully verified against the official ABDM Registry. Confirm the auto-filled details below to proceed.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEMOGRAPHIC DETAILS FORM (Auto-filled on verification or manual) */}
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              {t(language, 'identity.patientInfo')}
            </h3>
            {verifiedProfile && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ABDM Auto-filled
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t(language, 'identity.fullName')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Sharma"
              className="w-full px-4 py-3 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t(language, 'identity.age')} *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
                placeholder="45"
                className="w-full px-4 py-3 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t(language, 'identity.gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="w-full px-4 py-3 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-base bg-white"
              >
                <option value="male">{t(language, 'identity.male')}</option>
                <option value="female">{t(language, 'identity.female')}</option>
                <option value="other">{t(language, 'identity.other')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t(language, 'identity.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9829012345"
                className="w-full px-4 py-3 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-base"
              />
              {tab === 'manual' && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">{t(language, 'identity.newPatientHint')}</p>
                  <button
                    type="button"
                    onClick={findExistingPatient}
                    className="text-xs font-semibold text-teal-700 hover:underline whitespace-nowrap"
                  >
                    <Search className="w-3.5 h-3.5 inline mr-1" />{t(language, 'identity.findPatient')}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isHi ? 'पता / शहर (वैकल्पिक)' : 'Address / District (Optional)'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jaipur, Rajasthan"
                className="w-full px-4 py-3 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-base"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={handleContinue}
            disabled={!name || !age || !isValidPhone(phone)}
            className="kiosk-btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            {t(language, 'identity.proceed')} →
          </button>

          <button
            onClick={() => handleJudgeFastDemo('91-1234-5678-9012')}
            className="kiosk-btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2 border-teal-300 text-teal-800 bg-teal-50/70 hover:bg-teal-100"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            {isHi ? '⚡ फास्ट 1-क्लिक जज डेमो (रमेश शर्मा - ABHA सत्यापित)' : '⚡ Fast 1-Click Judge Demo (Ramesh Sharma - Verified ABHA)'}
          </button>

          <button
            onClick={() => setStep('welcome')}
            className="text-medikiosk-muted py-2 text-sm text-center hover:text-slate-800"
          >
            ← {t(language, 'identity.back')}
          </button>
        </div>

        {/* OTP VERIFICATION MODAL DIALOG */}
        {txnId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isHi ? 'OTP सत्यापन' : 'Enter OTP Verification'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {authMethod === 'AADHAAR_OTP' ? 'Aadhaar Registered Mobile' : 'ABHA Registered Phone'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTxnId(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sandbox Helper Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ABDM Sandbox Simulator:</span> An OTP was dispatched for transaction{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">{txnId.slice(0, 14)}...</code>.
                  <div className="mt-1 font-semibold text-amber-800">
                    Test OTP: <span className="underline font-mono">123456</span>
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  {isHi ? '6-अंकीय OTP दर्ज करें' : '6-Digit Verification Code'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  placeholder="1 2 3 4 5 6"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-4 rounded-2xl border-2 border-teal-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 focus:outline-none"
                />

                {otpError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {otpTimer > 0 ? (
                    `Expires in ${otpTimer}s`
                  ) : (
                    <span className="text-rose-600 font-medium">OTP Expired</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || loading}
                  className="font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-40 disabled:hover:text-slate-500"
                >
                  {isHi ? 'पुनः OTP भेजें' : 'Resend OTP'}
                </button>
              </div>

              {/* Quick Fill Button */}
              <button
                type="button"
                onClick={() => setOtp('123456')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Auto-fill Sandbox OTP (123456)
              </button>

              {/* Submit OTP */}
              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={otp.length < 6 || loading}
                className="kiosk-btn-primary w-full py-3.5 font-bold text-base flex items-center justify-center gap-2"
              >
                {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isHi ? 'सत्यापित करें' : 'Confirm & Authenticate'}
              </button>
            </div>
          </div>
        )}

        {/* SDK CONFIGURATION MODAL */}
        {showConfig && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-base">ABDM SDK Engine Settings</h3>
                </div>
                <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                This configuration manages the connection to India&apos;s ABDM / ABHA endpoints defined in{' '}
                <a
                  href="https://github.com/Technoculture/ABDM-ABHA-SDK"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 font-semibold underline inline-flex items-center gap-0.5"
                >
                  Technoculture/ABDM-ABHA-SDK <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                  <input
                    type="checkbox"
                    checked={useSimulation}
                    onChange={(e) => setUseSimulation(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-teal-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Enable Interactive ABDM Sandbox Simulator (Recommended for Demos)
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Simulates authentic ABDM responses, test OTPs, and sample patient records without requiring live UIDAI network hardware.
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ABDM API Gateway Base URL
                  </label>
                  <input
                    type="text"
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Default: https://healthidsbx.abdm.gov.in/api/v1
                  </span>
                </div>

              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="kiosk-btn-primary flex-1 py-2.5 text-xs font-bold"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
