export async function generateClinicalBrief(payload: Record<string, unknown>) {
  return {
    id: 'ai-brief-dev',
    summary: 'AI-generated draft — Physician verification required.',
    chiefComplaint: payload.chiefComplaint ?? 'Abdominal pain',
    relevantHistory: ['Diabetes documented in previous record', 'Previous consultation available'],
    currentIntake: {
      duration: '3 days',
      severity: '6/10',
      character: 'Intermittent',
      associatedSymptoms: ['Nausea'],
    },
    missingInformation: ['Current vitals', 'Current medication confirmation'],
    status: 'draft',
    modelName: 'Sanjeevani AI Clinical Brief (dev)',
    generatedAt: new Date().toISOString(),
  }
}
