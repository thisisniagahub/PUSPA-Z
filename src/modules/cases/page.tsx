'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FileText, Plus, Search, Filter, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, ArrowRight, Clock, CheckCircle2, XCircle, MessageSquare,
  User, DollarSign, Calendar, Tag, Flag,
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
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MobileCard } from '@/components/mobile-card'

// ─── Types ──────────────────────────────────────────────────────

interface CaseMember {
  id: string
  name: string
  icNumber: string
}

interface CaseNote {
  id: string
  content: string
  type: string
  createdAt: string
  author?: { id: string; name: string }
}

interface CaseRecord {
  id: string
  caseNumber: string
  memberId: string
  type: string
  priority: string
  status: string
  description?: string
  requestedAmount?: number
  approvedAmount?: number
  riskIndicator?: string
  welfareScore?: number
  nextAction?: string
  nextActionDate?: string
  assignedTo?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  member?: CaseMember
  notes?: CaseNote[]
}

interface CasesResponse {
  data: CaseRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface MemberOption {
  id: string
  name: string
  icNumber: string
}

// ─── Demo Data ──────────────────────────────────────────────────

const DEMO_MEMBERS_FOR_SELECT: MemberOption[] = [
  { id: 'demo_1', name: 'Ahmad bin Abdullah', icNumber: '900101-10-1234' },
  { id: 'demo_2', name: 'Fatimah binti Ismail', icNumber: '850505-14-5678' },
  { id: 'demo_3', name: 'Hassan bin Mohamad', icNumber: '780808-06-9012' },
  { id: 'demo_4', name: 'Nur Aisyah binti Rahman', icNumber: '950303-01-3456' },
  { id: 'demo_5', name: 'Ibrahim bin Yusof', icNumber: '910707-10-7890' },
]

const DEMO_CASES: CaseRecord[] = [
  {
    id: 'case_1', caseNumber: 'KES-00001-2024', memberId: 'demo_1', type: 'welfare', priority: 'urgent',
    status: 'approval', description: 'Bantuan kecemasan untuk keluarga yang terjejas akibat kebakaran rumah. Kehilangan harta benda dan tiada tempat tinggal sementara.',
    requestedAmount: 5000, riskIndicator: 'low', welfareScore: 78, nextAction: 'Sedia untuk kelulusan',
    createdAt: '2024-06-15T10:30:00Z', updatedAt: '2024-06-20T14:00:00Z',
    member: { id: 'demo_1', name: 'Ahmad bin Abdullah', icNumber: '900101-10-1234' },
    notes: [
      { id: 'n1', content: 'Lawatan rumah telah dibuat. Keadaan menunjukkan keperluan mendesak.', type: 'action', createdAt: '2024-06-16T09:00:00Z', author: { id: 'u1', name: 'Admin PUSPA' } },
      { id: 'n2', content: 'Dokumen sokongan telah diterima dan disahkan.', type: 'decision', createdAt: '2024-06-18T11:00:00Z', author: { id: 'u1', name: 'Admin PUSPA' } },
    ],
  },
  {
    id: 'case_2', caseNumber: 'KES-00002-2024', memberId: 'demo_2', type: 'medical', priority: 'high',
    status: 'verification', description: 'Bantuan perubatan untuk rawatan dialisis. Pesakit memerlukan dialisis 3 kali seminggu.',
    requestedAmount: 8000, riskIndicator: 'medium', welfareScore: 65, nextAction: 'Pengesahan dokumen perubatan',
    createdAt: '2024-06-18T08:15:00Z', updatedAt: '2024-06-19T16:30:00Z',
    member: { id: 'demo_2', name: 'Fatimah binti Ismail', icNumber: '850505-14-5678' },
    notes: [
      { id: 'n3', content: 'Surat pengesahan doktor diperlukan sebelum kelulusan.', type: 'follow_up', createdAt: '2024-06-19T10:00:00Z', author: { id: 'u1', name: 'Admin PUSPA' } },
    ],
  },
  {
    id: 'case_3', caseNumber: 'KES-00003-2024', memberId: 'demo_3', type: 'education', priority: 'medium',
    status: 'intake', description: 'Bantuan yuran persekolahan untuk 2 orang anak. Suami tidak bekerja akibat penyakit.',
    requestedAmount: 3000, createdAt: '2024-06-20T09:00:00Z', updatedAt: '2024-06-20T09:00:00Z',
    member: { id: 'demo_3', name: 'Hassan bin Mohamad', icNumber: '780808-06-9012' },
  },
  {
    id: 'case_4', caseNumber: 'KES-00004-2024', memberId: 'demo_4', type: 'housing', priority: 'high',
    status: 'assessment', description: 'Bantuan sewa rumah. Penyewa diberi notis pindah dan tiada simpanan untuk deposit rumah baharu.',
    requestedAmount: 4500, riskIndicator: 'low', welfareScore: 72, nextAction: 'Penilaian welfare score',
    createdAt: '2024-06-22T13:45:00Z', updatedAt: '2024-06-23T10:00:00Z',
    member: { id: 'demo_4', name: 'Nur Aisyah binti Rahman', icNumber: '950303-01-3456' },
  },
  {
    id: 'case_5', caseNumber: 'KES-00005-2024', memberId: 'demo_5', type: 'emergency', priority: 'urgent',
    status: 'draft', description: 'Bantuan kecemasan banjir. Rumah terendam air setinggi 3 kaki.',
    requestedAmount: 6000, createdAt: '2024-06-24T07:30:00Z', updatedAt: '2024-06-24T07:30:00Z',
    member: { id: 'demo_5', name: 'Ibrahim bin Yusof', icNumber: '910707-10-7890' },
  },
  {
    id: 'case_6', caseNumber: 'KES-00006-2024', memberId: 'demo_1', type: 'financial', priority: 'medium',
    status: 'closed', description: 'Bantuan kewangan bulanan biasa.', requestedAmount: 1500, approvedAmount: 1200,
    closedAt: '2024-06-10T15:00:00Z',
    createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-06-10T15:00:00Z',
    member: { id: 'demo_1', name: 'Ahmad bin Abdullah', icNumber: '900101-10-1234' },
    notes: [
      { id: 'n4', content: 'Kes telah diluluskan dan agihan dibuat.', type: 'decision', createdAt: '2024-05-15T09:00:00Z', author: { id: 'u1', name: 'Admin PUSPA' } },
      { id: 'n5', content: 'Kes ditutup selepas agihan selesai.', type: 'action', createdAt: '2024-06-10T15:00:00Z', author: { id: 'u1', name: 'Admin PUSPA' } },
    ],
  },
  {
    id: 'case_7', caseNumber: 'KES-00007-2024', memberId: 'demo_2', type: 'welfare', priority: 'low',
    status: 'disbursement', description: 'Bantuan makanan bulanan untuk keluarga miskin.',
    requestedAmount: 500, approvedAmount: 500, riskIndicator: 'low',
    createdAt: '2024-06-12T14:00:00Z', updatedAt: '2024-06-25T09:00:00Z',
    member: { id: 'demo_2', name: 'Fatimah binti Ismail', icNumber: '850505-14-5678' },
  },
]

// ─── Zod Schema ─────────────────────────────────────────────────

const caseFormSchema = z.object({
  memberId: z.string().min(1, 'Ahli diperlukan'),
  type: z.string().min(1, 'Jenis kes diperlukan'),
  priority: z.string().optional(),
  description: z.string().optional(),
  requestedAmount: z.string().optional(),
})

type CaseFormData = z.infer<typeof caseFormSchema>

// ─── Helper Constants ───────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  welfare: 'Kebajikan',
  medical: 'Perubatan',
  education: 'Pendidikan',
  housing: 'Perumahan',
  emergency: 'Kecemasan',
  financial: 'Kewangan',
}

