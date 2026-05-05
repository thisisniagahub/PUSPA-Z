'use client'

import { useAppStore, type ViewId } from '@/lib/store'
import { canAccessView } from '@/lib/access-control'
import { PuspaLogo } from '@/components/puspa-logo'
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
  Sparkles,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
  const { currentView, setView, currentUser } = useAppStore()
  const userRole = currentUser?.role || 'staff'

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              tooltip="PUSPA V4 — PPM-024-10-05012022"
            >
              <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
                <PuspaLogo size={26} variant="auto" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="font-bold text-sm truncate text-sidebar-primary">PUSPA V4</span>
                <span className="text-[10px] text-sidebar-foreground/60 truncate">PPM-024-10-05012022</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation Groups */}
      <SidebarContent>
        {Object.entries(groupedItems).map(([group, items]) => {
          const accessibleItems = items.filter(item => canAccessView(item.id, userRole))
          if (accessibleItems.length === 0) return null

          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accessibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentView === item.id
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setView(item.id)}
                          tooltip={`${item.label} — ${item.labelMs || item.label}`}
                          className={isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground' : ''}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarSeparator />

      {/* User Footer */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              tooltip={`${currentUser?.name || 'User'} (${userRole})`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none min-w-0">
                <span className="text-xs font-medium truncate">{currentUser?.name || 'User'}</span>
                <span className="text-[10px] text-sidebar-foreground/50 capitalize">{userRole}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
