import { ERPModule, Company, User, GlobalUser, CompanyUserProfile, CompanyAccess, SessionContext, Notification, AIInsight, SystemHealth, SystemRole, CompanyUserRole, UserSession } from '@/types/erp'

export const mockCompanies: Company[] = [
  {
    id: 'acme-corp',
    name: 'Acme Corporation',
    company_code: 'ACME',
    domain: 'acme.com',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'info@acme.com',
    subscription_plan: 'enterprise',
    settings: {
      theme: 'default',
      notification_preferences: ['email', 'in_app'],
      business_hours: '9:00-17:00',
      fiscal_year_start: '01-01'
    },
    security_settings: {
      mfa_required: true,
      password_policy: 'strong',
      session_timeout: 480,
      ip_whitelist_enabled: false
    },
    timezone: 'America/New_York',
    currency: 'USD',
    isActive: true,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'tech-solutions',
    name: 'Tech Solutions Ltd',
    company_code: 'TECH',
    domain: 'techsolutions.com',
    address: '456 Innovation Dr, San Francisco, CA 94102',
    phone: '+1 (555) 987-6543',
    email: 'contact@techsolutions.com',
    subscription_plan: 'professional',
    settings: {
      theme: 'dark',
      notification_preferences: ['email'],
      business_hours: '8:00-18:00',
      fiscal_year_start: '04-01'
    },
    security_settings: {
      mfa_required: false,
      password_policy: 'medium',
      session_timeout: 360,
      ip_whitelist_enabled: true
    },
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    isActive: true,
    created_at: '2023-06-20T14:00:00Z',
    updated_at: '2024-01-10T09:15:00Z'
  },
  {
    id: 'global-ventures',
    name: 'Global Ventures Inc',
    company_code: 'GLOBAL',
    domain: 'globalventures.com',
    address: '789 International Blvd, London, UK',
    phone: '+44 20 7123 4567',
    email: 'info@globalventures.com',
    subscription_plan: 'enterprise',
    settings: {
      theme: 'default',
      notification_preferences: ['email', 'sms', 'in_app'],
      business_hours: '9:00-17:30',
      fiscal_year_start: '04-01'
    },
    security_settings: {
      mfa_required: true,
      password_policy: 'strong',
      session_timeout: 240,
      ip_whitelist_enabled: true
    },
    timezone: 'Europe/London',
    currency: 'GBP',
    isActive: false,
    created_at: '2023-03-10T11:00:00Z',
    updated_at: '2023-12-15T16:45:00Z'
  }
]

// Mock global user profile
export const mockGlobalUser: GlobalUser = {
  id: 'global-user-1',
  email: 'sarah.johnson@example.com',
  first_name: 'Sarah',
  last_name: 'Johnson',
  phone: '+1 (555) 123-4567',
  profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  mfa_enabled: true,
  mfa_secret: 'JBSWY3DPEHPK3PXP',
  backup_codes: ['123456', '789012', '345678'],
  last_login: '2024-01-15T11:30:00Z',
  failed_login_attempts: 0,
  password_changed_at: '2024-01-01T00:00:00Z',
  is_active: true,
  preferences: {
    language: 'en',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    dashboard_layout: 'grid'
  },
  security_settings: {
    login_notifications: true,
    security_alerts: true,
    api_access_enabled: false
  },
  created_at: '2023-01-15T10:00:00Z',
  updated_at: '2024-01-15T11:30:00Z'
}

