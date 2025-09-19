export interface BiometricAuthConfig {
  id: string
  type: 'fingerprint' | 'face' | 'voice' | 'hardware_key'
  isAvailable: boolean
  isEnabled: boolean
  enrolledAt?: Date
  lastUsed?: Date
  trustLevel: 'low' | 'medium' | 'high'
  deviceInfo: {
    model: string
    os: string
    version: string
    secureElement: boolean
  }
}

export interface BiometricAuthResult {
  success: boolean
  type: BiometricAuthConfig['type']
  confidence: number
  timestamp: Date
  deviceId: string
  error?: {
    code: string
    message: string
    canRetry: boolean
    fallbackOptions: string[]
  }
}

export interface BiometricEnrollment {
  id: string
  userId: string
  companyId: string
  biometricType: BiometricAuthConfig['type']
  templateHash: string
  publicKey: string
  enrollmentDate: Date
  expiryDate?: Date
  isActive: boolean
  metadata: {
    deviceFingerprint: string
    enrollmentQuality: number
    securityLevel: string
  }
}

export interface BiometricPolicy {
  id: string
  companyId: string
  name: string
  requiredMethods: BiometricAuthConfig['type'][]
  minimumTrustLevel: BiometricAuthConfig['trustLevel']
  allowFallback: boolean
  fallbackMethods: string[]
  sessionTimeout: number
  maxRetryAttempts: number
  requireLivenessDetection: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BiometricAuditLog {
  id: string
  userId: string
  companyId: string
  sessionId: string
  eventType: 'enrollment' | 'authentication' | 'failure' | 'policy_change'
  biometricType: BiometricAuthConfig['type']
  result: 'success' | 'failure' | 'blocked'
  deviceInfo: {
    deviceId: string
    userAgent: string
    ipAddress: string
    location?: string
  }
  metadata: {
    confidence?: number
    failureReason?: string
    policyId?: string
    riskScore: number
  }
  timestamp: Date
}

export interface HardwareSecurityKey {
  id: string
  userId: string
  companyId: string
  keyId: string
  publicKey: string
  keyType: 'yubikey' | 'fido2' | 'u2f'
  name: string
  isActive: boolean
  lastUsed?: Date
  registeredAt: Date
  metadata: {
    manufacturer: string
    model: string
    firmwareVersion: string
    attestation: string
  }
}

export interface BiometricSession {
  id: string
  userId: string
  companyId: string
  authenticationType: BiometricAuthConfig['type']
  deviceId: string
  sessionToken: string
  expiresAt: Date
  trustScore: number
  riskAssessment: {
    deviceTrust: number
    locationTrust: number
    behaviorTrust: number
    overallRisk: 'low' | 'medium' | 'high'
  }
  createdAt: Date
}

export interface DeviceTrust {
  deviceId: string
  userId: string
  companyId: string
  trustLevel: 'untrusted' | 'basic' | 'trusted' | 'highly_trusted'
  isCompanyManaged: boolean
  enrollmentDate: Date
  lastVerification: Date
  securityFeatures: {
    hasSecureEnclave: boolean
    hasBiometrics: boolean
    hasScreenLock: boolean
    isJailbroken: boolean
    osVersion: string
  }
  riskFactors: string[]
}