const TYPE_COLORS: Record<string, string> = {
  welfare: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  medical: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  education: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  housing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Mendesak',
  high: 'Tinggi',
  medium: 'Sederhana',
  low: 'Rendah',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draf',
  intake: 'Pengambilan',
  verification: 'Pengesahan',
  assessment: 'Penilaian',
  approval: 'Kelulusan',
  disbursement: 'Agihan',
  follow_up: 'Susulan',
  closed: 'Ditutup',
  rejected: 'Ditolak',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  intake: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  verification: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  assessment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  approval: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  disbursement: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  follow_up: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  closed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

// Status flow for timeline
const STATUS_FLOW = ['draft', 'intake', 'verification', 'assessment', 'approval', 'disbursement', 'follow_up', 'closed']

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

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ─── Component ──────────────────────────────────────────────────

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isDemo, setIsDemo] = useState(false)

  // Dialog & Sheet states
  const [newCaseOpen, setNewCaseOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Member search for new case form
  const [memberSearch, setMemberSearch] = useState('')
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([])
  const [memberSearchLoading, setMemberSearchLoading] = useState(false)

  // Form
  const { toast } = useToast()
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      memberId: '', type: '', priority: 'medium', description: '', requestedAmount: '',
    },
  })

  // Fetch cases
  const fetchCases = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
      })

      const res = await fetch(`/api/v1/cases?${params}`)
      const json = await res.json()

      if (json.data && json.data.length > 0) {
        setCases(json.data)
        setTotal(json.pagination.total)
        setTotalPages(json.pagination.totalPages)
        setIsDemo(false)
      } else {
        // Use demo data when database is empty
        let filtered = [...DEMO_CASES]
        if (search) {
          const s = search.toLowerCase()
          filtered = filtered.filter(c =>
            c.caseNumber.toLowerCase().includes(s) ||
            (c.member?.name || '').toLowerCase().includes(s) ||
            (c.description || '').toLowerCase().includes(s)
          )
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter(c => c.status === statusFilter)
        }
        if (typeFilter !== 'all') {
          filtered = filtered.filter(c => c.type === typeFilter)
        }
        if (priorityFilter !== 'all') {
          filtered = filtered.filter(c => c.priority === priorityFilter)
        }
        const demoTotal = filtered.length
        const demoTotalPages = Math.ceil(demoTotal / 10)
        setCases(filtered)
        setTotal(demoTotal)
        setTotalPages(demoTotalPages)
        setIsDemo(true)
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
      setCases(DEMO_CASES)
      setTotal(DEMO_CASES.length)
      setTotalPages(1)
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, typeFilter, priorityFilter])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  // Search members for new case form
  const searchMembers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setMemberOptions([])
      return
    }
    setMemberSearchLoading(true)
    try {
      const res = await fetch(`/api/v1/members?search=${encodeURIComponent(query)}&limit=20`)
      const json = await res.json()
      if (json.data && json.data.length > 0) {
        setMemberOptions(json.data.map((m: { id: string; name: string; icNumber: string }) => ({
          id: m.id, name: m.name, icNumber: m.icNumber,
        })))
      } else {
        setMemberOptions(DEMO_MEMBERS_FOR_SELECT.filter(m =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.icNumber.includes(query)
        ))
      }
    } catch {
      setMemberOptions(DEMO_MEMBERS_FOR_SELECT.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.icNumber.includes(query)
      ))
    } finally {
      setMemberSearchLoading(false)
    }
  }, [])

  // Debounced member search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memberSearch) searchMembers(memberSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [memberSearch, searchMembers])

  // Open new case dialog
  const openNewCase = () => {
    form.reset({
      memberId: '', type: '', priority: 'medium', description: '', requestedAmount: '',
    })
    setMemberSearch('')
    setMemberOptions([])
    setNewCaseOpen(true)
  }

  // Submit new case
  const onSubmit = async (data: CaseFormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          requestedAmount: data.requestedAmount || '0',
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast({
          title: "Gagal mencipta kes",
          description: json.error || 'Sila cuba sebentar lagi.',
          variant: "destructive",
        })
        return
      }

      setNewCaseOpen(false)
      fetchCases()
      toast({
        title: "Kes berjaya dicipta!",
        description: `Kes ${json.caseNumber || 'baru'} telah berjaya didaftarkan.`,
      })
    } catch (error) {
      console.error('Error creating case:', error)
      toast({
        title: "Ralat Sistem",
        description: 'Gagal mencipta kes. Sila cuba sebentar lagi.',
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // View case details
  const viewCase = (caseRecord: CaseRecord) => {
    setSelectedCase(caseRecord)
    setDetailOpen(true)
  }

  // Compute stats
  const stats = cases.reduce<Record<string, number>>((acc, c) => {
    // For demo, use all DEMO_CASES for stats
    return acc
  }, {})

  const allCasesForStats = isDemo ? DEMO_CASES : cases
  const statsCounts = {
    draft: allCasesForStats.filter(c => c.status === 'draft').length,
    intake: allCasesForStats.filter(c => ['intake', 'verification', 'assessment'].includes(c.status)).length,
    approval: allCasesForStats.filter(c => c.status === 'approval' || c.status === 'disbursement').length,
    closed: allCasesForStats.filter(c => c.status === 'closed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Pengurusan Kes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Case Management — {total} kes berdaftar
          </p>
        </div>
        <Button onClick={openNewCase} className="gap-2">
          <Plus className="h-4 w-4" />
          Hantar Kes Baru
        </Button>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
          📋 Data demo dipaparkan — tiada kes dalam pangkalan data lagi. Hantar kes baru untuk mula.
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('draft'); setPage(1) }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCounts.draft}</p>
              <p className="text-xs text-muted-foreground">Draf</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('intake'); setPage(1) }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40">
              <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCounts.intake}</p>
              <p className="text-xs text-muted-foreground">Dalam Proses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('approval'); setPage(1) }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCounts.approval}</p>
              <p className="text-xs text-muted-foreground">Kelulusan/Agihan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('closed'); setPage(1) }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsCounts.closed}</p>
              <p className="text-xs text-muted-foreground">Ditutup</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari no. kes, nama ahli..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <Filter className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Keutamaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Keutamaan</SelectItem>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0 sm:p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium whitespace-nowrap">No. Kes</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap">Nama Ahli</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap hidden md:table-cell">Jenis</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap">Keutamaan</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap">Status</th>
                  <th className="text-right p-3 font-medium whitespace-nowrap hidden lg:table-cell">Amaun</th>
                  <th className="text-left p-3 font-medium whitespace-nowrap hidden xl:table-cell">Tarikh</th>
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
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Tiada kes dijumpai. Hantar kes baru untuk mula.
                    </td>
                  </tr>
                ) : (
                  cases.map((caseRecord) => (
                    <tr
                      key={caseRecord.id}
                      className="border-b hover:bg-primary/[0.04] cursor-pointer transition-all duration-200 group active:scale-[0.995]"
                      onClick={() => viewCase(caseRecord)}
                    >
                      <td className="p-3 font-mono text-xs font-medium">{caseRecord.caseNumber}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{caseRecord.member?.name || '—'}</p>
                          {caseRecord.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px] hidden sm:block">
                              {caseRecord.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[caseRecord.type] || TYPE_COLORS.welfare}`}>
                          {TYPE_LABELS[caseRecord.type] || caseRecord.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[caseRecord.priority] || PRIORITY_COLORS.medium}`}>
                          {caseRecord.priority === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                          {PRIORITY_LABELS[caseRecord.priority] || caseRecord.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[caseRecord.status] || STATUS_COLORS.draft}`}>
                          {STATUS_LABELS[caseRecord.status] || caseRecord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden lg:table-cell font-mono text-xs">
                        {caseRecord.requestedAmount ? formatCurrency(caseRecord.requestedAmount) : '—'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden xl:table-cell">
                        {formatDate(caseRecord.createdAt)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 group-hover:bg-primary group-hover:text-white rounded-xl transition-all shadow-sm" onClick={() => viewCase(caseRecord)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Card List */}
          <div className="md:hidden">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <MobileCard key={i} id="" title="" loading />)
            ) : cases.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Tiada kes dijumpai.</div>
            ) : (
              cases.map((caseRecord) => (
                <MobileCard 
                  key={caseRecord.id} 
                  id={caseRecord.caseNumber}
                  title={caseRecord.member?.name || 'Tiada Nama'}
                  subtitle={caseRecord.description}
                  status={{
                    label: STATUS_LABELS[caseRecord.status],
                    className: STATUS_COLORS[caseRecord.status]
                  }}
                  rightElement={
                    <span className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                      {caseRecord.requestedAmount ? formatCurrency(caseRecord.requestedAmount) : '—'}
                    </span>
                  }
                  onClick={() => viewCase(caseRecord)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Menunjukkan {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} daripada {total} kes
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

      {/* Floating Action Button (Mobile Only) */}
      <Button 
        onClick={openNewCase} 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl md:hidden z-50 flex items-center justify-center p-0"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* New Case Dialog */}
      <Dialog open={newCaseOpen} onOpenChange={setNewCaseOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Hantar Kes Baru
            </DialogTitle>
            <DialogDescription>
              Isi maklumat kes baharu. Ruangan bertanda * wajib diisi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Member Selection */}
            <div className="space-y-1.5">
              <Label>Ahli *</Label>
              <div className="relative">
                <Input
                  placeholder="Cari nama ahli atau No. IC..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {memberSearchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {memberOptions.length > 0 && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {memberOptions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        form.watch('memberId') === m.id ? 'bg-primary/10 font-medium' : ''
                      }`}
                      onClick={() => {
                        form.setValue('memberId', m.id)
                        setMemberSearch(m.name)
                        setMemberOptions([])
                      }}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{m.icNumber}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.watch('memberId') && (
                <input type="hidden" {...form.register('memberId')} />
              )}
              {form.formState.errors.memberId && (
                <p className="text-xs text-destructive">{form.formState.errors.memberId.message}</p>
              )}
            </div>

            {/* Case Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jenis Kes *</Label>
                <Select value={form.watch('type') || ''} onValueChange={(v) => form.setValue('type', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Keutamaan</Label>
                <Select value={form.watch('priority') || 'medium'} onValueChange={(v) => form.setValue('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Amaun Dipohon (RM)</Label>
              <Input type="number" min="0" step="100" placeholder="0" {...form.register('requestedAmount')} />
            </div>

            <div className="space-y-1.5">
              <Label>Keterangan</Label>
              <Textarea placeholder="Terangkan keperluan kes..." rows={3} {...form.register('description')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewCaseOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Hantar Kes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Case Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedCase && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedCase.caseNumber}
                </SheetTitle>
                <SheetDescription>
                  Butiran kes
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-4">
                {/* Status & Priority Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[selectedCase.status]}`}>
                    {STATUS_LABELS[selectedCase.status] || selectedCase.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_COLORS[selectedCase.priority]}`}>
                    {selectedCase.priority === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                    {PRIORITY_LABELS[selectedCase.priority] || selectedCase.priority}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[selectedCase.type]}`}>
                    {TYPE_LABELS[selectedCase.type] || selectedCase.type}
                  </span>
                  {selectedCase.riskIndicator && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      selectedCase.riskIndicator === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                      selectedCase.riskIndicator === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      Risk: {selectedCase.riskIndicator}
                    </span>
                  )}
                </div>

                {/* Case Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Maklumat Kes</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {selectedCase.member && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Ahli:</span>
                        <span className="font-medium">{selectedCase.member.name}</span>
                        <span className="text-xs text-muted-foreground">({selectedCase.member.icNumber})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Jenis:</span>
                      <span>{TYPE_LABELS[selectedCase.type] || selectedCase.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Keutamaan:</span>
                      <span>{PRIORITY_LABELS[selectedCase.priority] || selectedCase.priority}</span>
                    </div>
                    {selectedCase.requestedAmount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Amaun Dipohon:</span>
                        <span className="font-semibold">{formatCurrency(selectedCase.requestedAmount)}</span>
                      </div>
                    )}
                    {selectedCase.approvedAmount && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Amaun Diluluskan:</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(selectedCase.approvedAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Dihantar:</span>
                      <span>{formatDate(selectedCase.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {selectedCase.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Keterangan</h4>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedCase.description}</p>
                    </div>
                  </>
                )}

                {/* Status Timeline */}
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aliran Status</h4>
                  <div className="relative">
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {STATUS_FLOW.map((s, i) => {
                        const currentIdx = STATUS_FLOW.indexOf(selectedCase.status)
                        const isCompleted = i < currentIdx
                        const isCurrent = s === selectedCase.status
                        return (
                          <div key={s} className="flex items-center gap-1 shrink-0">
                            <div className={`flex flex-col items-center gap-1`}>
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                                isCompleted ? 'bg-emerald-500 text-white' :
                                isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? '✓' : i + 1}
                              </div>
                              <span className={`text-[10px] whitespace-nowrap ${
                                isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                              }`}>
                                {STATUS_LABELS[s]}
                              </span>
                            </div>
                            {i < STATUS_FLOW.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mx-1" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Welfare Score */}
                {selectedCase.welfareScore != null && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skor Kebajikan</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              selectedCase.welfareScore >= 70 ? 'bg-emerald-500' :
                              selectedCase.welfareScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedCase.welfareScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{selectedCase.welfareScore}%</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Case Notes */}
                {selectedCase.notes && selectedCase.notes.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Catatan Kes ({selectedCase.notes.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedCase.notes.map((note) => (
                          <div key={note.id} className="rounded-lg border p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-primary">
                                {note.author?.name || 'Sistem'}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] capitalize">{note.type}</Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDateTime(note.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Next Action */}
                {selectedCase.nextAction && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tindakan Seterusnya</h4>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                        <p className="font-medium text-primary">{selectedCase.nextAction}</p>
                        {selectedCase.nextActionDate && (
                          <p className="text-xs text-muted-foreground mt-1">Tarikh: {formatDate(selectedCase.nextActionDate)}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Meta */}
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Dihantar: {formatDateTime(selectedCase.createdAt)}</p>
                  <p>Kemaskini terakhir: {formatDateTime(selectedCase.updatedAt)}</p>
                  {selectedCase.closedAt && (
                    <p>Ditutup: {formatDateTime(selectedCase.closedAt)}</p>
                  )}
                </div>

                {/* Status Transition Buttons */}
                <div className="flex flex-wrap gap-2">
                  {selectedCase.status !== 'closed' && selectedCase.status !== 'rejected' && (
                    <>
                      <Button size="sm" className="gap-1">
                        <ArrowRight className="h-3 w-3" />
                        Kemaskini Status
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                        <XCircle className="h-3 w-3" />
                        Tolak
                      </Button>
                    </>
                  )}
                  {selectedCase.status === 'closed' && (
                    <Button size="sm" variant="outline" className="gap-1">
                      Buka Semula
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
