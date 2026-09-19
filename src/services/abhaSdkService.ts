/**
 * ABDM ABHA SDK Service
 * Implementation based on https://github.com/Technoculture/ABDM-ABHA-SDK
 * Official API Base: https://healthidsbx.abdm.gov.in/api/v1
 */

export type AbhaAuthMethod = 'AADHAAR_OTP' | 'MOBILE_OTP'

export interface AuthInitRequest {
  authMethod: AbhaAuthMethod
  healthid: string
}

export interface AuthInitResponse {
  txnId: string
}

export interface ConfirmOtpRequest {
  otp: string
  txnId: string
}

export interface ConfirmOtpResponse {
  token: string
  txnId?: string
}

export interface ResendOtpRequest {
  authMethod: AbhaAuthMethod
  txnId: string
}

export interface AbhaAccountProfile {
  healthId?: string
  healthIdNumber?: string
  name: string
  firstName?: string
  middleName?: string
  lastName?: string
  gender: 'M' | 'F' | 'O' | string
  yearOfBirth: string
  monthOfBirth?: string
  dayOfBirth?: string
  address?: string
  districtCode?: string
  districtName?: string
  stateCode?: string
  stateName?: string
  pincode?: string
  mobile?: string
  email?: string
  profilePhoto?: string
  kycPhoto?: string
  kycVerified?: boolean
  verificationStatus?: string
  verificationType?: string
  authMethods?: string[]
  phrAddress?: string[]
  qrCode?: string
}

export interface GenerateAadhaarOtpRequest {
  aadhaar: string
}

export interface VerifyAadhaarOtpRequest {
  otp: string
  txnId: string
}

export interface AbhaSdkConfig {
  baseUrl: string
  clientId?: string
  useSimulation: boolean
}

// Default Configuration matching OpenAPI spec
export const DEFAULT_ABHA_CONFIG: AbhaSdkConfig = {
  baseUrl: 'https://healthidsbx.abdm.gov.in/api/v1',
  useSimulation: true, // Default to true in client browser to prevent CORS/auth failures while demonstrating full flow
}

// Realistic Sandbox Mock Database matching real ABDM ABHA data structures
const SIMULATED_ABHA_DATABASE: Record<string, AbhaAccountProfile> = {
  '91-1234-5678-9012': {
    healthId: 'ramesh.sharma@abdm',
    healthIdNumber: '91-1234-5678-9012',
    name: 'Ramesh Kumar Sharma',
    firstName: 'Ramesh',
    middleName: 'Kumar',
    lastName: 'Sharma',
    gender: 'M',
    yearOfBirth: '1979',
    monthOfBirth: '08',
    dayOfBirth: '14',
    address: 'Plot 42, Malviya Nagar',
    districtName: 'Jaipur',
    stateName: 'Rajasthan',
    pincode: '302017',
    mobile: '9829012345',
    email: 'ramesh.sharma@example.com',
    kycVerified: true,
    verificationStatus: 'VERIFIED',
    verificationType: 'AADHAAR',
    authMethods: ['AADHAAR_OTP', 'MOBILE_OTP'],
  },
  'ramesh.sharma@abdm': {
    healthId: 'ramesh.sharma@abdm',
    healthIdNumber: '91-1234-5678-9012',
    name: 'Ramesh Kumar Sharma',
    firstName: 'Ramesh',
    middleName: 'Kumar',
    lastName: 'Sharma',
    gender: 'M',
    yearOfBirth: '1979',
    monthOfBirth: '08',
    dayOfBirth: '14',
    address: 'Plot 42, Malviya Nagar',
    districtName: 'Jaipur',
    stateName: 'Rajasthan',
    pincode: '302017',
    mobile: '9829012345',
    email: 'ramesh.sharma@example.com',
    kycVerified: true,
    verificationStatus: 'VERIFIED',
    verificationType: 'AADHAAR',
    authMethods: ['AADHAAR_OTP', 'MOBILE_OTP'],
  },
  '91-9876-5432-1098': {
    healthId: 'anita.patel@abdm',
    healthIdNumber: '91-9876-5432-1098',
    name: 'Anita Devi Patel',
    firstName: 'Anita',
    middleName: 'Devi',
    lastName: 'Patel',
    gender: 'F',
    yearOfBirth: '1986',
    monthOfBirth: '03',
    dayOfBirth: '22',
    address: 'B-204, Shivalik Residency, Bodakdev',
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    pincode: '380054',
    mobile: '9712345678',
    email: 'anita.patel@example.com',
    kycVerified: true,
    verificationStatus: 'VERIFIED',
    verificationType: 'AADHAAR',
    authMethods: ['AADHAAR_OTP', 'MOBILE_OTP'],
  },
  'anita.patel@abdm': {
    healthId: 'anita.patel@abdm',
    healthIdNumber: '91-9876-5432-1098',
    name: 'Anita Devi Patel',
    firstName: 'Anita',
    middleName: 'Devi',
    lastName: 'Patel',
    gender: 'F',
    yearOfBirth: '1986',
    monthOfBirth: '03',
    dayOfBirth: '22',
    address: 'B-204, Shivalik Residency, Bodakdev',
    districtName: 'Ahmedabad',
    stateName: 'Gujarat',
    pincode: '380054',
    mobile: '9712345678',
    email: 'anita.patel@example.com',
    kycVerified: true,
    verificationStatus: 'VERIFIED',
    verificationType: 'AADHAAR',
    authMethods: ['AADHAAR_OTP', 'MOBILE_OTP'],
  },
}

