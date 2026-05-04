'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Sheet, SheetContent, SheetHeader, SheetTitle,
  Label,
} from '@/components/ui'
import {
  Heart, Plus, Search, Filter, Mail, Phone, MapPin,
  Building2, User, Landmark, Eye,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface DonationRecord {
  id: string
  amount: number
  category: string
  date: string | null
  createdAt: string
}

interface Donor {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  type: string
  category: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  donations: DonationRecord[]
  totalDonated: number
  donationCount: number
}

/* ─── Helpers ──────────────────────────────────────────── */
const formatRM = (val: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(val)

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  individual: { label: 'Individu', icon: User, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  corporate: { label: 'Korporat', icon: Building2, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  government: { label: 'Kerajaan', icon: Landmark, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
}

const categoryLabels: Record<string, string> = {
  zakat: 'Zakat',
  sadaqah: 'Sadaqah',
  waqf: 'Waqf',
  infaq: 'Infaq',
  general: 'Umum',
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoDonors: Donor[] = [
  {
    id: 'dn1', name: 'Ahmad bin Abdullah', email: 'ahmad@email.com', phone: '012-345 6789',
    address: '12, Jalan Merdeka, 50000 Kuala Lumpur', type: 'individual', category: 'regular',
    notes: 'Penderma tetap sejak 2020', createdAt: '2020-01-15T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z',
    donations: [
      { id: 'd1', amount: 5000, category: 'zakat', date: '2025-03-01', createdAt: '2025-03-01T08:00:00Z' },
      { id: 'd2', amount: 2000, category: 'sadaqah', date: '2025-02-01', createdAt: '2025-02-01T08:00:00Z' },
      { id: 'd3', amount: 3000, category: 'zakat', date: '2025-01-01', createdAt: '2025-01-01T08:00:00Z' },
    ],
    totalDonated: 10000, donationCount: 3,
  },
  {
    id: 'dn2', name: 'Syarikat Maju Jaya Sdn Bhd', email: 'info@majujaya.com', phone: '03-8888 9999',
    address: 'Menara Maju, Jalan Sultan, 50000 KL', type: 'corporate', category: 'regular',
    notes: 'Program CSR tahunan', createdAt: '2021-06-01T08:00:00Z', updatedAt: '2025-03-03T10:00:00Z',
    donations: [
      { id: 'd4', amount: 10000, category: 'sadaqah', date: '2025-03-03', createdAt: '2025-03-03T10:00:00Z' },
      { id: 'd5', amount: 15000, category: 'waqf', date: '2024-12-01', createdAt: '2024-12-01T10:00:00Z' },
    ],
    totalDonated: 25000, donationCount: 2,
  },
  {
    id: 'dn3', name: 'Siti Aminah binti Hassan', email: 'siti@email.com', phone: '019-876 5432',
    address: '45, Taman Seri, 40000 Shah Alam', type: 'individual', category: 'occasional',
    notes: null, createdAt: '2023-03-05T14:00:00Z', updatedAt: '2025-03-05T14:00:00Z',
    donations: [
      { id: 'd6', amount: 25000, category: 'waqf', date: '2025-03-05', createdAt: '2025-03-05T14:00:00Z' },
    ],
    totalDonated: 25000, donationCount: 1,
  },
  {
    id: 'dn4', name: 'Kerajaan Negeri Selangor', email: 'bantuan@selangor.gov.my', phone: '03-5544 3322',
    address: 'Sultan Salahuddin Abdul Aziz Shah Building, Shah Alam', type: 'government', category: 'regular',
    notes: 'Geran tahunan asnaf', createdAt: '2019-01-01T08:00:00Z', updatedAt: '2025-03-07T09:00:00Z',
    donations: [
      { id: 'd7', amount: 50000, category: 'infaq', date: '2025-03-07', createdAt: '2025-03-07T09:00:00Z' },
      { id: 'd8', amount: 50000, category: 'infaq', date: '2024-03-01', createdAt: '2024-03-01T09:00:00Z' },
    ],
    totalDonated: 100000, donationCount: 2,
  },
  {
    id: 'dn5', name: 'Mohd Razak bin Ismail', email: 'razak@email.com', phone: '017-221 3344',
    address: '8, Kampung Baru, 50300 KL', type: 'individual', category: 'one_time',
    notes: 'Sumbangan sekali', createdAt: '2025-03-10T11:00:00Z', updatedAt: '2025-03-10T11:00:00Z',
    donations: [
      { id: 'd9', amount: 500, category: 'general', date: '2025-03-10', createdAt: '2025-03-10T11:00:00Z' },
    ],
    totalDonated: 500, donationCount: 1,
  },
  {
    id: 'dn6', name: 'Fatimah Zahra', email: 'fatimah@email.com', phone: '013-998 7766',
    address: '22, Jalan Ampang, 55000 KL', type: 'individual', category: 'regular',
    notes: null, createdAt: '2022-05-01T08:00:00Z', updatedAt: '2025-03-12T16:00:00Z',
    donations: [
      { id: 'd10', amount: 3000, category: 'zakat', date: '2025-03-12', createdAt: '2025-03-12T16:00:00Z' },
      { id: 'd11', amount: 1500, category: 'sadaqah', date: '2025-02-15', createdAt: '2025-02-15T16:00:00Z' },
      { id: 'd12', amount: 2000, category: 'infaq', date: '2025-01-20', createdAt: '2025-01-20T16:00:00Z' },
    ],
    totalDonated: 6500, donationCount: 3,
  },
]

/* ─── Component ────────────────────────────────────────── */
export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formType, setFormType] = useState('individual')
  const [formCategory, setFormCategory] = useState('regular')
  const [formNotes, setFormNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/v1/donors?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.donors && data.donors.length > 0) {
          setDonors(data.donors)
        } else {
          setDonors(demoDonors)
        }
      } else {
        setDonors(demoDonors)
      }
    } catch {
      setDonors(demoDonors)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          type: formType,
          category: formCategory,
          notes: formNotes,
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
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormAddress('')
    setFormType('individual')
    setFormCategory('regular')
    setFormNotes('')
  }

  const openDonorDetail = (donor: Donor) => {
    setSelectedDonor(donor)
    setSheetOpen(true)
  }

  const filtered = donors.filter((d) => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.phone || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchType
  })

  const totalDonatedAll = filtered.reduce((sum, d) => sum + d.totalDonated, 0)
  const totalDonors = filtered.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Penderma</h1>
          <p className="text-sm text-muted-foreground">Donor CRM — Urus maklumat dan hubungan penderma</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Penderma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Penderma Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Penderma *</Label>
                <Input id="name" placeholder="Nama penuh..." value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mel</Label>
                  <Input id="email" type="email" placeholder="email@contoh.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="012-345 6789" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea id="address" placeholder="Alamat penuh..." value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Jenis Penderma</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individu</SelectItem>
                      <SelectItem value="corporate">Korporat</SelectItem>
                      <SelectItem value="government">Kerajaan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Tetap</SelectItem>
                      <SelectItem value="occasional">Kadang-kadang</SelectItem>
                      <SelectItem value="one_time">Sekali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donorNotes">Catatan</Label>
                <Textarea id="donorNotes" placeholder="Catatan tambahan..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting || !formName.trim()}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900">
                <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Penderma</p>
                <p className="text-lg font-bold">{totalDonors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah Sumbangan</p>
                <p className="text-lg font-bold">{formatRM(totalDonatedAll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Penderma Tetap</p>
                <p className="text-lg font-bold">{filtered.filter(d => d.category === 'regular').length}</p>
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
                placeholder="Cari nama, e-mel, telefon..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Jenis Penderma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="individual">Individu</SelectItem>
                <SelectItem value="corporate">Korporat</SelectItem>
                <SelectItem value="government">Kerajaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Penderma</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>E-mel</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Jumlah Derma (RM)</TableHead>
                  <TableHead className="text-center">Bil. Derma</TableHead>
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
                      Tiada penderma dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => {
                    const typeConf = typeConfig[d.type] || typeConfig.individual
                    const TypeIcon = typeConf.icon
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {d.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{d.name}</p>
                              {d.category && (
                                <p className="text-xs text-muted-foreground capitalize">
                                  {d.category === 'regular' ? 'Tetap' : d.category === 'occasional' ? 'Kadang-kadang' : 'Sekali'}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {d.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {d.email}
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {d.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {d.phone}
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={typeConf.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatRM(d.totalDonated)}</TableCell>
                        <TableCell className="text-center">{d.donationCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => openDonorDetail(d)}>
                            <Eye className="h-3.5 w-3.5" />
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

      {/* Donor Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Butiran Penderma</SheetTitle>
          </SheetHeader>
          {selectedDonor && (
            <div className="mt-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {selectedDonor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDonor.name}</h3>
                  <Badge variant="secondary" className={typeConfig[selectedDonor.type]?.color || ''}>
                    {typeConfig[selectedDonor.type]?.label || selectedDonor.type}
                  </Badge>
                </div>
              </div>

              {/* Contact */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Maklumat Hubungan</h4>
                  {selectedDonor.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedDonor.email}
                    </div>
                  )}
                  {selectedDonor.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedDonor.phone}
                    </div>
                  )}
                  {selectedDonor.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      {selectedDonor.address}
                    </div>
                  )}
                  {selectedDonor.notes && (
                    <div className="text-sm text-muted-foreground pt-2 border-t">
                      <span className="font-medium">Catatan:</span> {selectedDonor.notes}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Jumlah Derma</p>
                    <p className="text-lg font-bold">{formatRM(selectedDonor.totalDonated)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Bil. Transaksi</p>
                    <p className="text-lg font-bold">{selectedDonor.donationCount}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Donation History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sejarah Sumbangan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarikh</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDonor.donations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">
                            Tiada rekod sumbangan
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedDonor.donations.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="text-sm">{d.date || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {categoryLabels[d.category] || d.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatRM(d.amount)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
