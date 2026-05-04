'use client'

import { useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Select, Separator,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui'
import {
  Shield, Users, Database, Cpu, HardDrive, Activity,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  UserPlus, Settings, FileText, Eye, Key,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface AdminUser {
  id: string
  name: string
  email: string
  role: 'staff' | 'admin' | 'developer'
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
}

interface SystemHealth {
  name: string
  status: 'operational' | 'degraded' | 'down'
  message: string
  latency?: string
  uptime?: string
}

interface AuditLogEntry {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  category: string
  severity: 'info' | 'warning' | 'critical'
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoUsers: AdminUser[] = [
  { id: 'usr1', name: 'Admin PUSPA', email: 'admin@puspa.org', role: 'admin', status: 'active', lastLogin: '2025-03-15T10:00:00Z', createdAt: '2024-01-15' },
  { id: 'usr2', name: 'Ahmad Faiz', email: 'ahmad@puspa.org', role: 'staff', status: 'active', lastLogin: '2025-03-15T09:30:00Z', createdAt: '2024-03-10' },
  { id: 'usr3', name: 'Siti Nurhaliza', email: 'siti@puspa.org', role: 'staff', status: 'active', lastLogin: '2025-03-14T16:00:00Z', createdAt: '2024-05-20' },
  { id: 'usr4', name: 'Dev Hermes', email: 'dev@puspa.org', role: 'developer', status: 'active', lastLogin: '2025-03-15T08:00:00Z', createdAt: '2024-06-01' },
  { id: 'usr5', name: 'Mohd Razak', email: 'razak@puspa.org', role: 'staff', status: 'inactive', lastLogin: '2025-02-20T11:00:00Z', createdAt: '2024-08-15' },
  { id: 'usr6', name: 'Fatimah Zahra', email: 'fatimah@puspa.org', role: 'admin', status: 'active', lastLogin: '2025-03-15T07:45:00Z', createdAt: '2024-02-28' },
]

const demoSystemHealth: SystemHealth[] = [
  { name: 'Database (SQLite)', status: 'operational', message: 'Semua operasi normal', latency: '2ms', uptime: '99.99%' },
  { name: 'API Server', status: 'operational', message: 'Pelayan berjalan lancar', latency: '15ms', uptime: '99.95%' },
  { name: 'AI Service (Hermes)', status: 'operational', message: 'Model dimuatkan dan sedia', latency: '450ms', uptime: '98.5%' },
  { name: 'File Storage', status: 'degraded', message: 'Penggunaan storan hampir penuh (87%)', latency: '8ms', uptime: '100%' },
]

const demoAuditLog: AuditLogEntry[] = [
  { id: 'al1', action: 'Pengguna ditambah', user: 'Admin PUSPA', target: 'Mohd Razak (razak@puspa.org)', timestamp: '2025-03-15T10:00:00Z', category: 'user_management', severity: 'info' },
  { id: 'al2', action: 'Peranan ditukar', user: 'Admin PUSPA', target: 'Fatimah Zahra → admin', timestamp: '2025-03-15T09:30:00Z', category: 'user_management', severity: 'warning' },
  { id: 'al3', action: 'Pematuhan dikemas kini', user: 'Ahmad Faiz', target: 'Polisi PDPA v4.2', timestamp: '2025-03-15T08:00:00Z', category: 'compliance', severity: 'info' },
  { id: 'al4', action: 'Sandaran pangkalan data', user: 'System', target: 'backup_20250315.db', timestamp: '2025-03-15T03:00:00Z', category: 'system', severity: 'info' },
  { id: 'al5', action: 'Percubaan akses gagal', user: 'Unknown', target: 'Percubaan log masuk dari IP 45.33.xxx.xxx', timestamp: '2025-03-13T22:30:00Z', category: 'security', severity: 'critical' },
  { id: 'al6', action: 'Konfigurasi AI dikemas kini', user: 'Dev Hermes', target: 'Hermes model parameters', timestamp: '2025-03-12T14:00:00Z', category: 'system', severity: 'info' },
  { id: 'al7', action: 'Akaun dinyahaktifkan', user: 'Admin PUSPA', target: 'Mohd Razak (inactive)', timestamp: '2025-03-11T11:00:00Z', category: 'user_management', severity: 'warning' },
  { id: 'al8', action: 'Laporan bulanan dijana', user: 'System', target: 'Laporan Februari 2025', timestamp: '2025-03-01T00:00:00Z', category: 'system', severity: 'info' },
]

/* ─── Helpers ──────────────────────────────────────────── */
const roleLabels: Record<string, string> = {
  staff: 'Kakitangan',
  admin: 'Pentadbir',
  developer: 'Pembangun',
}

const roleColors: Record<string, string> = {
  staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  developer: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

const healthStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  operational: { label: 'Beroperasi', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  degraded: { label: 'Terjejas', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', icon: AlertTriangle },
  down: { label: 'Tidak Berfungsi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
}

const severityConfig: Record<string, { color: string }> = {
  info: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  warning: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
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
export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(demoUsers)

  const handleRoleChange = (userId: string, newRole: 'staff' | 'admin' | 'developer') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const activeUsers = users.filter(u => u.status === 'active').length
  const storageUsage = 87 // percent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel Pentadbir</h1>
            <p className="text-sm text-muted-foreground">Admin Panel — Pengurusan sistem dan pengguna</p>
          </div>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pangkalan Data</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Normal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Cpu className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">API Server</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Aktif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">AI Service</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sedia
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Storan</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  {storageUsage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Kesihatan Sistem
          </CardTitle>
          <CardDescription>Status terperinci perkhidmatan sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoSystemHealth.map((service) => {
            const statusConf = healthStatusConfig[service.status]
            const StatusIcon = statusConf.icon
            return (
              <div key={service.name} className="flex items-center gap-3 p-3 rounded-lg border">
                <StatusIcon className={`h-5 w-5 shrink-0 ${service.status === 'operational' ? 'text-green-600' : service.status === 'degraded' ? 'text-amber-600' : 'text-red-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{service.name}</p>
                    <Badge variant="secondary" className={`text-[10px] ${statusConf.color}`}>
                      {statusConf.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{service.message}</p>
                </div>
                <div className="text-right shrink-0">
                  {service.latency && <p className="text-xs text-muted-foreground">{service.latency}</p>}
                  {service.uptime && <p className="text-xs font-medium">{service.uptime} uptime</p>}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pengurusan Pengguna
              </CardTitle>
              <CardDescription>{activeUsers} pengguna aktif daripada {users.length} jumlah</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <UserPlus className="h-3 w-3" />
              Tambah Pengguna
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Emel</TableHead>
                  <TableHead>Peranan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Log Masuk Terakhir</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(val) => handleRoleChange(user.id, val as 'staff' | 'admin' | 'developer')}
                      >
                        <Select.Trigger className="h-7 w-[130px] text-xs">
                          <Badge variant="secondary" className={`text-[10px] ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </Badge>
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="staff">Kakitangan</Select.Item>
                          <Select.Item value="admin">Pentadbir</Select.Item>
                          <Select.Item value="developer">Pembangun</Select.Item>
                        </Select.Content>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }>
                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(user.lastLogin)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        Lihat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Log Audit
              </CardTitle>
              <CardDescription>Rekod tindakan pentadbir terkini</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Key className="h-3 w-3" />
              Eksport Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {demoAuditLog.map((entry, idx) => {
              const sevConf = severityConfig[entry.severity]
              return (
                <div key={entry.id} className="flex items-start gap-3 py-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sevConf.color}`}>
                      {entry.severity === 'critical' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : entry.severity === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                    </div>
                    {idx < demoAuditLog.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1 min-h-[1rem]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <Badge variant="outline" className="text-[9px]">{entry.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.target}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>Oleh: {entry.user}</span>
                      <span>•</span>
                      <span>{formatTime(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
