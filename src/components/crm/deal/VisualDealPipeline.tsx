import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  DollarSign, 
  Calendar, 
  TrendUp, 
  Flag, 
  Eye, 
  PencilSimple,
  Copy,
  TrashSimple,
  Robot,
  Clock
} from '@phosphor-icons/react'

interface Deal {
  id: string
  dealNumber: string
  title: string
  description: string
  accountId: string
  contactId: string
  ownerId: string
  value: number
  currency: string
  stage: string
  probability: number
  closeDate: string
  source: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'won' | 'lost' | 'on_hold'
  aiScore: number
  aiRecommendations: string[]
  winProbability: number
  riskFactors: string[]
  nextBestActions: string[]
  customFields: Record<string, any>
  tags: string[]
  createdAt: string
  updatedAt: string
  lastActivityDate: string
  daysInStage: number
}

interface DealPipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  isActive: boolean
  dealCount: number
  dealValue: number
  avgDaysInStage: number
  conversionRate: number
}

interface VisualDealPipelineProps {
  deals: Deal[]
  stages: DealPipelineStage[]
  onDealClick: (deal: Deal) => void
  onStageUpdate: (dealId: string, newStage: string) => void
  onDealUpdate: (deal: Deal) => void
}

interface DraggedDeal {
  deal: Deal
  offset: { x: number; y: number }
}

export function VisualDealPipeline({
  deals,
  stages,
  onDealClick,
  onStageUpdate,
  onDealUpdate
}: VisualDealPipelineProps) {
  const [draggedDeal, setDraggedDeal] = useState<DraggedDeal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    const color = priority === 'high' ? 'text-red-600' : 
                 priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
    return <Flag className={`h-4 w-4 ${color}`} />
  }

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getStageMetrics = (stageId: string) => {
    const stageDeals = getDealsByStage(stageId)
    const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
    const avgDaysInStage = stageDeals.length > 0 
      ? Math.round(stageDeals.reduce((sum, deal) => sum + deal.daysInStage, 0) / stageDeals.length)
      : 0
    
    return {
      count: stageDeals.length,
      totalValue,
      avgDaysInStage
    }
  }

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    setDraggedDeal({ deal, offset })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', deal.id)
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1'
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: React.DragEvent, newStageId: string) => {
    e.preventDefault()
    
    if (draggedDeal && draggedDeal.deal.stage !== newStageId) {
      // Update the stage probability based on the new stage
      const newStage = stages.find(s => s.id === newStageId)
      const updatedDeal = {
        ...draggedDeal.deal,
        stage: newStageId,
        probability: newStage?.probability || draggedDeal.deal.probability,
        updatedAt: new Date().toISOString(),
        daysInStage: 0 // Reset days in stage
      }
      
      onStageUpdate(draggedDeal.deal.id, newStageId)
      onDealUpdate(updatedDeal)
    }
    
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDaysOverdue = (closeDate: string) => {
    const today = new Date()
    const close = new Date(closeDate)
    const diffTime = today.getTime() - close.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const isOverdue = (closeDate: string) => {
    return new Date(closeDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0))}
                </p>
              </div>
              <TrendUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  {deals.length > 0 ? formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length) : '$0'}
                </p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages
          .filter(stage => stage.isActive)
          .sort((a, b) => a.order - b.order)
          .map((stage) => {
            const stageDeals = getDealsByStage(stage.id)
            const metrics = getStageMetrics(stage.id)
            const isDragOver = dragOverStage === stage.id
            
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 ${isDragOver ? 'ring-2 ring-primary' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <Card className={`h-full ${isDragOver ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader className="pb-3" style={{ backgroundColor: stage.color }}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{stage.name}</CardTitle>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {metrics.count}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-white/90">
                      <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span className="font-medium">{formatCurrency(metrics.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Days:</span>
                        <span className="font-medium">{metrics.avgDaysInStage}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate:</span>
                        <span className="font-medium">{stage.probability}%</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 space-y-3 max-h-96 overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                          <TrendUp className="h-6 w-6" />
                        </div>
                        <p className="text-sm">No deals in this stage</p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          className={`cursor-move hover:shadow-md transition-all border-l-4 ${getPriorityColor(deal.priority)}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onDealClick(deal)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-2">{deal.title}</h4>
                                <p className="text-xs text-muted-foreground">{deal.dealNumber}</p>
                              </div>
                              {getPriorityIcon(deal.priority)}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Value:</span>
                                <span className="text-sm font-bold">{formatCurrency(deal.value)}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Probability:</span>
                                <div className="flex items-center gap-1">
                                  <Progress value={deal.probability} className="w-12 h-1" />
                                  <span className="text-xs font-medium">{deal.probability}%</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Close Date:</span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-xs ${isOverdue(deal.closeDate) ? 'text-red-600 font-medium' : ''}`}>
                                    {new Date(deal.closeDate).toLocaleDateString()}
                                  </span>
                                  {isOverdue(deal.closeDate) && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                      {getDaysOverdue(deal.closeDate)}d
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Days in Stage:</span>
                                <span className="text-xs">{deal.daysInStage}d</span>
                              </div>
                            </div>

                            {/* AI Insights */}
                            <div className="border-t pt-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Robot className="h-3 w-3 text-purple-600" />
                                <span className="text-xs font-medium">AI Score: {deal.aiScore}/100</span>
                              </div>
                              <div className="space-y-1">
                                {deal.nextBestActions.slice(0, 1).map((action, index) => (
                                  <p key={index} className="text-xs text-muted-foreground">• {action}</p>
                                ))}
                              </div>
                            </div>

                            {/* Risk Indicators */}
                            {deal.riskFactors.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600" />
                                <span className="text-xs text-amber-600">
                                  {deal.riskFactors.length} risk factor{deal.riskFactors.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            {/* Tags */}
                            {deal.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {deal.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDealClick(deal)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Edit deal
                                  }}
                                >
                                  <PencilSimple className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Clone deal
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Avatar className="h-6 w-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xs">
                                  {deal.ownerId.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
      </div>

      {/* Pipeline Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages
              .filter(stage => stage.isActive && stage.id !== 'closed_lost')
              .sort((a, b) => a.order - b.order)
              .map((stage, index, array) => {
                const stageDeals = getDealsByStage(stage.id)
                const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
                const maxValue = Math.max(...array.map(s => getDealsByStage(s.id).reduce((sum, deal) => sum + deal.value, 0)))
                const percentage = maxValue > 0 ? (stageValue / maxValue) * 100 : 0
                
                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{stageDeals.length} deals</span>
                        <span className="text-sm font-bold">{formatCurrency(stageValue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: stage.color 
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}