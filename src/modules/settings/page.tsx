'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Input, Switch, Separator, Avatar, AvatarFallback,
} from '@/components/ui'
import {
  User, Globe, Moon, PanelLeft, Bell, BellOff, Mail, MailX,
  Info, Save, Check, Camera, Shield, Palette,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface UserSettings {
  name: string
  email: string
  role: string
  avatar: string
  language: 'bm' | 'en'
  theme: 'light' | 'dark' | 'system'
  sidebarDefault: 'expanded' | 'collapsed'
  notifications: {
    email: boolean
    push: boolean
    caseUpdates: boolean
    donationAlerts: boolean
    systemAlerts: boolean
    weeklyReport: boolean
  }
}

/* ─── Component ────────────────────────────────────────── */
export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useAppStore()

  const [settings, setSettings] = useState<UserSettings>(() => {
    const defaults: UserSettings = {
      name: currentUser?.name || 'Admin PUSPA',
      email: currentUser?.email || 'admin@puspa.org',
      role: currentUser?.role || 'admin',
      avatar: 'AP',
      language: 'bm',
      theme: 'system',
      sidebarDefault: 'expanded',
      notifications: {
        email: true,
        push: true,
        caseUpdates: true,
        donationAlerts: true,
        systemAlerts: true,
        weeklyReport: false,
      },
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('puspa-settings')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return { ...defaults, ...parsed }
        } catch {
          // ignore
        }
      }
    }
    return defaults
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('puspa-settings', JSON.stringify(settings))
    setCurrentUser({
      id: currentUser?.id || 'usr_admin_001',
      name: settings.name,
      email: settings.email,
      role: (settings.role as 'staff' | 'admin' | 'developer') || 'admin',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  const roleLabels: Record<string, string> = {
    staff: 'Kakitangan',
    admin: 'Pentadbir',
    developer: 'Pembangun',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tetapan</h1>
          <p className="text-sm text-muted-foreground">Settings — Urus profil dan keutamaan anda</p>
        </div>
        <Button className="gap-2" onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Disimpan!' : 'Simpan Tetapan'}
        </Button>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </CardTitle>
          <CardDescription>Maklumat peribadi dan akaun anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">{settings.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{settings.name}</p>
              <p className="text-sm text-muted-foreground">{settings.email}</p>
              <Badge variant="secondary" className="mt-1">{roleLabels[settings.role] || settings.role}</Badge>
            </div>
            <Button variant="outline" size="sm" className="ml-auto gap-1">
              <Camera className="h-3 w-3" />
              Tukar Avatar
            </Button>
          </div>

          <Separator />

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama penuh"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emel</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="emel@contoh.com"
              />
            </div>
          </div>

          {/* Role (display only) */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Peranan: {roleLabels[settings.role] || settings.role}</p>
              <p className="text-xs text-muted-foreground">Peranan ditetapkan oleh pentadbir sistem</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Keutamaan
          </CardTitle>
          <CardDescription>Sesuaikan pengalaman pengguna anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Bahasa / Language</p>
                <p className="text-xs text-muted-foreground">Pilih bahasa antaramuka</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={settings.language === 'bm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, language: 'bm' }))}
              >
                Bahasa Melayu
              </Button>
              <Button
                variant={settings.language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, language: 'en' }))}
              >
                English
              </Button>
            </div>
          </div>

          <Separator />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">Pilih tema paparan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Button
                  key={t}
                  variant={settings.theme === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, theme: t }))}
                  className="capitalize"
                >
                  {t === 'light' ? 'Cerah' : t === 'dark' ? 'Gelap' : 'Sistem'}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sidebar Default */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sidebar Lalai</p>
                <p className="text-xs text-muted-foreground">Keadaan sidebar semasa memulakan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Kuncup</span>
              <Switch
                checked={settings.sidebarDefault === 'expanded'}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, sidebarDefault: checked ? 'expanded' : 'collapsed' }))
                }
              />
              <span className="text-sm text-muted-foreground">Kembang</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Pemberitahuan
          </CardTitle>
          <CardDescription>Urus keutamaan pemberitahuan anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { key: 'email' as const, label: 'Pemberitahuan Emel', desc: 'Terima pemberitahuan melalui emel', icon: Mail },
            { key: 'push' as const, label: 'Pemberitahuan Push', desc: 'Pemberitahuan pelayar desktop', icon: Bell },
            { key: 'caseUpdates' as const, label: 'Kemas Kini Kes', desc: 'Pemberitahuan apabila kes dikemas kini', icon: Bell },
            { key: 'donationAlerts' as const, label: 'Amaran Sumbangan', desc: 'Pemberitahuan sumbangan baru masuk', icon: Bell },
            { key: 'systemAlerts' as const, label: 'Amaran Sistem', desc: 'Pemberitahuan penyelenggaraan dan kemas kini', icon: BellOff },
            { key: 'weeklyReport' as const, label: 'Laporan Mingguan', desc: 'Hantar ringkasan mingguan melalui emel', icon: MailX },
          ].map((item, idx) => (
            <div key={item.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications[item.key]}
                  onCheckedChange={(checked) => updateNotification(item.key, checked)}
                />
              </div>
              {idx < 5 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Tentang PUSPA V4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Versi</p>
              <p className="font-medium">4.0.0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Build</p>
              <p className="font-medium">2025.03.04-stable</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Runtime</p>
              <p className="font-medium">Next.js 16 + TypeScript</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Engine</p>
              <p className="font-medium">Hermes v4 (z-ai)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="font-medium">SQLite (Prisma ORM)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">UI Framework</p>
              <p className="font-medium">shadcn/ui + Tailwind 4</p>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground text-center">
            PUSPA V4 — Pertubuhan Urus Peduli Asnaf. © 2025 Hak cipta terpelihara.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