// Mock company user profiles
export const mockCompanyProfiles: CompanyUserProfile[] = [
  {
    id: 'profile-1',
    global_user_id: 'global-user-1',
    company_id: 'acme-corp',
    employee_id: 'EMP-001',
    department: 'Information Technology',
    position: 'System Administrator',
    employment_type: 'full_time',
    status: 'active',
    hire_date: '2023-01-15',
    work_location: 'New York Office',
    company_specific_settings: {
      default_module: 'dashboard',
      notification_frequency: 'immediate'
    },
    last_company_login: '2024-01-15T11:30:00Z',
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-01-15T11:30:00Z'
  },
  {
    id: 'profile-2',
    global_user_id: 'global-user-1',
    company_id: 'tech-solutions',
    employee_id: 'TS-042',
    department: 'Operations',
    position: 'Operations Manager',
    employment_type: 'full_time',
    status: 'active',
    hire_date: '2023-06-20',
    work_location: 'San Francisco Office',
    company_specific_settings: {
      default_module: 'finance',
      notification_frequency: 'daily'
    },
    last_company_login: '2024-01-14T16:45:00Z',
    created_at: '2023-06-20T14:00:00Z',
    updated_at: '2024-01-14T16:45:00Z'
  }
]

// Mock company access for session context
export const mockCompanyAccess: CompanyAccess[] = [
  {
    company_id: 'acme-corp',
    company_name: 'Acme Corporation',
    company_code: 'ACME',
    role: 'admin',
    permissions: ['all'],
    status: 'active',
    last_accessed: '2024-01-15T11:30:00Z'
  },
  {
    company_id: 'tech-solutions',
    company_name: 'Tech Solutions Ltd',
    company_code: 'TECH',
    role: 'manager',
    permissions: ['finance', 'inventory', 'hr', 'reporting'],
    status: 'active',
    last_accessed: '2024-01-14T16:45:00Z'
  }
]

// Mock session context
export const mockSessionContext: SessionContext = {
  global_user_id: 'global-user-1',
  current_company_id: 'acme-corp',
  available_companies: mockCompanyAccess,
  jwt_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expires_at: '2024-01-16T11:30:00Z',
  permissions: ['all'],
  role: 'admin'
}

// Combined user interface for UI usage
export const mockUser: User = {
  id: 'global-user-1',
  email: 'sarah.johnson@example.com',
  name: 'Sarah Johnson',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  role: 'System Administrator',
  permissions: ['all'],
  companyId: 'acme-corp',
  employee_id: 'EMP-001',
  department: 'Information Technology',
  position: 'System Administrator',
  is_owner: true,
  company_profiles: mockCompanyProfiles,
  global_profile: mockGlobalUser
}

