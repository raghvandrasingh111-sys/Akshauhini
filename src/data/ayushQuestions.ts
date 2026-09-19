import type { InterviewQuestion } from '../types'

export const ayushQuestions: InterviewQuestion[] = [
  {
    id: 'ayush_prakriti',
    text: {
      en: 'What is your natural body constitution (Prakriti)?',
      hi: 'आपकी प्राकृतिक शारीरिक प्रकृति (प्रकृति) क्या है?',
    },
    type: 'choice',
    category: 'ayush',
    options: [
      { en: 'Vata (Air/Ether)', hi: 'वात (वायु/आकाश)', value: 'vata' },
      { en: 'Pitta (Fire/Water)', hi: 'पित्त (अग्नि/जल)', value: 'pitta' },
      { en: 'Kapha (Earth/Water)', hi: 'कफ (पृथ्वी/जल)', value: 'kapha' },
      { en: 'Mixed (Dwandwaja)', hi: 'मिश्र (द्वंद्वज)', value: 'mixed' },
      { en: 'Not sure', hi: 'पता नहीं', value: 'unknown' },
    ],
  },
  {
    id: 'ayush_vikriti',
    text: {
      en: 'What symptoms are you experiencing now (Vikriti)?',
      hi: 'अभी आप कौन से लक्षण महसूस कर रहे हैं (विकृति)?',
    },
    type: 'text',
    category: 'ayush',
  },
  {
    id: 'ayush_agni',
    text: {
      en: 'How is your digestion and appetite (Agni)?',
      hi: 'आपका पाचन और भूख (अग्नि) कैसी है?',
    },
    type: 'choice',
    category: 'ayush',
    options: [
      { en: 'Good appetite, regular digestion', hi: 'अच्छी भूख, नियमित पाचन', value: 'sama' },
      { en: 'Irregular appetite', hi: 'अनियमित भूख', value: 'vishama' },
      { en: 'Low appetite, slow digestion', hi: 'कम भूख, धीमा पाचन', value: 'manda' },
      { en: 'Excessive hunger, burning sensation', hi: 'अत्यधिक भूख, जलन', value: 'tikshna' },
    ],
  },
  {
    id: 'ayush_koshtha',
    text: {
      en: 'How are your bowel movements (Koshtha)?',
      hi: 'आपका मल त्याग (कोष्ठ) कैसा है?',
    },
    type: 'choice',
    category: 'ayush',
    options: [
      { en: 'Regular, soft', hi: 'नियमित, मुलायम', value: 'mrudu' },
      { en: 'Hard, constipated', hi: 'कठोर, कब्ज', value: 'krura' },
      { en: 'Loose, frequent', hi: 'पतला, बार-बार', value: 'loose' },
    ],
  },
  {
    id: 'ayush_ahara',
    text: {
      en: 'Describe your daily diet and lifestyle (Ahara-Vihara)',
      hi: 'अपने दैनिक आहार और जीवनशैली (आहार-विहार) का वर्णन करें',
    },
    type: 'text',
    category: 'ayush',
  },
  {
    id: 'ayush_nidra',
    text: {
      en: 'How is your sleep (Nidra)?',
      hi: 'आपकी नींद (निद्रा) कैसी है?',
    },
    type: 'choice',
    category: 'ayush',
    options: [
      { en: 'Sound, 6-8 hours', hi: 'गहरी, 6-8 घंटे', value: 'good' },
      { en: 'Disturbed, less than 5 hours', hi: 'बाधित, 5 घंटे से कम', value: 'poor' },
      { en: 'Excessive sleep', hi: 'अत्यधिक नींद', value: 'excessive' },
    ],
  },
  {
    id: 'ayush_satva',
    text: {
      en: 'How is your mental state (Satva)?',
      hi: 'आपकी मानसिक स्थिति (सत्त्व) कैसी है?',
    },
    type: 'choice',
    category: 'ayush',
    options: [
      { en: 'Calm and balanced', hi: 'शांत और संतुलित', value: 'pravara' },
      { en: 'Anxious or worried', hi: 'चिंतित या परेशान', value: 'madhyama' },
      { en: 'Depressed or irritable', hi: 'उदास या चिड़चिड़ा', value: 'avara' },
    ],
  },
]
