import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Funnel, 
  Plus, 
  Eye, 
  ArrowRight,
  TrendUp,
  Target,
  Star,
  Clock,
  DollarSign
} from '@phosphor-icons/react'

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  email: string
  companyName?: string
  leadStatus: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'
  leadRating: 'hot' | 'warm' | 'cold'
  leadPriority: 'high' | 'medium' | 'low'
  aiLeadScore: number
  aiConversionProbability: number
  aiEstimatedDealValue: number
  leadSource: string
  createdAt: string
  nextFollowUpDate?: string
  tags: string[]
}

interface LeadPipelineProps {
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
  onLeadSelect: (lead: Lead) => void
}

export function LeadPipeline({ leads, onLeadUpdate, onLeadSelect }: LeadPipelineProps) {
  const pipelineStages = [
    { 
      key: 'new', 
      label: 'New Leads', 
      color: 'bg-blue-100 text-blue-800',
      description: 'Recently captured leads'
    },
    { 
      key: 'contacted', 
      label: 'Contacted', 
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Initial contact made'
    },
    { 
      key: 'qualified', 
      label: 'Qualified', 
      color: 'bg-green-100 text-green-800',
      description: 'Qualified prospects'
    },
    { 
      key: 'converted', 
      label: 'Converted', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Successful conversions'
    }
  ]

  const stageData = useMemo(() => {
    return pipelineStages.map(stage => {
      const stageLeads = leads.filter(lead => lead.leadStatus === stage.key)
      const totalValue = stageLeads.reduce((sum, lead) => sum + lead.aiEstimatedDealValue, 0)
      const avgScore = stageLeads.length > 0 
        ? stageLeads.reduce((sum, lead) => sum + lead.aiLeadScore, 0) / stageLeads.length 
        : 0

      return {
        ...stage,
        leads: stageLeads,
        count: stageLeads.length,
        totalValue,
        avgScore: Math.round(avgScore)
      }
    })
  }, [leads])

  const totalLeads = leads.length
  const totalValue = leads.reduce((sum, lead) => sum + lead.aiEstimatedDealValue, 0)
  const conversionRate = totalLeads > 0 
    ? (stageData.find(s => s.key === 'converted')?.count || 0) / totalLeads * 100 
    : 0

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(lead))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    try {
      const leadData = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (leadData.id && leadData.leadStatus !== newStatus) {
        onLeadUpdate(leadData.id, { leadStatus: newStatus as Lead['leadStatus'] })
      }
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'hot': return <Star className="text-red-500" size={12} />
      case 'warm': return <Star className="text-orange-500" size={12} />
      case 'cold': return <Star className="text-blue-500" size={12} />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <Funnel className="text-blue-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="text-green-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="text-purple-500" size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalLeads > 0 ? totalValue / totalLeads : 0)}
                </p>
              </div>
              <TrendUp className="text-orange-500" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Funnel size={20} />
            Lead Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageData.map((stage, index) => {
              const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0
              const nextStage = stageData[index + 1]
              const conversionFromPrev = index > 0 && stageData[index - 1].count > 0
                ? (stage.count / stageData[index - 1].count) * 100
                : 100
              
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={stage.color}>
                        {stage.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {stage.count} leads ({percentage.toFixed(1)}%)
                      </span>
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {conversionFromPrev.toFixed(1)}% conversion
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(stage.totalValue)}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  {index < stageData.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stageData.map((stage) => (
          <Card 
            key={stage.key}
            className="h-fit"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={stage.color}>
                    {stage.label}
                  </Badge>
                </CardTitle>
                <Badge variant="outline">
                  {stage.count}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {stage.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Avg Score: {stage.avgScore}
                </span>
                <span className="font-medium">
                  {formatCurrency(stage.totalValue)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 max-h-96 overflow-y-auto">
              {stage.leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  className={`p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(lead.leadPriority)}`}
                  onClick={() => onLeadSelect(lead)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {lead.firstName} {lead.lastName}
                      </div>
                      {lead.companyName && (
                        <div className="text-xs text-muted-foreground truncate">
                          {lead.companyName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {getRatingIcon(lead.leadRating)}
                      <Badge variant="outline" className="text-xs">
                        {lead.aiLeadScore}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Est. Value</span>
                      <span className="font-medium">
                        {formatCurrency(lead.aiEstimatedDealValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Conversion</span>
                      <span className="font-medium">
                        {(lead.aiConversionProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={lead.aiConversionProbability * 100} 
                      className="h-1"
                    />
                  </div>

                  {lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lead.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {lead.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{lead.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {lead.nextFollowUpDate && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock size={10} />
                      <span>
                        Follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      {lead.leadSource}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLeadSelect(lead)
                      }}
                      className="h-6 px-2"
                    >
                      <Eye size={12} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {stage.leads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Funnel size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No leads in this stage</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Stage</th>
                  <th className="text-right p-2">Count</th>
                  <th className="text-right p-2">Total Value</th>
                  <th className="text-right p-2">Avg Score</th>
                  <th className="text-right p-2">Conversion %</th>
                  <th className="text-right p-2">Avg Deal Size</th>
                </tr>
              </thead>
              <tbody>
                {stageData.map((stage, index) => {
                  const conversionRate = index > 0 && stageData[index - 1].count > 0
                    ? (stage.count / stageData[index - 1].count) * 100
                    : 100
                  const avgDealSize = stage.count > 0 ? stage.totalValue / stage.count : 0

                  return (
                    <tr key={stage.key} className="border-b">
                      <td className="p-2">
                        <Badge className={stage.color}>
                          {stage.label}
                        </Badge>
                      </td>
                      <td className="text-right p-2 font-medium">
                        {stage.count}
                      </td>
                      <td className="text-right p-2 font-medium">
                        {formatCurrency(stage.totalValue)}
                      </td>
                      <td className="text-right p-2">
                        {stage.avgScore}
                      </td>
                      <td className="text-right p-2">
                        {conversionRate.toFixed(1)}%
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(avgDealSize)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}