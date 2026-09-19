import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { KioskPage } from './pages/KioskPage'
import { LoginPage } from './pages/LoginPage'
import { DoctorDashboardPage } from './pages/DoctorDashboardPage'
import { PatientSearchPage } from './pages/PatientSearchPage'
import { PatientProfilePage } from './pages/PatientProfilePage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PatientAuthProvider } from './context/PatientAuthContext'
import { PatientPortalPage } from './pages/PatientPortalPage'

export default function App() {
  return (
    <AuthProvider>
      <PatientAuthProvider>
        <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/doctor" element={<LoginPage />} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute><DoctorDashboardPage /></ProtectedRoute>} />
          <Route path="/doctor/patients/search" element={<ProtectedRoute><PatientSearchPage /></ProtectedRoute>} />
          <Route path="/doctor/patient/:patientId" element={<ProtectedRoute><PatientProfilePage /></ProtectedRoute>} />
          <Route path="/patient" element={<PatientPortalPage />} />
          <Route path="/physician" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/doctor" replace />} />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
      </BrowserRouter>
        </AppProvider>
      </PatientAuthProvider>
    </AuthProvider>
  )
}
