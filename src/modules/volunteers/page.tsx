'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  Award,
  ArrowRightLeft,
  Phone,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

// ─── Types ──────────────────────────────────────────────────────

interface VolunteerActivity {
  id: string
  hours: number
  role?: string
  status: string
  date?: string
}

interface VolunteerCertificate {
  id: string
  title: string
  issuedDate?: string
  certificateUrl?: string
}

interface VolunteerItem {
  id: string
  name: string
  email?: string
  phone?: string
  skills?: string
  availability?: string
  status: string
  totalHours: number
  joinedAt?: string
  notes?: string
  activities?: VolunteerActivity[]
  certificates?: VolunteerCertificate[]
  _count?: { activities: number; certificates: number }
  createdAt: string
}

// ─── Constants ──────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { label: 'Tidak Aktif', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  suspended: { label: 'Digantung', color: 'bg-red-100 text-red-800 border-red-200' },
}

const availabilityConfig: Record<string, { label: string }> = {
  weekdays: { label: 'Hari Kerja' },
  weekends: { label: 'Hujung Minggu' },
  flexible: { label: 'Fleksibel' },
}

// ─── Demo Data ──────────────────────────────────────────────────

const demoVolunteers: VolunteerItem[] = [
  {
    id: 'vol_001',
    name: 'Nurul Aisyah binti Rahman',
    email: 'nurul.aisyah@email.com',
    phone: '012-345 6789',
    skills: 'pendidikan,kaunseling,bahasa inggeris',
    availability: 'flexible',
    status: 'active',
    totalHours: 245,
    joinedAt: '2024-03-15',
    notes: 'Sukarelawan berpengalaman dalam program pendidikan.',
    activities: [
      { id: 'va1', hours: 8, role: 'Pengajar', status: 'approved', date: '2025-04-28' },
      { id: 'va2', hours: 6, role: 'Pembimbing', status: 'approved', date: '2025-04-25' },
      { id: 'va3', hours: 4, role: 'Penyelaras', status: 'logged', date: '2025-04-20' },
    ],
    certificates: [
      { id: 'vc1', title: 'Sijil Perkhidmatan 2024', issuedDate: '2024-12-20' },
      { id: 'vc2', title: 'Sijil Latihan Kaunseling', issuedDate: '2024-08-15' },
    ],
    _count: { activities: 45, certificates: 2 },
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'vol_002',
    name: 'Ahmad Faiz bin Ismail',
    email: 'ahmad.faiz@email.com',
    phone: '019-876 5432',
    skills: 'logistik,panduan,memasak',
    availability: 'weekends',
    status: 'active',
    totalHours: 180,
    joinedAt: '2024-06-01',
    activities: [
      { id: 'va4', hours: 10, role: 'Pemandu', status: 'approved', date: '2025-04-27' },
      { id: 'va5', hours: 6, role: 'Penyedia Makanan', status: 'approved', date: '2025-04-20' },
    ],
    certificates: [
      { id: 'vc3', title: 'Sijil Sukarelawan Cemerlang', issuedDate: '2025-01-10' },
    ],
    _count: { activities: 30, certificates: 1 },
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'vol_003',
    name: 'Siti Fatimah binti Abdullah',
    email: 'siti.fatimah@email.com',
    phone: '011-234 5678',
    skills: 'perubatan,kesihatan,jururawat',
    availability: 'weekdays',
    status: 'active',
    totalHours: 320,
    joinedAt: '2023-12-10',
    activities: [
      { id: 'va6', hours: 12, role: 'Jururawat', status: 'approved', date: '2025-04-29' },
      { id: 'va7', hours: 8, role: 'Pemeriksa Kesihatan', status: 'approved', date: '2025-04-22' },
    ],
    certificates: [
      { id: 'vc4', title: 'Sijil Perkhidmatan 2023', issuedDate: '2023-12-20' },
      { id: 'vc5', title: 'Sijil Perkhidmatan 2024', issuedDate: '2024-12-20' },
      { id: 'vc6', title: 'Sijil Latihan Kecemasan', issuedDate: '2024-05-10' },
    ],
    _count: { activities: 60, certificates: 3 },
    createdAt: '2023-12-10T09:00:00Z',
  },
  {
    id: 'vol_004',
    name: 'Mohd Hafiz bin Che Nor',
    email: 'hafiz.chenor@email.com',
    phone: '016-789 0123',
    skills: 'teknologi,komputer,media sosial',
    availability: 'flexible',
    status: 'inactive',
    totalHours: 95,
    joinedAt: '2024-09-20',
    notes: 'Berpindah ke luar negara buat masa ini.',
    activities: [],
    certificates: [],
    _count: { activities: 15, certificates: 0 },
    createdAt: '2024-09-20T08:00:00Z',
  },
  {
    id: 'vol_005',
    name: 'Zainab binti Osman',
    email: 'zainab.osman@email.com',
    phone: '013-456 7890',
    skills: 'kebajikan,sosial,kaunseling',
    availability: 'weekdays',
    status: 'active',
    totalHours: 156,
    joinedAt: '2024-07-05',
    activities: [
      { id: 'va8', hours: 6, role: 'Kaunselor', status: 'approved', date: '2025-04-26' },
    ],
    certificates: [
      { id: 'vc7', title: 'Sijil Latihan Kaunseling Kebajikan', issuedDate: '2024-11-15' },
    ],
    _count: { activities: 25, certificates: 1 },
    createdAt: '2024-07-05T10:00:00Z',
  },
  {
    id: 'vol_006',
    name: 'Rizal bin Kamal',
    email: 'rizal.kamal@email.com',
    phone: '017-111 2233',
    skills: 'keusahawanan,pemasaran,grafik',
    availability: 'weekends',
    status: 'suspended',
    totalHours: 40,
    joinedAt: '2025-01-10',
    notes: 'Digantung kerana tidak hadir 3 kali berturut-turut.',
    activities: [],
    certificates: [],
    _count: { activities: 8, certificates: 0 },
    createdAt: '2025-01-10T10:00:00Z',
  },
]

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Component ──────────────────────────────────────────────────

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>(demoVolunteers)
  const [search, setSearch] = useState('')
  const [filterAvailability, setFilterAvailability] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerItem | null>(null)
  const [loading, setLoading] = useState(false)

  // New volunteer form
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    availability: 'flexible',
    status: 'active',
    joinedAt: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetchVolunteers()
  }, [])

  async function fetchVolunteers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterAvailability !== 'all') params.set('availability', filterAvailability)
      if (search) params.set('search', search)

      const res = await fetch(`/api/v1/volunteers?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setVolunteers(json.data)
        }
      }
    } catch {
      // Keep demo data
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateVolunteer() {
    try {
      const res = await fetch('/api/v1/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })
      if (res.ok) {
        const json = await res.json()
        setVolunteers((prev) => [json.data, ...prev])
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
      email: '',
      phone: '',
      skills: '',
      availability: 'flexible',
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }

  // Filter client-side for demo
  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false
      if (filterAvailability !== 'all' && v.availability !== filterAvailability) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          v.name.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q) ||
          v.phone?.includes(q) ||
          v.skills?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [volunteers, search, filterStatus, filterAvailability])

  // Stats
  const stats = useMemo(() => {
    const active = volunteers.filter((v) => v.status === 'active').length
    const totalHours = volunteers.reduce((s, v) => s + v.totalHours, 0)
    const certs = volunteers.reduce((s, v) => s + (v._count?.certificates || v.certificates?.length || 0), 0)
    const thisMonth = volunteers.filter((v) => v.status === 'active').length
    return { active, totalHours, certs, thisMonth }
  }, [volunteers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Sukarelawan</h1>
          <p className="text-sm text-muted-foreground">Volunteer Management</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Daftar Sukarelawan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Daftar Sukarelawan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="vol-name">Nama</Label>
                <Input
                  id="vol-name"
                  placeholder="Nama penuh sukarelawan"
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vol-email">E-mel</Label>
                  <Input
                    id="vol-email"
                    type="email"
                    placeholder="emel@contoh.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vol-phone">Telefon</Label>
                  <Input
                    id="vol-phone"
                    placeholder="012-345 6789"
                    value={newForm.phone}
                    onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vol-skills">Kemahiran (dipisahkan koma)</Label>
                <Input
                  id="vol-skills"
                  placeholder="cth: pendidikan, kaunseling, memasak"
                  value={newForm.skills}
                  onChange={(e) => setNewForm((f) => ({ ...f, skills: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ketersediaan</Label>
                  <Select
                    value={newForm.availability}
                    onValueChange={(v) => setNewForm((f) => ({ ...f, availability: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekdays">Hari Kerja</SelectItem>
                      <SelectItem value="weekends">Hujung Minggu</SelectItem>
                      <SelectItem value="flexible">Fleksibel</SelectItem>
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
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      <SelectItem value="suspended">Digantung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vol-joined">Tarikh Menyertai</Label>
                <Input
                  id="vol-joined"
                  type="date"
                  value={newForm.joinedAt}
                  onChange={(e) => setNewForm((f) => ({ ...f, joinedAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vol-notes">Catatan</Label>
                <Textarea
                  id="vol-notes"
                  placeholder="Catatan tambahan"
                  value={newForm.notes}
                  onChange={(e) => setNewForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateVolunteer} disabled={!newForm.name}>
                  Daftar
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
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Sukarelawan Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours.toLocaleString('ms-MY')}</p>
                <p className="text-xs text-muted-foreground">Jumlah Jam</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.certs}</p>
                <p className="text-xs text-muted-foreground">Sijil Dikeluarkan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Pengerahan Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari sukarelawan..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterAvailability} onValueChange={setFilterAvailability}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Ketersediaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="weekdays">Hari Kerja</SelectItem>
                <SelectItem value="weekends">Hujung Minggu</SelectItem>
                <SelectItem value="flexible">Fleksibel</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden md:table-cell">E-mel</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                  <TableHead className="hidden lg:table-cell">Kemahiran</TableHead>
                  <TableHead>Ketersediaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jam</TableHead>
                  <TableHead className="w-[60px]">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Tiada sukarelawan dijumpai</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((volunteer) => {
                    const statCfg = statusConfig[volunteer.status] || { label: volunteer.status, color: 'bg-gray-100 text-gray-800 border-gray-200' }
                    const availCfg = availabilityConfig[volunteer.availability || ''] || { label: volunteer.availability || '-' }
                    const initials = volunteer.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()

                    return (
                      <TableRow key={volunteer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedVolunteer(volunteer)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{volunteer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {volunteer.email || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {volunteer.phone || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(volunteer.skills || '').split(',').slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {skill.trim()}
                              </Badge>
                            ))}
                            {(volunteer.skills || '').split(',').length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{(volunteer.skills || '').split(',').length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{availCfg.label}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] ${statCfg.color}`}>
                            {statCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {volunteer.totalHours}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVolunteer(volunteer)
                            }}
                          >
                            <Eye className="h-4 w-4" />
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

      {/* Volunteer Detail Sheet */}
      <Sheet open={!!selectedVolunteer} onOpenChange={(open) => !open && setSelectedVolunteer(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedVolunteer && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedVolunteer.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 pt-4">
                {/* Basic info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {selectedVolunteer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className={statusConfig[selectedVolunteer.status]?.color || ''}>
                          {statusConfig[selectedVolunteer.status]?.label || selectedVolunteer.status}
                        </Badge>
                        <Badge variant="secondary">
                          {availabilityConfig[selectedVolunteer.availability || '']?.label || selectedVolunteer.availability || '-'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Menyertai: {formatDate(selectedVolunteer.joinedAt)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    {selectedVolunteer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedVolunteer.email}</span>
                      </div>
                    )}
                    {selectedVolunteer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedVolunteer.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {selectedVolunteer.skills && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Kemahiran</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedVolunteer.skills.split(',').map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVolunteer.notes && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Catatan</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                        {selectedVolunteer.notes}
                      </p>
                    </div>
                  )}

                  {/* Hours summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-2xl font-bold text-amber-800">{selectedVolunteer.totalHours}</p>
                      <p className="text-xs text-amber-700">Jumlah Jam</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 p-3 text-center">
                      <p className="text-2xl font-bold text-violet-800">
                        {selectedVolunteer._count?.certificates || selectedVolunteer.certificates?.length || 0}
                      </p>
                      <p className="text-xs text-violet-700">Sijil</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Activity Log */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Log Aktiviti</h4>
                  <ScrollArea className="max-h-60">
                    {(selectedVolunteer.activities && selectedVolunteer.activities.length > 0) ? (
                      <div className="space-y-2">
                        {selectedVolunteer.activities.map((act) => (
                          <div key={act.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2.5 text-xs">
                            <div>
                              <p className="font-medium">{act.role || 'Aktiviti'}</p>
                              <p className="text-muted-foreground">{formatDate(act.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{act.hours} jam</p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  act.status === 'approved'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : act.status === 'rejected'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {act.status === 'approved' ? 'Disahkan' : act.status === 'rejected' ? 'Ditolak' : 'Dicatat'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tiada aktiviti dicatat.</p>
                    )}
                  </ScrollArea>
                </div>

                <Separator />

                {/* Certificates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Sijil</h4>
                  <ScrollArea className="max-h-60">
                    {(selectedVolunteer.certificates && selectedVolunteer.certificates.length > 0) ? (
                      <div className="space-y-2">
                        {selectedVolunteer.certificates.map((cert) => (
                          <div key={cert.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-violet-600" />
                              <div>
                                <p className="font-medium">{cert.title}</p>
                                <p className="text-muted-foreground">{formatDate(cert.issuedDate)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tiada sijil dikeluarkan.</p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
