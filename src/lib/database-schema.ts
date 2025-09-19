/**
 * Database Schema Definitions for Multi-Company ERP System
 * 
 * This file contains TypeScript interfaces that match the PostgreSQL database schema
 * for the multi-company architecture. These interfaces ensure type safety when
 * working with database records in the frontend application.
 */

// Core Company Schema
export interface DatabaseCompany {
  id: number
  company_name: string
  company_code: string
  domain?: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  subscription_plan: 'enterprise' | 'professional' | 'standard' | 'starter'
  settings: Record<string, any>
  security_settings: Record<string, any>
  timezone: string
  currency: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Global User Schema
export interface DatabaseGlobalUser {
  id: number
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
  profile_picture_url?: string
  mfa_enabled: boolean
  mfa_secret?: string
  backup_codes: string[]
  last_login?: string
  failed_login_attempts: number
  account_locked_until?: string
  password_changed_at: string
  is_active: boolean
  preferences: Record<string, any>
  security_settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Company User Profile Schema
export interface DatabaseCompanyUserProfile {
  id: number
  global_user_id: number
  company_id: number
  employee_id?: string
  department_id?: number
  job_title?: string
  role_id: number
  manager_id?: number
  cost_center?: string
  hire_date?: string
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern'
  salary_band?: string
  status: 'active' | 'inactive' | 'suspended' | 'terminated'
  settings: Record<string, any>
  last_activity?: string
  created_at: string
  updated_at: string
}

// Role Schema
export interface DatabaseRole {
  id: number
  company_id: number
  role_name: string
  description?: string
  permissions: string[]
  is_system_role: boolean
  created_at: string
  updated_at: string
}

// Department Schema
export interface DatabaseDepartment {
  id: number
  company_id: number
  name: string
  description?: string
  parent_department_id?: number
  manager_id?: number
  cost_center?: string
  budget?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// User Session Schema
export interface DatabaseUserSession {
  id: number
  global_user_id: number
  company_id: number
  jwt_token: string
  refresh_token?: string
  expires_at: string
  last_activity: string
  ip_address?: string
  user_agent?: string
  is_active: boolean
  created_at: string
}

// Audit Log Schema
export interface DatabaseAuditLog {
  id: number
  global_user_id?: number
  company_id?: number
  action: string
  resource: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

// Company Invitation Schema
export interface DatabaseCompanyInvitation {
  id: number
  company_id: number
  inviter_user_id?: number
  email: string
  role_id?: number
  department_id?: number
  token: string
  expires_at: string
  accepted_at?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  updated_at: string
}

// Sync Configuration Schema
export interface DatabaseSyncConfiguration {
  id: number
  company_id: number
  module_id: string
  auto_sync: boolean
  sync_interval: number
  priority: 'high' | 'medium' | 'low'
  conflict_resolution: 'server_wins' | 'client_wins' | 'manual' | 'workflow'
  sync_fields: string[]
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

// Permission Schema
export interface DatabasePermission {
  id: number
  permission_name: string
  description?: string
  module: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute'
  is_system_permission: boolean
  created_at: string
}

// Role Permission Junction Table
export interface DatabaseRolePermission {
  role_id: number
  permission_id: number
  granted_at: string
  granted_by: number
}

// Company Module Configuration
export interface DatabaseCompanyModule {
  id: number
  company_id: number
  module_name: string
  is_enabled: boolean
  configuration: Record<string, any>
  license_seats?: number
  features_enabled: string[]
  created_at: string
  updated_at: string
}

// Data validation and transformation utilities
export class DatabaseUtils {
  /**
   * Validates company data before database operations
   */
  static validateCompany(company: Partial<DatabaseCompany>): string[] {
    const errors: string[] = []
    
    if (!company.company_name?.trim()) {
      errors.push('Company name is required')
    }
    
    if (!company.company_code?.trim()) {
      errors.push('Company code is required')
    }
    
    if (company.email && !this.isValidEmail(company.email)) {
      errors.push('Invalid email format')
    }
    
    return errors
  }

