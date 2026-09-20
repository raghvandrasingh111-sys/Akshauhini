import { useEffect } from 'react'
import { HeartPulse, Stethoscope } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { usePatientAuth } from '../context/PatientAuthContext'
import { InterviewScreen } from '../components/kiosk/InterviewScreen'
import { SummaryScreen } from '../components/kiosk/SummaryScreen'
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher'

export function PatientIntakeDashboardPage() {
  const { reset, setStep, setIdentity, step } = useApp()
  const { patient } = usePatientAuth()

  useEffect(() => {
    reset()

    const fallbackIdentity = {
      name: patient?.name ?? 'New Patient',
      age: patient?.age ?? 0,
      gender: (patient?.gender ?? 'other') as 'male' | 'female' | 'other',
      phone: patient?.phone || undefined,
      address: patient?.address || undefined,
      patientId: patient?.patientId,
      databaseId: patient?.databaseId,
      abhaId: patient?.patientId,
      isAbhaVerified: Boolean(patient?.phone),
      verificationMethod: 'manual' as const,
    }

    setIdentity(fallbackIdentity)
    setStep('interview')
  }, [patient, reset, setIdentity, setStep])

  if (step === 'summary' || step === 'complete') {
    return <SummaryScreen />
  }

  return (
    <div className="min-h-screen bg-[#F3F8F6] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#0F5132] p-2 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                Case taking
              </p>
              <h1 className="text-xl font-black">Clinical intake</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
              <Stethoscope className="h-4 w-4" />
              Existing patient session
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <InterviewScreen />
      </main>
    </div>
  )
}
