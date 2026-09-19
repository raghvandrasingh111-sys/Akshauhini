import { useApp } from '../context/AppContext'
import { WelcomeScreen } from '../components/kiosk/WelcomeScreen'
import { IdentityScreen } from '../components/kiosk/IdentityScreen'
import { ConsentScreen } from '../components/kiosk/ConsentScreen'
import { ModeSelectScreen } from '../components/kiosk/ModeSelectScreen'
import { InterviewScreen } from '../components/kiosk/InterviewScreen'
import { DocumentScanScreen } from '../components/kiosk/DocumentScanScreen'
import { SummaryScreen } from '../components/kiosk/SummaryScreen'
import { DoctorAccessScreen } from '../components/kiosk/DoctorAccessScreen'

export function KioskPage() {
  const { step } = useApp()

  switch (step) {
    case 'welcome':
      return <WelcomeScreen />
    case 'identity':
      return <IdentityScreen />
    case 'consent':
      return <ConsentScreen />
    case 'mode-select':
      return <ModeSelectScreen />
    case 'interview':
      return <InterviewScreen />
    case 'documents':
      return <DocumentScanScreen />
    case 'summary':
    case 'complete':
      return <SummaryScreen />
    case 'doctor-access':
      return <DoctorAccessScreen />
    default:
      return <WelcomeScreen />
  }
}
