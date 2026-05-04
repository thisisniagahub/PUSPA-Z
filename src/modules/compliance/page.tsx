'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, Textarea,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Label, Tabs, TabsList, TabsTrigger, TabsContent, Progress,
} from '@/components/ui'
import {
  Shield, Plus, Search, Filter, Clock, CheckCircle2,
  XCircle, AlertTriangle, Eye, FileCheck, Calendar,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface ComplianceRecord {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  dueDate: string | null
  completedAt: string | null
  evidenceUrl: string | null
  notes: string | null
  assignedTo: string | null
  createdAt: string
}

interface ComplianceStats {
  overallScore: number
  totalRecords: number
  compliantCount: number
  overdueCount: number
  categoryScores: Record<string, { total: number; compliant: number; score: number }>
  statusBreakdown: Record<string, number>
}

/* ─── Helpers ──────────────────────────────────────────── */
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  compliant: { label: 'Patuh', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  non_compliant: { label: 'Tidak Patuh', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
  expired: { label: 'Tamat Tempoh', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: AlertTriangle },
  under_review: { label: 'Sedang Semakan', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Eye },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  rosm: { label: 'ROSM', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300' },
  lhdn: { label: 'LHDN', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
  pdpa: { label: 'PDPA', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  internal: { label: 'Dalaman', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' },
  audit: { label: 'Audit', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300' },
}

const isOverdue = (dueDate: string | null, status: string) => {
  if (!dueDate || status === 'compliant' || status === 'expired') return false
  return new Date(dueDate) < new Date()
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoRecords: ComplianceRecord[] = [
  { id: 'cr1', title: 'ROSM Annual Renewal 2025', description: 'Pemfailan tahunan dengan ROSM', category: 'rosm', status: 'compliant', dueDate: '2025-03-31', completedAt: '2025-03-15', evidenceUrl: '/docs/rosm-2025.pdf', notes: 'Berjaya difailkan', assignedTo: 'Admin PUSPA', createdAt: '2025-01-15T08:00:00Z' },
  { id: 'cr2', title: 'LHDN Tax Filing Q1 2025', description: 'Pengisytiharan cukai suku pertama', category: 'lhdn', status: 'pending', dueDate: '2025-04-30', completedAt: null, evidenceUrl: null, notes: 'Menunggu penyata bank', assignedTo: 'Bendahari', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'cr3', title: 'PDPA Consent Form Update', description: 'Kemas kini borang persetujuan PDPA', category: 'pdpa', status: 'under_review', dueDate: '2025-06-30', completedAt: null, evidenceUrl: '/docs/pdpa-draft.pdf', notes: 'Dalam semakan oleh peguam', assignedTo: 'Peguam Nurul', createdAt: '2025-03-01T14:00:00Z' },
  { id: 'cr4', title: 'Internal Policy Review', description: 'Semakan dasar dalaman tahunan', category: 'internal', status: 'non_compliant', dueDate: '2025-02-28', completedAt: null, evidenceUrl: null, notes: 'Terdapat kelewatan', assignedTo: 'Pengarah', createdAt: '2024-12-01T09:00:00Z' },
  { id: 'cr5', title: 'Annual Audit 2024', description: 'Audit tahunan akaun 2024', category: 'audit', status: 'compliant', dueDate: '2025-03-31', completedAt: '2025-03-20', evidenceUrl: '/docs/audit-2024.pdf', notes: 'Audit selesai tanpa isu', assignedTo: 'Juruaudit Luar', createdAt: '2025-01-10T08:00:00Z' },
  { id: 'cr6', title: 'ROSM Committee Update', description: 'Kemas kini senarai jawatankuasa', category: 'rosm', status: 'expired', dueDate: '2025-01-31', completedAt: null, evidenceUrl: null, notes: 'Perlu dikemas kini segera', assignedTo: 'Setiausaha', createdAt: '2024-11-15T10:00:00Z' },
  { id: 'cr7', title: 'LHDN Tax Filing Q2 2025', description: 'Pengisytiharan cukai suku kedua', category: 'lhdn', status: 'pending', dueDate: '2025-07-31', completedAt: null, evidenceUrl: null, notes: null, assignedTo: 'Bendahari', createdAt: '2025-04-01T08:00:00Z' },
  { id: 'cr8', title: 'PDPA Data Breach Drill', description: 'Simulasi latihan kebocoran data', category: 'pdpa', status: 'compliant', dueDate: '2025-05-15', completedAt: '2025-05-10', evidenceUrl: '/docs/pdpa-drill.pdf', notes: 'Latihan berjaya', assignedTo: 'Admin PUSPA', createdAt: '2025-04-15T08:00:00Z' },
  { id: 'cr9', title: 'Internal Financial Control Review', description: 'Semakan kawalan kewangan dalaman', category: 'internal', status: 'under_review', dueDate: '2025-08-31', completedAt: null, evidenceUrl: '/docs/fin-control.pdf', notes: 'Sedang disemak', assignedTo: 'Bendahari', createdAt: '2025-05-01T09:00:00Z' },
  { id: 'cr10', title: 'Mid-Year Audit Review', description: 'Semakan audit pertengahan tahun', category: 'audit', status: 'pending', dueDate: '2025-09-30', completedAt: null, evidenceUrl: null, notes: null, assignedTo: 'Juruaudit Luar', createdAt: '2025-06-01T08:00:00Z' },
]

const demoStats: ComplianceStats = {
  overallScore: 40,
  totalRecords: 10,
  compliantCount: 4,
  overdueCount: 2,
  categoryScores: {
    rosm: { total: 2, compliant: 1, score: 50 },
    lhdn: { total: 2, compliant: 0, score: 0 },
    pdpa: { total: 2, compliant: 1, score: 50 },
    internal: { total: 2, compliant: 0, score: 0 },
    audit: { total: 2, compliant: 1, score: 50 },
  },
  statusBreakdown: { compliant: 4, pending: 3, under_review: 2, non_compliant: 1, expired: 1 },
}

/* ─── Circular Progress Component ──────────────────────── */
function CircularProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (v: number) => {
    if (v >= 80) return 'text-green-500'
    if (v >= 60) return 'text-yellow-500'
    if (v >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getColor(value)} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">Skor</span>
      </div>
    </div>
  )
}

/* ─── Component ────────────────────────────────────────── */
export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([])
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('rosm')
  const [formStatus, setFormStatus] = useState('pending')
  const [formDueDate, setFormDueDate] = useState('')
  const [formAssignedTo, setFormAssignedTo] = useState('')
  const [formEvidenceUrl, setFormEvidenceUrl] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/v1/compliance?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.records && data.records.length > 0) {
          setRecords(data.records)
          setStats(data.stats)
        } else {
          setRecords(demoRecords)
          setStats(demoStats)
        }
      } else {
        setRecords(demoRecords)
        setStats(demoStats)
      }
    } catch {
      setRecords(demoRecords)
      setStats(demoStats)
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formTitle) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          status: formStatus,
          dueDate: formDueDate || null,
          assignedTo: formAssignedTo || null,
          evidenceUrl: formEvidenceUrl || null,
          notes: formNotes || null,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('rosm')
    setFormStatus('pending')
    setFormDueDate('')
    setFormAssignedTo('')
    setFormEvidenceUrl('')
    setFormNotes('')
  }

  const filtered = records.filter((r) => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.assignedTo || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  const currentCategory = categoryFilter === 'all' ? 'all' : categoryFilter
  const score = stats?.overallScore ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pematuhan</h1>
          <p className="text-sm text-muted-foreground">Compliance — Urus rekod pematuhan dan audit</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Rekod
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Rekod Pematuhan</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tajuk</Label>
                <Input id="title" placeholder="Tajuk rekod pematuhan..." value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Penerangan</Label>
                <Textarea id="description" placeholder="Penerangan terperinci..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="rosm">ROSM</Select.Item>
                      <Select.Item value="lhdn">LHDN</Select.Item>
                      <Select.Item value="pdpa">PDPA</Select.Item>
                      <Select.Item value="internal">Dalaman</Select.Item>
                      <Select.Item value="audit">Audit</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="pending">Menunggu</Select.Item>
                      <Select.Item value="compliant">Patuh</Select.Item>
                      <Select.Item value="non_compliant">Tidak Patuh</Select.Item>
                      <Select.Item value="expired">Tamat Tempoh</Select.Item>
                      <Select.Item value="under_review">Sedang Semakan</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Tarikh Akhir</Label>
                  <Input id="dueDate" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Ditugaskan Kepada</Label>
                  <Input id="assignedTo" placeholder="Nama..." value={formAssignedTo} onChange={(e) => setFormAssignedTo(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evidenceUrl">URL Bukti</Label>
                <Input id="evidenceUrl" placeholder="/docs/evidence.pdf" value={formEvidenceUrl} onChange={(e) => setFormEvidenceUrl(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" placeholder="Catatan tambahan..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting || !formTitle}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compliance Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CircularProgress value={score} size={140} strokeWidth={12} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold">Skor Pematuhan Keseluruhan</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.compliantCount ?? 0} daripada {stats?.totalRecords ?? 0} rekod adalah patuh
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {Object.entries(categoryConfig).map(([key, conf]) => {
                  const catScore = stats?.categoryScores?.[key]
                  return (
                    <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{conf.label}</p>
                      <p className="text-lg font-bold">{catScore?.score ?? 0}%</p>
                      <Progress value={catScore?.score ?? 0} className="h-1.5 mt-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={currentCategory} onValueChange={setCategoryFilter}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="rosm">ROSM</TabsTrigger>
          <TabsTrigger value="lhdn">LHDN</TabsTrigger>
          <TabsTrigger value="pdpa">PDPA</TabsTrigger>
          <TabsTrigger value="internal">Dalaman</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari tajuk, penerangan..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <Select.Value placeholder="Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Semua Status</Select.Item>
                <Select.Item value="pending">Menunggu</Select.Item>
                <Select.Item value="compliant">Patuh</Select.Item>
                <Select.Item value="non_compliant">Tidak Patuh</Select.Item>
                <Select.Item value="expired">Tamat Tempoh</Select.Item>
                <Select.Item value="under_review">Sedang Semakan</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Rekod Pematuhan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tajuk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tarikh Akhir</TableHead>
                  <TableHead>Ditugaskan</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tiada rekod pematuhan dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const catConf = categoryConfig[r.category] || categoryConfig.internal
                    const statConf = statusConfig[r.status] || statusConfig.pending
                    const StatusIcon = statConf.icon
                    const overdue = isOverdue(r.dueDate, r.status)
                    return (
                      <TableRow key={r.id} className={overdue ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{r.title}</p>
                            {r.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={catConf.color}>{catConf.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${statConf.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={`text-sm ${overdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}>
                              {r.dueDate || '—'}
                            </span>
                            {overdue && (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{r.assignedTo || '—'}</TableCell>
                        <TableCell>
                          {r.evidenceUrl ? (
                            <div className="flex items-center gap-1 text-primary">
                              <FileCheck className="h-3 w-3" />
                              <span className="text-xs underline truncate max-w-[100px]">{r.evidenceUrl}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tiada</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Lihat
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
