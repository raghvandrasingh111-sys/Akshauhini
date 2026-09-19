import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { KioskPage } from './pages/KioskPage'
import { PhysicianDashboard } from './components/physician/PhysicianDashboard'
import { HeartPulse, Monitor } from 'lucide-react'

function NavBar() {
  const location = useLocation()
  const isKiosk = location.pathname === '/'

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-kiosk border border-medikiosk-border p-2">
      <Link
        to="/"
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
          isKiosk ? 'bg-medikiosk-primary text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <HeartPulse className="w-5 h-5" />
        Patient Kiosk
      </Link>
      <Link
        to="/physician"
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
          !isKiosk ? 'bg-medikiosk-primary text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Monitor className="w-5 h-5" />
        Physician EMR
      </Link>
    </nav>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/physician" element={<PhysicianDashboard />} />
        </Routes>
        <NavBar />
      </BrowserRouter>
    </AppProvider>
  )
}
