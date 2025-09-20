import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  WarningCircle, 
  TrendDown, 
  Clock, 
  DollarSign,
  Calendar,
  Users,
  Target,
  AlertTriangle
} from '@phosphor-icons/react'

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  closeDate: string
  daysInStage: number
  riskFactors: string[]
}

interface DealRiskAssessmentProps {
  deal: Deal
  riskFactors: string[]
}

export function DealRiskAssessment({ deal, riskFactors }: DealRiskAssessmentProps) {
  // Calculate risk score based on various factors
  const calculateRiskScore = () => {
    let riskScore = 0
    
    // Days in stage risk
    if (deal.daysInStage > 30) riskScore += 25
    else if (deal.daysInStage > 14) riskScore += 15
    
    // Close date risk
    const daysToClose = Math.ceil((new Date(deal.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysToClose < 0) riskScore += 40 // Overdue
    else if (daysToClose < 7) riskScore += 20 // Due soon
    else if (daysToClose < 14) riskScore += 10
    
    // Value risk (higher value = higher risk)
    if (deal.value > 500000) riskScore += 15
    else if (deal.value > 100000) riskScore += 10
    
    // Probability risk
    if (deal.probability < 25) riskScore += 20
    else if (deal.probability < 50) riskScore += 10
    
    // Risk factors
    riskScore += Math.min(riskFactors.length * 5, 20)
    
    return Math.min(riskScore, 100)
  }

  const riskScore = calculateRiskScore()
  
  const getRiskLevel = (score: number) => {
    if (score >= 75) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (score >= 50) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (score >= 25) return { level: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    return { level: 'Very Low', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  const risk = getRiskLevel(riskScore)

  const riskCategories = [
    {
      name: 'Timeline Risk',
      icon: <Clock className="h-5 w-5" />,
      factors: [
        deal.daysInStage > 30 && `${deal.daysInStage} days in current stage`,
        new Date(deal.closeDate) < new Date() && 'Deal is overdue',
        Math.ceil((new Date(deal.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 7 && 'Close date within 7 days'
      ].filter(Boolean),
      score: Math.min(Math.max(deal.daysInStage - 14, 0) * 2 + (new Date(deal.closeDate) < new Date() ? 40 : 0), 100)
    },
    {
      name: 'Financial Risk',
      icon: <DollarSign className="h-5 w-5" />,
      factors: [
        deal.value > 500000 && 'High-value deal requires extra attention',
        deal.probability < 50 && `Low probability (${deal.probability}%)`,
        riskFactors.includes('Budget constraints') && 'Budget constraints identified'
      ].filter(Boolean),
      score: (deal.value > 500000 ? 30 : deal.value > 100000 ? 15 : 0) + (deal.probability < 50 ? 25 : 0)
    },
    {
      name: 'Competitive Risk',
      icon: <Target className="h-5 w-5" />,
      factors: [
        riskFactors.includes('Competitor presence') && 'Competitor identified in opportunity',
        riskFactors.includes('Price pressure') && 'Price pressure from alternatives',
        riskFactors.includes('Feature gaps') && 'Missing required features'
      ].filter(Boolean),
      score: riskFactors.filter(f => ['Competitor presence', 'Price pressure', 'Feature gaps'].includes(f)).length * 15
    },
    {
      name: 'Stakeholder Risk',
      icon: <Users className="h-5 w-5" />,
      factors: [
        riskFactors.includes('Decision maker unavailable') && 'Key decision maker not engaged',
        riskFactors.includes('Multiple stakeholders') && 'Complex stakeholder structure',
        riskFactors.includes('Internal champion lacking') && 'No internal champion identified'
      ].filter(Boolean),
      score: riskFactors.filter(f => ['Decision maker unavailable', 'Multiple stakeholders', 'Internal champion lacking'].includes(f)).length * 12
    }
  ]

  const mitigationStrategies = [
    {
      risk: 'High timeline risk',
      strategies: [
        'Schedule immediate stakeholder meeting',
        'Expedite decision-making process',
        'Offer implementation incentives',
        'Assign dedicated success manager'
      ]
    },
    {
      risk: 'Financial concerns',
      strategies: [
        'Provide flexible payment terms',
        'Offer ROI analysis and business case',
        'Consider phased implementation',
        'Introduce value-based pricing'
      ]
    },
    {
      risk: 'Competitive pressure',
      strategies: [
        'Highlight unique differentiators',
        'Provide competitive comparison',
        'Offer exclusive features or pricing',
        'Accelerate proof of concept'
      ]
    },
    {
      risk: 'Stakeholder issues',
      strategies: [
        'Map all decision makers and influencers',
        'Develop stakeholder engagement plan',
        'Identify and nurture internal champion',
        'Conduct executive briefing sessions'
      ]
    }
  ]

  const getRelevantMitigationStrategies = () => {
    const strategies: string[] = []
    
    if (riskCategories[0].score > 30) strategies.push(...mitigationStrategies[0].strategies)
    if (riskCategories[1].score > 25) strategies.push(...mitigationStrategies[1].strategies)
    if (riskCategories[2].score > 20) strategies.push(...mitigationStrategies[2].strategies)
    if (riskCategories[3].score > 15) strategies.push(...mitigationStrategies[3].strategies)
    
    return strategies.slice(0, 6) // Limit to top 6 strategies
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <WarningCircle className="h-6 w-6 text-orange-600" />
        <h3 className="text-lg font-semibold">Risk Assessment</h3>
      </div>

      {/* Overall Risk Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Overall Risk Level</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive risk analysis for this deal
              </p>
            </div>
            <Badge className={`${risk.bgColor} ${risk.color} text-lg px-4 py-2`}>
              {risk.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Risk Score</span>
              <span className="font-medium">{riskScore}/100</span>
            </div>
            <Progress 
              value={riskScore} 
              className="h-3"
              // Apply different colors based on risk level
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskCategories.map((category) => (
          <Card key={category.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                {category.icon}
                <h4 className="font-medium">{category.name}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk Level</span>
                  <span className="font-medium">{category.score}/100</span>
                </div>
                <Progress value={category.score} className="h-2" />
                
                {category.factors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1">Risk Factors:</p>
                    <div className="space-y-1">
                      {category.factors.map((factor, index) => (
                        <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
                          {factor}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Identified Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Mitigation Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRelevantMitigationStrategies().map((strategy, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{strategy}</p>
                </div>
              </div>
            ))}
            
            {getRelevantMitigationStrategies().length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No specific mitigation strategies needed at this time.</p>
                <p className="text-xs">Risk levels are within acceptable thresholds.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Days in current stage</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{deal.daysInStage} days</div>
                <div className="text-xs text-muted-foreground">
                  {deal.daysInStage > 30 ? 'High risk' : deal.daysInStage > 14 ? 'Medium risk' : 'Low risk'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm">Days until close date</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {Math.ceil((new Date(deal.closeDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(deal.closeDate) < new Date() ? 'Overdue' : 'On track'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <TrendDown className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Win probability</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{deal.probability}%</div>
                <div className="text-xs text-muted-foreground">
                  {deal.probability > 75 ? 'High confidence' : 
                   deal.probability > 50 ? 'Medium confidence' : 'Low confidence'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}