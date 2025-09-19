import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartData, TimeSeriesData } from '@/types/dashboard'

interface BaseChartProps {
  title: string
  data: ChartData[] | TimeSeriesData[]
  width?: number
  height?: number
  isLoading?: boolean
  error?: string | null
  className?: string
  onDataPointClick?: (dataPoint: ChartData | TimeSeriesData) => void
}

// Simple Bar Chart Component
export function BarChart({ title, data, width = 400, height = 300, isLoading, error, className, onDataPointClick }: BaseChartProps) {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">{title} - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data as ChartData[]
  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{chartData.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div 
              key={item.id} 
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
              onClick={() => onDataPointClick?.(item)}
            >
              <div className="w-16 text-sm font-medium text-muted-foreground">
                {item.name}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-muted rounded-md overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-md"
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || 'hsl(var(--primary))'
                    }}
                  />
                </div>
              </div>
              <div className="w-20 text-right text-sm font-mono">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Line Chart Component
export function LineChart({ title, data, width = 400, height = 300, isLoading, error, className, onDataPointClick }: BaseChartProps) {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">{title} - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const timeSeriesData = data as TimeSeriesData[]
  const maxValue = Math.max(...timeSeriesData.map(d => d.value))
  const minValue = Math.min(...timeSeriesData.map(d => d.value))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{timeSeriesData.length} points</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 w-full">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 24" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              points={timeSeriesData.map((point, index) => {
                const x = (index / (timeSeriesData.length - 1)) * 100
                const y = ((maxValue - point.value) / (maxValue - minValue)) * 100
                return `${x}%,${y}%`
              }).join(' ')}
            />
            
            {/* Data points */}
            {timeSeriesData.map((point, index) => {
              const x = (index / (timeSeriesData.length - 1)) * 100
              const y = ((maxValue - point.value) / (maxValue - minValue)) * 100
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="hsl(var(--primary))"
                  className="cursor-pointer hover:r-4 transition-all"
                  onClick={() => onDataPointClick?.(point)}
                />
              )
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxValue.toLocaleString()}</span>
            <span>{((maxValue + minValue) / 2).toLocaleString()}</span>
            <span>{minValue.toLocaleString()}</span>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{new Date(timeSeriesData[0]?.timestamp).toLocaleDateString()}</span>
          <span>{new Date(timeSeriesData[timeSeriesData.length - 1]?.timestamp).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Pie Chart Component
export function PieChart({ title, data, width = 400, height = 300, isLoading, error, className, onDataPointClick }: BaseChartProps) {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">{title} - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data as ChartData[]
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  let cumulativePercentage = 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">Total: {total.toLocaleString()}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg width="150" height="150" className="transform -rotate-90">
              {chartData.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = -cumulativePercentage
                const currentCumulative = cumulativePercentage
                cumulativePercentage += percentage

                return (
                  <circle
                    key={item.id}
                    cx="75"
                    cy="75"
                    r="60"
                    fill="transparent"
                    stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onDataPointClick?.(item)}
                  />
                )
              })}
            </svg>
          </div>
          
          <div className="flex-1 space-y-2">
            {chartData.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => onDataPointClick?.(item)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-sm font-medium flex-1">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
                <span className="text-sm font-mono">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Metric Display Component
export function MetricCard({ title, data, isLoading, error, className }: BaseChartProps) {
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">{title} - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data as ChartData[]
  const primaryMetric = chartData[0]

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {typeof primaryMetric?.value === 'number' 
              ? primaryMetric.value.toLocaleString() 
              : primaryMetric?.value || 'N/A'}
          </div>
          {chartData.length > 1 && (
            <div className="text-xs text-muted-foreground">
              {chartData.slice(1).map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}