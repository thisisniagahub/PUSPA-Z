'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, Textarea, Checkbox,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Label,
} from '@/components/ui'
import {
  HandCoins, Plus, Search, Filter, FileText, CheckCircle2,
  TrendingUp, Receipt, ShieldCheck, Calendar,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface Donation {
  id: string
  donorId: string | null
  donorName: string | null
  category: string
  amount: number
  currency: string
  method: string | null
  receiptNumber: string | null
  receiptIssued: boolean
  shariahCompliant: boolean
  date: string | null
  notes: string | null
  createdAt: string
  donor?: { id: string; name: string; email: string | null; type: string } | null
}

interface DonationStats {
  totalThisMonth: number
  categoryTotals: Record<string, number>
  receiptCount: number
  shariahRate: number
  totalDonations: number
  totalAmount: number
}

/* ─── Helpers ──────────────────────────────────────────── */
const formatRM = (val: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(val)

const categoryConfig: Record<string, { label: string; color: string }> = {
  zakat: { label: 'Zakat', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  sadaqah: { label: 'Sadaqah', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
  waqf: { label: 'Waqf', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  infaq: { label: 'Infaq', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  general: { label: 'Umum', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
}

const methodLabels: Record<string, string> = {
  cash: 'Tunai',
  bank_transfer: 'Pindahan Bank',
  online: 'Atas Talian',
  cheque: 'Cek',
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoDonations: Donation[] = [
  { id: 'd1', donorId: null, donorName: 'Ahmad bin Abdullah', category: 'zakat', amount: 5000, currency: 'MYR', method: 'bank_transfer', receiptNumber: 'REC-00001', receiptIssued: true, shariahCompliant: true, date: '2025-03-01', notes: 'Zakat fitrah', createdAt: '2025-03-01T08:00:00Z', donor: { id: 'dn1', name: 'Ahmad bin Abdullah', email: 'ahmad@email.com', type: 'individual' } },
  { id: 'd2', donorId: null, donorName: 'Syarikat Maju Jaya', category: 'sadaqah', amount: 10000, currency: 'MYR', method: 'cheque', receiptNumber: 'REC-00002', receiptIssued: true, shariahCompliant: true, date: '2025-03-03', notes: 'Sumbangan bulanan', createdAt: '2025-03-03T10:00:00Z', donor: { id: 'dn2', name: 'Syarikat Maju Jaya', email: 'info@majujaya.com', type: 'corporate' } },
  { id: 'd3', donorId: null, donorName: 'Siti Aminah', category: 'waqf', amount: 25000, currency: 'MYR', method: 'online', receiptNumber: 'REC-00003', receiptIssued: false, shariahCompliant: true, date: '2025-03-05', notes: 'Waqf pendidikan', createdAt: '2025-03-05T14:00:00Z', donor: { id: 'dn3', name: 'Siti Aminah', email: 'siti@email.com', type: 'individual' } },
  { id: 'd4', donorId: null, donorName: 'Kerajaan Negeri', category: 'infaq', amount: 50000, currency: 'MYR', method: 'bank_transfer', receiptNumber: 'REC-00004', receiptIssued: true, shariahCompliant: true, date: '2025-03-07', notes: 'Infaq pembangunan', createdAt: '2025-03-07T09:00:00Z', donor: { id: 'dn4', name: 'Kerajaan Negeri', email: 'gov@negeri.gov.my', type: 'government' } },
  { id: 'd5', donorId: null, donorName: 'Mohd Razak', category: 'general', amount: 500, currency: 'MYR', method: 'cash', receiptNumber: 'REC-00005', receiptIssued: false, shariahCompliant: false, date: '2025-03-10', notes: 'Sumbangan am', createdAt: '2025-03-10T11:00:00Z', donor: { id: 'dn5', name: 'Mohd Razak', email: 'razak@email.com', type: 'individual' } },
  { id: 'd6', donorId: null, donorName: 'Fatimah Zahra', category: 'zakat', amount: 3000, currency: 'MYR', method: 'online', receiptNumber: 'REC-00006', receiptIssued: true, shariahCompliant: true, date: '2025-03-12', notes: null, createdAt: '2025-03-12T16:00:00Z', donor: { id: 'dn6', name: 'Fatimah Zahra', email: 'fatimah@email.com', type: 'individual' } },
  { id: 'd7', donorId: null, donorName: 'Perniagaan Al-Barakah', category: 'sadaqah', amount: 7500, currency: 'MYR', method: 'bank_transfer', receiptNumber: 'REC-00007', receiptIssued: true, shariahCompliant: true, date: '2025-03-14', notes: 'Sadaqah bulanan', createdAt: '2025-03-14T08:30:00Z', donor: { id: 'dn7', name: 'Perniagaan Al-Barakah', email: 'info@albarakah.com', type: 'corporate' } },
]

const demoStats: DonationStats = {
  totalThisMonth: 101000,
  categoryTotals: { zakat: 8000, sadaqah: 17500, waqf: 25000, infaq: 50000, general: 500 },
  receiptCount: 5,
  shariahRate: 86,
  totalDonations: 7,
  totalAmount: 101000,
}

/* ─── Component ────────────────────────────────────────── */
export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [formDonorName, setFormDonorName] = useState('')
  const [formCategory, setFormCategory] = useState('sadaqah')
  const [formAmount, setFormAmount] = useState('')
  const [formMethod, setFormMethod] = useState('cash')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formNotes, setFormNotes] = useState('')
  const [formShariah, setFormShariah] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (methodFilter !== 'all') params.set('method', methodFilter)

      const res = await fetch(`/api/v1/donations?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.donations && data.donations.length > 0) {
          setDonations(data.donations)
          setStats(data.stats)
        } else {
          setDonations(demoDonations)
          setStats(demoStats)
        }
      } else {
        setDonations(demoDonations)
        setStats(demoStats)
      }
    } catch {
      setDonations(demoDonations)
      setStats(demoStats)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, methodFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formAmount || parseFloat(formAmount) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: formDonorName,
          category: formCategory,
          amount: parseFloat(formAmount),
          method: formMethod,
          date: formDate,
          notes: formNotes,
          shariahCompliant: formShariah,
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
    setFormDonorName('')
    setFormCategory('sadaqah')
    setFormAmount('')
    setFormMethod('cash')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormNotes('')
    setFormShariah(true)
  }

  const filtered = donations.filter((d) => {
    const matchSearch = !search ||
      (d.donorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.receiptNumber || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter
    const matchMethod = methodFilter === 'all' || d.method === methodFilter
    return matchSearch && matchCat && matchMethod
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Sumbangan</h1>
          <p className="text-sm text-muted-foreground">Donation Management — Rekod dan urus sumbangan masuk</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Rekod Derma Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Rekod Derma Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="donorName">Nama Penderma</Label>
                <Input id="donorName" placeholder="Cari atau masukkan nama..." value={formDonorName} onChange={(e) => setFormDonorName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="zakat">Zakat</Select.Item>
                      <Select.Item value="sadaqah">Sadaqah</Select.Item>
                      <Select.Item value="waqf">Waqf</Select.Item>
                      <Select.Item value="infaq">Infaq</Select.Item>
                      <Select.Item value="general">Umum</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Jumlah (RM)</Label>
                  <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kaedah Pembayaran</Label>
                  <Select value={formMethod} onValueChange={setFormMethod}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="cash">Tunai</Select.Item>
                      <Select.Item value="bank_transfer">Pindahan Bank</Select.Item>
                      <Select.Item value="online">Atas Talian</Select.Item>
                      <Select.Item value="cheque">Cek</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Tarikh</Label>
                  <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" placeholder="Catatan tambahan..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="shariah" checked={formShariah} onCheckedChange={(v) => setFormShariah(v === true)} />
                <Label htmlFor="shariah" className="text-sm">Patuh Syariah</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting || !formAmount}>
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
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Bulan Ini</p>
                <p className="text-lg font-bold">{stats ? formatRM(stats.totalThisMonth) : formatRM(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900">
                <HandCoins className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Mengikut Kategori</p>
                <p className="text-lg font-bold">{stats ? Object.keys(stats.categoryTotals).length : 0} Kategori</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resit Dikeluarkan</p>
                <p className="text-lg font-bold">{stats?.receiptCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kadar Patuh Syariah</p>
                <p className="text-lg font-bold">{stats?.shariahRate ?? 100}%</p>
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
                placeholder="Cari penderma, resit..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <Select.Value placeholder="Kategori" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Semua Kategori</Select.Item>
                <Select.Item value="zakat">Zakat</Select.Item>
                <Select.Item value="sadaqah">Sadaqah</Select.Item>
                <Select.Item value="waqf">Waqf</Select.Item>
                <Select.Item value="infaq">Infaq</Select.Item>
                <Select.Item value="general">Umum</Select.Item>
              </Select.Content>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <Select.Trigger className="w-full sm:w-[160px]">
                <Select.Value placeholder="Kaedah" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Semua Kaedah</Select.Item>
                <Select.Item value="cash">Tunai</Select.Item>
                <Select.Item value="bank_transfer">Pindahan Bank</Select.Item>
                <Select.Item value="online">Atas Talian</Select.Item>
                <Select.Item value="cheque">Cek</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Sumbangan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Penderma</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Jumlah (RM)</TableHead>
                  <TableHead>Kaedah</TableHead>
                  <TableHead>No. Resit</TableHead>
                  <TableHead>Syariah</TableHead>
                  <TableHead>Tarikh</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tiada sumbangan dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => {
                    const catConf = categoryConfig[d.category] || categoryConfig.general
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{d.donorName || d.donor?.name || '—'}</p>
                            {d.donor?.type && (
                              <p className="text-xs text-muted-foreground capitalize">{d.donor.type}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={catConf.color}>
                            {catConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatRM(d.amount)}</TableCell>
                        <TableCell className="text-sm">{methodLabels[d.method || ''] || d.method || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{d.receiptNumber || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {d.shariahCompliant ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Patuh
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Tidak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {d.date || '—'}
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
