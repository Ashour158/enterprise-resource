export interface ChartData {
  id: string
  name: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  series?: string
  metadata?: Record<string, any>
}

export interface ChartConfig {
  id: string
  title: string
  type: ChartType
  dataSource: string
  moduleId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  settings: ChartSettings
  filters?: DashboardFilter[]
  companyIds?: string[]
  isRealTime: boolean
  refreshInterval?: number
}

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'donut'
  | 'area' 
  | 'scatter'
  | 'gauge' 
  | 'metric'
  | 'heatmap'
  | 'treemap'
  | 'funnel'
  | 'waterfall'
  | 'radar'
  | 'sankey'
  | 'candlestick'

export interface ChartSettings {
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  animation?: boolean
  responsive?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  customOptions?: Record<string, any>
}

export interface DashboardLayout {
  id: string
  name: string
  description?: string
  userId: string
  companyId: string
  isDefault: boolean
  isPublic: boolean
  charts: ChartConfig[]
  filters: DashboardFilter[]
  settings: DashboardSettings
  createdAt: string
  updatedAt: string
}

export interface DashboardSettings {
  autoRefresh: boolean
  refreshInterval: number
  theme: 'light' | 'dark' | 'auto'
  density: 'compact' | 'comfortable' | 'spacious'
  showHeader: boolean
  showFilters: boolean
  allowExport: boolean
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text'
  field: string
  value: any
  options?: { label: string; value: any }[]
  isRequired?: boolean
}

export interface DataVisualizationMetrics {
  totalCharts: number
  activeCharts: number
  realTimeCharts: number
  avgLoadTime: number
  dataPoints: number
  lastUpdate: string
  syncStatus: 'synced' | 'syncing' | 'error'
}

export interface AIInsight {
  id: string
  type: 'trend' | 'anomaly' | 'forecast' | 'correlation' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  chartId?: string
  moduleId: string
  companyId: string
  data?: any
  actions?: string[]
  createdAt: string
}

export interface DrillDownContext {
  chartId: string
  level: number
  filters: Record<string, any>
  breadcrumb: string[]
}

export interface ExportOptions {
  format: 'png' | 'pdf' | 'xlsx' | 'csv'
  includeCharts: boolean
  includeData: boolean
  dateRange?: { start: string; end: string }
  companyId?: string
}

export interface RealtimeDataUpdate {
  chartId: string
  companyId: string
  moduleId: string
  data: ChartData[] | TimeSeriesData[]
  timestamp: string
  changeType: 'add' | 'update' | 'delete'
}

export interface DashboardPermission {
  userId: string
  dashboardId: string
  permission: 'view' | 'edit' | 'admin'
  companyId: string
  grantedBy: string
  grantedAt: string
}