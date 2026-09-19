import type { ExtractedDocument, ClinicalEntity } from '../types'

const SAMPLE_LAB_REPORT: ExtractedDocument = {
  id: 'doc_lab_001',
  type: 'lab_report',
  fileName: 'CBC_Report_2026.pdf',
  date: '2026-09-15',
  confidence: 0.97,
  rawText: 'Complete Blood Count — Hb: 9.2 g/dL (Low), WBC: 11200 /cumm, Platelets: 180000',
  entities: [
    {
      type: 'lab_value',
      label: 'Hemoglobin',
      value: '9.2',
      unit: 'g/dL',
      isAbnormal: true,
      referenceRange: '12.0-16.0',
    },
    {
      type: 'lab_value',
      label: 'WBC Count',
      value: '11200',
      unit: '/cumm',
      isAbnormal: true,
      referenceRange: '4000-11000',
    },
    {
      type: 'lab_value',
      label: 'Platelets',
      value: '180000',
      unit: '/cumm',
      isAbnormal: false,
      referenceRange: '150000-450000',
    },
  ],
}

const SAMPLE_PRESCRIPTION: ExtractedDocument = {
  id: 'doc_rx_001',
  type: 'prescription',
  fileName: 'Prescription_Dr_Sharma.jpg',
  date: '2026-08-20',
  confidence: 0.72,
  rawText: 'Tab Metformin 500mg BD, Tab Amlodipine 5mg OD, Tab Atorvastatin 10mg HS',
  entities: [
    { type: 'medication', label: 'Metformin', value: '500mg BD' },
    { type: 'medication', label: 'Amlodipine', value: '5mg OD' },
    { type: 'medication', label: 'Atorvastatin', value: '10mg HS' },
    { type: 'diagnosis', label: 'Type 2 DM + HTN', value: 'Chronic' },
  ],
}

const SAMPLE_DISCHARGE: ExtractedDocument = {
  id: 'doc_dis_001',
  type: 'discharge_summary',
  fileName: 'Discharge_Summary_AIIMS.pdf',
  date: '2026-06-10',
  confidence: 0.95,
  rawText: 'Diagnosis: Acute Coronary Syndrome — NSTEMI. Procedure: Coronary angiography. Discharged on DAPT.',
  entities: [
    { type: 'diagnosis', label: 'NSTEMI', value: 'Acute Coronary Syndrome' },
    { type: 'procedure', label: 'Coronary Angiography', value: '2026-06-08' },
    { type: 'medication', label: 'Aspirin + Clopidogrel', value: 'DAPT' },
  ],
}

export async function processDocument(
  file: File,
  type: ExtractedDocument['type']
): Promise<ExtractedDocument> {
  await simulateProcessing(1500 + Math.random() * 1000)

  const samples: Record<ExtractedDocument['type'], ExtractedDocument> = {
    lab_report: { ...SAMPLE_LAB_REPORT, id: `doc_${Date.now()}`, fileName: file.name },
    prescription: { ...SAMPLE_PRESCRIPTION, id: `doc_${Date.now()}`, fileName: file.name },
    discharge_summary: { ...SAMPLE_DISCHARGE, id: `doc_${Date.now()}`, fileName: file.name },
  }

  return samples[type]
}

export async function simulateScan(type: ExtractedDocument['type']): Promise<ExtractedDocument> {
  await simulateProcessing(2000)
  const samples = [SAMPLE_LAB_REPORT, SAMPLE_PRESCRIPTION, SAMPLE_DISCHARGE]
  const sample = samples.find((s) => s.type === type) ?? SAMPLE_LAB_REPORT
  return { ...sample, id: `doc_${Date.now()}` }
}

function simulateProcessing(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function buildTimeline(docs: ExtractedDocument[]): ExtractedDocument[] {
  return [...docs].sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function getAbnormalLabs(docs: ExtractedDocument[]): ClinicalEntity[] {
  return docs.flatMap((d) => d.entities.filter((e) => e.isAbnormal))
}
