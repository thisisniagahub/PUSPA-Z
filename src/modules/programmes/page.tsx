'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Users,
  Banknote,
  Target,
  TrendingUp,
  Eye,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

// ─── Types ──────────────────────────────────────────────────────

interface ProgrammeItem {
  id: string
  name: string
  description?: string
  category: string
  status: string
  budget: number
  spent: number
  startDate?: string
  endDate?: string
  location?: string
  targetBeneficiaries: number
  impactMetric?: string
  beneficiaryCount?: number
  createdAt: string
}

// ─── Constants ──────────────────────────────────────────────────

const categoryConfig: Record<string, { label: string; color: string }> = {
  education: { label: 'Pendidikan', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  welfare: { label: 'Kebajikan', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  health: { label: 'Kesihatan', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  economic: { label: 'Ekonomi', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  social: { label: 'Sosial', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  religious: { label: 'Keagamaan', color: 'bg-purple-100 text-purple-800 border-purple-200' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: 'Perancangan', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800 border-green-200' },
  completed: { label: 'Selesai', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  suspended: { label: 'Digantung', color: 'bg-red-100 text-red-800 border-red-200' },
}

// ─── Demo Data ──────────────────────────────────────────────────

const demoProgrammes: ProgrammeItem[] = [
  {
    id: 'prog_001',
    name: 'Program Bimbingan Pelajar Asnaf',
    description: 'Program bimbingan akademik dan kemahiran belajar untuk pelajar daripada keluarga asnaf di sekitar Lembah Klang.',
    category: 'education',
    status: 'active',
    budget: 150000,
    spent: 87500,
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    location: 'Pusat Pendidikan PUSPA, Kuala Lumpur',
    targetBeneficiaries: 200,
    beneficiaryCount: 145,
    impactMetric: '85% peningkatan kehadiran sekolah',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'prog_002',
    name: 'Bantuan Makanan Bulanan',
    description: 'Pengedaran bungkusan makanan kepada keluarga asnaf setiap bulan.',
    category: 'welfare',
    status: 'active',
    budget: 200000,
    spent: 150000,
    startDate: '2024-06-01',
    endDate: '2025-06-30',
    location: 'Selangor & Kuala Lumpur',
    targetBeneficiaries: 500,
    beneficiaryCount: 420,
    impactMetric: '4,200 bungkusan makanan diedar',
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'prog_003',
    name: 'Klinik Kesihatan Komuniti',
    description: 'Klinik kesihatan percuma untuk golongan asnaf dengan perkhidmatan perubatan asas.',
    category: 'health',
    status: 'active',
    budget: 300000,
    spent: 120000,
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    location: 'Klinik PUSPA, Petaling Jaya',
    targetBeneficiaries: 1000,
    beneficiaryCount: 380,
    impactMetric: '380 pesakit dirawat',
    createdAt: '2025-02-15T09:00:00Z',
  },
  {
    id: 'prog_004',
    name: 'Latihan Kemahiran Keusahawanan',
    description: 'Program latihan kemahiran perniagaan untuk asnaf memulakan perniagaan kecil.',
    category: 'economic',
    status: 'planning',
    budget: 180000,
    spent: 5000,
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    location: 'Pusat Latihan PUSPA, Shah Alam',
    targetBeneficiaries: 100,
    beneficiaryCount: 0,
    impactMetric: 'Janaan pendapatan minimum RM1,000/sebulan',
    createdAt: '2025-04-01T08:00:00Z',
  },
  {
    id: 'prog_005',
    name: 'Program Keceriaan Raya',
    description: 'Pengedaran pakaian dan duit raya kepada kanak-kanak asnaf sempena Hari Raya Aidilfitri.',
    category: 'social',
    status: 'completed',
    budget: 75000,
    spent: 72500,
    startDate: '2025-03-01',
    endDate: '2025-04-15',
    location: 'Seluruh Malaysia',
    targetBeneficiaries: 300,
    beneficiaryCount: 310,
    impactMetric: '310 kanak-kanak menerima bantuan',
    createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'prog_006',
    name: 'Kelas Pengajian Al-Quran',
    description: 'Kelas tahfiz dan pengajian al-Quran untuk remaja asnaf.',
    category: 'religious',
    status: 'suspended',
    budget: 60000,
    spent: 25000,
    startDate: '2024-09-01',
    endDate: '2025-08-31',
    location: 'Masjid PUSPA, Gombak',
    targetBeneficiaries: 50,
    beneficiaryCount: 35,
    impactMetric: '20 pelajar hafal 5 juzuk',
    createdAt: '2024-08-15T08:00:00Z',
  },
]

// ─── Helpers ────────────────────────────────────────────────────

function formatMYR(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Component ──────────────────────────────────────────────────

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>(demoProgrammes)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeItem | null>(null)
  const [loading, setLoading] = useState(false)

  // New programme form
  const [newForm, setNewForm] = useState({
    name: '',
    description: '',
    category: 'education',
    status: 'planning',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    targetBeneficiaries: '',
    impactMetric: '',
  })

  useEffect(() => {
    fetchProgrammes()
  }, [])

  async function fetchProgrammes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterCategory !== 'all') params.set('category', filterCategory)
      if (search) params.set('search', search)

      const res = await fetch(`/api/v1/programmes?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setProgrammes(json.data)
        }
      }
    } catch {
      // Keep demo data
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProgramme() {
    try {
      const res = await fetch('/api/v1/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newForm,
          budget: parseFloat(newForm.budget) || 0,
          targetBeneficiaries: parseInt(newForm.targetBeneficiaries) || 0,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setProgrammes((prev) => [json.data, ...prev])
        setShowNewDialog(false)
        resetForm()
      }
    } catch {
      // Error handling
    }
  }

  function resetForm() {
    setNewForm({
      name: '',
      description: '',
      category: 'education',
      status: 'planning',
      budget: '',
      startDate: '',
      endDate: '',
      location: '',
      targetBeneficiaries: '',
      impactMetric: '',
    })
  }

  // Filter programmes client-side for demo
  const filtered = useMemo(() => {
    return programmes.filter((p) => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false
      if (filterCategory !== 'all' && p.category !== filterCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [programmes, search, filterStatus, filterCategory])

  // Stats
  const stats = useMemo(() => {
    const active = programmes.filter((p) => p.status === 'active').length
    const totalBudget = programmes.reduce((s, p) => s + p.budget, 0)
    const totalSpent = programmes.reduce((s, p) => s + p.spent, 0)
    const totalBen = programmes.reduce((s, p) => s + (p.beneficiaryCount || p.targetBeneficiaries || 0), 0)
    return { active, totalBudget, totalSpent, totalBen }
  }, [programmes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Program</h1>
          <p className="text-sm text-muted-foreground">Programme Management</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Program Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cipta Program Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="prog-name">Nama Program</Label>
                <Input
                  id="prog-name"
                  placeholder="Masukkan nama program"
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-desc">Penerangan</Label>
                <Textarea
                  id="prog-desc"
                  placeholder="Penerangan program"
                  value={newForm.description}
                  onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={newForm.category}
                    onValueChange={(v) => setNewForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newForm.status}
                    onValueChange={(v) => setNewForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-budget">Belanjawan (RM)</Label>
                <Input
                  id="prog-budget"
                  type="number"
                  placeholder="0"
                  value={newForm.budget}
                  onChange={(e) => setNewForm((f) => ({ ...f, budget: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prog-start">Tarikh Mula</Label>
                  <Input
                    id="prog-start"
                    type="date"
                    value={newForm.startDate}
                    onChange={(e) => setNewForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prog-end">Tarikh Tamat</Label>
                  <Input
                    id="prog-end"
                    type="date"
                    value={newForm.endDate}
                    onChange={(e) => setNewForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-loc">Lokasi</Label>
                <Input
                  id="prog-loc"
                  placeholder="Lokasi program"
                  value={newForm.location}
                  onChange={(e) => setNewForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-target">Sasaran Penerima Manfaat</Label>
                <Input
                  id="prog-target"
                  type="number"
                  placeholder="0"
                  value={newForm.targetBeneficiaries}
                  onChange={(e) => setNewForm((f) => ({ ...f, targetBeneficiaries: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-impact">Metrik Impak</Label>
                <Input
                  id="prog-impact"
                  placeholder="cth: 85% peningkatan kehadiran"
                  value={newForm.impactMetric}
                  onChange={(e) => setNewForm((f) => ({ ...f, impactMetric: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateProgramme} disabled={!newForm.name}>
                  Cipta Program
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Program Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatMYR(stats.totalBudget)}</p>
                <p className="text-xs text-muted-foreground">Jumlah Belanjawan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatMYR(stats.totalSpent)}</p>
                <p className="text-xs text-muted-foreground">Jumlah Perbelanjaan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBen.toLocaleString('ms-MY')}</p>
                <p className="text-xs text-muted-foreground">Penerima Manfaat</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari program..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programme Cards Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Tiada program dijumpai</p>
            <p className="text-sm text-muted-foreground">Cipta program baru atau ubah penapis</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((programme) => {
            const catCfg = categoryConfig[programme.category] || { label: programme.category, color: 'bg-gray-100 text-gray-800 border-gray-200' }
            const statCfg = statusConfig[programme.status] || { label: programme.status, color: 'bg-gray-100 text-gray-800 border-gray-200' }
            const budgetPct = programme.budget > 0 ? Math.min(100, Math.round((programme.spent / programme.budget) * 100)) : 0
            const benCount = programme.beneficiaryCount || 0
            const benPct = programme.targetBeneficiaries > 0 ? Math.min(100, Math.round((benCount / programme.targetBeneficiaries) * 100)) : 0

            return (
              <Card key={programme.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                        {programme.name}
                      </CardTitle>
                      {programme.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{programme.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className={`text-[11px] ${catCfg.color}`}>
                      {catCfg.label}
                    </Badge>
                    <Badge variant="outline" className={`text-[11px] ${statCfg.color}`}>
                      {statCfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Budget progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Belanjawan</span>
                      <span className="font-medium">
                        {formatMYR(programme.spent)} / {formatMYR(programme.budget)}
                      </span>
                    </div>
                    <Progress value={budgetPct} className="h-2" />
                    <p className="text-[11px] text-muted-foreground">{budgetPct}% digunakan</p>
                  </div>

                  {/* Beneficiaries */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Penerima Manfaat
                    </span>
                    <span className="font-medium">
                      {benCount} / {programme.targetBeneficiaries} ({benPct}%)
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Tempoh
                    </span>
                    <span className="font-medium">
                      {formatDate(programme.startDate)} — {formatDate(programme.endDate)}
                    </span>
                  </div>

                  {/* Impact */}
                  {programme.impactMetric && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                      <span className="font-medium">Impak:</span> {programme.impactMetric}
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSelectedProgramme(programme)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Butiran
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Programme Detail Dialog */}
      <Dialog open={!!selectedProgramme} onOpenChange={(open) => !open && setSelectedProgramme(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedProgramme && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selectedProgramme.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={categoryConfig[selectedProgramme.category]?.color || ''}>
                    {categoryConfig[selectedProgramme.category]?.label || selectedProgramme.category}
                  </Badge>
                  <Badge variant="outline" className={statusConfig[selectedProgramme.status]?.color || ''}>
                    {statusConfig[selectedProgramme.status]?.label || selectedProgramme.status}
                  </Badge>
                </div>

                {/* Description */}
                {selectedProgramme.description && (
                  <p className="text-sm text-muted-foreground">{selectedProgramme.description}</p>
                )}

                <Separator />

                {/* Budget Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Pecahan Belanjawan</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">Belanjawan</p>
                      <p className="text-lg font-bold text-emerald-800">
                        {formatMYR(selectedProgramme.budget)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">Perbelanjaan</p>
                      <p className="text-lg font-bold text-amber-800">
                        {formatMYR(selectedProgramme.spent)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress
                      value={selectedProgramme.budget > 0 ? Math.min(100, (selectedProgramme.spent / selectedProgramme.budget) * 100) : 0}
                      className="h-2.5"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      Baki: {formatMYR(selectedProgramme.budget - selectedProgramme.spent)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lokasi</span>
                    <span className="font-medium">{selectedProgramme.location || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarikh Mula</span>
                    <span className="font-medium">{formatDate(selectedProgramme.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarikh Tamat</span>
                    <span className="font-medium">{formatDate(selectedProgramme.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sasaran Penerima</span>
                    <span className="font-medium">{selectedProgramme.targetBeneficiaries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Penerima Semasa</span>
                    <span className="font-medium">{selectedProgramme.beneficiaryCount || 0}</span>
                  </div>
                  {selectedProgramme.impactMetric && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metrik Impak</span>
                      <span className="font-medium">{selectedProgramme.impactMetric}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Sample Beneficiary List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Senarai Penerima Manfaat</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {['Ahmad bin Ali', 'Siti binti Hassan', 'Muhammad bin Ismail', 'Aisyah binti Yusof', 'Ismail bin Abdullah'].map((name, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-xs">
                        <span>{name}</span>
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                          Aktif
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Menunjukkan 5 daripada {selectedProgramme.beneficiaryCount || 0} penerima
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
