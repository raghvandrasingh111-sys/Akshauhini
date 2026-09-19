import { useState, useEffect } from 'react'
import {
  Stethoscope,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Edit3,
  RefreshCw,
  User,
} from 'lucide-react'
import type { ClinicalSummary } from '../../types'

export function PhysicianDashboard() {
  const [summaries, setSummaries] = useState<ClinicalSummary[]>([])
  const [selected, setSelected] = useState<ClinicalSummary | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedHpi, setEditedHpi] = useState('')

  const loadSummaries = () => {
    try {
      const raw = localStorage.getItem('medikiosk_physician_summaries')
      const parsed: ClinicalSummary[] = raw ? JSON.parse(raw) : []
      setSummaries(parsed)
      if (parsed.length > 0 && !selected) {
        setSelected(parsed[0])
        setEditedHpi(parsed[0].hpi)
      }
    } catch {
      setSummaries([])
    }
  }

  useEffect(() => {
    loadSummaries()
    const interval = setInterval(loadSummaries, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected) setEditedHpi(selected.hpi)
  }, [selected])

  const handleVerify = () => {
    if (!selected) return
    const updated = { ...selected, status: 'verified' as const, hpi: editedHpi }
    const next = summaries.map((s) => (s.id === selected.id ? updated : s))
    localStorage.setItem('medikiosk_physician_summaries', JSON.stringify(next))
    setSummaries(next)
    setSelected(updated)
    setEditMode(false)
  }

  const loadDemo = () => {
    const demo: ClinicalSummary = {
      id: `demo_${Date.now()}`,
      patientId: '91-1234-5678-9012',
      createdAt: new Date().toISOString(),
      chiefComplaint: '3 din se severe chest pain aur saans phul rahi hai',
      hpi: 'Duration: 1-3d. Onset: sudden. Severity: 8/10. Radiation: left_arm',
      pastHistory: 'Hypertension; Diabetes Mellitus',
      medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD'],
      allergies: ['Penicillin'],
      reviewOfSystems: 'No additional symptoms reported',
      priorInvestigations: 'Hemoglobin: 9.2 g/dL (ABNORMAL); WBC: 11200 /cumm (ABNORMAL)',
      redFlags: [
        {
          id: 'rf_chest_pain',
          symptom: 'Chest Pain',
          severity: 'critical',
          message: 'Acute chest pain detected — possible cardiac emergency.',
          messageHi: 'तीव्र सीने का दर्द — संभावित हृदय आपातकाल।',
        },
        {
          id: 'rf_cardiac_radiation',
          symptom: 'Chest Pain with Radiation',
          severity: 'critical',
          message: 'Chest pain radiating to arm — high suspicion for ACS.',
          messageHi: 'सीने का दर्द हाथ तक — ACS की संभावना।',
        },
      ],
      documents: [],
      fhirBundle: {
        resourceType: 'Bundle',
        type: 'document',
        entry: [],
      },
      status: 'draft',
    }
    const next = [demo, ...summaries]
    localStorage.setItem('medikiosk_physician_summaries', JSON.stringify(next))
    setSummaries(next)
    setSelected(demo)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-medikiosk-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-medikiosk-primary" />
          <div>
            <h1 className="text-xl font-bold">Physician EMR Dashboard</h1>
            <p className="text-sm text-medikiosk-muted">MediKiosk · FHIR R4 · HL7 Interop</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSummaries}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={loadDemo}
            className="px-4 py-2 rounded-lg bg-medikiosk-primary text-white font-medium"
          >
            Load Demo Case
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-80 bg-white border-r border-medikiosk-border overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-700">Patient Queue</h2>
            <p className="text-sm text-medikiosk-muted">{summaries.length} intake(s)</p>
          </div>
          {summaries.length === 0 ? (
            <div className="p-6 text-center text-medikiosk-muted">
              <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No patients yet.</p>
              <p className="text-sm mt-1">Complete kiosk intake or load demo.</p>
            </div>
          ) : (
            summaries.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-4 border-b hover:bg-medikiosk-surface transition-colors ${
                  selected?.id === s.id ? 'bg-medikiosk-surface border-l-4 border-l-medikiosk-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.patientId}</p>
                    <p className="text-sm text-medikiosk-muted truncate max-w-[200px]">
                      {s.chiefComplaint}
                    </p>
                  </div>
                  {s.redFlags.length > 0 && (
                    <AlertTriangle className="w-5 h-5 text-medikiosk-emergency shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-xs text-medikiosk-muted">
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-medikiosk-muted">
              Select a patient from the queue
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
              {selected.redFlags.length > 0 && (
                <div className="p-4 bg-medikiosk-emergency-light border-2 border-medikiosk-emergency rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-6 h-6 text-medikiosk-emergency" />
                    <h3 className="font-bold text-medikiosk-emergency text-lg">
                      RED FLAG ALERT — Priority Triage
                    </h3>
                  </div>
                  {selected.redFlags.map((f) => (
                    <p key={f.id} className="text-slate-800 mb-1">
                      • <strong>{f.symptom}:</strong> {f.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-card border border-medikiosk-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Structured Clinical Summary</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-medikiosk-border text-sm hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      {editMode ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={handleVerify}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-medikiosk-accent text-white text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Accept
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Chief Complaint" value={selected.chiefComplaint} highlight />
                  <Field label="Status" value={selected.status.toUpperCase()} />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-medikiosk-primary uppercase">HPI</label>
                  {editMode ? (
                    <textarea
                      value={editedHpi}
                      onChange={(e) => setEditedHpi(e.target.value)}
                      className="w-full mt-1 p-3 border-2 border-medikiosk-primary rounded-xl min-h-[80px]"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-slate-50 rounded-xl">{selected.hpi}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Field label="Past History" value={selected.pastHistory} />
                  <Field label="Review of Systems" value={selected.reviewOfSystems} />
                  <Field label="Medications" value={selected.medications.join(', ')} />
                  <Field label="Allergies" value={selected.allergies.join(', ')} />
                  <Field label="Prior Investigations" value={selected.priorInvestigations} colSpan />
                </div>

                {selected.ayushProfile && (
                  <div className="mt-4 p-4 bg-ayush-surface rounded-xl">
                    <h4 className="font-bold text-ayush-primary mb-2">AYUSH Dashavidha Pariksha</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Object.entries(selected.ayushProfile).map(([k, v]) => (
                        <span key={k}>
                          <strong className="capitalize">{k}:</strong> {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-medikiosk-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-medikiosk-primary" />
                  <h3 className="font-bold">FHIR R4 Bundle Preview</h3>
                </div>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-64">
                  {JSON.stringify(selected.fhirBundle, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  highlight,
  colSpan,
}: {
  label: string
  value: string
  highlight?: boolean
  colSpan?: boolean
}) {
  return (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="text-xs font-semibold text-medikiosk-primary uppercase">{label}</label>
      <p
        className={`mt-1 p-3 rounded-xl ${
          highlight ? 'bg-medikiosk-surface font-semibold text-lg' : 'bg-slate-50'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