  /**
   * Validates global user data before database operations
   */
  static validateGlobalUser(user: Partial<DatabaseGlobalUser>): string[] {
    const errors: string[] = []
    
    if (!user.email?.trim()) {
      errors.push('Email is required')
    } else if (!this.isValidEmail(user.email)) {
      errors.push('Invalid email format')
    }
    
    if (!user.first_name?.trim()) {
      errors.push('First name is required')
    }
    
    if (!user.last_name?.trim()) {
      errors.push('Last name is required')
    }
    
    if (!user.password_hash?.trim()) {
      errors.push('Password hash is required')
    }
    
    return errors
  }

  /**
   * Validates company user profile data
   */
  static validateCompanyUserProfile(profile: Partial<DatabaseCompanyUserProfile>): string[] {
    const errors: string[] = []
    
    if (!profile.global_user_id) {
      errors.push('Global user ID is required')
    }
    
    if (!profile.company_id) {
      errors.push('Company ID is required')
    }
    
    if (!profile.role_id) {
      errors.push('Role ID is required')
    }
    
    return errors
  }

  /**
   * Email validation utility
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Sanitizes string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
  }

  /**
   * Transforms database company to frontend format
   */
  static transformCompanyForFrontend(dbCompany: DatabaseCompany): any {
    return {
      id: dbCompany.id.toString(),
      name: dbCompany.company_name,
      company_code: dbCompany.company_code,
      domain: dbCompany.domain || '',
      logo: dbCompany.logo_url,
      address: dbCompany.address,
      phone: dbCompany.phone,
      email: dbCompany.email,
      subscription_plan: dbCompany.subscription_plan,
      settings: dbCompany.settings,
      security_settings: dbCompany.security_settings,
      timezone: dbCompany.timezone,
      currency: dbCompany.currency,
      isActive: dbCompany.is_active,
      created_at: dbCompany.created_at,
      updated_at: dbCompany.updated_at
    }
  }

  /**
   * Transforms database global user to frontend format
   */
  static transformGlobalUserForFrontend(dbUser: DatabaseGlobalUser): any {
    return {
      id: dbUser.id.toString(),
      email: dbUser.email,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      name: `${dbUser.first_name} ${dbUser.last_name}`,
      phone: dbUser.phone,
      avatar: dbUser.profile_picture_url,
      mfa_enabled: dbUser.mfa_enabled,
      backup_codes: dbUser.backup_codes,
      last_login: dbUser.last_login,
      is_active: dbUser.is_active,
      preferences: dbUser.preferences,
      security_settings: dbUser.security_settings,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    }
  }
}

// SQL Query Templates for common operations
export const SQL_QUERIES = {
  // Get user with all company profiles
  GET_USER_WITH_COMPANIES: `
    SELECT 
      gu.*,
      json_agg(
        json_build_object(
          'id', cup.id,
          'company_id', cup.company_id,
          'employee_id', cup.employee_id,
          'department_id', cup.department_id,
          'job_title', cup.job_title,
          'role_id', cup.role_id,
          'status', cup.status,
          'company_name', c.company_name,
          'company_code', c.company_code
        )
      ) as company_profiles
    FROM global_users gu
    LEFT JOIN company_user_profiles cup ON gu.id = cup.global_user_id
    LEFT JOIN companies c ON cup.company_id = c.id
    WHERE gu.email = $1 AND gu.is_active = true
    GROUP BY gu.id
  `,

  // Get company with user permissions
  GET_COMPANY_WITH_USER_PERMISSIONS: `
    SELECT 
      c.*,
      cup.role_id,
      cup.status as user_status,
      r.role_name,
      r.permissions
    FROM companies c
    JOIN company_user_profiles cup ON c.id = cup.company_id
    JOIN roles r ON cup.role_id = r.id
    WHERE c.id = $1 AND cup.global_user_id = $2 AND c.is_active = true
  `,

  // Create audit log entry
  CREATE_AUDIT_LOG: `
    INSERT INTO audit_logs (
      global_user_id, company_id, action, resource, resource_id,
      old_values, new_values, ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,

  // Get sync configuration for company
  GET_SYNC_CONFIG: `
    SELECT * FROM sync_configurations 
    WHERE company_id = $1 AND is_active = true
    ORDER BY priority DESC, module_id ASC
  `
}