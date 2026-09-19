import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { KioskPage } from './KioskPage'
import type { KioskStep } from '../types'

const pathSteps: Record<string, KioskStep> = {
  '/patient/intake': 'welcome',
  '/patient/intake/identify': 'identity',
  '/patient/intake/language': 'welcome',
  '/patient/intake/symptoms': 'interview',
  '/patient/intake/history': 'interview',
  '/patient/intake/documents': 'documents',
  '/patient/intake/review': 'summary',
}

export function PatientIntakePage() {
  const { pathname } = useLocation()
  const { setStep } = useApp()

  useEffect(() => {
    const step = pathSteps[pathname]
    if (step) setStep(step)
  }, [pathname, setStep])

  return <KioskPage />
}
