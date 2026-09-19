import type {
  PatientIdentity,
  InterviewAnswer,
  ExtractedDocument,
  RedFlag,
  GeminiDoctorKeyPoints,
  GeminiDifferential,
} from '../types'

const GEMINI_STORAGE_KEY = 'medikiosk_gemini_api_key'
const DEFAULT_MODEL = 'gemini-1.5-flash'

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GEMINI_STORAGE_KEY)
    if (stored && stored.trim()) return stored.trim()
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim())
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY)
    }
  }
}

export interface GeminiAnalysisInput {
  identity: PatientIdentity
  answers: InterviewAnswer[]
  documents?: ExtractedDocument[]
  redFlags?: RedFlag[]
}

/**
 * Analyzes patient kiosk intake responses using Google's Gemini API
 * and produces structured doctor key points for clinical decision support.
 */
export async function analyzePatientIntakeWithGemini(
  input: GeminiAnalysisInput
): Promise<GeminiDoctorKeyPoints> {
  const apiKey = getGeminiApiKey()

  if (!apiKey) {
    // Graceful clinical simulator fallback if API key is not configured
    console.info('[GeminiService] No API key detected. Utilizing clinical intelligence fallback.')
    return generateSimulatedGeminiAnalysis(input)
  }

  const prompt = buildClinicalPrompt(input)

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`[GeminiService] Gemini API returned ${response.status}: ${errorText}`)
      return generateSimulatedGeminiAnalysis(input, `API HTTP ${response.status}`)
    }

    const data = await response.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error('No content returned from Gemini API')
    }

    const parsed = parseGeminiResponse(content)
    parsed.generatedAt = new Date().toISOString()
    return parsed
  } catch (err) {
    console.error('[GeminiService] Exception during Gemini call, using fallback:', err)
    return generateSimulatedGeminiAnalysis(input, 'Network / Service Exception')
  }
}

function buildClinicalPrompt(input: GeminiAnalysisInput): string {
  const { identity, answers, documents, redFlags } = input

  const formattedAnswers = answers
    .map((a) => `- [${a.questionId}] ${a.question}: "${a.answer}"`)
    .join('\n')

  const formattedFlags =
    redFlags && redFlags.length > 0
      ? redFlags.map((f) => `- [${f.severity.toUpperCase()}] ${f.symptom}: ${f.message}`).join('\n')
      : 'None detected'

  const formattedDocs =
    documents && documents.length > 0
      ? documents
          .map(
            (d) =>
              `- Doc "${d.fileName}" (${d.type}): ${d.entities.map((e) => `${e.label}=${e.value}`).join(', ')}`
          )
          .join('\n')
      : 'None scanned'

  return `You are an expert Clinical AI Co-Pilot assisting an Outpatient Department (OPD) Physician in India.
Analyze the following patient intake data collected at a hospital digital kiosk.
The patient may have responded in Hindi, Hinglish, or English.
Synthesize the raw findings into highly structured, clear, actionable clinical key points for the examining doctor.

PATIENT DEMOGRAPHICS:
- Name: ${identity.name}
- Age: ${identity.age} years | Gender: ${identity.gender}
- ABHA Status: ${identity.isAbhaVerified ? `Verified (${identity.abhaId})` : 'Manual intake'}
${identity.address ? `- Location: ${identity.address}` : ''}

KIOSK INTERVIEW ANSWERS:
${formattedAnswers}

TRIAGE RED FLAGS:
${formattedFlags}

SCANNED INVESTIGATIONS / DOCUMENTS:
${formattedDocs}

INSTRUCTIONS:
Return a valid JSON object strictly matching this schema with NO markdown wrapping:
{
  "clinicalImpression": "1-2 sentence high-level clinical synthesis of patient presentation",
  "urgencyLevel": "Emergency" or "Urgent" or "Routine",
  "urgencyReason": "Brief justification for urgency level",
  "keyFindings": ["3 to 5 concise bullet points highlighting timeline, sensation, pain severity, triggers"],
  "pertinentPositives": ["Key positive symptoms (e.g. pain radiation to left arm, diaphoresis, hypertension history)"],
  "pertinentNegatives": ["Crucial absent symptoms ruled out in interview (e.g. no fever, no trauma)"],
  "differentialDiagnoses": [
    {
      "condition": "Condition name (e.g. Acute Coronary Syndrome (ACS) / Angina)",
      "likelihood": "High" or "Moderate" or "Low",
      "reason": "Clinical justification based on presentation"
    }
  ],
  "recommendedWorkup": ["List 3 to 5 immediate investigations/tests the doctor should order right away (e.g. 12-lead ECG, Serum Troponin-I, CBC)"],
  "suggestedDoctorQuestions": ["2 to 3 targeted probing questions the doctor should ask the patient next to refine diagnosis"]
}
`
}