// In-memory session store for simulated transactions
interface SimulationSession {
  txnId: string
  healthid: string
  authMethod: AbhaAuthMethod
  expectedOtp: string
  createdAt: number
  profile: AbhaAccountProfile
}

const activeSimulationSessions = new Map<string, SimulationSession>()

export class AbhaApiClient {
  private config: AbhaSdkConfig

  constructor(config: Partial<AbhaSdkConfig> = {}) {
    this.config = { ...DEFAULT_ABHA_CONFIG, ...config }
  }

  public setConfig(config: Partial<AbhaSdkConfig>) {
    this.config = { ...this.config, ...config }
  }

  public getConfig(): AbhaSdkConfig {
    return { ...this.config }
  }

  /**
   * POST /auth/init
   * Initiates authentication using Aadhaar OTP or Mobile OTP
   * Reference: docs/DefaultApi.md#auth_aadhar_init
   */
  public async authInit(req: AuthInitRequest): Promise<AuthInitResponse> {
    const cleanId = req.healthid.trim()

    if (this.config.useSimulation) {
      await new Promise((r) => setTimeout(r, 600)) // Realistic network delay

      const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const expectedOtp = '123456' // Standard sandbox OTP

      // Find or generate profile
      let profile = SIMULATED_ABHA_DATABASE[cleanId]
      if (!profile) {
        // Synthesize realistic profile if a custom ID was entered
        const isNum = /^\d+$/.test(cleanId.replace(/[- ]/g, ''))
        const abhaNum = isNum ? cleanId : `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        const abhaAddr = cleanId.includes('@') ? cleanId : `user.${cleanId.replace(/[^a-zA-Z0-9]/g, '')}@abdm`

        profile = {
          healthId: abhaAddr,
          healthIdNumber: abhaNum,
          name: 'Sunita Devi',
          firstName: 'Sunita',
          lastName: 'Devi',
          gender: 'F',
          yearOfBirth: '1970',
          monthOfBirth: '05',
          dayOfBirth: '10',
          address: 'Ward 12, Subhash Chowk',
          districtName: 'Varanasi',
          stateName: 'Uttar Pradesh',
          pincode: '221001',
          mobile: '9811223344',
          kycVerified: true,
          verificationStatus: 'VERIFIED',
          verificationType: req.authMethod === 'AADHAAR_OTP' ? 'AADHAAR' : 'MOBILE',
        }
      }

      activeSimulationSessions.set(txnId, {
        txnId,
        healthid: cleanId,
        authMethod: req.authMethod,
        expectedOtp,
        createdAt: Date.now(),
        profile,
      })

      return { txnId }
    }

    // Live ABDM API call
    const response = await fetch(`${this.config.baseUrl}/auth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ABDM API Error (${response.status}): ${errorText || response.statusText}`)
    }

    return response.json()
  }

  /**
   * POST /auth/confirmWithAadhaarOtp or POST /auth/confirmWithMobileOtp
   * Validates OTP and returns authenticated session token
   * Reference: docs/DefaultApi.md#confirm_with_aadhaar_otp
   */
  public async confirmOtp(req: ConfirmOtpRequest, method: AbhaAuthMethod = 'AADHAAR_OTP'): Promise<ConfirmOtpResponse> {
    if (this.config.useSimulation) {
      await new Promise((r) => setTimeout(r, 600)) // Realistic network delay

      const session = activeSimulationSessions.get(req.txnId)
      if (!session) {
        throw new Error('Transaction expired or invalid. Please initiate OTP again.')
      }

      // Accept '123456' as universal test OTP, or the session OTP
      if (req.otp !== session.expectedOtp && req.otp !== '123456') {
        throw new Error('Invalid OTP entered. (For testing, use sandbox OTP: 123456)')
      }

      const token = `abdm_token_${session.txnId}_${Date.now()}`
      return { token, txnId: session.txnId }
    }

    const endpoint =
      method === 'AADHAAR_OTP'
        ? `${this.config.baseUrl}/auth/confirmWithAadhaarOtp`
        : `${this.config.baseUrl}/auth/confirmWithMobileOtp`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ABDM OTP Confirmation Failed (${response.status}): ${errorText || response.statusText}`)
    }

    return response.json()
  }

