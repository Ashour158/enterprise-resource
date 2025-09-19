import { RoleLevel, Permission, Role, PermissionMatrix } from '@/types/rbac'

export const ROLE_LEVELS: RoleLevel[] = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Complete system access across all modules and companies',
    color: 'text-red-600 bg-red-50',
    capabilities: [
      'Global user management and system configuration',
      'Multi-company data access and cross-company reporting',
      'System maintenance and security policy management',
      'Complete database and infrastructure access'
    ]
  },
  {
    id: 2,
    name: 'Company Admin',
    description: 'Full access within their company only',
    color: 'text-purple-600 bg-purple-50',
    capabilities: [
      'User management and invitation for their company',
      'Company settings and module configuration',
      'All module access with full CRUD permissions',
      'Security policy configuration for company'
    ]
  },
  {
    id: 3,
    name: 'Manager',
    description: 'Department/team-level access and management',
    color: 'text-blue-600 bg-blue-50',
    capabilities: [
      'Team member management and approval workflows',
      'Read/write access to assigned modules and data',
      'Performance analytics for their team',
      'Budget and resource allocation for department'
    ]
  },
  {
    id: 4,
    name: 'User',
    description: 'Standard operational access to assigned modules',
    color: 'text-green-600 bg-green-50',
    capabilities: [
      'Create, read, update permissions for their work',
      'Access to assigned customers/projects/data',
      'Self-service features and collaboration tools',
      'Standard reporting and dashboard access'
    ]
  },
  {
    id: 5,
    name: 'Viewer',
    description: 'Read-only access to assigned modules and data',
    color: 'text-gray-600 bg-gray-50',
    capabilities: [
      'Dashboard and report viewing only',
      'No create, update, or delete permissions',
      'Limited data export capabilities',
      'Read-only access to assigned projects'
    ]
  }
]

export const DEFAULT_PERMISSIONS: Permission[] = [
  // Finance Module
  { id: 'finance-read', moduleId: 'finance', moduleName: 'Finance', action: 'read', resourceType: 'transaction', scope: 'company' },
  { id: 'finance-create', moduleId: 'finance', moduleName: 'Finance', action: 'create', resourceType: 'transaction', scope: 'department' },
  { id: 'finance-update', moduleId: 'finance', moduleName: 'Finance', action: 'update', resourceType: 'transaction', scope: 'own' },
  { id: 'finance-delete', moduleId: 'finance', moduleName: 'Finance', action: 'delete', resourceType: 'transaction', scope: 'own' },
  { id: 'finance-approve', moduleId: 'finance', moduleName: 'Finance', action: 'approve', resourceType: 'transaction', scope: 'department' },
  { id: 'finance-admin', moduleId: 'finance', moduleName: 'Finance', action: 'admin', resourceType: 'settings', scope: 'company' },

  // HR Module
  { id: 'hr-read', moduleId: 'hr', moduleName: 'Human Resources', action: 'read', resourceType: 'employee', scope: 'company' },
  { id: 'hr-create', moduleId: 'hr', moduleName: 'Human Resources', action: 'create', resourceType: 'employee', scope: 'department' },
  { id: 'hr-update', moduleId: 'hr', moduleName: 'Human Resources', action: 'update', resourceType: 'employee', scope: 'team' },
  { id: 'hr-delete', moduleId: 'hr', moduleName: 'Human Resources', action: 'delete', resourceType: 'employee', scope: 'department' },
  { id: 'hr-approve', moduleId: 'hr', moduleName: 'Human Resources', action: 'approve', resourceType: 'leave_request', scope: 'team' },
  { id: 'hr-admin', moduleId: 'hr', moduleName: 'Human Resources', action: 'admin', resourceType: 'policies', scope: 'company' },

  // Sales Module
  { id: 'sales-read', moduleId: 'sales', moduleName: 'Sales', action: 'read', resourceType: 'lead', scope: 'company' },
  { id: 'sales-create', moduleId: 'sales', moduleName: 'Sales', action: 'create', resourceType: 'lead', scope: 'own' },
  { id: 'sales-update', moduleId: 'sales', moduleName: 'Sales', action: 'update', resourceType: 'lead', scope: 'own' },
  { id: 'sales-delete', moduleId: 'sales', moduleName: 'Sales', action: 'delete', resourceType: 'lead', scope: 'own' },
  { id: 'sales-approve', moduleId: 'sales', moduleName: 'Sales', action: 'approve', resourceType: 'deal', scope: 'team' },
  { id: 'sales-admin', moduleId: 'sales', moduleName: 'Sales', action: 'admin', resourceType: 'pipeline', scope: 'company' },

  // Inventory Module
  { id: 'inventory-read', moduleId: 'inventory', moduleName: 'Inventory', action: 'read', resourceType: 'item', scope: 'company' },
  { id: 'inventory-create', moduleId: 'inventory', moduleName: 'Inventory', action: 'create', resourceType: 'item', scope: 'department' },
  { id: 'inventory-update', moduleId: 'inventory', moduleName: 'Inventory', action: 'update', resourceType: 'item', scope: 'department' },
  { id: 'inventory-delete', moduleId: 'inventory', moduleName: 'Inventory', action: 'delete', resourceType: 'item', scope: 'department' },
  { id: 'inventory-approve', moduleId: 'inventory', moduleName: 'Inventory', action: 'approve', resourceType: 'purchase_order', scope: 'department' },
  { id: 'inventory-admin', moduleId: 'inventory', moduleName: 'Inventory', action: 'admin', resourceType: 'warehouse', scope: 'company' },

  // CRM Module
  { id: 'crm-read', moduleId: 'crm', moduleName: 'CRM', action: 'read', resourceType: 'customer', scope: 'company' },
  { id: 'crm-create', moduleId: 'crm', moduleName: 'CRM', action: 'create', resourceType: 'customer', scope: 'team' },
  { id: 'crm-update', moduleId: 'crm', moduleName: 'CRM', action: 'update', resourceType: 'customer', scope: 'own' },
  { id: 'crm-delete', moduleId: 'crm', moduleName: 'CRM', action: 'delete', resourceType: 'customer', scope: 'own' },
  { id: 'crm-approve', moduleId: 'crm', moduleName: 'CRM', action: 'approve', resourceType: 'contract', scope: 'team' },
  { id: 'crm-admin', moduleId: 'crm', moduleName: 'CRM', action: 'admin', resourceType: 'settings', scope: 'company' },

  // Project Management Module
  { id: 'projects-read', moduleId: 'projects', moduleName: 'Projects', action: 'read', resourceType: 'project', scope: 'company' },
  { id: 'projects-create', moduleId: 'projects', moduleName: 'Projects', action: 'create', resourceType: 'project', scope: 'department' },
  { id: 'projects-update', moduleId: 'projects', moduleName: 'Projects', action: 'update', resourceType: 'project', scope: 'team' },
  { id: 'projects-delete', moduleId: 'projects', moduleName: 'Projects', action: 'delete', resourceType: 'project', scope: 'team' },
  { id: 'projects-approve', moduleId: 'projects', moduleName: 'Projects', action: 'approve', resourceType: 'milestone', scope: 'team' },
  { id: 'projects-admin', moduleId: 'projects', moduleName: 'Projects', action: 'admin', resourceType: 'settings', scope: 'company' },

  // Manufacturing Module
  { id: 'manufacturing-read', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'read', resourceType: 'production_order', scope: 'company' },
  { id: 'manufacturing-create', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'create', resourceType: 'production_order', scope: 'department' },
  { id: 'manufacturing-update', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'update', resourceType: 'production_order', scope: 'department' },
  { id: 'manufacturing-delete', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'delete', resourceType: 'production_order', scope: 'department' },
  { id: 'manufacturing-approve', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'approve', resourceType: 'production_order', scope: 'department' },
  { id: 'manufacturing-admin', moduleId: 'manufacturing', moduleName: 'Manufacturing', action: 'admin', resourceType: 'settings', scope: 'company' }
]