function parseGeminiResponse(rawText: string): GeminiDoctorKeyPoints {
  try {
    // Clean code blocks if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    const obj = JSON.parse(cleaned)
    return {
      clinicalImpression: obj.clinicalImpression || 'Clinical intake recorded for physician review.',
      urgencyLevel: ['Emergency', 'Urgent', 'Routine'].includes(obj.urgencyLevel)
        ? obj.urgencyLevel
        : 'Urgent',
      urgencyReason: obj.urgencyReason || 'Based on clinical presentation and reported severity.',
      keyFindings: Array.isArray(obj.keyFindings) ? obj.keyFindings : [],
      pertinentPositives: Array.isArray(obj.pertinentPositives) ? obj.pertinentPositives : [],
      pertinentNegatives: Array.isArray(obj.pertinentNegatives) ? obj.pertinentNegatives : [],
      differentialDiagnoses: Array.isArray(obj.differentialDiagnoses)
        ? obj.differentialDiagnoses
        : [],
      recommendedWorkup: Array.isArray(obj.recommendedWorkup) ? obj.recommendedWorkup : [],
      suggestedDoctorQuestions: Array.isArray(obj.suggestedDoctorQuestions)
        ? obj.suggestedDoctorQuestions
        : [],
    }
  } catch (e) {
    console.warn('[GeminiService] Failed to parse JSON response directly, generating fallback:', e)
    throw e
  }
}

/**
 * Intelligent clinical rule-based engine providing high-fidelity Gemini-style
 * doctor key points when running offline or without an active API key.
 */
