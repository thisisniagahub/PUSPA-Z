'use client'

import { useEffect } from 'react'
import { useAppStore, type ViewId } from '@/lib/store'
import { canAccessView } from '@/lib/access-control'
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
  Rocket,
  UtensilsCrossed,
  BookOpen,
  Building2,
  Building,
  ClipboardList,
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
  useSidebar,
} from '@/components/ui/sidebar'
import { UserAvatar } from '@/components/user-avatar'

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
  { id: 'programmes', label: 'Programmes', labelMs: 'Program', icon: Calendar, group: 'Program' },
  { id: 'asnafpreneur', label: 'Asnafpreneur', labelMs: 'Asnafpreneur', icon: Rocket, group: 'Program' },
  { id: 'sedekah-jumaat', label: 'Sedekah Jumaat', labelMs: 'Sedekah Jumaat', icon: UtensilsCrossed, group: 'Program' },
  { id: 'volunteers', label: 'Volunteers', labelMs: 'Sukarelawan', icon: Sparkles, group: 'Operasi' },
  { id: 'documents', label: 'Documents', labelMs: 'Dokumen', icon: FolderOpen, group: 'Operasi' },
  { id: 'compliance', label: 'Compliance', labelMs: 'Pematuhan', icon: Shield, group: 'Tadbir Urus' },
  { id: 'reports', label: 'Reports', labelMs: 'Laporan', icon: BarChart3, group: 'Tadbir Urus' },
  { id: 'ekyc', label: 'eKYC', labelMs: 'eKYC', icon: ScanFace, group: 'Tadbir Urus' },
  { id: 'admin', label: 'Admin', labelMs: 'Pentadbiran', icon: UserCog, group: 'Tadbir Urus' },
  { id: 'tapsecure', label: 'TapSecure', labelMs: 'TapSecure', icon: Lock, group: 'Tadbir Urus' },
  { id: 'ai', label: 'PUSPA AI', labelMs: 'AI PUSPA', icon: Bot, group: 'AI & Bantuan' },
  { id: 'docs', label: 'Panduan', labelMs: 'Panduan', icon: BookOpen, group: 'AI & Bantuan' },
  { id: 'settings', label: 'Settings', labelMs: 'Tetapan', icon: Settings, group: 'Sistem' },
  { id: 'carta-organisasi', label: 'Carta Organisasi', labelMs: 'Carta Organisasi', icon: Building2, group: 'Organisasi' },
  { id: 'institusi', label: 'Institusi', labelMs: 'Institusi & Kawasan', icon: Building, group: 'Organisasi' },
  { id: 'permohonan-bantuan', label: 'Permohonan Bantuan', labelMs: 'Borang Bantuan', icon: ClipboardList, group: 'Organisasi' },
]

export function AppSidebar() {
  const { currentView, setView, currentUser, setCurrentUser } = useAppStore()
  const { isMobile, setOpenMobile } = useSidebar()
  const userRole = currentUser?.role || 'staff'

  /** Sekali sahaja selepas reload: avatar dari puspa-settings jika persist store tak ada imageUrl lagi */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('puspa-settings')
      if (!raw) return
      const u = useAppStore.getState().currentUser
      if (!u) return
      const parsed = JSON.parse(raw) as { profileImageUrl?: string }
      const url = typeof parsed.profileImageUrl === 'string' ? parsed.profileImageUrl.trim() : ''
      if (url && u.imageUrl !== url) setCurrentUser({ ...u, imageUrl: url })
    } catch {
      /* ignore */
    }
  }, [setCurrentUser])

  const groupedItems = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo Header — Exact Layout from puspa-brand-identity.png */}
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3 min-w-0 overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          {/* Icon: Always visible on white background for best contrast with purple logo */}
          <div className="flex h-10 w-10 items-center justify-center shrink-0 rounded-lg bg-white shadow-md ring-1 ring-black/5">
            <img
              src="/puspa-logo-transparent.png"
              alt="PUSPA"
              className="h-8 w-8 object-contain"
            />
          </div>
          
          {/* Text: Exact stacking from identity image */}
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-2xl font-black leading-none tracking-tighter text-sidebar-foreground">
              PUSPA
            </span>
            {/* TAGLINE: FORCED WHITE AS REQUESTED */}
            <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tight mt-0.5 truncate">
              Pertubuhan Urus Peduli Asnaf
            </span>
          </div>
        </div>
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
                          onClick={() => {
                            setView(item.id)
                            if (isMobile) setOpenMobile(false)
                          }}
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
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              tooltip={`${currentUser?.name || 'User'} (${userRole})`}
            >
              <UserAvatar
                name={currentUser?.name}
                src={currentUser?.imageUrl}
                size="sm"
                className="ring-sidebar-border"
              />
              <div className="flex flex-col gap-0.5 leading-none min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium truncate">{currentUser?.name || 'User'}</span>
                <span className="text-[11px] text-sidebar-foreground/60 capitalize">{userRole}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
