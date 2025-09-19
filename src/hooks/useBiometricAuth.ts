import { useState, useEffect, useCallback } from 'react'
import { BiometricAuthConfig, BiometricAuthResult, BiometricEnrollment, BiometricPolicy, BiometricAuditLog, HardwareSecurityKey, BiometricSession, DeviceTrust } from '@/types/biometric'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export function useBiometricAuth(userId: string, companyId: string) {
  const [isSupported, setIsSupported] = useState(false)
  const [availableMethods, setAvailableMethods] = useState<BiometricAuthConfig[]>([])
  const [enrolledMethods, setEnrolledMethods] = useKV<BiometricEnrollment[]>(`biometric-enrollments-${userId}-${companyId}`, [])
  const [authSession, setAuthSession] = useKV<BiometricSession | null>(`biometric-session-${userId}`, null)
  const [deviceTrust, setDeviceTrust] = useKV<DeviceTrust | null>(`device-trust-${userId}`, null)
  const [biometricPolicy] = useKV<BiometricPolicy | null>(`biometric-policy-${companyId}`, null)
  const [auditLogs, setAuditLogs] = useKV<BiometricAuditLog[]>(`biometric-audit-${userId}-${companyId}`, [])
  const [hardwareKeys, setHardwareKeys] = useKV<HardwareSecurityKey[]>(`hardware-keys-${userId}-${companyId}`, [])
  const [isLoading, setIsLoading] = useState(false)
  const [lastAuthResult, setLastAuthResult] = useState<BiometricAuthResult | null>(null)

  // Ensure arrays are never undefined
  const safeEnrolledMethods = enrolledMethods || []
  const safeAuditLogs = auditLogs || []
  const safeHardwareKeys = hardwareKeys || []

  // Check device capabilities
  const checkBiometricSupport = useCallback(async () => {
    const methods: BiometricAuthConfig[] = []
    const deviceInfo = {
      model: navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Android',
      os: navigator.userAgent.includes('iPhone') ? 'iOS' : 'Android',
      version: '15.0',
      secureElement: true
    }

    // Check for WebAuthn support
    if (window.PublicKeyCredential) {
      // Fingerprint support
      methods.push({
        id: 'fingerprint',
        type: 'fingerprint',
        isAvailable: true,
        isEnabled: false,
        trustLevel: 'high',
        deviceInfo
      })

      // Face ID support (simulated)
      if (navigator.userAgent.includes('iPhone')) {
        methods.push({
          id: 'face',
          type: 'face',
          isAvailable: true,
          isEnabled: false,
          trustLevel: 'high',
          deviceInfo
        })
      }

      // Hardware key support
      methods.push({
        id: 'hardware_key',
        type: 'hardware_key',
        isAvailable: true,
        isEnabled: false,
        trustLevel: 'high',
        deviceInfo
      })
    }

    setAvailableMethods(methods)
    setIsSupported(methods.length > 0)
  }, [])

  // Enroll biometric method
  const enrollBiometric = useCallback(async (type: BiometricAuthConfig['type']): Promise<BiometricAuthResult> => {
    setIsLoading(true)
    
    try {
      // Simulate WebAuthn registration
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32)
        crypto.getRandomValues(challenge)

        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
          challenge,
          rp: {
            name: "ERP System",
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: `user-${userId}`,
            displayName: `User ${userId}`
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: "direct"
        }

        const credential = await navigator.credentials.create({
          publicKey: publicKeyOptions
        }) as PublicKeyCredential

        if (credential) {
          const enrollment: BiometricEnrollment = {
            id: crypto.randomUUID(),
            userId,
            companyId,
            biometricType: type,
            templateHash: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            publicKey: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            enrollmentDate: new Date(),
            isActive: true,
            metadata: {
              deviceFingerprint: navigator.userAgent,
              enrollmentQuality: 95,
              securityLevel: 'high'
            }
          }

          setEnrolledMethods(prev => [...(prev || []), enrollment])
          
          // Log enrollment
          const auditLog: BiometricAuditLog = {
            id: crypto.randomUUID(),
            userId,
            companyId,
            sessionId: crypto.randomUUID(),
            eventType: 'enrollment',
            biometricType: type,
            result: 'success',
            deviceInfo: {
              deviceId: navigator.userAgent,
              userAgent: navigator.userAgent,
              ipAddress: '192.168.1.1'
            },
            metadata: {
              confidence: 95,
              riskScore: 10
            },
            timestamp: new Date()
          }

          setAuditLogs(prev => [auditLog, ...(prev || []).slice(0, 99)])

          const result: BiometricAuthResult = {
            success: true,
            type,
            confidence: 95,
            timestamp: new Date(),
            deviceId: navigator.userAgent
          }

          setLastAuthResult(result)
          toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} biometric enrolled successfully`)
          return result
        }
      }

      throw new Error('Biometric enrollment failed')
    } catch (error) {
      const result: BiometricAuthResult = {
        success: false,
        type,
        confidence: 0,
        timestamp: new Date(),
        deviceId: navigator.userAgent,
        error: {
          code: 'ENROLLMENT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          canRetry: true,
          fallbackOptions: ['password', 'sms']
        }
      }

      setLastAuthResult(result)
      toast.error(`Failed to enroll ${type} biometric`)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [userId, companyId, setEnrolledMethods, setAuditLogs])

  // Authenticate using biometrics
  const authenticateWithBiometric = useCallback(async (type: BiometricAuthConfig['type']): Promise<BiometricAuthResult> => {
    setIsLoading(true)

    try {
      const enrollment = safeEnrolledMethods.find(e => e.biometricType === type && e.isActive)
      if (!enrollment) {
        throw new Error('Biometric not enrolled')
      }

      // Simulate WebAuthn authentication
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32)
        crypto.getRandomValues(challenge)

        const publicKeyOptions: PublicKeyCredentialRequestOptions = {
          challenge,
          timeout: 60000,
          userVerification: "required",
          allowCredentials: [{
            id: new Uint8Array(atob(enrollment.publicKey).split('').map(c => c.charCodeAt(0))),
            type: "public-key"
          }]
        }

        const assertion = await navigator.credentials.get({
          publicKey: publicKeyOptions
        }) as PublicKeyCredential

        if (assertion) {
          // Create biometric session
          const session: BiometricSession = {
            id: crypto.randomUUID(),
            userId,
            companyId,
            authenticationType: type,
            deviceId: navigator.userAgent,
            sessionToken: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
            trustScore: 95,
            riskAssessment: {
              deviceTrust: 90,
              locationTrust: 85,
              behaviorTrust: 95,
              overallRisk: 'low'
            },
            createdAt: new Date()
          }

          setAuthSession(session)

          // Log successful authentication
          const auditLog: BiometricAuditLog = {
            id: crypto.randomUUID(),
            userId,
            companyId,
            sessionId: session.id,
            eventType: 'authentication',
            biometricType: type,
            result: 'success',
            deviceInfo: {
              deviceId: navigator.userAgent,
              userAgent: navigator.userAgent,
              ipAddress: '192.168.1.1'
            },
            metadata: {
              confidence: 95,
              riskScore: 10
            },
            timestamp: new Date()
          }

          setAuditLogs(prev => [auditLog, ...(prev || []).slice(0, 99)])

          const result: BiometricAuthResult = {
            success: true,
            type,
            confidence: 95,
            timestamp: new Date(),
            deviceId: navigator.userAgent
          }

          setLastAuthResult(result)
          toast.success(`Authenticated with ${type}`)
          return result
        }
      }

      throw new Error('Authentication failed')
    } catch (error) {
      // Log failed authentication
      const auditLog: BiometricAuditLog = {
        id: crypto.randomUUID(),
        userId,
        companyId,
        sessionId: crypto.randomUUID(),
        eventType: 'failure',
        biometricType: type,
        result: 'failure',
        deviceInfo: {
          deviceId: navigator.userAgent,
          userAgent: navigator.userAgent,
          ipAddress: '192.168.1.1'
        },
        metadata: {
          failureReason: error instanceof Error ? error.message : 'Unknown error',
          riskScore: 80
        },
        timestamp: new Date()
      }

      setAuditLogs(prev => [auditLog, ...(prev || []).slice(0, 99)])

      const result: BiometricAuthResult = {
        success: false,
        type,
        confidence: 0,
        timestamp: new Date(),
        deviceId: navigator.userAgent,
        error: {
          code: 'AUTH_FAILED',
          message: error instanceof Error ? error.message : 'Authentication failed',
          canRetry: true,
          fallbackOptions: ['password', 'sms']
        }
      }

      setLastAuthResult(result)
      toast.error(`${type} authentication failed`)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [userId, companyId, safeEnrolledMethods, setAuthSession, setAuditLogs])

  // Remove enrolled biometric
  const removeBiometric = useCallback(async (enrollmentId: string): Promise<boolean> => {
    try {
      setEnrolledMethods(prev => (prev || []).filter(e => e.id !== enrollmentId))
      toast.success('Biometric removed successfully')
      return true
    } catch (error) {
      toast.error('Failed to remove biometric')
      return false
    }
  }, [setEnrolledMethods])

  // Register hardware security key
  const registerHardwareKey = useCallback(async (name: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32)
        crypto.getRandomValues(challenge)

        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
          challenge,
          rp: {
            name: "ERP System",
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: `user-${userId}`,
            displayName: `User ${userId}`
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
            userVerification: "discouraged",
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: "direct"
        }

        const credential = await navigator.credentials.create({
          publicKey: publicKeyOptions
        }) as PublicKeyCredential

        if (credential) {
          const hardwareKey: HardwareSecurityKey = {
            id: crypto.randomUUID(),
            userId,
            companyId,
            keyId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            publicKey: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            keyType: 'fido2',
            name,
            isActive: true,
            registeredAt: new Date(),
            metadata: {
              manufacturer: 'Unknown',
              model: 'FIDO2 Key',
              firmwareVersion: '1.0',
              attestation: 'self'
            }
          }

          setHardwareKeys(prev => [...(prev || []), hardwareKey])
          toast.success('Hardware security key registered successfully')
          return true
        }
      }

      throw new Error('Hardware key registration failed')
    } catch (error) {
      toast.error('Failed to register hardware security key')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, companyId, setHardwareKeys])

  // Check session validity
  const isSessionValid = useCallback((): boolean => {
    if (!authSession) return false
    return new Date() < new Date(authSession.expiresAt)
  }, [authSession])

  // Get enrolled methods count
  const getEnrolledMethodsCount = useCallback((): number => {
    return safeEnrolledMethods.filter(e => e.isActive).length
  }, [safeEnrolledMethods])

  // Initialize on mount
  useEffect(() => {
    checkBiometricSupport()
  }, [checkBiometricSupport])

  return {
    // State
    isSupported,
    isLoading,
    availableMethods,
    enrolledMethods: safeEnrolledMethods,
    authSession,
    deviceTrust,
    biometricPolicy,
    auditLogs: safeAuditLogs,
    hardwareKeys: safeHardwareKeys,
    lastAuthResult,

    // Actions
    enrollBiometric,
    authenticateWithBiometric,
    removeBiometric,
    registerHardwareKey,
    checkBiometricSupport,

    // Computed
    isSessionValid: isSessionValid(),
    enrolledMethodsCount: getEnrolledMethodsCount(),
    hasFingerprint: safeEnrolledMethods.some(e => e.biometricType === 'fingerprint' && e.isActive),
    hasFaceId: safeEnrolledMethods.some(e => e.biometricType === 'face' && e.isActive),
    hasHardwareKey: safeHardwareKeys.some(k => k.isActive)
  }
}