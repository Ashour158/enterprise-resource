import { useState, useEffect, useCallback } from 'react'
import { ChartData, TimeSeriesData, RealtimeDataUpdate, DataVisualizationMetrics } from '@/types/dashboard'

interface UseRealtimeChartsProps {
  companyId: string
  moduleIds?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseRealtimeChartsReturn {
  chartData: Record<string, ChartData[] | TimeSeriesData[]>
  metrics: DataVisualizationMetrics
  isLoading: boolean
  error: string | null
  lastUpdate: Date | null
  updateChartData: (chartId: string, data: ChartData[] | TimeSeriesData[]) => void
  refreshData: (chartId?: string) => Promise<void>
  subscribeToChart: (chartId: string) => void
  unsubscribeFromChart: (chartId: string) => void
}

export function useRealtimeCharts({
  companyId,
  moduleIds = [],
  autoRefresh = true,
  refreshInterval = 30000
}: UseRealtimeChartsProps): UseRealtimeChartsReturn {
  const [chartData, setChartData] = useState<Record<string, ChartData[] | TimeSeriesData[]>>({})
  const [subscribedCharts, setSubscribedCharts] = useState<string[]>([])
  const [metrics, setMetrics] = useState<DataVisualizationMetrics>({
    totalCharts: 0,
    activeCharts: 0,
    realTimeCharts: 0,
    avgLoadTime: 0,
    dataPoints: 0,
    lastUpdate: new Date().toISOString(),
    syncStatus: 'synced'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Generate mock data for different chart types
  const generateMockData = useCallback((chartId: string, type: 'chart' | 'timeseries' = 'chart'): ChartData[] | TimeSeriesData[] => {
    if (type === 'timeseries') {
      const data: TimeSeriesData[] = []
      const now = new Date()
      for (let i = 29; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString()
        data.push({
          timestamp,
          value: Math.floor(Math.random() * 1000) + 500,
          series: 'primary',
          metadata: { chartId, companyId }
        })
      }
      return data
    }

    const categories = ['Q1', 'Q2', 'Q3', 'Q4']
    return categories.map((category, index) => ({
      id: `${chartId}-${index}`,
      name: category,
      value: Math.floor(Math.random() * 100000) + 10000,
      color: `hsl(${index * 90}, 70%, 50%)`,
      metadata: { chartId, companyId, category }
    }))
  }, [companyId])

  // Simulate real-time data updates
  const simulateRealtimeUpdate = useCallback((chartId: string) => {
    const currentData = chartData[chartId]
    if (!currentData) return

    const updatedData = currentData.map(item => {
      if ('timestamp' in item) {
        // Time series data
        return {
          ...item,
          value: Math.max(0, item.value + (Math.random() - 0.5) * 100)
        }
      } else {
        // Chart data
        return {
          ...item,
          value: Math.max(0, item.value + (Math.random() - 0.5) * 5000)
        }
      }
    })

    setChartData(prev => ({
      ...prev,
      [chartId]: updatedData
    }))

    setLastUpdate(new Date())
  }, [chartData])

  // Update chart data
  const updateChartData = useCallback((chartId: string, data: ChartData[] | TimeSeriesData[]) => {
    setChartData(prev => ({
      ...prev,
      [chartId]: data
    }))
    setLastUpdate(new Date())
  }, [])

  // Refresh data for specific chart or all charts
  const refreshData = useCallback(async (chartId?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      if (chartId) {
        const newData = generateMockData(chartId, chartId.includes('timeseries') ? 'timeseries' : 'chart')
        updateChartData(chartId, newData)
      } else {
        // Refresh all subscribed charts
        const newChartData: Record<string, ChartData[] | TimeSeriesData[]> = {}
        subscribedCharts.forEach(id => {
          newChartData[id] = generateMockData(id, id.includes('timeseries') ? 'timeseries' : 'chart')
        })
        setChartData(newChartData)
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }, [subscribedCharts, generateMockData, updateChartData])

  // Subscribe to chart updates
  const subscribeToChart = useCallback((chartId: string) => {
    setSubscribedCharts(prev => {
      if (!prev.includes(chartId)) {
        return [...prev, chartId]
      }
      return prev
    })
    
    // Initialize with mock data
    const newData = generateMockData(chartId, chartId.includes('timeseries') ? 'timeseries' : 'chart')
    updateChartData(chartId, newData)
  }, [generateMockData, updateChartData])

  // Unsubscribe from chart updates
  const unsubscribeFromChart = useCallback((chartId: string) => {
    setSubscribedCharts(prev => prev.filter(id => id !== chartId))
    
    setChartData(prev => {
      const newData = { ...prev }
      delete newData[chartId]
      return newData
    })
  }, [])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || subscribedCharts.length === 0) return

    const interval = setInterval(() => {
      subscribedCharts.forEach(chartId => {
        simulateRealtimeUpdate(chartId)
      })
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, subscribedCharts, refreshInterval, simulateRealtimeUpdate])

  // Update metrics
  useEffect(() => {
    const totalCharts = subscribedCharts.length
    const dataPoints = Object.values(chartData).reduce((sum, data) => sum + data.length, 0)
    
    setMetrics({
      totalCharts,
      activeCharts: totalCharts,
      realTimeCharts: totalCharts,
      avgLoadTime: 245, // Mock average
      dataPoints,
      lastUpdate: lastUpdate?.toISOString() || new Date().toISOString(),
      syncStatus: error ? 'error' : isLoading ? 'syncing' : 'synced'
    })
  }, [subscribedCharts, chartData, lastUpdate, error, isLoading])

  return {
    chartData,
    metrics,
    isLoading,
    error,
    lastUpdate,
    updateChartData,
    refreshData,
    subscribeToChart,
    unsubscribeFromChart
  }
}