'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Users, Plus, Search, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  User, Phone, Mail, MapPin, Briefcase, DollarSign, Home, Shield, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// ─── Types ──────────────────────────────────────────────────────

interface HouseholdMember {
  id: string
  name: string
  relationship: string
  icNumber?: string
  dateOfBirth?: string
  occupation?: string
  monthlyIncome: number
}

interface Member {
  id: string
  icNumber: string
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postcode?: string
  gender?: string
  dateOfBirth?: string
  occupation?: string
  monthlyIncome: number
  householdSize: number
  asnafCategory: string
  status: string
  ekycStatus: string
  ekycRiskLevel?: string
  notes?: string
  createdAt: string
  updatedAt: string
  householdMembers?: HouseholdMember[]
}

interface MembersResponse {
  data: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── Demo Data ──────────────────────────────────────────────────

const DEMO_MEMBERS: Member[] = [
  {
    id: 'demo_1', icNumber: '900101-10-1234', name: 'Ahmad bin Abdullah', phone: '012-345 6789',
    email: 'ahmad@email.com', address: '12, Jalan Maju 3', city: 'Shah Alam', state: 'Selangor',
    postcode: '40000', gender: 'male', dateOfBirth: '1990-01-01', occupation: 'Pekerja kilang',
    monthlyIncome: 1200, householdSize: 5, asnafCategory: 'fakir', status: 'active',
    ekycStatus: 'verified', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z',
    householdMembers: [
      { id: 'hm1', name: 'Aminah binti Hassan', relationship: 'spouse', icNumber: '920202-10-5678', monthlyIncome: 0 },
      { id: 'hm2', name: 'Muhammad bin Ahmad', relationship: 'child', dateOfBirth: '2015-03-10', monthlyIncome: 0 },
    ],
  },
  {
    id: 'demo_2', icNumber: '850505-14-5678', name: 'Fatimah binti Ismail', phone: '019-876 5432',
    email: 'fatimah@email.com', address: '45, Taman Seri Indah', city: 'Johor Bahru', state: 'Johor',
    postcode: '81200', gender: 'female', dateOfBirth: '1985-05-05', occupation: 'Guru tadika (separuh masa)',
    monthlyIncome: 800, householdSize: 3, asnafCategory: 'miskin', status: 'active',
    ekycStatus: 'verified', createdAt: '2024-02-20T08:30:00Z', updatedAt: '2024-02-20T08:30:00Z',
    householdMembers: [
      { id: 'hm3', name: 'Ali bin Fatimah', relationship: 'child', dateOfBirth: '2012-07-22', monthlyIncome: 0 },
    ],
  },
  {
    id: 'demo_3', icNumber: '780808-06-9012', name: 'Hassan bin Mohamad', phone: '016-111 2233',
    address: '88, Kampung Baru', city: 'Kuantan', state: 'Pahang',
    postcode: '25000', gender: 'male', dateOfBirth: '1978-08-08', occupation: 'Tidak bekerja (sakit)',
    monthlyIncome: 0, householdSize: 4, asnafCategory: 'fakir', status: 'pending',
    ekycStatus: 'pending', createdAt: '2024-03-10T14:00:00Z', updatedAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'demo_4', icNumber: '950303-01-3456', name: 'Nur Aisyah binti Rahman', phone: '013-555 7788',
    email: 'aisyah@email.com', address: '7, Pangsapuri Damai', city: 'Kuala Lumpur', state: 'WP Kuala Lumpur',
    postcode: '53000', gender: 'female', dateOfBirth: '1995-03-03', occupation: 'Peniaga kecil-kecilan',
    monthlyIncome: 1500, householdSize: 6, asnafCategory: 'miskin', status: 'active',
    ekycStatus: 'verified', createdAt: '2024-03-25T09:15:00Z', updatedAt: '2024-03-25T09:15:00Z',
  },
  {
    id: 'demo_5', icNumber: '910707-10-7890', name: 'Ibrahim bin Yusof', phone: '017-222 3344',
    address: '23, Jalan Mawar', city: 'Alor Setar', state: 'Kedah',
    postcode: '05000', gender: 'male', dateOfBirth: '1991-07-07', occupation: 'Pemandu grab',
    monthlyIncome: 1800, householdSize: 3, asnafCategory: 'gharim', status: 'active',
    ekycStatus: 'verified', createdAt: '2024-04-05T11:30:00Z', updatedAt: '2024-04-05T11:30:00Z',
  },
  {
    id: 'demo_6', icNumber: '880909-14-2345', name: 'Zainab binti Ahmad', phone: '014-666 8899',
    email: 'zainab@email.com', address: '56, Taman Kenanga', city: 'Melaka', state: 'Melaka',
    postcode: '75000', gender: 'female', dateOfBirth: '1988-09-09', occupation: 'Suri rumah',
    monthlyIncome: 0, householdSize: 7, asnafCategory: 'fakir', status: 'inactive',
    ekycStatus: 'rejected', createdAt: '2024-04-15T16:45:00Z', updatedAt: '2024-04-15T16:45:00Z',
  },
  {
    id: 'demo_7', icNumber: '930404-10-6789', name: 'Omar bin Iskandar', phone: '018-444 5566',
    address: '34, Jalan Delima', city: 'Ipoh', state: 'Perak',
    postcode: '30000', gender: 'male', dateOfBirth: '1993-04-04', occupation: 'Pekerja kontrak',
    monthlyIncome: 1100, householdSize: 4, asnafCategory: 'amil', status: 'active',
    ekycStatus: 'verified', createdAt: '2024-05-01T07:00:00Z', updatedAt: '2024-05-01T07:00:00Z',
  },
  {
    id: 'demo_8', icNumber: '970606-01-0123', name: 'Siti Khadijah binti Abdullah', phone: '011-999 0011',
    email: 'khadijah@email.com', address: '90, Jalan Puteri', city: 'Petaling Jaya', state: 'Selangor',
    postcode: '46000', gender: 'female', dateOfBirth: '1997-06-06', occupation: 'Pelajar universiti',
    monthlyIncome: 300, householdSize: 2, asnafCategory: 'ibn_sabil', status: 'pending',
    ekycStatus: 'pending', createdAt: '2024-05-20T13:20:00Z', updatedAt: '2024-05-20T13:20:00Z',
  },
]

// ─── Zod Schema ─────────────────────────────────────────────────

const memberFormSchema = z.object({
  name: z.string().min(1, 'Nama diperlukan'),
  icNumber: z.string().min(1, 'No. IC diperlukan'),
  phone: z.string().optional(),
  email: z.string().email('Format emel tidak sah').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z.string().optional(),
  householdSize: z.string().optional(),
  asnafCategory: z.string().optional(),
  notes: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberFormSchema>

// ─── Helper Functions ───────────────────────────────────────────

const ASNAF_LABELS: Record<string, string> = {
  fakir: 'Fakir',
  miskin: 'Miskin',
  amil: 'Amil',
  gharim: 'Gharim',
  riqab: 'Riqab',
  ibn_sabil: 'Ibn Sabil',
  muallaf: 'Muallaf',
  fisabilillah: 'Fi Sabilillah',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

const EKYC_COLORS: Record<string, string> = {
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
  'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor',
  'Terengganu', 'WP Kuala Lumpur', 'WP Labuan', 'WP Putrajaya',
]

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('ms-MY', { minimumFractionDigits: 0 })}`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ─── Component ──────────────────────────────────────────────────

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isDemo, setIsDemo] = useState(false)

  // Dialog states
  const [registerOpen, setRegisterOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '', icNumber: '', phone: '', email: '', address: '', city: '',
      state: '', postcode: '', gender: '', dateOfBirth: '', occupation: '',
      monthlyIncome: '0', householdSize: '1', asnafCategory: 'fakir', notes: '',
    },
  })

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { asnafCategory: categoryFilter }),
      })

      const res = await fetch(`/api/v1/members?${params}`)
      const json = await res.json()

      if (json.data && json.data.length > 0) {
        setMembers(json.data)
        setTotal(json.pagination.total)
        setTotalPages(json.pagination.totalPages)
        setIsDemo(false)
      } else {
        // Use demo data when database is empty
        let filtered = [...DEMO_MEMBERS]
        if (search) {
          const s = search.toLowerCase()
          filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(s) || m.icNumber.includes(s)
          )
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter(m => m.status === statusFilter)
        }
        if (categoryFilter !== 'all') {
          filtered = filtered.filter(m => m.asnafCategory === categoryFilter)
        }
        const demoTotal = filtered.length
        const demoTotalPages = Math.ceil(demoTotal / 10)
        const demoPage = Math.min(page, demoTotalPages || 1)
        setMembers(filtered.slice((demoPage - 1) * 10, demoPage * 10))
        setTotal(demoTotal)
        setTotalPages(demoTotalPages)
        setIsDemo(true)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      // Fallback to demo data
      setMembers(DEMO_MEMBERS.slice(0, 10))
      setTotal(DEMO_MEMBERS.length)
      setTotalPages(1)
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Reset form when dialog opens
  const openRegister = () => {
    form.reset({
      name: '', icNumber: '', phone: '', email: '', address: '', city: '',
      state: '', postcode: '', gender: '', dateOfBirth: '', occupation: '',
      monthlyIncome: '0', householdSize: '1', asnafCategory: 'fakir', notes: '',
    })
    setRegisterOpen(true)
  }

  // Submit new member
  const onSubmit = async (data: MemberFormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          monthlyIncome: data.monthlyIncome || '0',
          householdSize: data.householdSize || '1',
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Failed to create member')
        return
      }

      setRegisterOpen(false)
      fetchMembers()
    } catch (error) {
      console.error('Error creating member:', error)
      alert('Failed to create member')
    } finally {
      setSubmitting(false)
    }
  }

  // View member details
  const viewMember = (member: Member) => {
    setSelectedMember(member)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Pengurusan Ahli Asnaf
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Asnaf Member Management — {total} ahli berdaftar
          </p>
        </div>
        <Button onClick={openRegister} className="gap-2">
          <Plus className="h-4 w-4" />
          Daftar Ahli Baru
        </Button>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
          📋 Data demo dipaparkan — tiada ahli dalam pangkalan data lagi. Daftar ahli baru untuk mula.
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau No. IC..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(ASNAF_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium whitespace-nowrap">Nama</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap">No. IC</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap hidden md:table-cell">Kategori</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                  <th className="text-right p-3 font-medium whitespace-nowrap hidden lg:table-cell">Pendapatan</th>
                  <th className="text-center p-3 font-medium whitespace-nowrap hidden xl:table-cell">Tanggungan</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap hidden lg:table-cell">eKYC</th>
                  <th className="text-center p-3 font-medium whitespace-nowrap">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-3">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Tiada ahli dijumpai. Daftar ahli baru untuk mula.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => viewMember(member)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{member.name}</p>
                            {member.occupation && (
                              <p className="text-xs text-muted-foreground truncate hidden sm:block">{member.occupation}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-xs">{member.icNumber}</td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {ASNAF_LABELS[member.asnafCategory] || member.asnafCategory}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[member.status] || STATUS_COLORS.pending}`}>
                          {member.status === 'active' ? 'Aktif' : member.status === 'inactive' ? 'Tidak Aktif' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden lg:table-cell font-mono text-xs">
                        {formatCurrency(member.monthlyIncome)}
                      </td>
                      <td className="p-3 text-center hidden xl:table-cell">{member.householdSize}</td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EKYC_COLORS[member.ekycStatus] || EKYC_COLORS.pending}`}>
                          {member.ekycStatus === 'verified' ? 'Disahkan' : member.ekycStatus === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => viewMember(member)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Menunjukkan {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} daripada {total} ahli
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm" disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline" size="sm" disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register Member Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Daftar Ahli Baru
            </DialogTitle>
            <DialogDescription>
              Isi maklumat ahli asnaf baru. Ruangan bertanda * wajib diisi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Maklumat Peribadi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Nama Penuh *</Label>
                  <Input id="name" placeholder="Ahmad bin Abdullah" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="icNumber">No. Kad Pengenalan *</Label>
                  <Input id="icNumber" placeholder="900101-10-1234" {...form.register('icNumber')} />
                  {form.formState.errors.icNumber && (
                    <p className="text-xs text-destructive">{form.formState.errors.icNumber.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth">Tarikh Lahir</Label>
                  <Input id="dateOfBirth" type="date" {...form.register('dateOfBirth')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Jantina</Label>
                  <Select value={form.watch('gender') || ''} onValueChange={(v) => form.setValue('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih jantina" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Lelaki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="occupation">Pekerjaan</Label>
                  <Input id="occupation" placeholder="Pekerja kilang" {...form.register('occupation')} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Maklumat Perhubungan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">No. Telefon</Label>
                  <Input id="phone" placeholder="012-345 6789" {...form.register('phone')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Emel</Label>
                  <Input id="email" type="email" placeholder="ahmad@email.com" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Alamat
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea id="address" placeholder="12, Jalan Maju 3" rows={2} {...form.register('address')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Bandar</Label>
                  <Input id="city" placeholder="Shah Alam" {...form.register('city')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postcode">Poskod</Label>
                  <Input id="postcode" placeholder="40000" {...form.register('postcode')} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="state">Negeri</Label>
                  <Select value={form.watch('state') || ''} onValueChange={(v) => form.setValue('state', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih negeri" /></SelectTrigger>
                    <SelectContent>
                      {MALAYSIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Asnaf Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Maklumat Asnaf
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="asnafCategory">Kategori Asnaf</Label>
                  <Select value={form.watch('asnafCategory') || 'fakir'} onValueChange={(v) => form.setValue('asnafCategory', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASNAF_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyIncome">Pendapatan Bulanan (RM)</Label>
                  <Input id="monthlyIncome" type="number" min="0" step="100" placeholder="0" {...form.register('monthlyIncome')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="householdSize">Saiz Isi Rumah</Label>
                  <Input id="householdSize" type="number" min="1" step="1" placeholder="1" {...form.register('householdSize')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" placeholder="Catatan tambahan..." rows={2} {...form.register('notes')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Daftar Ahli'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedMember && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {selectedMember.name}
                </SheetTitle>
                <SheetDescription>
                  Butiran ahli asnaf
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-4">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[selectedMember.status]}`}>
                    {selectedMember.status === 'active' ? 'Aktif' : selectedMember.status === 'inactive' ? 'Tidak Aktif' : 'Menunggu'}
                  </span>
                  <Badge variant="outline">
                    {ASNAF_LABELS[selectedMember.asnafCategory] || selectedMember.asnafCategory}
                  </Badge>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${EKYC_COLORS[selectedMember.ekycStatus]}`}>
                    eKYC: {selectedMember.ekycStatus === 'verified' ? 'Disahkan' : selectedMember.ekycStatus === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </span>
                </div>

                {/* Personal Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Maklumat Peribadi</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">No. IC:</span>
                      <span className="font-mono">{selectedMember.icNumber}</span>
                    </div>
                    {selectedMember.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Tarikh Lahir:</span>
                        <span>{formatDate(selectedMember.dateOfBirth)}</span>
                      </div>
                    )}
                    {selectedMember.gender && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Jantina:</span>
                        <span>{selectedMember.gender === 'male' ? 'Lelaki' : 'Perempuan'}</span>
                      </div>
                    )}
                    {selectedMember.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Pekerjaan:</span>
                        <span>{selectedMember.occupation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Maklumat Perhubungan</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {selectedMember.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{selectedMember.phone}</span>
                      </div>
                    )}
                    {selectedMember.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{selectedMember.email}</span>
                      </div>
                    )}
                    {selectedMember.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>
                          {selectedMember.address}
                          {selectedMember.city && `, ${selectedMember.city}`}
                          {selectedMember.postcode && ` ${selectedMember.postcode}`}
                          {selectedMember.state && `, ${selectedMember.state}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Financial Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Maklumat Kewangan</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Pendapatan Bulanan</p>
                      <p className="text-lg font-semibold mt-1">{formatCurrency(selectedMember.monthlyIncome)}</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Saiz Isi Rumah</p>
                      <p className="text-lg font-semibold mt-1">{selectedMember.householdSize} orang</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Household Members */}
                {selectedMember.householdMembers && selectedMember.householdMembers.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Ahli Isi Rumah ({selectedMember.householdMembers.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedMember.householdMembers.map((hm) => (
                          <div key={hm.id} className="rounded-lg border p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{hm.name}</span>
                              <Badge variant="outline" className="text-xs capitalize">{hm.relationship}</Badge>
                            </div>
                            {hm.occupation && (
                              <p className="text-xs text-muted-foreground mt-1">{hm.occupation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Notes */}
                {selectedMember.notes && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Catatan</h4>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedMember.notes}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Meta */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Didaftarkan: {formatDate(selectedMember.createdAt)}</p>
                  <p>Kemaskini terakhir: {formatDate(selectedMember.updatedAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Padam
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
