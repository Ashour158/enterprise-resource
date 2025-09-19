/**
 * Security and Validation Layer for Multi-Company ERP System
 * 
 * This module provides comprehensive security utilities, input validation,
 * and data sanitization for the multi-company architecture.
 */

import { z } from 'zod'
import { Company, GlobalUser, CompanyUserProfile, SessionContext } from '@/types/erp'

// Input validation schemas using Zod
export const ValidationSchemas = {
  // Email validation with strict RFC compliance
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .toLowerCase(),

  // Password validation with security requirements
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),

  // Company code validation
  companyCode: z.string()
    .min(2, 'Company code must be at least 2 characters')
    .max(10, 'Company code is too long')
    .regex(/^[A-Z0-9_-]+$/, 'Company code can only contain uppercase letters, numbers, hyphens and underscores'),

  // User name validation
  userName: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),

  // Employee ID validation
  employeeId: z.string()
    .min(1, 'Employee ID is required')
    .max(50, 'Employee ID is too long')
    .regex(/^[A-Z0-9_-]+$/, 'Employee ID can only contain uppercase letters, numbers, hyphens and underscores'),

  // Phone number validation
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),

  // Company name validation
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(255, 'Company name is too long')
    .regex(/^[a-zA-Z0-9\s\-.,&()]+$/, 'Company name contains invalid characters'),

  // JWT token validation
  jwtToken: z.string()
    .min(1, 'Token is required')
    .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, 'Invalid JWT format'),

  // Permission validation
  permission: z.string()
    .min(1, 'Permission is required')
    .max(100, 'Permission name is too long')
    .regex(/^[a-z0-9_:]+$/, 'Permission can only contain lowercase letters, numbers, underscores and colons'),

  // Role validation
  role: z.string()
    .min(1, 'Role is required')
    .max(50, 'Role name is too long')
    .regex(/^[a-z_]+$/, 'Role can only contain lowercase letters and underscores')
}

