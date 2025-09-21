import React from 'react'
import { EnhancedAccountManagement } from './enhanced/EnhancedAccountManagement'

interface AccountManagementProps {
  companyId: string
  userId: string
  userRole: string
}

export function AccountManagement({ companyId, userId, userRole }: AccountManagementProps) {
  return (
    <EnhancedAccountManagement 
      companyId={companyId}
      userId={userId}
      userRole={userRole}
    />
  )
}