export const PERMISSION_MATRIX: PermissionMatrix = {
  finance: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: false, approve: true, admin: false, scope: ['department', 'team'] },
    4: { create: true, read: true, update: true, delete: false, approve: false, admin: false, scope: ['own'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['own'] }
  },
  hr: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: false, approve: true, admin: false, scope: ['department', 'team'] },
    4: { create: false, read: true, update: true, delete: false, approve: false, admin: false, scope: ['own'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['own'] }
  },
  sales: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: true, approve: true, admin: false, scope: ['department', 'team'] },
    4: { create: true, read: true, update: true, delete: true, approve: false, admin: false, scope: ['own'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['own'] }
  },
  inventory: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: true, approve: true, admin: false, scope: ['department'] },
    4: { create: true, read: true, update: true, delete: false, approve: false, admin: false, scope: ['department'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['department'] }
  },
  crm: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: true, approve: true, admin: false, scope: ['team'] },
    4: { create: true, read: true, update: true, delete: true, approve: false, admin: false, scope: ['own'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['own'] }
  },
  projects: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: true, approve: true, admin: false, scope: ['department', 'team'] },
    4: { create: true, read: true, update: true, delete: false, approve: false, admin: false, scope: ['team'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['team'] }
  },
  manufacturing: {
    1: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['global', 'company'] },
    2: { create: true, read: true, update: true, delete: true, approve: true, admin: true, scope: ['company'] },
    3: { create: true, read: true, update: true, delete: true, approve: true, admin: false, scope: ['department'] },
    4: { create: true, read: true, update: true, delete: false, approve: false, admin: false, scope: ['department'] },
    5: { create: false, read: true, update: false, delete: false, approve: false, admin: false, scope: ['department'] }
  }
}

export const DEFAULT_ROLES: Omit<Role, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Super Administrator',
    level: 1,
    description: 'Complete system access across all modules and companies',
    isSystemRole: true,
    permissions: DEFAULT_PERMISSIONS.filter(p => p.scope === 'global' || p.scope === 'company'),
    userCount: 0,
    isActive: true
  },
  {
    name: 'Company Administrator',
    level: 2,
    description: 'Full access within their company only',
    isSystemRole: true,
    permissions: DEFAULT_PERMISSIONS.filter(p => p.scope === 'company' || p.scope === 'department'),
    userCount: 0,
    isActive: true
  },
  {
    name: 'Department Manager',
    level: 3,
    description: 'Department/team-level access and management',
    isSystemRole: true,
    permissions: DEFAULT_PERMISSIONS.filter(p => ['department', 'team', 'own'].includes(p.scope) && p.action !== 'admin'),
    userCount: 0,
    isActive: true
  },
  {
    name: 'Standard User',
    level: 4,
    description: 'Standard operational access to assigned modules',
    isSystemRole: true,
    permissions: DEFAULT_PERMISSIONS.filter(p => ['own', 'team'].includes(p.scope) && !['delete', 'approve', 'admin'].includes(p.action)),
    userCount: 0,
    isActive: true
  },
  {
    name: 'Viewer',
    level: 5,
    description: 'Read-only access to assigned modules and data',
    isSystemRole: true,
    permissions: DEFAULT_PERMISSIONS.filter(p => p.action === 'read'),
    userCount: 0,
    isActive: true
  }
]