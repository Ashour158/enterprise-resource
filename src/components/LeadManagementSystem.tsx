import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { LeadOverviewDashboard } from './LeadOverviewDashboard'
import { LeadDetailView } from './LeadDetailView'
import { LeadScoringEngine } from './LeadScoringEngine'
import { BulkLeadOperations } from './BulkLeadOperations'
import { AILeadInsights } from './AILeadInsights'
import { LeadNurturingCampaigns } from './LeadNurturingCampaigns'
import { LeadSourceManager } from './LeadSourceManager'
import { LeadAnalyticsDashboard } from './LeadAnalyticsDashboard'
import { Lead } from '@/types/lead'
import { mockLeads, mockLeadSources, mockLeadAnalytics, mockAILeadInsights } from '@/data/mockLeadData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  TrendUp, 
  Target, 
  Brain, 
  Upload, 
  Mail, 
  Database,
  ChartLine,
  Funnel,
  Star,
  Zap,
  Plus
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeadManagementSystemProps {
  companyId: string
  userId: string
  userRole: string
}

export function LeadManagementSystem({ companyId, userId, userRole }: LeadManagementSystemProps) {
  const [activeView, setActiveView] = useState('overview')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [leads, setLeads] = useKV(`leads-${companyId}`, mockLeads)
  const [leadSources, setLeadSources] = useKV(`lead-sources-${companyId}`, mockLeadSources)
  const [isLoading, setIsLoading] = useState(false)

  // Real-time lead scoring updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate AI lead scoring updates
      setLeads(currentLeads => 
        currentLeads.map(lead => {
          if (Math.random() < 0.1) { // 10% chance of score update
            const scoreChange = (Math.random() - 0.5) * 10
            const newScore = Math.max(0, Math.min(100, lead.ai_lead_score + scoreChange))
            
            if (Math.abs(scoreChange) > 2) {
              toast.info(`Lead score updated for ${lead.full_name}: ${newScore.toFixed(1)}`)
            }
            
            return {
              ...lead,
              ai_lead_score: newScore,
              updated_at: new Date().toISOString()
            }
          }
          return lead
        })
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [setLeads])

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead)
    setActiveView('detail')
  }

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    )
    setSelectedLead(updatedLead)
    toast.success('Lead updated successfully')
  }

  const handleBulkOperation = async (operation: any) => {
    setIsLoading(true)
    try {
      // Simulate bulk operation processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (operation.operation_type === 'delete') {
        setLeads(currentLeads => 
          currentLeads.filter(lead => !operation.lead_ids.includes(lead.id))
        )
        toast.success(`${operation.lead_ids.length} leads deleted successfully`)
      } else if (operation.operation_type === 'update') {
        setLeads(currentLeads => 
          currentLeads.map(lead => 
            operation.lead_ids.includes(lead.id) 
              ? { ...lead, ...operation.operation_data, updated_at: new Date().toISOString() }
              : lead
          )
        )
        toast.success(`${operation.lead_ids.length} leads updated successfully`)
      }
      
      setSelectedLeads([])
    } catch (error) {
      toast.error('Bulk operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getQuickStats = () => {
    const totalLeads = leads.length
    const newLeadsThisMonth = leads.filter(lead => {
      const createdDate = new Date(lead.created_at)
      const now = new Date()
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear()
    }).length
    
    const qualifiedLeads = leads.filter(lead => lead.lead_status === 'qualified').length
    const averageScore = leads.reduce((sum, lead) => sum + lead.ai_lead_score, 0) / totalLeads || 0
    const hotLeads = leads.filter(lead => lead.lead_rating === 'hot').length
    
    return [
      { label: 'Total Leads', value: totalLeads, icon: <Users size={20} />, color: 'text-blue-600' },
      { label: 'New This Month', value: newLeadsThisMonth, icon: <Plus size={20} />, color: 'text-green-600' },
      { label: 'Qualified Leads', value: qualifiedLeads, icon: <Target size={20} />, color: 'text-purple-600' },
      { label: 'Average Score', value: averageScore.toFixed(1), icon: <Star size={20} />, color: 'text-yellow-600' },
      { label: 'Hot Leads', value: hotLeads, icon: <Zap size={20} />, color: 'text-red-600' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {getQuickStats().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Lead Management Interface */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Lead Management System</h2>
            <p className="text-muted-foreground">
              AI-powered lead scoring, automated nurturing, and comprehensive lead analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <ChartLine size={16} />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="scoring" className="flex items-center gap-2">
                <Brain size={16} />
                AI Scoring
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Zap size={16} />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="nurturing" className="flex items-center gap-2">
                <Mail size={16} />
                Nurturing
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-2">
                <Funnel size={16} />
                Sources
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Upload size={16} />
                Bulk Operations
              </TabsTrigger>
              <TabsTrigger value="detail" className="flex items-center gap-2" disabled={!selectedLead}>
                <Database size={16} />
                Lead Detail
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                AI Scoring Active
              </Badge>
              {selectedLeads.length > 0 && (
                <Badge variant="secondary">
                  {selectedLeads.length} Selected
                </Badge>
              )}
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <LeadOverviewDashboard
            leads={leads}
            leadSources={leadSources}
            selectedLeads={selectedLeads}
            onLeadSelect={handleLeadSelect}
            onLeadUpdate={handleLeadUpdate}
            onSelectionChange={setSelectedLeads}
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LeadAnalyticsDashboard
            analytics={mockLeadAnalytics}
            leads={leads}
            leadSources={leadSources}
            companyId={companyId}
          />
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <LeadScoringEngine
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AILeadInsights
            insights={mockAILeadInsights}
            leads={leads}
            onLeadSelect={handleLeadSelect}
            companyId={companyId}
          />
        </TabsContent>

        <TabsContent value="nurturing" className="space-y-6">
          <LeadNurturingCampaigns
            leads={leads}
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <LeadSourceManager
            leadSources={leadSources}
            leads={leads}
            onSourceUpdate={(sources) => setLeadSources(sources)}
            companyId={companyId}
            userId={userId}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkLeadOperations
            leads={leads}
            selectedLeads={selectedLeads}
            onBulkOperation={handleBulkOperation}
            onLeadsUpdate={setLeads}
            companyId={companyId}
            userId={userId}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="detail" className="space-y-6">
          {selectedLead ? (
            <LeadDetailView
              lead={selectedLead}
              onLeadUpdate={handleLeadUpdate}
              onClose={() => {
                setSelectedLead(null)
                setActiveView('overview')
              }}
              companyId={companyId}
              userId={userId}
              userRole={userRole}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Lead Selected</h3>
                <p className="text-muted-foreground">
                  Select a lead from the overview to view detailed information and manage activities.
                </p>
                <Button 
                  onClick={() => setActiveView('overview')} 
                  className="mt-4"
                >
                  Go to Lead Overview
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}