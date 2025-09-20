// Test component to verify Lead Aging integration
import React from 'react'
import { EnhancedLeadManagement } from '@/components/crm/EnhancedLeadManagement'

export function TestLeadAging() {
  const handleScheduleMeeting = (leadId: string) => {
    console.log('Schedule meeting for lead:', leadId)
  }

  const handleCreateDeal = (leadId: string) => {
    console.log('Create deal for lead:', leadId)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Lead Aging Integration</h1>
      <EnhancedLeadManagement
        companyId="test-company"
        userId="test-user"
        userRole="admin"
        onScheduleMeeting={handleScheduleMeeting}
        onCreateDeal={handleCreateDeal}
      />
    </div>
  )
}