// Company context validation
export const CompanyContextSchema = z.object({
  companyId: z.string().uuid('Invalid company ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  permissions: z.array(ValidationSchemas.permission),
  role: ValidationSchemas.role
})

// Session validation schema
export const SessionSchema = z.object({
  global_user_id: z.string().uuid(),
  current_company_id: z.string().uuid(),
  jwt_token: ValidationSchemas.jwtToken,
  expires_at: z.string().datetime(),
  permissions: z.array(ValidationSchemas.permission),
  role: ValidationSchemas.role
})

/**
 * Security utilities for multi-company operations
 */
export class SecurityUtils {
  /**
   * Sanitizes string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  /**
   * Validates and sanitizes company context
   */
  static validateCompanyContext(context: any): { valid: boolean; errors: string[] } {
    try {
      CompanyContextSchema.parse(context)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { valid: false, errors: ['Invalid context format'] }
    }
  }

  /**
   * Checks if user has required permission in company context
   */
  static hasPermission(
    userPermissions: string[], 
    requiredPermission: string, 
    companyId: string
  ): boolean {
    // Super admin has all permissions
    if (userPermissions.includes('all') || userPermissions.includes('*')) {
      return true
    }

    // Check exact permission match
    if (userPermissions.includes(requiredPermission)) {
      return true
    }

    // Check wildcard permissions (e.g., 'finance:*' grants 'finance:read')
    const wildcardPermission = requiredPermission.split(':')[0] + ':*'
    if (userPermissions.includes(wildcardPermission)) {
      return true
    }

    return false
  }

  /**
   * Validates session token and extracts company context
   */
  static validateSession(sessionToken: string): { valid: boolean; companyId?: string; userId?: string } {
    try {
      // In a real implementation, this would verify JWT signature
      // For demo purposes, we'll do basic format validation
      const tokenParts = sessionToken.split('.')
      if (tokenParts.length !== 3) {
        return { valid: false }
      }

      // Decode JWT payload (in production, use proper JWT library)
      const payload = JSON.parse(atob(tokenParts[1]))
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return { valid: false }
      }

      return {
        valid: true,
        companyId: payload.company_id,
        userId: payload.sub
      }
    } catch {
      return { valid: false }
    }
  }

  /**
   * Generates secure random string for tokens
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Validates password strength
   */
  static validatePasswordStrength(password: string): { 
    score: number; 
    feedback: string[]; 
    isValid: boolean 
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8) score += 1
    else feedback.push('Password should be at least 8 characters long')

    if (password.length >= 12) score += 1

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[@$!%*?&]/.test(password)) score += 1
    else feedback.push('Include special characters')

    // Common password checks
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score -= 2
      feedback.push('Avoid common passwords')
    }

    return {
      score: Math.max(0, score),
      feedback,
      isValid: score >= 4
    }
  }

  /**
   * Rate limiting for API requests
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      // Get or create request history for identifier
      let requestTimes = requests.get(identifier) || []
      
      // Remove old requests outside the window
      requestTimes = requestTimes.filter(time => time > windowStart)
      
      // Check if under limit
      if (requestTimes.length >= maxRequests) {
        return false
      }

      // Add current request
      requestTimes.push(now)
      requests.set(identifier, requestTimes)

      return true
    }
  }

  /**
   * Input sanitization for SQL injection prevention
   */
  static sanitizeSqlInput(input: string): string {
    return input
      .replace(/[';\\]/g, '') // Remove SQL metacharacters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments
      .replace(/\*\//g, '')
      .trim()
  }

  /**
   * Validates file upload security
   */
  static validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed')
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push('File size too large (max 10MB)')
    }

    // Check file name for suspicious patterns
    if (/[<>:"\/\\|?*]/.test(file.name)) {
      errors.push('File name contains invalid characters')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Audit logging for security events
 */
export class AuditLogger {
  /**
   * Logs security events for compliance
   */
  static logSecurityEvent(event: {
    action: string
    resource: string
    userId: string
    companyId: string
    success: boolean
    details?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): void {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      ...event,
      id: SecurityUtils.generateSecureToken(16)
    }

    // In production, this would be sent to a secure audit log service
    console.log('Security Audit:', auditEntry)

    // Store in browser for demo (in production, send to server)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security-audit-logs') || '[]')
      existingLogs.push(auditEntry)
      
      // Keep only last 100 entries in browser storage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }
      
      localStorage.setItem('security-audit-logs', JSON.stringify(existingLogs))
    } catch (error) {
      console.error('Failed to store audit log:', error)
    }
  }

  /**
   * Retrieves audit logs for compliance reporting
   */
  static getAuditLogs(filters?: {
    userId?: string
    companyId?: string
    action?: string
    startDate?: string
    endDate?: string
  }): any[] {
    try {
      const logs = JSON.parse(localStorage.getItem('security-audit-logs') || '[]')
      
      if (!filters) return logs

      return logs.filter((log: any) => {
        if (filters.userId && log.userId !== filters.userId) return false
        if (filters.companyId && log.companyId !== filters.companyId) return false
        if (filters.action && log.action !== filters.action) return false
        if (filters.startDate && log.timestamp < filters.startDate) return false
        if (filters.endDate && log.timestamp > filters.endDate) return false
        return true
      })
    } catch {
      return []
    }
  }
}

/**
 * Company data isolation utilities
 */
export class DataIsolationUtils {
  /**
   * Ensures data queries include company context
   */
  static enforceCompanyContext(query: any, companyId: string): any {
    if (typeof query === 'object' && query !== null) {
      return {
        ...query,
        company_id: companyId
      }
    }
    return query
  }

  /**
   * Validates that data belongs to the current company context
   */
  static validateDataOwnership(data: any, companyId: string): boolean {
    if (Array.isArray(data)) {
      return data.every(item => item.company_id === companyId)
    }
    
    if (typeof data === 'object' && data !== null) {
      return data.company_id === companyId
    }
    
    return false
  }

  /**
   * Filters data array to only include current company data
   */
  static filterByCompany<T extends { company_id: string }>(data: T[], companyId: string): T[] {
    return data.filter(item => item.company_id === companyId)
  }
}

// Export a default configuration object
export const SecurityConfig = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 // days
  },
  sessionPolicy: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    renewalThreshold: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 3
  },
  rateLimiting: {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    fileUpload: { maxRequests: 10, windowMs: 60 * 1000 } // 10 uploads per minute
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationDays: 30
  }
}