import type { InterviewQuestion, Language } from './types'

export const LANGUAGE_LOCALES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
}

type TranslationKey =
  | 'brand.tagline'
  | 'welcome.title'
  | 'welcome.subtitle'
  | 'welcome.chooseLanguage'
  | 'welcome.continue'
  | 'identity.title'
  | 'identity.abhaTab'
  | 'identity.manualTab'
  | 'identity.patientInfo'
  | 'identity.fullName'
  | 'identity.age'
  | 'identity.gender'
  | 'identity.male'
  | 'identity.female'
  | 'identity.other'
  | 'identity.proceed'
  | 'identity.back'
  | 'consent.title'
  | 'consent.listen'
  | 'consent.continue'
  | 'back'
  | 'mode.title'
  | 'mode.subtitle'
  | 'mode.allopathic'
  | 'mode.ayush'
  | 'mode.allopathicDetail'
  | 'mode.ayushDetail'
  | 'mode.back'
  | 'interview.progress'
  | 'interview.question'
  | 'interview.confirm'
  | 'interview.yes'
  | 'interview.no'
  | 'interview.type'
  | 'interview.voiceUnavailable'
  | 'interview.skip'
  | 'documents.title'
  | 'documents.subtitle'
  | 'documents.extracted'
  | 'documents.scan'
  | 'documents.processing'
  | 'documents.confidence'
  | 'documents.abnormal'
  | 'documents.finish'
  | 'documents.back'
  | 'documents.lab'
  | 'documents.prescription'
  | 'documents.discharge'
  | 'summary.complete'
  | 'summary.thankYou'
  | 'summary.sent'
  | 'summary.emergency'
  | 'summary.listen'
  | 'summary.done'
  | 'summary.newPatient'
  | 'summary.synced'
  | 'summary.offline'
  | 'summary.syncing'

