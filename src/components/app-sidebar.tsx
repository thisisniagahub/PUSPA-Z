'use client'

import { useAppStore, type ViewId } from '@/lib/store'
import { canAccessView } from '@/lib/access-control'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  HandCoins,
  ArrowDownToLine,
  Calendar,
  Shield,
  BarChart3,
  ScanFace,
  FolderOpen,
  Activity,
  Heart,
  Bot,
  Settings,
  Lock,
  UserCog,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface NavItem {
  id: ViewId
  label: string
  labelMs?: string
  icon: React.ElementType
  badge?: string
  group?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelMs: 'Papan Pemuka', icon: LayoutDashboard, group: 'Utama' },
  { id: 'members', label: 'Members', labelMs: 'Ahli Asnaf', icon: Users, group: 'Utama' },
  { id: 'cases', label: 'Cases', labelMs: 'Kes', icon: FileText, group: 'Utama' },
  { id: 'activities', label: 'Activities', labelMs: 'Aktiviti', icon: Activity, group: 'Utama' },
  { id: 'donations', label: 'Donations', labelMs: 'Sumbangan', icon: HandCoins, group: 'Kewangan' },
  { id: 'donors', label: 'Donors', labelMs: 'Penderma', icon: Heart, group: 'Kewangan' },
  { id: 'disbursements', label: 'Disbursements', labelMs: 'Agihan', icon: ArrowDownToLine, group: 'Kewangan' },
  { id: 'programmes', label: 'Programmes', labelMs: 'Program', icon: Calendar, group: 'Operasi' },
  { id: 'volunteers', label: 'Volunteers', labelMs: 'Sukarelawan', icon: Sparkles, group: 'Operasi' },
  { id: 'documents', label: 'Documents', labelMs: 'Dokumen', icon: FolderOpen, group: 'Operasi' },
  { id: 'compliance', label: 'Compliance', labelMs: 'Pematuhan', icon: Shield, group: 'Tadbir Urus' },
  { id: 'reports', label: 'Reports', labelMs: 'Laporan', icon: BarChart3, group: 'Tadbir Urus' },
  { id: 'ekyc', label: 'eKYC', labelMs: 'eKYC', icon: ScanFace, group: 'Tadbir Urus' },
  { id: 'admin', label: 'Admin', labelMs: 'Pentadbiran', icon: UserCog, group: 'Tadbir Urus' },
  { id: 'tapsecure', label: 'TapSecure', labelMs: 'TapSecure', icon: Lock, group: 'Tadbir Urus' },
  { id: 'ai', label: 'PUSPA AI', labelMs: 'AI PUSPA', icon: Bot, group: 'AI & Ops' },
  { id: 'settings', label: 'Settings', labelMs: 'Tetapan', icon: Settings, group: 'Sistem' },
]

export function AppSidebar() {
  const { currentView, setView, currentUser, sidebarOpen, setSidebarOpen } = useAppStore()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Utama': true,
    'Kewangan': true,
    'Operasi': true,
    'Tadbir Urus': true,
    'AI & Ops': true,
    'Sistem': true,
  })

  const userRole = currentUser?.role || 'staff'

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  if (!sidebarOpen) return null

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-full w-64 border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
      "flex flex-col",
      !sidebarOpen && "-translate-x-full"
    )}>
      {/* Logo Area */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          P
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold tracking-tight truncate">PUSPA V4</h1>
          <p className="text-[10px] text-muted-foreground truncate">Peduli Asnaf</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        {Object.entries(groupedItems).map(([group, items]) => {
          const accessibleItems = items.filter(item => canAccessView(item.id, userRole))
          if (accessibleItems.length === 0) return null
          
          return (
            <div key={group} className="mb-2">
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center w-full px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <ChevronDown className={cn(
                  "h-3 w-3 mr-1 transition-transform",
                  !expandedGroups[group] && "-rotate-90"
                )} />
                {group}
              </button>
              {expandedGroups[group] && (
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentView === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={cn(
                          "flex items-center gap-3 w-full rounded-md px-2 py-1.5 text-sm transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
              <Separator className="my-2" />
            </div>
          )
        })}
      </ScrollArea>

      {/* User Area */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
