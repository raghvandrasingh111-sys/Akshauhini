import type { InterviewQuestion } from '../types'

export const allopathicQuestions: InterviewQuestion[] = [
  {
    id: 'cc_main',
    text: {
      en: 'What is your main health problem today?',
      hi: 'आज आपकी मुख्य स्वास्थ्य समस्या क्या है?',
    },
    type: 'text',
    category: 'chief_complaint',
    redFlagValues: ['chest pain', 'सीने में दर्द', 'breathlessness', 'सांस', 'unconscious', 'बेहोश'],
  },
  {
    id: 'cc_duration',
    text: {
      en: 'How long have you had this problem?',
      hi: 'यह समस्या कब से है?',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Less than 24 hours', hi: '24 घंटे से कम', value: '<24h' },
      { en: '1-3 days', hi: '1-3 दिन', value: '1-3d' },
      { en: '4-7 days', hi: '4-7 दिन', value: '4-7d' },
      { en: 'More than a week', hi: 'एक सप्ताह से अधिक', value: '>1w' },
      { en: 'More than a month', hi: 'एक महीने से अधिक', value: '>1m' },
    ],
  },
  {
    id: 'hpi_onset',
    text: {
      en: 'How did it start — suddenly or gradually?',
      hi: 'यह कैसे शुरू हुआ — अचानक या धीरे-धीरे?',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Sudden', hi: 'अचानक', value: 'sudden' },
      { en: 'Gradual', hi: 'धीरे-धीरे', value: 'gradual' },
    ],
  },
  {
    id: 'hpi_severity',
    text: {
      en: 'On a scale of 1-10, how severe is your pain/discomfort?',
      hi: '1-10 के पैमाने पर, आपका दर्द/परेशानी कितनी गंभीर है?',
    },
    type: 'scale',
    category: 'hpi',
  },
  {
    id: 'hpi_radiation',
    text: {
      en: 'Does the pain spread anywhere else? (e.g., arm, jaw, back)',
      hi: 'क्या दर्द कहीं और फैलता है? (जैसे, हाथ, जबड़ा, पीठ)',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Left arm', hi: 'बायां हाथ', value: 'left_arm' },
      { en: 'Right arm', hi: 'दायां हाथ', value: 'right_arm' },
      { en: 'Jaw/Neck', hi: 'जबड़ा/गर्दन', value: 'jaw_neck' },
      { en: 'Back', hi: 'पीठ', value: 'back' },
      { en: 'No radiation', hi: 'नहीं फैलता', value: 'none' },
    ],
    redFlagValues: ['left_arm', 'right_arm', 'jaw_neck'],
  },
  {
    id: 'hpi_aggravating',
    text: {
      en: 'What makes it worse?',
      hi: 'क्या इसे और बढ़ाता है?',
    },
    type: 'text',
    category: 'hpi',
  },
  {
    id: 'hpi_relieving',
    text: {
      en: 'What makes it better?',
      hi: 'क्या इसे ठीक करता है?',
    },
    type: 'text',
    category: 'hpi',
  },
  {
    id: 'past_diabetes',
    text: {
      en: 'Do you have diabetes?',
      hi: 'क्या आपको मधुमेह (डायबिटीज) है?',
    },
    type: 'yesno',
    category: 'past_history',
  },
  {
    id: 'past_hypertension',
    text: {
      en: 'Do you have high blood pressure?',
      hi: 'क्या आपको उच्च रक्तचाप (BP) है?',
    },
    type: 'yesno',
    category: 'past_history',
  },
  {
    id: 'past_surgery',
    text: {
      en: 'Have you had any surgeries in the past?',
      hi: 'क्या आपकी पहले कोई सर्जरी हुई है?',
    },
    type: 'text',
    category: 'past_history',
  },
  {
    id: 'med_current',
    text: {
      en: 'What medicines are you currently taking?',
      hi: 'आप अभी कौन-कौन सी दवाइयाँ ले रहे हैं?',
    },
    type: 'text',
    category: 'medications',
  },
  {
    id: 'allergy',
    text: {
      en: 'Do you have any drug allergies?',
      hi: 'क्या आपको किसी दवा से एलर्जी है?',
    },
    type: 'text',
    category: 'allergies',
  },
  {
    id: 'ros_fever',
    text: {
      en: 'Do you have fever?',
      hi: 'क्या आपको बुखार है?',
    },
    type: 'yesno',
    category: 'ros',
  },
  {
    id: 'ros_weight',
    text: {
      en: 'Any recent weight loss or gain?',
      hi: 'हाल में वजन कम या बढ़ा?',
    },
    type: 'choice',
    category: 'ros',
    options: [
      { en: 'No change', hi: 'कोई बदलाव नहीं', value: 'none' },
      { en: 'Weight loss', hi: 'वजन कम', value: 'loss' },
      { en: 'Weight gain', hi: 'वजन बढ़ा', value: 'gain' },
    ],
  },
]
