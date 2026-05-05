'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Label,
} from '@/components/ui'
import {
  ArrowDownToLine, Plus, Search, Filter, Clock, CheckCircle2,
  Banknote, Calendar, AlertCircle, XCircle,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface MemberInfo {
  id: string
  name: string
  icNumber: string
  asnafCategory: string
}

interface CaseInfo {
  id: string
  caseNumber: string
  type: string
}

interface Disbursement {
  id: string
  memberId: string
  caseId: string | null
  programmeId: string | null
  amount: number
  category: string
  status: string
  paymentMethod: string | null
  paymentRef: string | null
  scheduledDate: string | null
  disbursedDate: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  member: MemberInfo
  case: CaseInfo | null
}

interface DisbursementStats {
  totalDisbursed: number
  pendingCount: number
  approvedCount: number
  scheduledCount: number
  verifiedCount: number
  totalDisbursements: number
}

/* ─── Helpers ──────────────────────────────────────────── */
const formatRM = (val: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(val)

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  approved: { label: 'Diluluskan', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle2 },
  disbursed: { label: 'Diagihkan', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: Banknote },
  verified: { label: 'Disahkan', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
}

const categoryLabels: Record<string, string> = {
  welfare: 'Kebajikan',
  medical: 'Perubatan',
  education: 'Pendidikan',
  housing: 'Perumahan',
  emergency: 'Kecemasan',
  monthly_aid: 'Bantuan Bulanan',
}

const methodLabels: Record<string, string> = {
  cash: 'Tunai',
  bank_transfer: 'Pindahan Bank',
  cheque: 'Cek',
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoDisbursements: Disbursement[] = [
  {
    id: 'dis1', memberId: 'm1', caseId: 'c1', programmeId: null, amount: 1500, category: 'welfare',
    status: 'disbursed', paymentMethod: 'bank_transfer', paymentRef: 'TXN-001', scheduledDate: '2025-03-01',
    disbursedDate: '2025-03-01', verifiedBy: null, verifiedAt: null, notes: 'Bantuan makanan',
    createdAt: '2025-02-28T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z',
    member: { id: 'm1', name: 'Aminah binti Mohamed', icNumber: '850101-01-5520', asnafCategory: 'fakir' },
    case: { id: 'c1', caseNumber: 'KES-2025-001', type: 'welfare' },
  },
  {
    id: 'dis2', memberId: 'm2', caseId: 'c2', programmeId: null, amount: 5000, category: 'medical',
    status: 'pending', paymentMethod: 'bank_transfer', paymentRef: null, scheduledDate: '2025-03-15',
    disbursedDate: null, verifiedBy: null, verifiedAt: null, notes: 'Kos rawatan hospital',
    createdAt: '2025-03-05T10:00:00Z', updatedAt: '2025-03-05T10:00:00Z',
    member: { id: 'm2', name: 'Hassan bin Omar', icNumber: '780505-10-5431', asnafCategory: 'miskin' },
    case: { id: 'c2', caseNumber: 'KES-2025-002', type: 'medical' },
  },
  {
    id: 'dis3', memberId: 'm3', caseId: null, programmeId: null, amount: 800, category: 'monthly_aid',
    status: 'approved', paymentMethod: 'cash', paymentRef: null, scheduledDate: '2025-03-10',
    disbursedDate: null, verifiedBy: null, verifiedAt: null, notes: 'Bantuan bulanan Mac',
    createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-08T09:00:00Z',
    member: { id: 'm3', name: 'Zainab binti Ali', icNumber: '900302-14-5540', asnafCategory: 'fakir' },
    case: null,
  },
  {
    id: 'dis4', memberId: 'm4', caseId: 'c3', programmeId: null, amount: 3000, category: 'education',
    status: 'verified', paymentMethod: 'bank_transfer', paymentRef: 'TXN-002', scheduledDate: '2025-02-20',
    disbursedDate: '2025-02-20', verifiedBy: 'admin', verifiedAt: '2025-02-22T08:00:00Z', notes: 'Yuran pengajian',
    createdAt: '2025-02-15T08:00:00Z', updatedAt: '2025-02-22T08:00:00Z',
    member: { id: 'm4', name: 'Muhammad Amin', icNumber: '000506-10-5521', asnafCategory: 'gharim' },
    case: { id: 'c3', caseNumber: 'KES-2025-003', type: 'education' },
  },
  {
    id: 'dis5', memberId: 'm5', caseId: 'c4', programmeId: null, amount: 10000, category: 'housing',
    status: 'cancelled', paymentMethod: 'cheque', paymentRef: null, scheduledDate: '2025-02-28',
    disbursedDate: null, verifiedBy: null, verifiedAt: null, notes: 'Dibatalkan - dokumen tidak lengkap',
    createdAt: '2025-02-10T08:00:00Z', updatedAt: '2025-02-25T08:00:00Z',
    member: { id: 'm5', name: 'Rahimah binti Ismail', icNumber: '750812-06-5482', asnafCategory: 'miskin' },
    case: { id: 'c4', caseNumber: 'KES-2025-004', type: 'housing' },
  },
  {
    id: 'dis6', memberId: 'm6', caseId: 'c5', programmeId: null, amount: 2000, category: 'emergency',
    status: 'disbursed', paymentMethod: 'cash', paymentRef: 'CASH-003', scheduledDate: '2025-03-05',
    disbursedDate: '2025-03-05', verifiedBy: null, verifiedAt: null, notes: 'Bantuan kecemasan kebakaran',
    createdAt: '2025-03-04T18:00:00Z', updatedAt: '2025-03-05T08:00:00Z',
    member: { id: 'm6', name: 'Ahmad Tarmizi', icNumber: '880211-14-5491', asnafCategory: 'fakir' },
    case: { id: 'c5', caseNumber: 'KES-2025-005', type: 'emergency' },
  },
  {
    id: 'dis7', memberId: 'm3', caseId: null, programmeId: null, amount: 800, category: 'monthly_aid',
    status: 'approved', paymentMethod: 'bank_transfer', paymentRef: null, scheduledDate: '2025-04-01',
    disbursedDate: null, verifiedBy: null, verifiedAt: null, notes: 'Bantuan bulanan April',
    createdAt: '2025-03-20T08:00:00Z', updatedAt: '2025-03-20T08:00:00Z',
    member: { id: 'm3', name: 'Zainab binti Ali', icNumber: '900302-14-5540', asnafCategory: 'fakir' },
    case: null,
  },
]

const demoStats: DisbursementStats = {
  totalDisbursed: 6300,
  pendingCount: 1,
  approvedCount: 2,
  scheduledCount: 2,
  verifiedCount: 1,
  totalDisbursements: 7,
}

/* ─── Component ────────────────────────────────────────── */
export default function DisbursementsPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [stats, setStats] = useState<DisbursementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [formMemberId, setFormMemberId] = useState('')
  const [formCaseId, setFormCaseId] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('welfare')
  const [formPaymentMethod, setFormPaymentMethod] = useState('bank_transfer')
  const [formScheduledDate, setFormScheduledDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/v1/disbursements?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.disbursements && data.disbursements.length > 0) {
          setDisbursements(data.disbursements)
          setStats(data.stats)
        } else {
          setDisbursements(demoDisbursements)
          setStats(demoStats)
        }
      } else {
        setDisbursements(demoDisbursements)
        setStats(demoStats)
      }
    } catch {
      setDisbursements(demoDisbursements)
      setStats(demoStats)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, categoryFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formMemberId.trim() || !formAmount || parseFloat(formAmount) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/disbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: formMemberId,
          caseId: formCaseId || undefined,
          amount: parseFloat(formAmount),
          category: formCategory,
          paymentMethod: formPaymentMethod,
          scheduledDate: formScheduledDate || undefined,
          notes: formNotes || undefined,
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
    setFormMemberId('')
    setFormCaseId('')
    setFormAmount('')
    setFormCategory('welfare')
    setFormPaymentMethod('bank_transfer')
    setFormScheduledDate('')
    setFormNotes('')
  }

  const filtered = disbursements.filter((d) => {
    const matchSearch = !search ||
      d.member.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.case?.caseNumber || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Agihan</h1>
          <p className="text-sm text-muted-foreground">Disbursement Management — Urus dan kelulusan agihan bantuan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agihan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Agihan Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="memberId">ID Ahli *</Label>
                  <Input id="memberId" placeholder="cuid ahli..." value={formMemberId} onChange={(e) => setFormMemberId(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="caseId">ID Kes</Label>
                  <Input id="caseId" placeholder="cuid kes (pilihan)" value={formCaseId} onChange={(e) => setFormCaseId(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="disbAmount">Jumlah (RM) *</Label>
                  <Input id="disbAmount" type="number" min="0" step="0.01" placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Kategori *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welfare">Kebajikan</SelectItem>
                      <SelectItem value="medical">Perubatan</SelectItem>
                      <SelectItem value="education">Pendidikan</SelectItem>
                      <SelectItem value="housing">Perumahan</SelectItem>
                      <SelectItem value="emergency">Kecemasan</SelectItem>
                      <SelectItem value="monthly_aid">Bantuan Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kaedah Bayaran</Label>
                  <Select value={formPaymentMethod} onValueChange={setFormPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="bank_transfer">Pindahan Bank</SelectItem>
                      <SelectItem value="cheque">Cek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduledDate">Tarikh Dijadual</Label>
                  <Input id="scheduledDate" type="date" value={formScheduledDate} onChange={(e) => setFormScheduledDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="disbNotes">Catatan</Label>
                <Textarea id="disbNotes" placeholder="Catatan tambahan..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting || !formMemberId.trim() || !formAmount}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Diagihkan</p>
                <p className="text-lg font-bold">{stats ? formatRM(stats.totalDisbursed) : formatRM(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Menunggu Kelulusan</p>
                <p className="text-lg font-bold">{stats?.pendingCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dijadualkan</p>
                <p className="text-lg font-bold">{stats?.scheduledCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disahkan</p>
                <p className="text-lg font-bold">{stats?.verifiedCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari penerima, no. kes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Diluluskan</SelectItem>
                <SelectItem value="disbursed">Diagihkan</SelectItem>
                <SelectItem value="verified">Disahkan</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="welfare">Kebajikan</SelectItem>
                <SelectItem value="medical">Perubatan</SelectItem>
                <SelectItem value="education">Pendidikan</SelectItem>
                <SelectItem value="housing">Perumahan</SelectItem>
                <SelectItem value="emergency">Kecemasan</SelectItem>
                <SelectItem value="monthly_aid">Bantuan Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Agihan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penerima</TableHead>
                  <TableHead className="text-right">Jumlah (RM)</TableHead>
                  <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Kaedah Bayaran</TableHead>
                  <TableHead className="hidden md:table-cell">Tarikh Dijadual</TableHead>
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
                      Tiada agihan dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => {
                    const stConf = statusConfig[d.status] || statusConfig.pending
                    const StIcon = stConf.icon
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{d.member.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{d.member.icNumber}</span>
                              {d.case && (
                                <span className="text-primary">({d.case.caseNumber})</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatRM(d.amount)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {categoryLabels[d.category] || d.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={stConf.color}>
                            <StIcon className="h-3 w-3 mr-1" />
                            {stConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {methodLabels[d.paymentMethod || ''] || d.paymentMethod || '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {d.scheduledDate || '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Lihat</Button>
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
