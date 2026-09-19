import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { type ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, error } = useAuth()

  if (status === 'AUTH_LOADING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Verifying secure session...
      </div>
    )
  }

  if (status === 'NOT_AUTHENTICATED') {
    return <Navigate to="/doctor" replace />
  }

  if (status === 'DOCTOR_PROFILE_MISSING' || status === 'DATABASE_ERROR') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            {status === 'DOCTOR_PROFILE_MISSING' ? 'Doctor profile not found' : 'Authentication error'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
