import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Zap, Target, Settings } from '@phosphor-icons/react'

interface LeadNurturingCampaignsProps {
  leads: any[]
  companyId: string
  userId: string
  userRole: string
}

export function LeadNurturingCampaigns({ leads, companyId, userId, userRole }: LeadNurturingCampaignsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={20} />
            Lead Nurturing Campaigns
          </CardTitle>
          <CardDescription>
            Automated email sequences and behavioral triggers for lead engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Zap size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nurturing Campaigns Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Advanced email automation and behavioral triggers will be available in the next update
          </p>
          <Button className="flex items-center gap-2">
            <Settings size={16} />
            Configure Campaigns
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function LeadSourceManager({ leadSources, leads, onSourceUpdate, companyId, userId, userRole }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Lead Source Management
          </CardTitle>
          <CardDescription>
            Manage and track performance of lead generation sources
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Target size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Source Management Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Comprehensive lead source tracking and ROI analysis will be available in the next update
          </p>
          <Button className="flex items-center gap-2">
            <Settings size={16} />
            Manage Sources
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}