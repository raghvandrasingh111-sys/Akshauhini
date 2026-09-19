import { useState } from 'react'
import { FileText, FlaskConical, ClipboardList, Scan, Loader2, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { simulateScan, buildTimeline, getAbnormalLabs } from '../../services/ocrService'
import type { ExtractedDocument } from '../../types'

const DOC_TYPES = [
  {
    type: 'lab_report' as const,
    icon: FlaskConical,
    en: 'Lab Report',
    hi: 'लैब रिपोर्ट',
    color: 'text-blue-600',
  },
  {
    type: 'prescription' as const,
    icon: FileText,
    en: 'Prescription',
    hi: 'प्रिस्क्रिप्शन',
    color: 'text-purple-600',
  },
  {
    type: 'discharge_summary' as const,
    icon: ClipboardList,
    en: 'Discharge Summary',
    hi: 'डिस्चार्ज सारांश',
    color: 'text-orange-600',
  },
]

export function DocumentScanScreen() {
  const { language, documents, addDocument, finalizeSummary, setStep } = useApp()
  const isHi = language === 'hi'
  const [scanning, setScanning] = useState<string | null>(null)

  const handleScan = async (type: ExtractedDocument['type']) => {
    setScanning(type)
    const doc = await simulateScan(type)
    addDocument(doc)
    setScanning(null)
  }

  const timeline = buildTimeline(documents)
  const abnormalLabs = getAbnormalLabs(documents)

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="kiosk-card mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Scan className="w-8 h-8 text-medikiosk-primary" />
            <h2 className="text-2xl font-bold">
              {isHi ? 'चिकित्सा दस्तावेज़ स्कैन' : 'Medical Document Scan'}
            </h2>
          </div>
          <p className="text-medikiosk-muted mb-6">
            {isHi
              ? 'पुरानी प्रिस्क्रिप्शन, लैब रिपोर्ट स्कैन करें'
              : 'Scan old prescriptions, lab reports & discharge summaries'}
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {DOC_TYPES.map(({ type, icon: Icon, en, hi, color }) => (
              <button
                key={type}
                onClick={() => handleScan(type)}
                disabled={scanning !== null}
                className="touch-option relative"
              >
                {scanning === type ? (
                  <Loader2 className="w-10 h-10 animate-spin text-medikiosk-primary" />
                ) : (
                  <Icon className={`w-10 h-10 ${color}`} />
                )}
                <span className="font-semibold">{isHi ? hi : en}</span>
                <span className="text-xs text-medikiosk-muted">
                  {scanning === type
                    ? isHi ? 'OCR प्रसंस्करण…' : 'Processing OCR…'
                    : isHi ? 'स्कैन करें' : 'Tap to Scan'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {documents.length > 0 && (
          <div className="kiosk-card mb-6 animate-slide-up">
            <h3 className="font-bold text-lg mb-4">
              {isHi ? 'निकाली गई जानकारी' : 'Extracted Clinical Data'}
            </h3>
            <div className="space-y-4">
              {timeline.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-medikiosk-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{doc.fileName}</p>
                      <p className="text-sm text-medikiosk-muted">
                        {doc.date} · {Math.round(doc.confidence * 100)}% {isHi ? 'विश्वास' : 'confidence'}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-medikiosk-surface text-medikiosk-primary text-xs rounded-full capitalize">
                      {doc.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.entities.map((e, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${
                          e.isAbnormal
                            ? 'bg-medikiosk-emergency-light text-medikiosk-emergency font-semibold'
                            : 'bg-white border border-medikiosk-border'
                        }`}
                      >
                        {e.label}: {e.value}{e.unit ? ` ${e.unit}` : ''}
                        {e.isAbnormal && ' ⚠️'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {abnormalLabs.length > 0 && (
              <div className="mt-4 p-4 bg-medikiosk-emergency-light rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-medikiosk-emergency shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-medikiosk-emergency">
                    {isHi ? 'असामान्य लैब मान' : 'Abnormal Lab Values Flagged'}
                  </p>
                  <p className="text-sm text-slate-700">
                    {abnormalLabs.map((l) => `${l.label}: ${l.value} ${l.unit} (Ref: ${l.referenceRange})`).join('; ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={finalizeSummary} className="kiosk-btn-primary w-full">
            {isHi ? 'सारांश बनाएं और EMR भेजें' : 'Generate Summary & Send to EMR'}
          </button>
          <button onClick={() => setStep('interview')} className="text-medikiosk-muted py-2">
            ← {isHi ? 'साक्षात्कार पर वापस' : 'Back to Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}
