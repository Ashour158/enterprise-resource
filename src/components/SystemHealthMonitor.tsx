import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SystemHealth } from '@/types/erp'
import { 
  Activity, 
  Database, 
  Globe, 
  Shield, 
  Archive, 
  EnvelopeSimple,
  CheckCircle,
  Warning,
  XCircle
} from '@phosphor-icons/react'

interface SystemHealthMonitorProps {
  health: SystemHealth
}

export function SystemHealthMonitor({ health }: SystemHealthMonitorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} className="text-green-600" />
      case 'degraded': return <Warning size={16} className="text-yellow-600" />
      case 'offline': return <XCircle size={16} className="text-red-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200'
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'database': return <Database size={16} />
      case 'api gateway': return <Globe size={16} />
      case 'authentication': return <Shield size={16} />
      case 'file storage': return <Archive size={16} />
      case 'email service': return <EnvelopeSimple size={16} />
      default: return <Activity size={16} />
    }
  }

  const getOverallHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const successRate = (health.apiCalls.successful / health.apiCalls.total) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          <CardTitle className="text-lg">System Health</CardTitle>
        </div>
        <CardDescription>
          Real-time monitoring of system performance and service status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="font-medium">Overall Status</span>
          <Badge 
            variant="outline"
            className={`${getOverallHealthColor(health.overall)} border-current`}
          >
            {health.overall}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Globe size={16} />
            Services Status
          </h4>
          {health.services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getServiceIcon(service.name)}
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {service.responseTime}ms • {service.uptime}% uptime
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <Badge 
                  variant="outline" 
                  className={getStatusColor(service.status)}
                >
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">API Performance</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {health.apiCalls.total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Calls</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {successRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {health.apiCalls.failed.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>API Success Rate</span>
              <span>{successRate.toFixed(1)}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}