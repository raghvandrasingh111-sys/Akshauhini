import { useState } from 'react'
import { UserCheck, CreditCard } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function IdentityScreen() {
  const { language, setIdentity, setStep } = useApp()
  const isHi = language === 'hi'

  const [abhaId, setAbhaId] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')

  const handleSubmit = () => {
    if (!name || !age) return
    setIdentity({
      abhaId: abhaId || undefined,
      name,
      age: parseInt(age, 10),
      gender,
    })
    setStep('consent')
  }

  const handleDemo = () => {
    setIdentity({
      abhaId: '91-1234-5678-9012',
      name: 'Demo Patient',
      age: 45,
      gender: 'male',
    })
    setStep('consent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medikiosk-surface via-white to-teal-50 p-6">
      <div className="max-w-xl mx-auto kiosk-card animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="w-8 h-8 text-medikiosk-primary" />
          <h2 className="text-2xl font-bold">
            {isHi ? 'पहचान सत्यापन' : 'Identity Verification'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ABHA ID {isHi ? '(वैकल्पिक)' : '(Optional)'}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medikiosk-muted" />
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="91-XXXX-XXXX-XXXX"
                className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isHi ? 'पूरा नाम' : 'Full Name'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isHi ? 'उम्र' : 'Age'} *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
                className="w-full px-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isHi ? 'लिंग' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="w-full px-4 py-4 rounded-xl border-2 border-medikiosk-border focus:border-medikiosk-primary focus:outline-none text-lg bg-white"
              >
                <option value="male">{isHi ? 'पुरुष' : 'Male'}</option>
                <option value="female">{isHi ? 'महिला' : 'Female'}</option>
                <option value="other">{isHi ? 'अन्य' : 'Other'}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={handleSubmit}
            disabled={!name || !age}
            className="kiosk-btn-primary w-full"
          >
            {isHi ? 'आगे बढ़ें' : 'Continue'}
          </button>
          <button onClick={handleDemo} className="kiosk-btn-secondary w-full">
            {isHi ? '🎤 डेमो मोड (जज के लिए)' : '🎤 Demo Mode (For Judges)'}
          </button>
          <button onClick={() => setStep('welcome')} className="text-medikiosk-muted py-2">
            ← {isHi ? 'वापस' : 'Back'}
          </button>
        </div>
      </div>
    </div>
  )
}