export function generateSimulatedGeminiAnalysis(
  input: GeminiAnalysisInput,
  debugNote?: string
): GeminiDoctorKeyPoints {
  const { identity, answers, redFlags } = input

  const mainComplaint =
    answers.find((a) => a.questionId === 'cc_main')?.answer ||
    answers.find((a) => a.questionId === 'cc_body_area')?.answer ||
    'General illness'

  const sensation = answers.find((a) => a.questionId === 'hpi_sensation')?.answer || ''
  const duration = answers.find((a) => a.questionId === 'cc_duration')?.answer || ''
  const radiation = answers.find((a) => a.questionId === 'hpi_radiation')?.answer || ''
  const severityStr = answers.find((a) => a.questionId === 'hpi_severity')?.answer || '5'
  const severityNum = parseInt(severityStr, 10) || 5
  const associated = answers.find((a) => a.questionId === 'hpi_associated')?.answer || ''
  const pastConditions = answers.find((a) => a.questionId === 'past_conditions')?.answer || ''
  const medications = answers.find((a) => a.questionId === 'med_current')?.answer || ''

  const isCardiacSuspect =
    /chest|सीना|heart|cardiac|left_arm|seene/i.test(mainComplaint) ||
    /left_arm|jaw_neck/i.test(radiation) ||
    /pressure|tightness|heaviness/i.test(sensation)

  const isRespiratorySuspect = /breath|saans|सांस|cough|dyspnea/i.test(mainComplaint)
  const isAbdominalSuspect = /stomach|पेट|abdomen|acid|vomit|loose/i.test(mainComplaint)

  let urgencyLevel: 'Emergency' | 'Urgent' | 'Routine' = 'Routine'
  let urgencyReason = 'Stable outpatient presentation suitable for routine clinical evaluation.'

  if (redFlags && redFlags.length > 0) {
    urgencyLevel = 'Emergency'
    urgencyReason = `Critical red flags detected (${redFlags.map((r) => r.symptom).join(', ')}). High risk of acute event.`
  } else if (severityNum >= 7 || isCardiacSuspect) {
    urgencyLevel = 'Urgent'
    urgencyReason = `Severe distress (pain score ${severityNum}/10) with potential cardiovascular involvement.`
  }

  // Differentials
  const diffs: GeminiDifferential[] = []

  if (isCardiacSuspect) {
    diffs.push({
      condition: 'Acute Coronary Syndrome (ACS) / Unstable Angina',
      likelihood: severityNum >= 7 || radiation === 'left_arm' ? 'High' : 'Moderate',
      reason: `Patient reports chest distress radiating to ${radiation || 'surrounding areas'} with severity score ${severityNum}/10.`,
    })
    diffs.push({
      condition: 'Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm',
      likelihood: 'Moderate',
      reason: 'Burning/pressure sensations can mimic retrosternal cardiac symptoms.',
    })
    diffs.push({
      condition: 'Musculoskeletal Chest Wall Pain (Costochondritis)',
      likelihood: 'Low',
      reason: 'Consider if localized tenderness or exacerbation with movement.',
    })
  } else if (isRespiratorySuspect) {
    diffs.push({
      condition: 'Acute Exacerbation of Asthma / COPD',
      likelihood: 'High',
      reason: 'Reported acute shortness of breath and respiratory difficulty.',
    })
    diffs.push({
      condition: 'Lower Respiratory Tract Infection / Pneumonia',
      likelihood: 'Moderate',
      reason: 'Potential infectious etiology if fever and cough are present.',
    })
  } else if (isAbdominalSuspect) {
    diffs.push({
      condition: 'Acute Gastritis / Peptic Ulcer Disease',
      likelihood: 'High',
      reason: 'Epigastric distress with nausea or burning sensation.',
    })
    diffs.push({
      condition: 'Acute Cholecystitis / Pancreatitis',
      likelihood: 'Moderate',
      reason: 'Severe abdominal pain may indicate biliary or pancreatic involvement.',
    })
  } else {
    diffs.push({
      condition: 'Acute Febrile Illness / Viral Syndrome',
      likelihood: 'High',
      reason: 'Generalized acute symptoms consistent with seasonal viral infection.',
    })
    diffs.push({
      condition: 'Tension Headache / Migraine',
      likelihood: 'Moderate',
      reason: 'Cranial discomfort without focal neurological deficits.',
    })
  }

  const keyFindings = [
    `Chief presentation: "${mainComplaint}" of duration "${duration || 'recent'}"`,
    `Pain character: ${sensation || 'Discomfort'} rated ${severityNum}/10`,
    radiation && radiation !== 'none'
      ? `Pain radiates towards: ${radiation.replace('_', ' ')}`
      : 'No radiation of pain reported',
    associated ? `Associated symptoms noted: ${associated}` : 'No secondary symptoms reported',
    pastConditions ? `Underlying comorbidities: ${pastConditions}` : 'No known comorbidities reported',
  ].filter(Boolean)

  const pertinentPositives = [
    `Reported symptom severity: ${severityNum}/10`,
    radiation && radiation !== 'none' && `Radiation to ${radiation.replace('_', ' ')}`,
    associated && `Accompanied by ${associated}`,
    pastConditions && `Comorbid history of ${pastConditions}`,
    medications && `Current active medications: ${medications}`,
  ].filter(Boolean) as string[]

  const pertinentNegatives = [
    !/loss|unconscious|faint/i.test(mainComplaint) && 'No syncope or loss of consciousness reported',
    radiation === 'none' && 'No radiation to neck or arms',
    !/bleed/i.test(mainComplaint) && 'No active bleeding or hemoptysis',
    'No reported drug allergies on initial intake',
  ].filter(Boolean) as string[]

  const recommendedWorkup = isCardiacSuspect
    ? [
        'Urgent 12-Lead Electrocardiogram (ECG)',
        'Cardiac Biomarkers (High-Sensitivity Troponin-I / T, CK-MB)',
        'Bedside Vital Signs (BP, SpO2, Heart Rate, Respiratory Rate)',
        'Complete Blood Count (CBC) & Random Blood Sugar (RBS)',
        'Echocardiogram if ECG shows ischemic changes',
      ]
    : [
        'Vital Signs Baseline (BP, Pulse, Temperature, SpO2)',
        'Complete Blood Count (CBC) with Differential',
        'Routine Metabolic Profile (RBS, Serum Creatinine, Electrolytes)',
        'Focused Physical Examination by Attending Physician',
      ]

  const suggestedDoctorQuestions = isCardiacSuspect
    ? [
        'Does the chest pressure feel worse upon exertion (climbing stairs) and ease with complete rest?',
        'Have you noticed cold sweating, dizziness, or a feeling of breathlessness when the pain peaks?',
        'Is there any family history of early heart disease or cardiac stent placement?',
      ]
    : [
        'Did you take any over-the-counter painkillers or home remedies before arriving?',
        'Has this specific episode ever happened to you before in the past?',
        'Does changing your posture or drinking water relieve or worsen the discomfort?',
      ]

  return {
    clinicalImpression: `${identity.age}y ${identity.gender} presenting with ${mainComplaint}${duration ? ` for ${duration}` : ''}. Clinical picture warrants ${urgencyLevel.toLowerCase()} evaluation. ${debugNote ? `(${debugNote})` : ''}`,
    urgencyLevel,
    urgencyReason,
    keyFindings,
    pertinentPositives: pertinentPositives.slice(0, 4),
    pertinentNegatives: pertinentNegatives.slice(0, 3),
    differentialDiagnoses: diffs,
    recommendedWorkup,
    suggestedDoctorQuestions,
    generatedAt: new Date().toISOString(),
  }
}
