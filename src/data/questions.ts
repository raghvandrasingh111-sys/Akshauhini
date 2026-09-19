import type { InterviewQuestion } from '../types'

export const allopathicQuestions: InterviewQuestion[] = [
  {
    id: 'cc_body_area',
    text: {
      en: 'Where are you feeling the trouble or discomfort most?',
      hi: 'आपको मुख्य परेशानी शरीर के किस हिस्से में हो रही है?',
    },
    subtext: {
      en: 'Tap the main area to help the doctor understand quickly',
      hi: 'मुख्य हिस्से पर टैप करें ताकि डॉक्टर को तुरंत समझ आए',
    },
    type: 'choice',
    category: 'chief_complaint',
    options: [
      { en: '🫀 Chest / Heart', hi: '🫀 सीना / दिल का हिस्सा', value: 'chest' },
      { en: '🫁 Breathing / Lungs', hi: '🫁 सांस लेने में तकलीफ', value: 'breathing' },
      { en: '🫄 Stomach / Digestion', hi: '🫄 पेट / पाचन / गैस', value: 'abdomen' },
      { en: '🧠 Head / Dizziness', hi: '🧠 सिर दर्द / चक्कर', value: 'head' },
      { en: '🌡️ Fever & Body Ache', hi: '🌡️ बुखार व बदन दर्द', value: 'fever' },
      { en: '🦴 Bones & Joints', hi: '🦴 हड्डियां व जोड़', value: 'joints' },
      { en: '🩹 Skin / Rash', hi: '🩹 त्वचा / खुजली / दाने', value: 'skin' },
      { en: '⚡ Other / General Weakness', hi: '⚡ अन्य परेशानी / कमजोरी', value: 'general' },
    ],
  },
  {
    id: 'cc_main',
    text: {
      en: 'In your own words, what main problem brought you to the clinic today?',
      hi: 'अपनी सरल भाषा में बताएं, आज क्या मुख्य तकलीफ हो रही है?',
    },
    subtext: {
      en: 'You can speak using the microphone or type below',
      hi: 'आप नीचे माइक का बटन दबाकर बोल भी सकते हैं या टाइप करें',
    },
    type: 'text',
    category: 'chief_complaint',
    redFlagValues: ['chest pain', 'सीने में दर्द', 'breathlessness', 'सांस', 'unconscious', 'बेहोश', 'stroke', 'bleed'],
  },
  {
    id: 'hpi_sensation',
    text: {
      en: 'How would you describe the feeling or pain?',
      hi: 'यह दर्द या परेशानी महसूस कैसी होती है?',
    },
    subtext: {
      en: 'Select the option that best describes your feeling',
      hi: 'जो आपको सबसे ज्यादा महसूस हो रहा है उसे चुनें',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Heavy pressure or tightness', hi: 'भारीपन या भारी दबाव', value: 'pressure' },
      { en: 'Sharp or stabbing pain', hi: 'तेज़ चुभने वाला दर्द', value: 'stabbing' },
      { en: 'Burning sensation or acidity', hi: 'जलन या खट्टी डकार', value: 'burning' },
      { en: 'Dull continuous ache', hi: 'हल्का-हल्का लगातार मीठा दर्द', value: 'dull_ache' },
      { en: 'Throbbing or pounding', hi: 'धड़कता हुआ दर्द', value: 'throbbing' },
      { en: 'Cramping or twisting', hi: 'मरोड़ या ऐंठन', value: 'cramping' },
      { en: 'Numbness or tingling', hi: 'सुन्नपन या झुनझुनी', value: 'numbness' },
    ],
  },
  {
    id: 'cc_duration',
    text: {
      en: 'How long have you been having this problem?',
      hi: 'यह परेशानी आपको कब से हो रही है?',
    },
    subtext: {
      en: 'Select the timeline of your symptoms',
      hi: 'समय चुनें कि तकलीफ कब से है',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Just a few hours (< 24 hrs)', hi: 'कुछ ही घंटों से (आज ही)', value: '<24h' },
      { en: '1 to 3 days', hi: '1 से 3 दिनों से', value: '1-3d' },
      { en: '4 to 7 days (about a week)', hi: '4 से 7 दिनों से (लगभग 1 हफ्ता)', value: '4-7d' },
      { en: 'More than 1 week', hi: '1 हफ्ते से अधिक समय से', value: '>1w' },
      { en: 'More than a month (chronic)', hi: '1 महीने या काफी समय से', value: '>1m' },
    ],
  },
  {
    id: 'hpi_onset',
    text: {
      en: 'How did this problem begin?',
      hi: 'यह तकलीफ कैसे शुरू हुई थी?',
    },
    subtext: {
      en: 'Did it strike all of a sudden or develop slowly?',
      hi: 'अचानक एकदम से शुरू हुई या धीरे-धीरे बढ़ी?',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: '⚡ Suddenly (within minutes)', hi: '⚡ अचानक एकदम से शुरू हुई', value: 'sudden' },
      { en: '🌱 Gradually (slowly built up over time)', hi: '🌱 धीरे-धीरे समय के साथ बढ़ी', value: 'gradual' },
    ],
  },
  {
    id: 'hpi_pattern',
    text: {
      en: 'Does the discomfort stay continuously or does it come and go?',
      hi: 'यह तकलीफ लगातार बनी रहती है या बीच-बीच में आती-जाती है?',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Continuous — stays all the time', hi: 'लगातार — हर समय बनी रहती है', value: 'continuous' },
      { en: 'Intermittent — comes and goes in waves', hi: 'रुक-रुक कर — लहर की तरह आती-जाती है', value: 'intermittent' },
      { en: 'Worse when walking or exerting', hi: 'चलने या काम करने पर बढ़ती है', value: 'exertion' },
      { en: 'Worse after eating food', hi: 'खाने के बाद बढ़ती है', value: 'postprandial' },
      { en: 'Worse while resting or at night', hi: 'रात को या लेटने पर बढ़ती है', value: 'night_rest' },
    ],
  },
  {
    id: 'hpi_severity',
    text: {
      en: 'On a scale of 1 to 10, how severe is your pain or distress right now?',
      hi: '1 से 10 के पैमाने पर, आपकी तकलीफ या दर्द कितना तेज है?',
    },
    subtext: {
      en: '1 is very mild discomfort, 10 is unbearable severe agony',
      hi: '1 मतलब बहुत हल्का, 10 मतलब असहनीय बहुत तेज दर्द',
    },
    type: 'scale',
    category: 'hpi',
  },
  {
    id: 'hpi_radiation',
    text: {
      en: 'Does the pain travel or spread anywhere else?',
      hi: 'क्या दर्द अपनी जगह से किसी और हिस्से में फैलता है?',
    },
    subtext: {
      en: 'For example, going towards the left arm, neck, back or jaw',
      hi: 'जैसे बाएं हाथ, गर्दन, जबड़े या पीठ की तरफ जाना',
    },
    type: 'choice',
    category: 'hpi',
    options: [
      { en: 'Left arm / shoulder', hi: 'बायां हाथ या कंधा', value: 'left_arm' },
      { en: 'Right arm / shoulder', hi: 'दायां हाथ या कंधा', value: 'right_arm' },
      { en: 'Jaw, throat or neck', hi: 'जबड़ा, गला या गर्दन', value: 'jaw_neck' },
      { en: 'Upper back / between shoulder blades', hi: 'पीठ के ऊपरी हिस्से में', value: 'back' },
      { en: 'Stomach / abdomen', hi: 'पेट की तरफ', value: 'abdomen' },
      { en: 'No, does not spread anywhere', hi: 'नहीं, कहीं और नहीं फैलता', value: 'none' },
    ],
    redFlagValues: ['left_arm', 'right_arm', 'jaw_neck'],
  },
  {
    id: 'hpi_associated',
    text: {
      en: 'Are you experiencing any of these other feelings alongside?',
      hi: 'क्या इसके साथ आपको इनमें से कोई और लक्षण भी महसूस हो रहे हैं?',
    },
    subtext: {
      en: 'Select all that you feel right now',
      hi: 'जो भी महसूस हो रहा है उसे चुनें (आप एक या अधिक चुन सकते हैं)',
    },
    type: 'multichoice',
    category: 'hpi',
    options: [
      { en: '💦 Cold Sweating', hi: '💦 ठंडा पसीना आना', value: 'sweating' },
      { en: '🫁 Shortness of breath / panting', hi: '🫁 सांस फूलना या सांस लेने में जोर लगना', value: 'breathlessness' },
      { en: '🤢 Nausea or vomiting', hi: '🤢 उल्टी या जी मिचलाना', value: 'nausea' },
      { en: '🌀 Dizziness or feeling faint', hi: '🌀 चक्कर आना या आंखों के आगे अंधेरा', value: 'dizziness' },
      { en: '💓 Fast pounding heart (palpitations)', hi: '💓 दिल की धड़कन बहुत तेज होना', value: 'palpitations' },
      { en: '🌡️ High fever or chills', hi: '🌡️ तेज बुखार या कंपकंपी', value: 'fever' },
      { en: '❌ None of the above', hi: '❌ इनमें से कुछ भी नहीं', value: 'none' },
    ],
  },
  {
    id: 'past_conditions',
    text: {
      en: 'Do you have any existing ongoing medical conditions?',
      hi: 'क्या आपको पहले से इनमें से कोई बीमारी है?',
    },
    subtext: {
      en: 'Select all existing conditions that apply to you',
      hi: 'अगर कोई पुरानी बीमारी है तो चुनें',
    },
    type: 'multichoice',
    category: 'past_history',
    options: [
      { en: 'High Blood Pressure (BP)', hi: 'उच्च रक्तचाप (High BP)', value: 'hypertension' },
      { en: 'Diabetes / Sugar', hi: 'मधुमेह (शुगर / Diabetes)', value: 'diabetes' },
      { en: 'Heart Condition / Previous Stent', hi: 'दिल की बीमारी / पहले स्टेंट लगा हो', value: 'heart_disease' },
      { en: 'Asthma / Breathing issue', hi: 'दमा (अस्थमा) / सांस की पुरानी बीमारी', value: 'asthma' },
      { en: 'Kidney or Liver problem', hi: 'गुर्दे (किडनी) या लिवर की समस्या', value: 'kidney_liver' },
      { en: 'Thyroid disorder', hi: 'थायरॉइड की समस्या', value: 'thyroid' },
      { en: '❌ None / Healthy', hi: '❌ इनमें से कोई बीमारी नहीं है', value: 'none' },
    ],
  },
  {
    id: 'med_current',
    text: {
      en: 'Are you taking any regular medications or daily tablets?',
      hi: 'क्या आप रोज़ाना कोई दवाइयाँ या गोलियां लेते हैं?',
    },
    subtext: {
      en: 'Name any BP, diabetes, blood thinner, or daily tablets',
      hi: 'जैसे BP, शुगर, खून पतला करने की दवा या कोई भी नियमित गोली',
    },
    type: 'text',
    category: 'medications',
  },
  {
    id: 'allergy',
    text: {
      en: 'Do you have any known allergy to any medicine or injection?',
      hi: 'क्या आपको किसी दवा, पेनिसिलिन या इंजेक्शन से कोई एलर्जी है?',
    },
    subtext: {
      en: 'Such as rash, swelling, or breathing difficulty after taking a medicine',
      hi: 'जैसे किसी दवा से दाने, खुजली या सांस में तकलीफ हुई हो',
    },
    type: 'text',
    category: 'allergies',
  },
]
