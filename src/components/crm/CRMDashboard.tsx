import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CRMAnalytics } from '@/types/crm'

interface CRMDashboardProps {
  companyId: string
  userId: string
  analytics: CRMAnalytics
  onNavigate: (tab: string) => void
}

export function CRMDashboard({ companyId, userId, analytics, onNavigate }: CRMDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRM Dashboard</h2>
      <p className="text-muted-foreground">
        Comprehensive customer relationship management for {companyId}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('contacts')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContacts}</div>
            <p className="text-xs text-muted-foreground">Active customer contacts</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('pipeline')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active deals in pipeline</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.winRate}%</div>
            <p className="text-xs text-muted-foreground">Deal closure success rate</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('activities')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averageDealSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average value per deal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}