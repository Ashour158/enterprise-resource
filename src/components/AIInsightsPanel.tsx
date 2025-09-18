import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AIInsight } from '@/types/erp'
import { Brain, TrendUp, Warning, Lightbulb, CheckCircle } from '@phosphor-icons/react'

interface AIInsightsPanelProps {
  insights: AIInsight[]
  onActionClick: (insight: AIInsight, action: string) => void
}

export function AIInsightsPanel({ insights = [], onActionClick }: AIInsightsPanelProps) {
  // Ensure safe array
  const safeInsights = Array.isArray(insights) ? insights : []
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendUp size={16} className="text-blue-600" />
      case 'recommendation': return <Lightbulb size={16} className="text-green-600" />
      case 'alert': return <Warning size={16} className="text-red-600" />
      case 'optimization': return <CheckCircle size={16} className="text-purple-600" />
      default: return <Brain size={16} className="text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
        </div>
        <CardDescription>
          Machine learning recommendations and predictions for your business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeInsights.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Brain size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI insights available</p>
          </div>
        ) : (
          safeInsights.map((insight) => (
          <div 
            key={insight.id} 
            className="p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-semibold text-sm">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getImpactColor(insight.impact)}
                >
                  {insight.impact} impact
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {insight.module}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {insight.description}
            </p>
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{insight.confidence}%</span>
              </div>
              <Progress value={insight.confidence} className="h-2" />
            </div>
            
            {insight.actionable && insight.actions && (
              <div className="flex gap-2 flex-wrap">
                {insight.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onActionClick(insight, action.action)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))
        )}
      </CardContent>
    </Card>
  )
}