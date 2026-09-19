import { AppProvider } from './context/AppContext'
import { KioskPage } from './pages/KioskPage'

export default function App() {
  return (
    <AppProvider>
      <KioskPage />
    </AppProvider>
  )
}
