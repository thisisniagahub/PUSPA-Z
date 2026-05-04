'use client'

import { useAppStore, type ViewId } from '@/lib/store'
import { Menu, Search, Moon, Sun, MessageSquare, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'

const viewTitles: Record<ViewId, { en: string; ms: string }> = {
  dashboard: { en: 'Dashboard', ms: 'Papan Pemuka' },
  members: { en: 'Member Management', ms: 'Pengurusan Ahli' },
  cases: { en: 'Case Management', ms: 'Pengurusan Kes' },
  programmes: { en: 'Programme Management', ms: 'Pengurusan Program' },
  donations: { en: 'Donation Management', ms: 'Pengurusan Sumbangan' },
  donors: { en: 'Donor CRM', ms: 'Pengurusan Penderma' },
  disbursements: { en: 'Disbursement Management', ms: 'Pengurusan Agihan' },
  volunteers: { en: 'Volunteer Management', ms: 'Pengurusan Sukarelawan' },
  compliance: { en: 'Compliance', ms: 'Pematuhan' },
  reports: { en: 'Reports & Analytics', ms: 'Laporan & Analitik' },
  ekyc: { en: 'eKYC Verification', ms: 'Pengesahan eKYC' },
  documents: { en: 'Document Management', ms: 'Pengurusan Dokumen' },
  activities: { en: 'Activity Log', ms: 'Log Aktiviti' },
  ai: { en: 'PUSPA AI — Hermes', ms: 'AI PUSPA — Hermes' },
  settings: { en: 'Settings', ms: 'Tetapan' },
  tapsecure: { en: 'TapSecure', ms: 'TapSecure' },
  admin: { en: 'Admin Panel', ms: 'Panel Pentadbir' },
}

export function AppHeader() {
  const { currentView, toggleSidebar, toggleAiChat, sidebarOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  
  const title = viewTitles[currentView] || { en: currentView, ms: currentView }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1">
        <h2 className="text-sm font-semibold">{title.en}</h2>
        <p className="text-[10px] text-muted-foreground">{title.ms}</p>
      </div>

      <div className="hidden md:flex items-center gap-2 w-64">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari... / Search..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center">
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleAiChat}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">Toggle AI chat</span>
        </Button>
      </div>
    </header>
  )
}
