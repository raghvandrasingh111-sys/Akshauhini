import type { RedFlag, InterviewAnswer } from '../types'

const RED_FLAG_PATTERNS: {
  pattern: RegExp
  id: string
  symptom: string
  severity: RedFlag['severity']
  message: string
  messageHi: string
}[] = [
  {
    pattern: /chest\s*pain|सीने\s*म(?:ें|e)\s*द(?:र्द|ard)|seene\s*mein\s*dard/i,
    id: 'rf_chest_pain',
    symptom: 'Chest Pain',
    severity: 'critical',
    message: 'Acute chest pain detected — possible cardiac emergency. Immediate triage required.',
    messageHi: 'तीव्र सीने का दर्द — संभावित हृदय आपातकाल। तत्काल ट्राइएज आवश्यक।',
  },
  {
    pattern: /breathless|saans|सांस|dyspnea|saans\s*phul|सांस\s*फूल/i,
    id: 'rf_dyspnea',
    symptom: 'Breathlessness',
    severity: 'critical',
    message: 'Acute breathlessness detected — respiratory/cardiac emergency possible.',
    messageHi: 'तीव्र सांस की तकलीफ — श्वसन/हृदय आपातकाल संभव।',
  },
  {
    pattern: /unconscious|बेहोश|behosh|faint|syncope/i,
    id: 'rf_unconscious',
    symptom: 'Loss of Consciousness',
    severity: 'critical',
    message: 'Loss of consciousness reported — immediate emergency assessment required.',
    messageHi: 'चेतना की हानि — तत्काल आपातकालीन जांच आवश्यक।',
  },
  {
    pattern: /stroke|facial\s*droop|one\s*side\s*weak|लकवा|हाथ\s*कमजोर/i,
    id: 'rf_stroke',
    symptom: 'Stroke Indicators',
    severity: 'critical',
    message: 'Possible stroke symptoms — activate stroke protocol immediately.',
    messageHi: 'संभावित स्ट्रोक लक्षण — तत्काल स्ट्रोक प्रोटोकॉल सक्रिय करें।',
  },
  {
    pattern: /severe\s*bleed|heavy\s*bleed|खून\s*बह/i,
    id: 'rf_bleeding',
    symptom: 'Severe Bleeding',
    severity: 'urgent',
    message: 'Severe bleeding reported — urgent assessment needed.',
    messageHi: 'गंभीर रक्तस्राव — तत्काल जांच आवश्यक।',
  },
]

const RADIATION_FLAGS = ['left_arm', 'right_arm', 'jaw_neck']

export function detectRedFlags(answers: InterviewAnswer[]): RedFlag[] {
  const flags: RedFlag[] = []
  const seen = new Set<string>()

  for (const answer of answers) {
    for (const rule of RED_FLAG_PATTERNS) {
      if (rule.pattern.test(answer.answer) && !seen.has(rule.id)) {
        seen.add(rule.id)
        flags.push({
          id: rule.id,
          symptom: rule.symptom,
          severity: rule.severity,
          message: rule.message,
          messageHi: rule.messageHi,
        })
      }
    }

    if (answer.questionId === 'hpi_radiation' && RADIATION_FLAGS.includes(answer.answer)) {
      const chestPainAnswer = answers.find(
        (a) => a.questionId === 'cc_main' && /chest|सीने|seene/i.test(a.answer)
      )
      if (chestPainAnswer && !seen.has('rf_cardiac_radiation')) {
        seen.add('rf_cardiac_radiation')
        flags.push({
          id: 'rf_cardiac_radiation',
          symptom: 'Chest Pain with Radiation',
          severity: 'critical',
          message: 'Chest pain radiating to arm/jaw — high suspicion for acute coronary syndrome.',
          messageHi: 'सीने का दर्द हाथ/जबड़े तक — तीव्र कोरोनरी सिंड्रोम की संभावना।',
        })
      }
    }

    if (answer.questionId === 'hpi_severity') {
      const severity = parseInt(answer.answer, 10)
      const hasChestPain = answers.some(
        (a) => a.questionId === 'cc_main' && /chest|सीने|seene/i.test(a.answer)
      )
      if (hasChestPain && severity >= 7 && !seen.has('rf_severe_chest')) {
        seen.add('rf_severe_chest')
        flags.push({
          id: 'rf_severe_chest',
          symptom: 'Severe Chest Pain (≥7/10)',
          severity: 'critical',
          message: 'Severe chest pain (7+/10) — priority emergency triage.',
          messageHi: 'गंभीर सीने का दर्द (7+/10) — प्राथमिकता आपातकालीन ट्राइएज।',
        })
      }
    }
  }

  return flags.sort((a, b) => {
    const order = { critical: 0, urgent: 1, moderate: 2 }
    return order[a.severity] - order[b.severity]
  })
}

export function isEmergency(flags: RedFlag[]): boolean {
  return flags.some((f) => f.severity === 'critical')
}
