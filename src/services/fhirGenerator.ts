import type {
  ClinicalSummary,
  InterviewAnswer,
  ExtractedDocument,
  RedFlag,
  AyushProfile,
  PatientIdentity,
} from '../types'

export function generateClinicalSummary(
  identity: PatientIdentity,
  answers: InterviewAnswer[],
  documents: ExtractedDocument[],
  redFlags: RedFlag[],
  ayushProfile?: AyushProfile
): ClinicalSummary {
  const chiefComplaint = answers.find((a) => a.questionId === 'cc_main')?.answer ?? 'Not recorded'
  const duration = answers.find((a) => a.questionId === 'cc_duration')?.answer ?? ''
  const onset = answers.find((a) => a.questionId === 'hpi_onset')?.answer ?? ''
  const severity = answers.find((a) => a.questionId === 'hpi_severity')?.answer ?? ''
  const radiation = answers.find((a) => a.questionId === 'hpi_radiation')?.answer ?? ''
  const aggravating = answers.find((a) => a.questionId === 'hpi_aggravating')?.answer ?? ''
  const relieving = answers.find((a) => a.questionId === 'hpi_relieving')?.answer ?? ''

  const hpi = [
    duration && `Duration: ${duration}`,
    onset && `Onset: ${onset}`,
    severity && `Severity: ${severity}/10`,
    radiation && radiation !== 'none' && `Radiation: ${radiation}`,
    aggravating && `Aggravating: ${aggravating}`,
    relieving && `Relieving: ${relieving}`,
  ]
    .filter(Boolean)
    .join('. ')

  const pastHistory = [
    answers.find((a) => a.questionId === 'past_diabetes')?.answer === 'yes' && 'Diabetes Mellitus',
    answers.find((a) => a.questionId === 'past_hypertension')?.answer === 'yes' && 'Hypertension',
    answers.find((a) => a.questionId === 'past_surgery')?.answer,
  ]
    .filter(Boolean)
    .join('; ')

  const medications = [
    answers.find((a) => a.questionId === 'med_current')?.answer,
    ...documents.flatMap((d) =>
      d.entities.filter((e) => e.type === 'medication').map((e) => `${e.label} ${e.value}`)
    ),
  ].filter(Boolean) as string[]

  const allergies = [answers.find((a) => a.questionId === 'allergy')?.answer].filter(
    Boolean
  ) as string[]

  const ros = [
    answers.find((a) => a.questionId === 'ros_fever')?.answer === 'yes' && 'Fever present',
    answers.find((a) => a.questionId === 'ros_weight')?.answer &&
      `Weight change: ${answers.find((a) => a.questionId === 'ros_weight')?.answer}`,
  ]
    .filter(Boolean)
    .join('; ')

  const priorInvestigations = documents
    .flatMap((d) =>
      d.entities
        .filter((e) => e.type === 'lab_value')
        .map((e) => `${e.label}: ${e.value} ${e.unit ?? ''}${e.isAbnormal ? ' (ABNORMAL)' : ''}`)
    )
    .join('; ')

  const id = `summary_${Date.now()}`
  const summary: ClinicalSummary = {
    id,
    patientId: identity.abhaId ?? identity.name,
    createdAt: new Date().toISOString(),
    chiefComplaint,
    hpi: hpi || 'Details pending physician review',
    pastHistory: pastHistory || 'None reported',
    medications: [...new Set(medications)],
    allergies: allergies.length ? allergies : ['NKDA'],
    reviewOfSystems: ros || 'No additional symptoms reported',
    priorInvestigations: priorInvestigations || 'None scanned',
    ayushProfile,
    redFlags,
    documents,
    fhirBundle: buildFHIRBundle(identity, summaryFields({
      chiefComplaint, hpi, pastHistory, medications, allergies, ros, priorInvestigations, redFlags,
    })),
    status: 'draft',
  }

  return summary
}

function summaryFields(fields: Record<string, unknown>) {
  return fields
}

function buildFHIRBundle(
  identity: PatientIdentity,
  fields: Record<string, unknown>
) {
  return {
    resourceType: 'Bundle' as const,
    type: 'document' as const,
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: identity.abhaId ?? 'patient-001',
          identifier: [
            ...(identity.abhaNumber || identity.abhaId
              ? [
                  {
                    system: 'https://healthid.abdm.gov.in',
                    type: {
                      coding: [
                        {
                          system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                          code: 'MR',
                          display: 'ABHA Health ID Number',
                        },
                      ],
                    },
                    value: identity.abhaNumber || identity.abhaId,
                  },
                ]
              : []),
            ...(identity.abhaAddress
              ? [
                  {
                    system: 'https://abdm.gov.in/abha-address',
                    value: identity.abhaAddress,
                  },
                ]
              : []),
          ],
          name: [{ text: identity.name }],
          gender: identity.gender,
          birthDate: estimateBirthDate(identity.age),
          telecom: identity.phone ? [{ system: 'phone', value: identity.phone }] : undefined,
          address: identity.address
            ? [
                {
                  line: [identity.address],
                  district: identity.district,
                  state: identity.state,
                  postalCode: identity.pincode,
                  country: 'IN',
                },
              ]
            : undefined,
          meta: identity.isAbhaVerified
            ? {
                tag: [
                  {
                    system: 'https://abdm.gov.in/verification-status',
                    code: 'verified',
                    display: 'ABDM ABHA KYC Verified',
                  },
                ],
              }
            : undefined,
        },
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'condition-001',
          code: { text: String(fields.chiefComplaint) },
          clinicalStatus: { coding: [{ code: 'active' }] },
        },
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-001',
          status: 'active',
          medicationCodeableConcept: {
            text: (fields.medications as string[])?.join(', ') ?? 'None',
          },
        },
      },
      {
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'allergy-001',
          code: { text: (fields.allergies as string[])?.join(', ') ?? 'NKDA' },
        },
      },
      {
        resource: {
          resourceType: 'DocumentReference',
          id: 'doc-ref-001',
          status: 'current',
          description: 'MediKiosk Clinical Intake Summary',
          content: [
            {
              attachment: {
                contentType: 'application/json',
                title: 'Structured History Summary',
              },
            },
          ],
        },
      },
    ],
  }
}

function estimateBirthDate(age: number): string {
  const year = new Date().getFullYear() - age
  return `${year}-01-01`
}

export function buildAyushProfile(answers: InterviewAnswer[]): AyushProfile {
  return {
    prakriti: answers.find((a) => a.questionId === 'ayush_prakriti')?.answer ?? 'Not assessed',
    vikriti: answers.find((a) => a.questionId === 'ayush_vikriti')?.answer ?? 'Not assessed',
    agni: answers.find((a) => a.questionId === 'ayush_agni')?.answer ?? 'Not assessed',
    koshtha: answers.find((a) => a.questionId === 'ayush_koshtha')?.answer ?? 'Not assessed',
    aharaVihara: answers.find((a) => a.questionId === 'ayush_ahara')?.answer ?? 'Not assessed',
    nidra: answers.find((a) => a.questionId === 'ayush_nidra')?.answer ?? 'Not assessed',
    satva: answers.find((a) => a.questionId === 'ayush_satva')?.answer ?? 'Not assessed',
    sara: 'Pending examination',
    samhanana: 'Pending examination',
    pramana: 'Pending examination',
  }
}
