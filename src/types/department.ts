export interface Department {
  id: string
  name: string
  code: string
  description?: string
  parentId?: string
  companyId: string
  managerId?: string
  location?: string
  budget?: number
  employeeCount: number
  status: 'active' | 'inactive' | 'suspended'
  moduleAccess: string[] // Array of ERP module IDs this department can access
  permissions: DepartmentPermission[]
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export interface DepartmentPermission {
  moduleId: string
  permissions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'admin')[]
  conditions?: Record<string, any>
}

export interface DepartmentUser {
  id: string
  departmentId: string
  userId: string
  role: string
  isManager: boolean
  permissions: string[]
  assignedAt: Date
  assignedBy: string
  status: 'active' | 'inactive'
}

export interface DepartmentHierarchy {
  id: string
  name: string
  code: string
  level: number
  parentId?: string
  children: DepartmentHierarchy[]
  userCount: number
  moduleCount: number
  status: 'active' | 'inactive' | 'suspended'
}

export interface CreateDepartmentRequest {
  name: string
  code: string
  description?: string
  parentId?: string
  managerId?: string
  location?: string
  budget?: number
  moduleAccess: string[]
  permissions: DepartmentPermission[]
  settings?: Record<string, any>
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  id: string
}

export interface DepartmentStats {
  totalDepartments: number
  activeDepartments: number
  totalUsers: number
  averageUsersPerDepartment: number
  departmentsByModule: Record<string, number>
  hierarchyDepth: number
}

export interface DepartmentAuditLog {
  id: string
  departmentId: string
  action: 'created' | 'updated' | 'deleted' | 'user_assigned' | 'user_removed' | 'permissions_changed'
  details: Record<string, any>
  performedBy: string
  performedAt: Date
  companyId: string
  ipAddress?: string
}

export interface DepartmentFilter {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  parentId?: string
  moduleId?: string
  managerId?: string
  hasUsers?: boolean
  level?: number
}

export interface BulkDepartmentOperation {
  operation: 'assign_users' | 'remove_users' | 'update_permissions' | 'change_status'
  departmentIds: string[]
  data: Record<string, any>
}