export const mockModules: ERPModule[] = [
  {
    id: 'finance',
    name: 'Financial Management',
    description: 'Comprehensive accounting, budgeting, and financial reporting',
    icon: 'CreditCard',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    notifications: 3,
    quickStats: [
      { label: 'Revenue YTD', value: '$2.4M', trend: 'up' },
      { label: 'Outstanding AR', value: '$180K', trend: 'down' },
      { label: 'Cash Flow', value: 'Positive', trend: 'stable' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Real-time stock tracking, warehouse management, and optimization',
    icon: 'Package',
    status: 'active',
    lastUpdated: '2024-01-15T09:45:00Z',
    notifications: 7,
    quickStats: [
      { label: 'Total Items', value: '12,450', trend: 'up' },
      { label: 'Low Stock Alerts', value: '23', trend: 'down' },
      { label: 'Turnover Rate', value: '4.2x', trend: 'up' }
    ]
  },
  {
    id: 'sales',
    name: 'Sales & CRM',
    description: 'Customer relationship management and sales pipeline tracking',
    icon: 'TrendUp',
    status: 'active',
    lastUpdated: '2024-01-15T11:15:00Z',
    notifications: 12,
    quickStats: [
      { label: 'Active Leads', value: '156', trend: 'up' },
      { label: 'Conversion Rate', value: '24%', trend: 'up' },
      { label: 'Pipeline Value', value: '$890K', trend: 'stable' }
    ]
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Vendor management, purchase orders, and procurement analytics',
    icon: 'ShoppingCart',
    status: 'active',
    lastUpdated: '2024-01-15T08:20:00Z',
    notifications: 5,
    quickStats: [
      { label: 'Active POs', value: '89', trend: 'stable' },
      { label: 'Vendor Rating', value: '4.7/5', trend: 'up' },
      { label: 'Cost Savings', value: '12%', trend: 'up' }
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee management, payroll, performance, and recruitment',
    icon: 'Users',
    status: 'active',
    lastUpdated: '2024-01-15T07:30:00Z',
    notifications: 2,
    quickStats: [
      { label: 'Total Employees', value: '248', trend: 'up' },
      { label: 'Open Positions', value: '12', trend: 'down' },
      { label: 'Retention Rate', value: '94%', trend: 'stable' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production planning, quality control, and shop floor management',
    icon: 'Gear',
    status: 'active',
    lastUpdated: '2024-01-15T09:00:00Z',
    notifications: 8,
    quickStats: [
      { label: 'Production Rate', value: '98.5%', trend: 'up' },
      { label: 'Quality Score', value: '99.2%', trend: 'stable' },
      { label: 'Downtime', value: '1.3%', trend: 'down' }
    ]
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Project planning, resource allocation, and delivery tracking',
    icon: 'Calendar',
    status: 'active',
    lastUpdated: '2024-01-15T10:45:00Z',
    notifications: 15,
    quickStats: [
      { label: 'Active Projects', value: '34', trend: 'stable' },
      { label: 'On-Time Delivery', value: '87%', trend: 'up' },
      { label: 'Resource Utilization', value: '82%', trend: 'stable' }
    ]
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    description: 'End-to-end supply chain visibility and optimization',
    icon: 'Truck',
    status: 'maintenance',
    lastUpdated: '2024-01-14T16:00:00Z',
    notifications: 1,
    quickStats: [
      { label: 'Shipments Today', value: '67', trend: 'stable' },
      { label: 'On-Time Rate', value: '96%', trend: 'up' },
      { label: 'Transit Time', value: '2.3 days', trend: 'down' }
    ]
  },
  {
    id: 'quality',
    name: 'Quality Management',
    description: 'Quality assurance, compliance, and continuous improvement',
    icon: 'Shield',
    status: 'active',
    lastUpdated: '2024-01-15T11:00:00Z',
    notifications: 4,
    quickStats: [
      { label: 'Quality Score', value: '99.1%', trend: 'stable' },
      { label: 'Defect Rate', value: '0.02%', trend: 'down' },
      { label: 'Compliance', value: '100%', trend: 'stable' }
    ]
  },
  {
    id: 'assets',
    name: 'Asset Management',
    description: 'Equipment tracking, maintenance scheduling, and lifecycle management',
    icon: 'Buildings',
    status: 'active',
    lastUpdated: '2024-01-15T08:45:00Z',
    notifications: 6,
    quickStats: [
      { label: 'Total Assets', value: '1,247', trend: 'up' },
      { label: 'Maintenance Due', value: '18', trend: 'stable' },
      { label: 'Asset Utilization', value: '87%', trend: 'up' }
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    description: 'Advanced analytics, reporting, and data visualization',
    icon: 'ChartBar',
    status: 'active',
    lastUpdated: '2024-01-15T11:30:00Z',
    notifications: 2,
    quickStats: [
      { label: 'Active Reports', value: '127', trend: 'up' },
      { label: 'Data Accuracy', value: '99.8%', trend: 'stable' },
      { label: 'Query Performance', value: '0.3s', trend: 'down' }
    ]
  },
  {
    id: 'document',
    name: 'Document Management',
    description: 'Document storage, version control, and collaboration tools',
    icon: 'FileText',
    status: 'active',
    lastUpdated: '2024-01-15T09:30:00Z',
    notifications: 9,
    quickStats: [
      { label: 'Total Documents', value: '24,567', trend: 'up' },
      { label: 'Storage Used', value: '2.1TB', trend: 'up' },
      { label: 'Collaboration Score', value: '92%', trend: 'stable' }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Risk',
    description: 'Regulatory compliance, risk assessment, and audit management',
    icon: 'UserCheck',
    status: 'active',
    lastUpdated: '2024-01-15T10:15:00Z',
    notifications: 3,
    quickStats: [
      { label: 'Compliance Score', value: '98.5%', trend: 'stable' },
      { label: 'Open Risks', value: '7', trend: 'down' },
      { label: 'Audit Readiness', value: '95%', trend: 'up' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication Hub',
    description: 'Internal messaging, notifications, and collaboration platform',
    icon: 'ChatCircle',
    status: 'active',
    lastUpdated: '2024-01-15T11:45:00Z',
    notifications: 24,
    quickStats: [
      { label: 'Active Users', value: '234', trend: 'stable' },
      { label: 'Messages Today', value: '1,456', trend: 'up' },
      { label: 'Response Time', value: '4 min', trend: 'down' }
    ]
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Inventory Alert',
    message: 'Low stock detected for Product SKU-1234',
    type: 'warning',
    timestamp: '2024-01-15T11:30:00Z',
    isRead: false,
    module: 'inventory'
  },
  {
    id: 'notif-2',
    title: 'New Sales Lead',
    message: 'High-value lead from Enterprise Corp',
    type: 'success',
    timestamp: '2024-01-15T11:15:00Z',
    isRead: false,
    module: 'sales'
  },
  {
    id: 'notif-3',
    title: 'System Maintenance',
    message: 'Supply Chain module scheduled for maintenance',
    type: 'info',
    timestamp: '2024-01-15T10:00:00Z',
    isRead: true,
    module: 'supply-chain'
  }
]

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai-1',
    title: 'Demand Forecast',
    description: 'Product ABC123 demand will increase 30% next month based on seasonal trends',
    type: 'prediction',
    confidence: 87,
    impact: 'high',
    module: 'inventory',
    actionable: true,
    actions: [
      { label: 'Increase Stock Order', action: 'adjust-inventory' },
      { label: 'View Details', action: 'view-forecast' }
    ]
  },
  {
    id: 'ai-2',
    title: 'Cash Flow Optimization',
    description: 'Adjusting payment terms could improve cash flow by $50K',
    type: 'recommendation',
    confidence: 92,
    impact: 'medium',
    module: 'finance',
    actionable: true,
    actions: [
      { label: 'Review Terms', action: 'review-terms' },
      { label: 'Schedule Meeting', action: 'schedule-meeting' }
    ]
  },
  {
    id: 'ai-3',
    title: 'Quality Risk',
    description: 'Supplier XYZ showing quality degradation patterns',
    type: 'alert',
    confidence: 78,
    impact: 'high',
    module: 'quality',
    actionable: true,
    actions: [
      { label: 'Contact Supplier', action: 'contact-supplier' },
      { label: 'Find Alternative', action: 'find-alternative' }
    ]
  }
]

export const mockSystemHealth: SystemHealth = {
  overall: 'healthy',
  services: [
    { name: 'Database', status: 'online', responseTime: 12, uptime: 99.9 },
    { name: 'API Gateway', status: 'online', responseTime: 45, uptime: 99.8 },
    { name: 'Authentication', status: 'online', responseTime: 23, uptime: 100 },
    { name: 'Real-time Sync', status: 'online', responseTime: 8, uptime: 99.7 },
    { name: 'WebSocket Server', status: 'online', responseTime: 15, uptime: 99.9 },
    { name: 'File Storage', status: 'degraded', responseTime: 156, uptime: 98.2 },
    { name: 'Email Service', status: 'online', responseTime: 89, uptime: 99.5 }
  ],
  apiCalls: {
    total: 125430,
    successful: 124891,
    failed: 539
  }
}

// Mock data for real-time sync demonstrations
export const mockSyncEvents = [
  {
    id: 'sync-1',
    type: 'data_update' as const,
    module: 'finance',
    entity: 'invoice',
    operation: 'create' as const,
    data: { invoiceId: 'INV-2024-001', amount: 5000 },
    timestamp: new Date().toISOString(),
    companyId: 'acme-corp',
    userId: 'user-1'
  },
  {
    id: 'sync-2',
    type: 'data_update' as const,
    module: 'inventory',
    entity: 'stock',
    operation: 'update' as const,
    data: { productId: 'PROD-123', quantity: 150 },
    timestamp: new Date().toISOString(),
    companyId: 'acme-corp',
    userId: 'user-2'
  }
]

export const mockSyncConflicts = [
  {
    id: 'conflict-1',
    module: 'finance',
    entity: 'invoice',
    entityId: 'INV-2024-001',
    field: 'amount',
    serverValue: 5000,
    clientValue: 5200,
    timestamp: new Date().toISOString(),
    resolved: false
  }
]

// Mock System Roles
export const mockSystemRoles: SystemRole[] = [
  {
    id: 'role-super-admin',
    company_id: 'acme-corp',
    role_name: 'Super Administrator',
    role_level: 1,
    description: 'Full system access with all permissions',
    is_system_role: true,
    permissions: {
      modules: ['*'],
      actions: ['*'],
      scope: 'global'
    },
    created_at: '2023-01-15T10:00:00Z'
  },
  {
    id: 'role-admin',
    company_id: 'acme-corp',
    role_name: 'Administrator',
    role_level: 2,
    description: 'Company-wide administrative access',
    is_system_role: true,
    permissions: {
      modules: ['finance', 'hr', 'inventory', 'sales', 'reporting'],
      actions: ['create', 'read', 'update', 'delete', 'approve'],
      scope: 'company'
    },
    created_at: '2023-01-15T10:00:00Z'
  },
  {
    id: 'role-manager',
    company_id: 'acme-corp',
    role_name: 'Manager',
    role_level: 3,
    description: 'Department management with approval rights',
    is_system_role: true,
    permissions: {
      modules: ['finance', 'hr', 'inventory', 'sales'],
      actions: ['read', 'update', 'approve'],
      scope: 'department'
    },
    created_at: '2023-01-15T10:00:00Z'
  },
  {
    id: 'role-user',
    company_id: 'acme-corp',
    role_name: 'User',
    role_level: 4,
    description: 'Standard user access',
    is_system_role: true,
    permissions: {
      modules: ['finance', 'inventory', 'sales'],
      actions: ['read', 'update'],
      scope: 'own'
    },
    created_at: '2023-01-15T10:00:00Z'
  },
  {
    id: 'role-viewer',
    company_id: 'acme-corp',
    role_name: 'Viewer',
    role_level: 5,
    description: 'Read-only access',
    is_system_role: true,
    permissions: {
      modules: ['reporting'],
      actions: ['read'],
      scope: 'own'
    },
    created_at: '2023-01-15T10:00:00Z'
  }
]

// Mock Company User Roles
export const mockCompanyUserRoles: CompanyUserRole[] = [
  {
    id: 'user-role-1',
    company_user_profile_id: 'profile-1',
    role_id: 'role-admin',
    assigned_by: 'system',
    assigned_at: '2023-01-15T10:00:00Z',
    is_active: true
  },
  {
    id: 'user-role-2',
    company_user_profile_id: 'profile-2',
    role_id: 'role-manager',
    assigned_by: 'profile-1',
    assigned_at: '2023-06-20T10:00:00Z',
    is_active: true
  }
]

// Mock User Sessions
export const mockUserSessions: UserSession[] = [
  {
    id: 'session-1',
    global_user_id: 'global-user-1',
    company_id: 'acme-corp',
    company_user_profile_id: 'profile-1',
    session_token: 'jwt-token-example',
    refresh_token: 'refresh-token-example',
    expires_at: '2024-01-16T10:00:00Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device_fingerprint: 'device-123',
    location_data: {
      country: 'US',
      city: 'New York',
      timezone: 'America/New_York'
    },
    is_active: true,
    created_at: '2024-01-15T10:00:00Z'
  }
]