const translations: Record<TranslationKey, Record<Language, string>> = {
  'brand.tagline': { en: 'AI-Powered Digital Clinical Intake Platform', hi: 'AI-संचालित डिजिटल क्लिनिकल इनटेक', ta: 'AI மூலம் இயக்கப்படும் டிஜிட்டல் மருத்துவ பதிவு', te: 'AI ఆధారిత డిజిటల్ క్లినికల్ నమోదు', bn: 'AI-চালিত ডিজিটাল ক্লিনিক্যাল ইনটেক' },
  'welcome.title': { en: 'Welcome', hi: 'स्वागत है', ta: 'வரவேற்கிறோம்', te: 'స్వాగతం', bn: 'স্বাগতম' },
  'welcome.subtitle': { en: 'Select your language to begin intake', hi: 'अपनी भाषा चुनें और शुरू करें', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுத்து தொடங்குங்கள்', te: 'మీ భాషను ఎంచుకుని ప్రారంభించండి', bn: 'আপনার ভাষা বেছে নিয়ে শুরু করুন' },
  'welcome.chooseLanguage': { en: 'Choose Language', hi: 'भाषा चुनें', ta: 'மொழியைத் தேர்ந்தெடுக்கவும்', te: 'భాషను ఎంచుకోండి', bn: 'ভাষা বেছে নিন' },
  'welcome.continue': { en: 'Continue →', hi: 'आगे बढ़ें →', ta: 'தொடரவும் →', te: 'కొనసాగించండి →', bn: 'এগিয়ে যান →' },
  'identity.title': { en: 'Patient Identity & Verification', hi: 'रोगी पहचान सत्यापन', ta: 'நோயாளி அடையாளம் மற்றும் சரிபார்ப்பு', te: 'రోగి గుర్తింపు మరియు ధృవీకరణ', bn: 'রোগীর পরিচয় ও যাচাই' },
  'identity.abhaTab': { en: 'ABDM ABHA Verification', hi: 'ABHA से सत्यापन', ta: 'ABDM ABHA சரிபார்ப்பு', te: 'ABDM ABHA ధృవీకరణ', bn: 'ABDM ABHA যাচাই' },
  'identity.manualTab': { en: 'Manual Entry (No ABHA)', hi: 'मैन्युअल प्रविष्टि', ta: 'கைமுறை பதிவு', te: 'మాన్యువల్ నమోదు', bn: 'ম্যানুয়াল এন্ট্রি' },
  'identity.patientInfo': { en: 'Patient Information', hi: 'रोगी की व्यक्तिगत जानकारी', ta: 'நோயாளர் தகவல்', te: 'రోగి సమాచారం', bn: 'রোগীর তথ্য' },
  'identity.fullName': { en: 'Full Name', hi: 'पूरा नाम', ta: 'முழுப் பெயர்', te: 'పూర్తి పేరు', bn: 'পুরো নাম' },
  'identity.age': { en: 'Age (Years)', hi: 'उम्र (वर्ष)', ta: 'வயது (ஆண்டுகள்)', te: 'వయస్సు (సంవత్సరాలు)', bn: 'বয়স (বছর)' },
  'identity.gender': { en: 'Gender', hi: 'लिंग', ta: 'பாலினம்', te: 'లింగం', bn: 'লিঙ্গ' },
  'identity.male': { en: 'Male', hi: 'पुरुष', ta: 'ஆண்', te: 'పురుషుడు', bn: 'পুরুষ' },
  'identity.female': { en: 'Female', hi: 'महिला', ta: 'பெண்', te: 'స్త్రీ', bn: 'মহিলা' },
  'identity.other': { en: 'Other', hi: 'अन्य', ta: 'மற்றவை', te: 'ఇతరులు', bn: 'অন্যান্য' },
  'identity.proceed': { en: 'Proceed to Consent Screen', hi: 'सहमति स्क्रीन पर आगे बढ़ें', ta: 'ஒப்புதல் திரைக்குச் செல்லவும்', te: 'సమ్మతి స్క్రీన్‌కు వెళ్లండి', bn: 'সম্মতি স্ক্রিনে যান' },
  'identity.back': { en: 'Back to Welcome Screen', hi: 'प्रारंभिक स्क्रीन पर वापस जाएं', ta: 'வரவேற்புத் திரைக்குத் திரும்பு', te: 'స్వాగత స్క్రీన్‌కు తిరిగి వెళ్ళండి', bn: 'স্বাগত স্ক্রিনে ফিরে যান' },
  'consent.title': { en: 'Consent & Privacy', hi: 'सहमति और गोपनीयता', ta: 'ஒப்புதல் மற்றும் தனியுரிமை', te: 'సమ్మతి మరియు గోప్యత', bn: 'সম্মতি ও গোপনীয়তা' },
  'consent.listen': { en: 'Listen to Consent (Audio)', hi: 'ऑडियो में सुनें', ta: 'ஒப்புதலைக் கேளுங்கள்', te: 'సమ్మతిని వినండి', bn: 'সম্মতি শুনুন' },
  'consent.continue': { en: 'Grant Consent & Continue', hi: 'सहमति दें और जारी रखें', ta: 'ஒப்புதல் அளித்து தொடரவும்', te: 'సమ్మతి ఇచ్చి కొనసాగించండి', bn: 'সম্মতি দিয়ে এগিয়ে যান' },
  back: { en: 'Back', hi: 'वापस', ta: 'பின்செல்', te: 'వెనుకకు', bn: 'পিছনে' },
  'mode.title': { en: 'Select History Mode', hi: 'इतिहास मोड चुनें', ta: 'வரலாறு முறையைத் தேர்ந்தெடுக்கவும்', te: 'చరిత్ర మోడ్‌ను ఎంచుకోండి', bn: 'ইতিহাসের মোড বেছে নিন' },
  'mode.subtitle': { en: 'Choose your treatment system for specialized intake', hi: 'अपनी उपचार प्रणाली चुनें', ta: 'சிறப்பு பதிவுக்கான சிகிச்சை முறையைத் தேர்ந்தெடுக்கவும்', te: 'ప్రత్యేక నమోదు కోసం చికిత్స విధానాన్ని ఎంచుకోండి', bn: 'বিশেষ ইনটেকের জন্য চিকিৎসা পদ্ধতি বেছে নিন' },
  'mode.allopathic': { en: 'Allopathic', hi: 'एलोपैथिक', ta: 'அலோபதி', te: 'అల్లోపతి', bn: 'অ্যালোপ্যাথিক' },
  'mode.ayush': { en: 'AYUSH (Ayurveda)', hi: 'आयुष (आयुर्वेद)', ta: 'AYUSH (ஆயுர்வேதம்)', te: 'AYUSH (ఆయుర్వేదం)', bn: 'AYUSH (আয়ুর্বেদ)' },
  'mode.allopathicDetail': { en: 'SOCRATES · ROS · HPI', hi: 'SOCRATES · ROS · HPI', ta: 'SOCRATES · ROS · HPI', te: 'SOCRATES · ROS · HPI', bn: 'SOCRATES · ROS · HPI' },
  'mode.ayushDetail': { en: 'Dashavidha Pariksha · Prakriti · Agni', hi: 'दशविध परीक्षा · प्रकृति · अग्नि', ta: 'தசவித பரீட்சை · பிரகிருதி · அக்னி', te: 'దశవిధ పరీక్ష · ప్రకృతి · అగ్ని', bn: 'দশবিধ পরীক্ষা · প্রকৃতি · অগ্নি' },
  'mode.back': { en: 'Back', hi: 'वापस', ta: 'பின்செல்', te: 'వెనుకకు', bn: 'পিছনে' },
  'interview.progress': { en: 'Interview Progress', hi: 'साक्षात्कार प्रगति', ta: 'நேர்காணல் முன்னேற்றம்', te: 'ఇంటర్వ్యూ పురోగతి', bn: 'ইন্টারভিউ অগ্রগতি' },
  'interview.question': { en: 'Question', hi: 'प्रश्न', ta: 'கேள்வி', te: 'ప్రశ్న', bn: 'প্রশ্ন' },
  'interview.confirm': { en: 'Confirm & Continue', hi: 'चुनें और आगे बढ़ें', ta: 'உறுதிசெய்து தொடரவும்', te: 'నిర్ధారించి కొనసాగించండి', bn: 'নিশ্চিত করে এগিয়ে যান' },
  'interview.yes': { en: 'Yes', hi: 'हाँ', ta: 'ஆம்', te: 'అవును', bn: 'হ্যাঁ' },
  'interview.no': { en: 'No', hi: 'नहीं', ta: 'இல்லை', te: 'కాదు', bn: 'না' },
  'interview.type': { en: 'Type or speak here…', hi: 'यहाँ टाइप करें या बोलें…', ta: 'இங்கே தட்டச்சு செய்யவும் அல்லது பேசவும்…', te: 'ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి…', bn: 'এখানে টাইপ করুন বা বলুন…' },
  'interview.voiceUnavailable': { en: 'Voice not available — use touch mode', hi: 'आवाज़ पहचान उपलब्ध नहीं — टच मोड उपयोग करें', ta: 'குரல் வசதி இல்லை — தொடு முறையைப் பயன்படுத்தவும்', te: 'వాయిస్ అందుబాటులో లేదు — టచ్ మోడ్ ఉపయోగించండి', bn: 'ভয়েস পাওয়া যাচ্ছে না — টাচ মোড ব্যবহার করুন' },
  'interview.skip': { en: 'Skip to Document Scan', hi: 'दस्तावेज़ स्कैन पर जाएं', ta: 'ஆவண ஸ்கேனுக்குச் செல்லவும்', te: 'డాక్యుమెంట్ స్కాన్‌కు వెళ్లండి', bn: 'ডকুমেন্ট স্ক্যানে যান' },
  'documents.title': { en: 'Medical Document Scan', hi: 'चिकित्सा दस्तावेज़ स्कैन', ta: 'மருத்துவ ஆவண ஸ்கேன்', te: 'వైద్య పత్రాల స్కాన్', bn: 'চিকিৎসা নথি স্ক্যান' },
  'documents.subtitle': { en: 'Scan old prescriptions, lab reports & discharge summaries', hi: 'पुरानी प्रिस्क्रिप्शन, लैब रिपोर्ट स्कैन करें', ta: 'பழைய மருந்துச் சீட்டுகள் மற்றும் ஆய்வறிக்கைகளை ஸ்கேன் செய்யவும்', te: 'పాత ప్రిస్క్రిప్షన్లు మరియు ల్యాబ్ నివేదికలను స్కాన్ చేయండి', bn: 'পুরনো প্রেসক্রিপশন ও ল্যাব রিপোর্ট স্ক্যান করুন' },
  'documents.extracted': { en: 'Extracted Clinical Data', hi: 'निकाली गई जानकारी', ta: 'பெறப்பட்ட மருத்துவத் தரவு', te: 'సేకరించిన క్లినికల్ డేటా', bn: 'সংগৃহীত ক্লিনিক্যাল ডেটা' },
  'documents.scan': { en: 'Tap to Scan', hi: 'स्कैन करें', ta: 'ஸ்கேன் செய்யவும்', te: 'స్కాన్ చేయండి', bn: 'স্ক্যান করুন' },
  'documents.processing': { en: 'Processing OCR…', hi: 'OCR प्रसंस्करण…', ta: 'OCR செயலாக்கம்…', te: 'OCR ప్రాసెసింగ్…', bn: 'OCR প্রক্রিয়াকরণ…' },
  'documents.confidence': { en: 'confidence', hi: 'विश्वास', ta: 'நம்பகத்தன்மை', te: 'నమ్మకం', bn: 'বিশ্বাসযোগ্যতা' },
  'documents.abnormal': { en: 'Abnormal Lab Values Flagged', hi: 'असामान्य लैब मान', ta: 'அசாதாரண ஆய்வக மதிப்புகள்', te: 'అసాధారణ ల్యాబ్ విలువలు', bn: 'অস্বাভাবিক ল্যাব মান' },
  'documents.finish': { en: 'Generate Summary & Send to EMR', hi: 'सारांश बनाएं और EMR भेजें', ta: 'சுருக்கத்தை உருவாக்கி EMR-க்கு அனுப்பவும்', te: 'సారాంశాన్ని రూపొందించి EMRకు పంపండి', bn: 'সারাংশ তৈরি করে EMR-এ পাঠান' },
  'documents.back': { en: 'Back to Interview', hi: 'साक्षात्कार पर वापस', ta: 'நேர்காணலுக்குத் திரும்பு', te: 'ఇంటర్వ్యూకు తిరిగి వెళ్ళండి', bn: 'ইন্টারভিউতে ফিরে যান' },
  'documents.lab': { en: 'Lab Report', hi: 'लैब रिपोर्ट', ta: 'ஆய்வக அறிக்கை', te: 'ల్యాబ్ నివేదిక', bn: 'ল্যাব রিপোর্ট' },
  'documents.prescription': { en: 'Prescription', hi: 'प्रिस्क्रिप्शन', ta: 'மருந்துச் சீட்டு', te: 'ప్రిస్క్రిప్షన్', bn: 'প্রেসক্রিপশন' },
  'documents.discharge': { en: 'Discharge Summary', hi: 'डिस्चार्ज सारांश', ta: 'வெளியேற்ற சுருக்கம்', te: 'డిశ్చార్జ్ సారాంశం', bn: 'ছাড়পত্রের সারাংশ' },
  'summary.complete': { en: 'Intake Complete', hi: 'इनटेक पूर्ण', ta: 'பதிவு முடிந்தது', te: 'నమోదు పూర్తయింది', bn: 'ইনটেক সম্পূর্ণ' },
  'summary.thankYou': { en: 'Thank You!', hi: 'धन्यवाद!', ta: 'நன்றி!', te: 'ధన్యవాదాలు!', bn: 'ধন্যবাদ!' },
  'summary.sent': { en: 'Summary sent to physician dashboard', hi: 'डॉक्टर को सारांश भेज दिया गया', ta: 'சுருக்கம் மருத்துவர் டாஷ்போர்டுக்கு அனுப்பப்பட்டது', te: 'సారాంశం వైద్యుడి డాష్‌బోర్డ్‌కు పంపబడింది', bn: 'সারাংশ চিকিৎসকের ড্যাশবোর্ডে পাঠানো হয়েছে' },
  'summary.emergency': { en: 'Routed to Emergency Triage', hi: 'आपातकालीन ट्राइएज में भेजा गया', ta: 'அவசர சிகிச்சை பிரிவுக்கு அனுப்பப்பட்டது', te: 'అత్యవసర ట్రయాజ్‌కు పంపబడింది', bn: 'জরুরি ট্রায়াজে পাঠানো হয়েছে' },
  'summary.listen': { en: 'Listen to Audio Confirmation', hi: 'ऑडियो पुष्टि सुनें', ta: 'ஆடியோ உறுதிப்படுத்தலைக் கேளுங்கள்', te: 'ఆడియో నిర్ధారణను వినండి', bn: 'অডিও নিশ্চিতকরণ শুনুন' },
  'summary.done': { en: 'Done — Proceed to Waiting Area', hi: 'पूर्ण — प्रतीक्षा क्षेत्र में जाएं', ta: 'முடிந்தது — காத்திருப்பு பகுதிக்குச் செல்லவும்', te: 'పూర్తయింది — వేచి ఉండే ప్రాంతానికి వెళ్లండి', bn: 'সম্পন্ন — অপেক্ষা এলাকায় যান' },
  'summary.newPatient': { en: 'Start New Patient', hi: 'नया रोगी शुरू करें', ta: 'புதிய நோயாளியைத் தொடங்கவும்', te: 'కొత్త రోగిని ప్రారంభించండి', bn: 'নতুন রোগী শুরু করুন' },
  'summary.synced': { en: 'Synced to cloud', hi: 'क्लाउड में सुरक्षित', ta: 'கிளவுடில் சேமிக்கப்பட்டது', te: 'క్లౌడ్‌కు సమకాలీకరించబడింది', bn: 'ক্লাউডে সিঙ্ক হয়েছে' },
  'summary.offline': { en: 'Offline — saved locally', hi: 'ऑफलाइन — स्थानीय रूप से सहेजा', ta: 'ஆஃப்லைன் — உள்ளூரில் சேமிக்கப்பட்டது', te: 'ఆఫ్‌లైన్ — స్థానికంగా సేవ్ చేయబడింది', bn: 'অফলাইন — স্থানীয়ভাবে সংরক্ষিত' },
  'summary.syncing': { en: 'Syncing to cloud…', hi: 'क्लाउड में सहेज रहे हैं…', ta: 'கிளவுடில் சேமிக்கப்படுகிறது…', te: 'క్లౌడ్‌కు సమకాలీకరిస్తోంది…', bn: 'ক্লাউডে সিঙ্ক হচ্ছে…' },
}

export function t(language: Language, key: TranslationKey): string {
  return translations[key][language]
}

const consentTranslations: Record<number, Record<Language, string>> = {
  0: { en: 'I consent to AI-assisted clinical history collection for this OPD visit.', hi: 'मैं इस OPD विज़िट के लिए AI-सहायता प्राप्त नैदानिक इतिहास संग्रह के लिए सहमति देता/देती हूँ।', ta: 'இந்த OPD வருகைக்கான AI உதவியுடன் மருத்துவ வரலாறு சேகரிப்புக்கு நான் ஒப்புக்கொள்கிறேன்.', te: 'ఈ OPD సందర్శన కోసం AI సహాయంతో క్లినికల్ చరిత్ర సేకరణకు నేను సమ్మతిస్తున్నాను.', bn: 'এই OPD ভিজিটের জন্য AI-সহায়তায় ক্লিনিক্যাল ইতিহাস সংগ্রহে আমি সম্মতি দিচ্ছি।' },
  1: { en: 'I understand this is NOT a diagnosis — a doctor will review all information.', hi: 'मैं समझता/समझती हूँ कि यह निदान नहीं है — डॉक्टर सभी जानकारी की समीक्षा करेंगे।', ta: 'இது நோயறிதல் அல்ல, மருத்துவர் அனைத்து தகவல்களையும் பரிசீலிப்பார் என்பதை புரிந்துகொள்கிறேன்.', te: 'ఇది నిర్ధారణ కాదని, వైద్యుడు మొత్తం సమాచారాన్ని సమీక్షిస్తారని నేను అర్థం చేసుకున్నాను.', bn: 'আমি বুঝি এটি রোগ নির্ণয় নয়, একজন চিকিৎসক সব তথ্য পর্যালোচনা করবেন।' },
  2: { en: 'I consent to temporary processing of voice/audio data, erased after summary submission.', hi: 'मैं सारांश जमा होने के बाद मिटाए जाने वाले अस्थायी आवाज/ऑडियो डेटा प्रसंस्करण के लिए सहमति देता/देती हूँ।', ta: 'சுருக்கம் சமர்ப்பித்த பிறகு அழிக்கப்படும் குரல்/ஆடியோ தரவை தற்காலிகமாக செயலாக்க ஒப்புக்கொள்கிறேன்.', te: 'సారాంశం సమర్పించిన తర్వాత తొలగించబడే వాయిస్/ఆడియో డేటా తాత్కాలిక ప్రాసెసింగ్‌కు సమ్మతిస్తున్నాను.', bn: 'সারাংশ জমা দেওয়ার পরে মুছে ফেলা হবে এমন ভয়েস/অডিও ডেটা সাময়িকভাবে প্রক্রিয়াকরণে আমি সম্মতি দিচ্ছি।' },
  3: { en: 'I consent to FHIR-standard data transmission to the hospital EMR system.', hi: 'मैं अस्पताल EMR प्रणाली में FHIR-मानक डेटा प्रसारण के लिए सहमति देता/देती हूँ।', ta: 'மருத்துவமனை EMR அமைப்புக்கு FHIR தரநிலையிலான தரவு பரிமாற்றத்திற்கு ஒப்புக்கொள்கிறேன்.', te: 'ఆసుపత్రి EMR వ్యవస్థకు FHIR ప్రమాణ డేటా ప్రసారానికి సమ్మతిస్తున్నాను.', bn: 'হাসপাতালের EMR সিস্টেমে FHIR-মানের ডেটা পাঠাতে আমি সম্মতি দিচ্ছি।' },
  4: { en: 'I consent to link this clinical intake to my ABDM ABHA digital health record (HIP/HIU).', hi: 'मैं इस नैदानिक इनटेक को अपने ABDM ABHA डिजिटल स्वास्थ्य रिकॉर्ड (HIP/HIU) से जोड़ने की सहमति देता/देती हूँ।', ta: 'இந்த மருத்துவ பதிவை எனது ABDM ABHA டிஜிட்டல் சுகாதார பதிவுடன் இணைக்க ஒப்புக்கொள்கிறேன்.', te: 'ఈ క్లినికల్ నమోదును నా ABDM ABHA డిజిటల్ ఆరోగ్య రికార్డుతో అనుసంధానించడానికి సమ్మతిస్తున్నాను.', bn: 'এই ক্লিনিক্যাল ইনটেককে আমার ABDM ABHA ডিজিটাল স্বাস্থ্য রেকর্ডের সঙ্গে যুক্ত করতে আমি সম্মতি দিচ্ছি।' },
}

export function getConsentText(index: number, language: Language): string {
  return consentTranslations[index][language]
}

const questionTranslations: Partial<Record<string, { text: Record<Language, string>; subtext?: Record<Language, string>; options?: Record<string, Record<Language, string>> }>> = {
  cc_body_area: { text: { en: 'Where are you feeling the trouble or discomfort most?', hi: 'आपको मुख्य परेशानी शरीर के किस हिस्से में हो रही है?', ta: 'உங்களுக்கு அதிகமாக எந்த பகுதியில் தொந்தரவு அல்லது அசௌகரியம் உள்ளது?', te: 'మీకు ఎక్కువగా ఏ భాగంలో ఇబ్బంది లేదా అసౌకర్యం ఉంది?', bn: 'আপনার কোথায় বেশি সমস্যা বা অস্বস্তি হচ্ছে?' }, subtext: { en: 'Tap the main area to help the doctor understand quickly', hi: 'मुख्य हिस्से पर टैप करें ताकि डॉक्टर को तुरंत समझ आए', ta: 'மருத்துவர் விரைவாகப் புரிந்துகொள்ள முக்கிய பகுதியைத் தேர்ந்தெடுக்கவும்', te: 'వైద్యుడు త్వరగా అర్థం చేసుకోవడానికి ప్రధాన భాగాన్ని ఎంచుకోండి', bn: 'চিকিৎসককে দ্রুত বোঝাতে প্রধান অংশটি বেছে নিন' }, options: { chest: { en: '🫀 Chest / Heart', hi: '🫀 सीना / दिल का हिस्सा', ta: '🫀 மார்பு / இதயம்', te: '🫀 ఛాతీ / గుండె', bn: '🫀 বুক / হৃদয়' }, breathing: { en: '🫁 Breathing / Lungs', hi: '🫁 सांस लेने में तकलीफ', ta: '🫁 சுவாசம் / நுரையீரல்', te: '🫁 శ్వాస / ఊపిరితిత్తులు', bn: '🫁 শ্বাস / ফুসফুস' }, abdomen: { en: '🫄 Stomach / Digestion', hi: '🫄 पेट / पाचन / गैस', ta: '🫄 வயிறு / செரிமானம்', te: '🫄 కడుపు / జీర్ణక్రియ', bn: '🫄 পেট / হজম' }, head: { en: '🧠 Head / Dizziness', hi: '🧠 सिर दर्द / चक्कर', ta: '🧠 தலை / தலைச்சுற்றல்', te: '🧠 తల / తల తిరగడం', bn: '🧠 মাথা / মাথা ঘোরা' }, fever: { en: '🌡️ Fever & Body Ache', hi: '🌡️ बुखार व बदन दर्द', ta: '🌡️ காய்ச்சல் மற்றும் உடல்வலி', te: '🌡️ జ్వరం మరియు ఒంటి నొప్పి', bn: '🌡️ জ্বর ও শরীর ব্যথা' }, joints: { en: '🦴 Bones & Joints', hi: '🦴 हड्डियां व जोड़', ta: '🦴 எலும்புகள் மற்றும் மூட்டுகள்', te: '🦴 ఎముకలు మరియు కీళ్ళు', bn: '🦴 হাড় ও জয়েন্ট' }, skin: { en: '🩹 Skin / Rash', hi: '🩹 त्वचा / खुजली / दाने', ta: '🩹 தோல் / தடிப்பு', te: '🩹 చర్మం / దద్దుర్లు', bn: '🩹 ত্বক / ফুসকুড়ি' }, general: { en: '⚡ Other / General Weakness', hi: '⚡ अन्य परेशानी / कमजोरी', ta: '⚡ மற்றவை / பொதுவான பலவீனம்', te: '⚡ ఇతర / సాధారణ బలహీనత', bn: '⚡ অন্যান্য / সাধারণ দুর্বলতা' } } },
  cc_main: { text: { en: 'In your own words, what main problem brought you to the clinic today?', hi: 'अपनी सरल भाषा में बताएं, आज क्या मुख्य तकलीफ हो रही है?', ta: 'உங்கள் சொந்த வார்த்தைகளில், இன்று உங்களை மருத்துவமனைக்கு அழைத்து வந்த முக்கிய பிரச்சனை என்ன?', te: 'మీ మాటల్లో, ఈ రోజు మిమ్మల్ని క్లినిక్‌కు తీసుకువచ్చిన ప్రధాన సమస్య ఏమిటి?', bn: 'নিজের ভাষায় বলুন, আজ কোন প্রধান সমস্যা নিয়ে ক্লিনিকে এসেছেন?' }, subtext: { en: 'You can speak using the microphone or type below', hi: 'आप नीचे माइक का बटन दबाकर बोल भी सकते हैं या टाइप करें', ta: 'மைக்ரோஃபோனைப் பயன்படுத்திப் பேசலாம் அல்லது கீழே தட்டச்சு செய்யலாம்', te: 'మైక్రోఫోన్‌తో మాట్లాడవచ్చు లేదా క్రింద టైప్ చేయవచ్చు', bn: 'মাইক্রোফোন ব্যবহার করে বলুন বা নিচে টাইপ করুন' } },
  hpi_sensation: { text: { en: 'How would you describe the feeling or pain?', hi: 'यह दर्द या परेशानी महसूस कैसी होती है?', ta: 'இந்த வலி அல்லது தொந்தரவை எவ்வாறு விவரிப்பீர்கள்?', te: 'ఈ నొప్పి లేదా ఇబ్బందిని ఎలా వివరిస్తారు?', bn: 'এই ব্যথা বা অস্বস্তি কেমন?' }, options: { pressure: { en: 'Heavy pressure or tightness', hi: 'भारीपन या भारी दबाव', ta: 'கனமான அழுத்தம் அல்லது இறுக்கம்', te: 'భారీ ఒత్తిడి లేదా బిగుతు', bn: 'ভারী চাপ বা টান' }, stabbing: { en: 'Sharp or stabbing pain', hi: 'तेज़ चुभने वाला दर्द', ta: 'கூர்மையான குத்தும் வலி', te: 'తీవ్రమైన గుచ్చే నొప్పి', bn: 'তীক্ষ্ণ বা ছুরিকাঘাতের মতো ব্যথা' }, burning: { en: 'Burning sensation or acidity', hi: 'जलन या खट्टी डकार', ta: 'எரிச்சல் அல்லது அமிலத்தன்மை', te: 'మంట లేదా ఆమ్లత్వం', bn: 'জ্বালা বা অম্লতা' }, dull_ache: { en: 'Dull continuous ache', hi: 'हल्का-हल्का लगातार मीठा दर्द', ta: 'மந்தமான தொடர்ச்சியான வலி', te: 'మందమైన నిరంతర నొప్పి', bn: 'মৃদু অবিরাম ব্যথা' }, throbbing: { en: 'Throbbing or pounding', hi: 'धड़कता हुआ दर्द', ta: 'துடிக்கும் வலி', te: 'దడదడలాడే నొప్పి', bn: 'স্পন্দনশীল ব্যথা' }, cramping: { en: 'Cramping or twisting', hi: 'मरोड़ या ऐंठन', ta: 'பிடிப்பு அல்லது முறுக்கு', te: 'తిమ్మిరి లేదా మెలిక', bn: 'মোচড় বা খিঁচুনি' }, numbness: { en: 'Numbness or tingling', hi: 'सुन्नपन या झुनझुनी', ta: 'உணர்வின்மை அல்லது கூச்சம்', te: 'తిమ్మిరి లేదా జలదరింపు', bn: 'অসাড়তা বা ঝিনঝিনি' } } },
  cc_duration: { text: { en: 'How long have you been having this problem?', hi: 'यह परेशानी आपको कब से हो रही है?', ta: 'இந்த பிரச்சனை எவ்வளவு காலமாக உள்ளது?', te: 'ఈ సమస్య ఎంతకాలంగా ఉంది?', bn: 'এই সমস্যা কতদিন ধরে হচ্ছে?' } },
  hpi_onset: { text: { en: 'How did this problem begin?', hi: 'यह तकलीफ कैसे शुरू हुई थी?', ta: 'இந்த பிரச்சனை எவ்வாறு தொடங்கியது?', te: 'ఈ సమస్య ఎలా ప్రారంభమైంది?', bn: 'এই সমস্যা কীভাবে শুরু হয়েছিল?' } },
  hpi_pattern: { text: { en: 'Does the discomfort stay continuously or does it come and go?', hi: 'यह तकलीफ लगातार बनी रहती है या बीच-बीच में आती-जाती है?', ta: 'தொந்தரவு தொடர்ந்து உள்ளதா அல்லது வந்து போகிறதா?', te: 'ఇబ్బంది నిరంతరంగా ఉంటుందా లేదా వచ్చి పోతుందా?', bn: 'অস্বস্তি কি সবসময় থাকে, নাকি আসে যায়?' } },
  hpi_severity: { text: { en: 'On a scale of 1 to 10, how severe is your pain or distress right now?', hi: '1 से 10 के पैमाने पर, आपकी तकलीफ या दर्द कितना तेज है?', ta: '1 முதல் 10 வரை, இப்போது வலி அல்லது தொந்தரவு எவ்வளவு தீவிரமாக உள்ளது?', te: '1 నుండి 10 వరకు, ఇప్పుడు మీ నొప్పి లేదా ఇబ్బంది ఎంత తీవ్రంగా ఉంది?', bn: '১ থেকে ১০-এর স্কেলে এখন ব্যথা বা অস্বস্তি কতটা?' } },
  hpi_radiation: { text: { en: 'Does the pain travel or spread anywhere else?', hi: 'क्या दर्द अपनी जगह से किसी और हिस्से में फैलता है?', ta: 'வலி வேறு எந்த பகுதிக்கும் பரவுகிறதா?', te: 'నొప్పి మరే ఇతర భాగానికి వ్యాపిస్తుందా?', bn: 'ব্যথা কি অন্য কোথাও ছড়িয়ে পড়ে?' } },
  hpi_associated: { text: { en: 'Are you experiencing any of these other feelings alongside?', hi: 'क्या इसके साथ आपको इनमें से कोई और लक्षण भी महसूस हो रहे हैं?', ta: 'இதனுடன் வேறு ஏதேனும் அறிகுறிகள் உள்ளனவா?', te: 'దీనితో పాటు మరే ఇతర లక్షణాలు ఉన్నాయా?', bn: 'এর সঙ্গে কি অন্য কোনো উপসর্গ আছে?' } },
  past_conditions: { text: { en: 'Do you have any existing ongoing medical conditions?', hi: 'क्या आपको पहले से इनमें से कोई बीमारी है?', ta: 'உங்களுக்கு ஏதேனும் நீண்டகால நோய் உள்ளதா?', te: 'మీకు ఏవైనా కొనసాగుతున్న అనారోగ్యాలు ఉన్నాయా?', bn: 'আপনার কি কোনো চলমান রোগ আছে?' } },
  med_current: { text: { en: 'Are you taking any regular medications or daily tablets?', hi: 'क्या आप रोज़ाना कोई दवाइयाँ या गोलियां लेते हैं?', ta: 'நீங்கள் வழக்கமான மருந்துகள் அல்லது தினசரி மாத்திரைகள் எடுத்துக்கொள்கிறீர்களா?', te: 'మీరు క్రమం తప్పకుండా మందులు లేదా రోజువారీ మాత్రలు తీసుకుంటున్నారా?', bn: 'আপনি কি নিয়মিত ওষুধ বা প্রতিদিনের ট্যাবলেট খান?' } },
  allergy: { text: { en: 'Do you have any known allergy to any medicine or injection?', hi: 'क्या आपको किसी दवा, पेनिसिलिन या इंजेक्शन से कोई एलर्जी है?', ta: 'ஏதேனும் மருந்து அல்லது ஊசிக்கு ஒவ்வாமை உள்ளதா?', te: 'ఏదైనా మందు లేదా ఇంజెక్షన్‌కు అలర్జీ ఉందా?', bn: 'কোনো ওষুধ বা ইনজেকশনে কি অ্যালার্জি আছে?' } },
  ayush_prakriti: { text: { en: 'What is your natural body constitution (Prakriti)?', hi: 'आपकी प्राकृतिक शारीरिक प्रकृति (प्रकृति) क्या है?', ta: 'உங்கள் இயற்கையான உடல் அமைப்பு (பிரகிருதி) என்ன?', te: 'మీ సహజ శరీర స్వభావం (ప్రకృతి) ఏమిటి?', bn: 'আপনার স্বাভাবিক দেহপ্রকৃতি (প্রকৃতি) কী?' } },
  ayush_vikriti: { text: { en: 'What symptoms are you experiencing now (Vikriti)?', hi: 'अभी आप कौन से लक्षण महसूस कर रहे हैं (विकृति)?', ta: 'இப்போது என்ன அறிகுறிகளை அனுபவிக்கிறீர்கள் (விக்ருதி)?', te: 'ఇప్పుడు మీరు ఏ లక్షణాలను అనుభవిస్తున్నారు (వికృతి)?', bn: 'এখন কী উপসর্গ অনুভব করছেন (বিকৃতি)?' } },
  ayush_agni: { text: { en: 'How is your digestion and appetite (Agni)?', hi: 'आपका पाचन और भूख (अग्नि) कैसी है?', ta: 'உங்கள் செரிமானம் மற்றும் பசி (அக்னி) எப்படி உள்ளது?', te: 'మీ జీర్ణక్రియ మరియు ఆకలి (అగ్ని) ఎలా ఉన్నాయి?', bn: 'আপনার হজম ও ক্ষুধা (অগ্নি) কেমন?' } },
  ayush_koshtha: { text: { en: 'How are your bowel movements (Koshtha)?', hi: 'आपका मल त्याग (कोष्ठ) कैसा है?', ta: 'உங்கள் குடல் இயக்கம் (கோஷ்டம்) எப்படி உள்ளது?', te: 'మీ మల విసర్జన (కోష్ఠ) ఎలా ఉంది?', bn: 'আপনার মলত্যাগ (কোষ্ঠ) কেমন?' } },
  ayush_ahara: { text: { en: 'Describe your daily diet and lifestyle (Ahara-Vihara)', hi: 'अपने दैनिक आहार और जीवनशैली (आहार-विहार) का वर्णन करें', ta: 'உங்கள் தினசரி உணவு மற்றும் வாழ்க்கை முறையை விவரிக்கவும்', te: 'మీ రోజువారీ ఆహారం మరియు జీవనశైలిని వివరించండి', bn: 'আপনার দৈনিক খাদ্য ও জীবনযাত্রা বর্ণনা করুন' } },
  ayush_nidra: { text: { en: 'How is your sleep (Nidra)?', hi: 'आपकी नींद (निद्रा) कैसी है?', ta: 'உங்கள் தூக்கம் (நித்ரா) எப்படி உள்ளது?', te: 'మీ నిద్ర (నిద్ర) ఎలా ఉంది?', bn: 'আপনার ঘুম (নিদ্রা) কেমন?' } },
  ayush_satva: { text: { en: 'How is your mental state (Satva)?', hi: 'आपकी मानसिक स्थिति (सत्त्व) कैसी है?', ta: 'உங்கள் மனநிலை (சத்வம்) எப்படி உள்ளது?', te: 'మీ మానసిక స్థితి (సత్వం) ఎలా ఉంది?', bn: 'আপনার মানসিক অবস্থা (সত্ত্ব) কেমন?' } },
}

const commonOptionTranslations: Record<string, Record<Language, string>> = {
  '<24h': { en: 'Just a few hours (< 24 hrs)', hi: 'कुछ ही घंटों से (आज ही)', ta: 'சில மணிநேரங்கள் (< 24 மணி)', te: 'కొన్ని గంటలు (< 24 గంటలు)', bn: 'মাত্র কয়েক ঘণ্টা (< ২৪ ঘণ্টা)' },
  '1-3d': { en: '1 to 3 days', hi: '1 से 3 दिनों से', ta: '1 முதல் 3 நாட்கள்', te: '1 నుండి 3 రోజులు', bn: '১ থেকে ৩ দিন' },
  '4-7d': { en: '4 to 7 days (about a week)', hi: '4 से 7 दिनों से (लगभग 1 हफ्ता)', ta: '4 முதல் 7 நாட்கள்', te: '4 నుండి 7 రోజులు', bn: '৪ থেকে ৭ দিন' },
  '>1w': { en: 'More than 1 week', hi: '1 हफ्ते से अधिक समय से', ta: '1 வாரத்திற்கும் மேலாக', te: '1 వారానికి పైగా', bn: '১ সপ্তাহের বেশি' },
  '>1m': { en: 'More than a month (chronic)', hi: '1 महीने या काफी समय से', ta: '1 மாதத்திற்கும் மேலாக', te: '1 నెలకు పైగా', bn: '১ মাসের বেশি' },
  sudden: { en: 'Suddenly (within minutes)', hi: 'अचानक एकदम से शुरू हुई', ta: 'திடீரென (சில நிமிடங்களில்)', te: 'అకస్మాత్తుగా (నిమిషాల్లో)', bn: 'হঠাৎ (কয়েক মিনিটে)' },
  gradual: { en: 'Gradually (slowly built up over time)', hi: 'धीरे-धीरे समय के साथ बढ़ी', ta: 'படிப்படியாக', te: 'క్రమంగా', bn: 'ধীরে ধীরে' },
  continuous: { en: 'Continuous — stays all the time', hi: 'लगातार — हर समय बनी रहती है', ta: 'தொடர்ந்து — எப்போதும் உள்ளது', te: 'నిరంతరం — ఎప్పుడూ ఉంటుంది', bn: 'অবিরাম — সবসময় থাকে' },
  intermittent: { en: 'Intermittent — comes and goes in waves', hi: 'रुक-रुक कर — लहर की तरह आती-जाती है', ta: 'இடைவிட்டு — வந்து போகும்', te: 'అడపాదడపా — వచ్చి పోతుంది', bn: 'মাঝে মাঝে — আসে যায়' },
  exertion: { en: 'Worse when walking or exerting', hi: 'चलने या काम करने पर बढ़ती है', ta: 'நடக்கும்போது அல்லது உழைக்கும்போது அதிகரிக்கும்', te: 'నడిచినప్పుడు లేదా శ్రమించినప్పుడు పెరుగుతుంది', bn: 'হাঁটলে বা পরিশ্রমে বাড়ে' },
  postprandial: { en: 'Worse after eating food', hi: 'खाने के बाद बढ़ती है', ta: 'சாப்பிட்ட பிறகு அதிகரிக்கும்', te: 'తిన్న తర్వాత పెరుగుతుంది', bn: 'খাওয়ার পরে বাড়ে' },
  night_rest: { en: 'Worse while resting or at night', hi: 'रात को या लेटने पर बढ़ती है', ta: 'ஓய்வில் அல்லது இரவில் அதிகரிக்கும்', te: 'విశ్రాంతిలో లేదా రాత్రి పెరుగుతుంది', bn: 'বিশ্রামে বা রাতে বাড়ে' },
  left_arm: { en: 'Left arm / shoulder', hi: 'बायां हाथ या कंधा', ta: 'இடது கை / தோள்', te: 'ఎడమ చేయి / భుజం', bn: 'বাম হাত / কাঁধ' },
  right_arm: { en: 'Right arm / shoulder', hi: 'दायां हाथ या कंधा', ta: 'வலது கை / தோள்', te: 'కుడి చేయి / భుజం', bn: 'ডান হাত / কাঁধ' },
  jaw_neck: { en: 'Jaw, throat or neck', hi: 'जबड़ा, गला या गर्दन', ta: 'தாடை, தொண்டை அல்லது கழுத்து', te: 'దవడ, గొంతు లేదా మెడ', bn: 'চোয়াল, গলা বা ঘাড়' },
  back: { en: 'Upper back / between shoulder blades', hi: 'पीठ के ऊपरी हिस्से में', ta: 'மேல் முதுகு', te: 'పై వెన్ను', bn: 'উপরের পিঠ' },
  none: { en: 'None of the above', hi: 'इनमें से कुछ भी नहीं', ta: 'மேற்கண்ட எதுவும் இல்லை', te: 'పైవేవీ కాదు', bn: 'উপরের কোনোটিই নয়' },
  sweating: { en: 'Cold Sweating', hi: 'ठंडा पसीना आना', ta: 'குளிர்ந்த வியர்வை', te: 'చల్లని చెమట', bn: 'ঠান্ডা ঘাম' },
  breathlessness: { en: 'Shortness of breath / panting', hi: 'सांस फूलना या सांस लेने में जोर लगना', ta: 'மூச்சுத்திணறல்', te: 'ఊపిరి ఆడకపోవడం', bn: 'শ্বাসকষ্ট' },
  nausea: { en: 'Nausea or vomiting', hi: 'उल्टी या जी मिचलाना', ta: 'குமட்டல் அல்லது வாந்தி', te: 'వికారం లేదా వాంతులు', bn: 'বমি বমি ভাব বা বমি' },
  dizziness: { en: 'Dizziness or feeling faint', hi: 'चक्कर आना या आंखों के आगे अंधेरा', ta: 'தலைச்சுற்றல்', te: 'తల తిరగడం', bn: 'মাথা ঘোরা' },
  palpitations: { en: 'Fast pounding heart (palpitations)', hi: 'दिल की धड़कन बहुत तेज होना', ta: 'வேகமான இதயத் துடிப்பு', te: 'వేగంగా గుండె కొట్టుకోవడం', bn: 'দ্রুত হৃদস্পন্দন' },
  fever: { en: 'High fever or chills', hi: 'तेज बुखार या कंपकंपी', ta: 'அதிக காய்ச்சல் அல்லது குளிர்', te: 'అధిక జ్వరం లేదా చలి', bn: 'উচ্চ জ্বর বা কাঁপুনি' },
  hypertension: { en: 'High Blood Pressure (BP)', hi: 'उच्च रक्तचाप (High BP)', ta: 'உயர் இரத்த அழுத்தம்', te: 'అధిక రక్తపోటు', bn: 'উচ্চ রক্তচাপ' },
  diabetes: { en: 'Diabetes / Sugar', hi: 'मधुमेह (शुगर / Diabetes)', ta: 'நீரிழிவு', te: 'మధుమేహం', bn: 'ডায়াবেটিস' },
  heart_disease: { en: 'Heart Condition / Previous Stent', hi: 'दिल की बीमारी / पहले स्टेंट लगा हो', ta: 'இதய நோய் / ஸ்டென்ட்', te: 'గుండె వ్యాధి / స్టెంట్', bn: 'হৃদরোগ / স্টেন্ট' },
  asthma: { en: 'Asthma / Breathing issue', hi: 'दमा (अस्थमा) / सांस की पुरानी बीमारी', ta: 'ஆஸ்துமா / சுவாசப் பிரச்சனை', te: 'ఆస్తమా / శ్వాస సమస్య', bn: 'অ্যাজমা / শ্বাসের সমস্যা' },
  kidney_liver: { en: 'Kidney or Liver problem', hi: 'गुर्दे (किडनी) या लिवर की समस्या', ta: 'சிறுநீரகம் அல்லது கல்லீரல் பிரச்சனை', te: 'కిడ్నీ లేదా కాలేయ సమస్య', bn: 'কিডনি বা লিভারের সমস্যা' },
  thyroid: { en: 'Thyroid disorder', hi: 'थायरॉइड की समस्या', ta: 'தைராய்டு கோளாறு', te: 'థైరాయిడ్ సమస్య', bn: 'থাইরয়েড সমস্যা' },
  vata: { en: 'Vata (Air/Ether)', hi: 'वात (वायु/आकाश)', ta: 'வாதம்', te: 'వాత', bn: 'বাত' },
  pitta: { en: 'Pitta (Fire/Water)', hi: 'पित्त (अग्नि/जल)', ta: 'பித்தம்', te: 'పిత్త', bn: 'পিত্ত' },
  kapha: { en: 'Kapha (Earth/Water)', hi: 'कफ (पृथ्वी/जल)', ta: 'கபம்', te: 'కఫ', bn: 'কফ' },
  mixed: { en: 'Mixed (Dwandwaja)', hi: 'मिश्र (द्वंद्वज)', ta: 'கலப்பு', te: 'మిశ్రమం', bn: 'মিশ্র' },
  unknown: { en: 'Not sure', hi: 'पता नहीं', ta: 'தெரியவில்லை', te: 'తెలియదు', bn: 'জানি না' },
}

export function localizeQuestion(question: InterviewQuestion, language: Language): InterviewQuestion {
  const translated = questionTranslations[question.id]
  if (!translated) return question
  return {
    ...question,
    text: { ...question.text, [language]: translated.text[language] },
    subtext: question.subtext && translated.subtext ? { ...question.subtext, [language]: translated.subtext[language] } : question.subtext,
    options: question.options?.map((option) => ({
      ...option,
      ...(translated.options?.[option.value] ? { [language]: translated.options[option.value][language] } : {}),
    })),
  }
}

export function getQuestionText(question: InterviewQuestion, language: Language): string {
  const localized = localizeQuestion(question, language) as InterviewQuestion & {
    text: Record<Language, string>
  }
  return localized.text[language] || question.text.en
}

export function getQuestionSubtext(question: InterviewQuestion, language: Language): string | undefined {
  const localized = localizeQuestion(question, language) as InterviewQuestion & {
    subtext?: Record<Language, string>
  }
  return localized.subtext?.[language] || localized.subtext?.en
}

export function getOptionText(question: InterviewQuestion, value: string, language: Language): string {
  const localized = localizeQuestion(question, language) as InterviewQuestion & {
    options?: Array<{ value: string } & Record<Language, string>>
  }
  const option = localized.options?.find((item) => item.value === value) as
    | ({ value: string } & Record<Language, string>)
    | undefined
  return option?.[language] || commonOptionTranslations[value]?.[language] || option?.en || commonOptionTranslations[value]?.en || value
}
