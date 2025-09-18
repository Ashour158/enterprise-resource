import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  Buildings, 
  CaretDown, 
  Gear, 
  SignOut, 
  User 
} from '@phosphor-icons/react'
import { Company, User as UserType, Notification } from '@/types/erp'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user: UserType
  currentCompany: Company
  companies: Company[]
  notifications: Notification[]
  onCompanyChange: (companyId: string) => void
  onNotificationClick: () => void
}

export function Header({ 
  user, 
  currentCompany, 
  companies, 
  notifications,
  onCompanyChange,
  onNotificationClick 
}: HeaderProps) {
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Buildings size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ERP System</h1>
              <p className="text-xs text-muted-foreground">Enterprise Resource Planning</p>
            </div>
          </div>
          
          <div className="h-6 w-px bg-border/50" />
          
          <DropdownMenu open={isCompanyMenuOpen} onOpenChange={setIsCompanyMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-9"
                size="sm"
              >
                <Buildings size={16} />
                <span className="max-w-32 truncate">{currentCompany.name}</span>
                <CaretDown size={12} className={cn(
                  "transition-transform duration-200",
                  isCompanyMenuOpen && "rotate-180"
                )} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {companies.map((company) => (
                <DropdownMenuItem 
                  key={company.id}
                  onClick={() => onCompanyChange(company.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs text-muted-foreground">{company.domain}</span>
                  </div>
                  {company.id === currentCompany.id && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={onNotificationClick}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
                <CaretDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Gear className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <SignOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}