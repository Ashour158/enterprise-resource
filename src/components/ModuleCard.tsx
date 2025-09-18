import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Buildings, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendUp, 
  CreditCard, 
  FileText, 
  ChartBar, 
  Gear, 
  Truck, 
  UserCheck, 
  Calendar, 
  ChatCircle, 
  Shield,
  ArrowUp,
  ArrowDown,
  Minus
} from '@phosphor-icons/react'
import { ERPModule } from '@/types/erp'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  module: ERPModule
  onSelect: (moduleId: string) => void
}

const iconMap = {
  CreditCard,
  Package,
  TrendUp,
  ShoppingCart,
  Users,
  Gear,
  Calendar,
  Truck,
  Shield,
  Buildings,
  ChartBar,
  FileText,
  UserCheck,
  ChatCircle
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <ArrowUp size={12} className="text-green-600" />
  if (trend === 'down') return <ArrowDown size={12} className="text-red-600" />
  return <Minus size={12} className="text-gray-500" />
}

export function ModuleCard({ module, onSelect }: ModuleCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = iconMap[module.icon as keyof typeof iconMap]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card 
      className={cn(
        'h-full transition-all duration-200 cursor-pointer border-border/50',
        'hover:shadow-lg hover:border-primary/20 hover:-translate-y-1',
        isHovered && 'shadow-lg border-primary/20 -translate-y-1'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(module.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {IconComponent && <IconComponent size={24} />}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{module.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="outline" 
              className={cn('text-xs font-medium', getStatusColor(module.status))}
            >
              {module.status}
            </Badge>
            {module.notifications > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {module.notifications > 99 ? '99+' : module.notifications}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          {module.quickStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {stat.value}
                </span>
                <TrendIcon trend={stat.trend} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-primary hover:text-primary hover:bg-primary/10"
          >
            Open Module →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}