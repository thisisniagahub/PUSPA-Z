'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Separator,
} from '@/components/ui'
import {
  Shield, Smartphone, Monitor, Clock, AlertTriangle,
  CheckCircle2, XCircle, Fingerprint, Key, ShieldCheck,
  ShieldAlert, Lock, Wifi, MapPin, Trash2, Plus,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface TrustedDevice {
  id: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  os: string
  browser: string
  lastActive: string
  lastIp: string
  trustStatus: 'trusted' | 'unverified' | 'revoked'
  isCurrent: boolean
  bindingDate: string
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'device_bind' | 'device_revoke' | 'password_change' | 'failed_login' | '2fa_enabled' | 'suspicious'
  description: string
  timestamp: string
  ip: string
  device: string
  severity: 'info' | 'warning' | 'critical'
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoDevices: TrustedDevice[] = [
  {
    id: 'dev1', name: 'iPhone 15 Pro', type: 'mobile', os: 'iOS 18.3', browser: 'Safari',
    lastActive: '2025-03-15T09:30:00Z', lastIp: '113.210.xxx.xxx', trustStatus: 'trusted',
    isCurrent: false, bindingDate: '2025-01-10',
  },
  {
    id: 'dev2', name: 'MacBook Pro PUSPA', type: 'desktop', os: 'macOS Sequoia', browser: 'Chrome 122',
    lastActive: '2025-03-15T10:00:00Z', lastIp: '113.210.xxx.xxx', trustStatus: 'trusted',
    isCurrent: true, bindingDate: '2024-12-01',
  },
  {
    id: 'dev3', name: 'iPad Air M2', type: 'tablet', os: 'iPadOS 18.3', browser: 'Safari',
    lastActive: '2025-03-14T16:00:00Z', lastIp: '175.136.xxx.xxx', trustStatus: 'trusted',
    isCurrent: false, bindingDate: '2025-02-15',
  },
  {
    id: 'dev4', name: 'Samsung Galaxy S24', type: 'mobile', os: 'Android 14', browser: 'Chrome',
    lastActive: '2025-03-10T08:00:00Z', lastIp: '60.49.xxx.xxx', trustStatus: 'unverified',
    isCurrent: false, bindingDate: '',
  },
  {
    id: 'dev5', name: 'Windows PC Pejabat', type: 'desktop', os: 'Windows 11', browser: 'Edge',
    lastActive: '2025-02-28T14:00:00Z', lastIp: '113.210.xxx.xxx', trustStatus: 'revoked',
    isCurrent: false, bindingDate: '2024-11-05',
  },
]

const demoSecurityEvents: SecurityEvent[] = [
  { id: 'se1', type: 'login', description: 'Log masuk berjaya dari MacBook Pro', timestamp: '2025-03-15T10:00:00Z', ip: '113.210.xxx.xxx', device: 'MacBook Pro', severity: 'info' },
  { id: 'se2', type: 'device_bind', description: 'Peranti iPhone 15 Pro ditambah sebagai peranti dipercayai', timestamp: '2025-03-14T09:15:00Z', ip: '113.210.xxx.xxx', device: 'iPhone 15 Pro', severity: 'info' },
  { id: 'se3', type: 'failed_login', description: 'Percubaan log masuk gagal dari IP tidak dikenali', timestamp: '2025-03-13T22:30:00Z', ip: '45.33.xxx.xxx', device: 'Unknown', severity: 'warning' },
  { id: 'se4', type: 'password_change', description: 'Kata laluan ditukar', timestamp: '2025-03-12T11:00:00Z', ip: '113.210.xxx.xxx', device: 'MacBook Pro', severity: 'info' },
  { id: 'se5', type: 'device_revoke', description: 'Akses Windows PC Pejabat ditarik balik', timestamp: '2025-03-11T15:30:00Z', ip: '113.210.xxx.xxx', device: 'Windows PC', severity: 'warning' },
  { id: 'se6', type: '2fa_enabled', description: 'Pengesahan dua faktor diaktifkan', timestamp: '2025-03-10T08:00:00Z', ip: '113.210.xxx.xxx', device: 'MacBook Pro', severity: 'info' },
  { id: 'se7', type: 'suspicious', description: 'Aktiviti mencurigakan dikesan - percubaan akses dari lokasi baharu', timestamp: '2025-03-08T03:15:00Z', ip: '185.220.xxx.xxx', device: 'Unknown', severity: 'critical' },
  { id: 'se8', type: 'login', description: 'Log masuk berjaya dari iPad Air', timestamp: '2025-03-07T14:00:00Z', ip: '175.136.xxx.xxx', device: 'iPad Air', severity: 'info' },
]

/* ─── Helpers ──────────────────────────────────────────── */
const deviceTypeIcons: Record<string, typeof Smartphone> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Smartphone,
}

const trustStatusConfig: Record<string, { label: string; color: string }> = {
  trusted: { label: 'Dipercayai', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  unverified: { label: 'Belum Disahkan', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  revoked: { label: 'Ditarik Balik', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

const severityConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  info: { color: 'bg-blue-500', icon: CheckCircle2 },
  warning: { color: 'bg-amber-500', icon: AlertTriangle },
  critical: { color: 'bg-red-500', icon: ShieldAlert },
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString('ms-MY')
}

/* ─── Component ────────────────────────────────────────── */
export default function TapSecurePage() {
  const [devices] = useState<TrustedDevice[]>(demoDevices)
  const [securityEvents] = useState<SecurityEvent[]>(demoSecurityEvents)

  const trustedCount = devices.filter(d => d.trustStatus === 'trusted').length
  const activeSessions = devices.filter(d => d.trustStatus === 'trusted' || d.trustStatus === 'unverified').length
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length
  const lastLogin = securityEvents.find(e => e.type === 'login')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TapSecure</h1>
            <p className="text-sm text-muted-foreground">Keselamatan Peranti — Urus peranti dan sesi anda</p>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peranti Dipercayai</p>
                <p className="text-lg font-bold">{trustedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sesi Aktif</p>
                <p className="text-lg font-bold">{activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peristiwa Kritikal</p>
                <p className="text-lg font-bold">{criticalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Log Masuk Terakhir</p>
                <p className="text-sm font-bold">{lastLogin ? formatTime(lastLogin.timestamp) : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trusted Devices List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Peranti Dipercayai
              </CardTitle>
              <CardDescription>Senarai peranti yang mempunyai akses ke akaun anda</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Tambah Peranti
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((device) => {
            const DeviceIcon = deviceTypeIcons[device.type] || Smartphone
            const statusConf = trustStatusConfig[device.trustStatus]
            return (
              <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{device.name}</p>
                    {device.isCurrent && (
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Peranti Semasa
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{device.os}</span>
                    <span>•</span>
                    <span>{device.browser}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(device.lastActive)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{device.lastIp}</span>
                    {device.bindingDate && <span className="flex items-center gap-1"><Key className="h-3 w-3" />{device.bindingDate}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-[10px] ${statusConf.color}`}>
                    {statusConf.label}
                  </Badge>
                  {device.trustStatus !== 'revoked' && !device.isCurrent && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Security Events Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Peristiwa Keselamatan
          </CardTitle>
          <CardDescription>Rekod aktiviti keselamatan akaun anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {securityEvents.map((event, idx) => {
              const sevConf = severityConfig[event.severity]
              const SevIcon = sevConf.icon
              return (
                <div key={event.id} className="flex gap-3 pb-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sevConf.color}/10`}>
                      <SevIcon className={`h-3.5 w-3.5 ${event.severity === 'critical' ? 'text-red-600 dark:text-red-400' : event.severity === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    {idx < securityEvents.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  {/* Event content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{event.description}</p>
                      {event.severity === 'critical' && (
                        <Badge variant="destructive" className="text-[10px] shrink-0">Kritikal</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(event.timestamp)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.ip}</span>
                      <span>•</span>
                      <span>{event.device}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Device Binding Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Pengikatan Peranti
          </CardTitle>
          <CardDescription>Tetapan pengikatan dan pengesahan peranti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Pengesahan Biometrik</p>
                <p className="text-xs text-muted-foreground">Gunakan cap jari atau pengenalan wajah untuk log masuk</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Aktif</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Pengesahan Dua Faktor (2FA)</p>
                <p className="text-xs text-muted-foreground">Lapisan keselamatan tambahan untuk akaun anda</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Aktif</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Auto-Kunci Peranti</p>
                <p className="text-xs text-muted-foreground">Kunci sesi secara automatik selepas 15 minit tidak aktif</p>
              </div>
            </div>
            <Badge variant="outline">15 min</Badge>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1">
              <Shield className="h-3 w-3" />
              Tetapan Keselamatan Lanjutan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