  /**
   * POST /auth/resendAuthOTP
   * Resends OTP for ongoing transaction
   * Reference: docs/DefaultApi.md#resend_auth_otp
   */
  public async resendAuthOtp(req: ResendOtpRequest): Promise<AuthInitResponse> {
    if (this.config.useSimulation) {
      await new Promise((r) => setTimeout(r, 400))
      return { txnId: req.txnId }
    }

    const response = await fetch(`${this.config.baseUrl}/auth/resendAuthOTP`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    if (!response.ok) {
      throw new Error(`Failed to resend OTP: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * GET /account/profile
   * Fetches patient demographic information using Bearer token
   * Reference: docs/DefaultApi.md#get_account_information_using_get
   */
  public async getAccountProfile(token: string): Promise<AbhaAccountProfile> {
    if (this.config.useSimulation) {
      await new Promise((r) => setTimeout(r, 500))

      // Match session from token
      const sessionParts = token.split('_')
      const txnId = sessionParts.slice(2, -1).join('_')
      const session = activeSimulationSessions.get(txnId)

      const profile = session ? session.profile : SIMULATED_ABHA_DATABASE['91-1234-5678-9012']

      return {
        ...profile,
        qrCode: this.generateSimulatedQrSvg(profile.healthIdNumber || '91-1234-5678-9012', profile.name),
      }
    }

    const response = await fetch(`${this.config.baseUrl}/account/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ABHA profile: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * POST /registration/aadhaar/generateOtp
   * Generates Aadhaar registration OTP
   * Reference: docs/DefaultApi.md#generate_otp
   */
  public async generateAadhaarRegistrationOtp(aadhaarNumber: string): Promise<AuthInitResponse> {
    if (this.config.useSimulation) {
      await new Promise((r) => setTimeout(r, 600))
      const txnId = `aadhaar_txn_${Date.now()}`
      activeSimulationSessions.set(txnId, {
        txnId,
        healthid: aadhaarNumber,
        authMethod: 'AADHAAR_OTP',
        expectedOtp: '123456',
        createdAt: Date.now(),
        profile: SIMULATED_ABHA_DATABASE['91-1234-5678-9012'],
      })
      return { txnId }
    }

    const response = await fetch(`${this.config.baseUrl}/registration/aadhaar/generateOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar: aadhaarNumber }),
    })

    if (!response.ok) {
      throw new Error(`Aadhaar OTP Generation failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Helper to generate simulated SVG QR code for ABHA card preview
   */
  private generateSimulatedQrSvg(healthId: string, name: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full" data-healthid="${healthId}" data-name="${name}">
      <rect width="100" height="100" fill="#ffffff"/>
      <rect x="10" y="10" width="24" height="24" fill="#0c4a6e" rx="3"/>
      <rect x="14" y="14" width="16" height="16" fill="#ffffff" rx="2"/>
      <rect x="18" y="18" width="8" height="8" fill="#0284c7"/>
      
      <rect x="66" y="10" width="24" height="24" fill="#0c4a6e" rx="3"/>
      <rect x="70" y="14" width="16" height="16" fill="#ffffff" rx="2"/>
      <rect x="74" y="18" width="8" height="8" fill="#0284c7"/>
      
      <rect x="10" y="66" width="24" height="24" fill="#0c4a6e" rx="3"/>
      <rect x="14" y="70" width="16" height="16" fill="#ffffff" rx="2"/>
      <rect x="18" y="74" width="8" height="8" fill="#0284c7"/>
      
      <rect x="42" y="14" width="6" height="6" fill="#0c4a6e"/>
      <rect x="52" y="18" width="6" height="6" fill="#0284c7"/>
      <rect x="42" y="28" width="6" height="6" fill="#0c4a6e"/>
      <rect x="22" y="42" width="6" height="6" fill="#0284c7"/>
      <rect x="34" y="42" width="8" height="8" fill="#0c4a6e"/>
      <rect x="46" y="44" width="8" height="8" fill="#0369a1"/>
      <rect x="58" y="42" width="6" height="6" fill="#0c4a6e"/>
      <rect x="68" y="44" width="6" height="6" fill="#0284c7"/>
      <rect x="42" y="66" width="6" height="6" fill="#0c4a6e"/>
      <rect x="52" y="72" width="6" height="6" fill="#0284c7"/>
      <rect x="64" y="68" width="8" height="8" fill="#0c4a6e"/>
      <rect x="78" y="78" width="8" height="8" fill="#0284c7"/>
    </svg>`
  }
}

// Export singleton instance
export const abhaSdkService = new AbhaApiClient()

/**
 * Utility: Convert ABHA gender string ('M', 'F', 'O') to internal kiosk gender
 */
export function normalizeAbhaGender(gender?: string): 'male' | 'female' | 'other' {
  if (!gender) return 'other'
  const g = gender.toUpperCase().trim()
  if (g === 'M' || g === 'MALE') return 'male'
  if (g === 'F' || g === 'FEMALE') return 'female'
  return 'other'
}

/**
 * Utility: Calculate age from Year of Birth or DOB string
 */
export function calculateAgeFromDob(yearOfBirth?: string, monthOfBirth?: string, dayOfBirth?: string): number {
  const currentYear = new Date().getFullYear()
  if (yearOfBirth) {
    const y = parseInt(yearOfBirth, 10)
    if (!isNaN(y) && y > 1900 && y <= currentYear) {
      if (monthOfBirth && dayOfBirth) {
        const m = parseInt(monthOfBirth, 10) - 1
        const d = parseInt(dayOfBirth, 10)
        const now = new Date()
        let age = now.getFullYear() - y
        if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) {
          age--
        }
        return age > 0 ? age : 0
      }
      return currentYear - y
    }
  }
  return 35 // fallback default
}
