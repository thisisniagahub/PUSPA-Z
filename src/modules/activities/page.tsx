'use client'

import type { LucideIcon } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import {
  Activity as ActivityIcon,
  Users,
  FileText,
  HandCoins,
  Calendar,
  Sparkles,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────

interface ActivityItem {
  id: string
  type: string
  category: string
  title: string
  description?: string
  entityType?: string
  entityId?: string
  metadata?: string
  createdAt: string
  userName?: string
}

// ─── Constants ──────────────────────────────────────────────────

const categoryConfig: Record<string, {
  label: string
  icon: LucideIcon
  color: string
  dotColor: string
  lineColor: string
}> = {
  member: {
    label: 'Ahli',
    icon: Users,
    color: 'bg-blue-100 text-blue-700',
    dotColor: 'bg-blue-500',
    lineColor: 'border-blue-200',
  },
  case: {
    label: 'Kes',
    icon: FileText,
    color: 'bg-orange-100 text-orange-700',
    dotColor: 'bg-orange-500',
    lineColor: 'border-orange-200',
  },
  donation: {
    label: 'Sumbangan',
    icon: HandCoins,
    color: 'bg-emerald-100 text-emerald-700',
    dotColor: 'bg-emerald-500',
    lineColor: 'border-emerald-200',
  },
  programme: {
    label: 'Program',
    icon: Calendar,
    color: 'bg-violet-100 text-violet-700',
    dotColor: 'bg-violet-500',
    lineColor: 'border-violet-200',
  },
  volunteer: {
    label: 'Sukarelawan',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-700',
    dotColor: 'bg-pink-500',
    lineColor: 'border-pink-200',
  },
  compliance: {
    label: 'Pematuhan',
    icon: Shield,
    color: 'bg-red-100 text-red-700',
    dotColor: 'bg-red-500',
    lineColor: 'border-red-200',
  },
  system: {
    label: 'Sistem',
    icon: Settings,
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-500',
    lineColor: 'border-gray-200',
  },
}

const ITEMS_PER_PAGE = 10

// ─── Demo Data ──────────────────────────────────────────────────

const demoActivities: ActivityItem[] = [
  {
    id: 'act_001',
    type: 'member_created',
    category: 'member',
    title: 'Ahli baru didaftarkan',
    description: 'Ahmad bin Ali telah didaftarkan sebagai ahli asnaf baru di bawah kategori Fakir.',
    entityType: 'Member',
    entityId: 'mem_001',
    createdAt: '2025-05-04T14:30:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_002',
    type: 'case_created',
    category: 'case',
    title: 'Kes baru dibuka',
    description: 'Kes kebajikan #KES-2025-0042 telah dibuka untuk Siti binti Hassan.',
    entityType: 'Case',
    entityId: 'case_042',
    createdAt: '2025-05-04T13:15:00Z',
    userName: 'Staff A',
  },
  {
    id: 'act_003',
    type: 'donation_received',
    category: 'donation',
    title: 'Sumbangan diterima',
    description: 'Sumbangan zakat sebanyak RM5,000 diterima daripada Encik Rahman melalui pemindahan bank.',
    entityType: 'Donation',
    entityId: 'don_003',
    createdAt: '2025-05-04T11:45:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_004',
    type: 'programme_created',
    category: 'programme',
    title: 'Program baru dicipta',
    description: 'Program Bimbingan Pelajar Asnaf telah dicipta di bawah kategori Pendidikan.',
    entityType: 'Programme',
    entityId: 'prog_001',
    createdAt: '2025-05-04T10:20:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_005',
    type: 'volunteer_registered',
    category: 'volunteer',
    title: 'Sukarelawan baru didaftarkan',
    description: 'Nurul Aisyah binti Rahman telah didaftarkan sebagai sukarelawan.',
    entityType: 'Volunteer',
    entityId: 'vol_001',
    createdAt: '2025-05-04T09:00:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_006',
    type: 'compliance_update',
    category: 'compliance',
    title: 'Rekod pematuhan dikemaskini',
    description: 'Pematuhan ROSM telah dikemaskini kepada status "Patuh".',
    entityType: 'ComplianceRecord',
    entityId: 'comp_001',
    createdAt: '2025-05-03T16:30:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_007',
    type: 'system_update',
    category: 'system',
    title: 'Kemaskini sistem',
    description: 'Sistem PUSPA V4 telah dikemaskini ke versi 4.2.1.',
    createdAt: '2025-05-03T08:00:00Z',
  },
  {
    id: 'act_008',
    type: 'case_updated',
    category: 'case',
    title: 'Kes dikemaskini',
    description: 'Kes #KES-2025-0038 telah dikemaskini ke status "Penilaian".',
    entityType: 'Case',
    entityId: 'case_038',
    createdAt: '2025-05-03T14:20:00Z',
    userName: 'Staff B',
  },
  {
    id: 'act_009',
    type: 'disbursement_approved',
    category: 'donation',
    title: 'Agihan diluluskan',
    description: 'Agihan bantuan bulanan sebanyak RM800 telah diluluskan untuk Ismail bin Abdullah.',
    entityType: 'Disbursement',
    entityId: 'disb_009',
    createdAt: '2025-05-03T11:00:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_010',
    type: 'member_updated',
    category: 'member',
    title: 'Maklumat ahli dikemaskini',
    description: 'Maklumat pendapatan bulanan untuk Aisyah binti Yusof telah dikemaskini.',
    entityType: 'Member',
    entityId: 'mem_004',
    createdAt: '2025-05-03T09:30:00Z',
    userName: 'Staff A',
  },
  {
    id: 'act_011',
    type: 'volunteer_activity',
    category: 'volunteer',
    title: 'Aktiviti sukarelawan dicatat',
    description: 'Ahmad Faiz bin Ismail telah menyumbang 10 jam sebagai Pemandu.',
    entityType: 'Volunteer',
    entityId: 'vol_002',
    createdAt: '2025-05-02T16:45:00Z',
    userName: 'Staff B',
  },
  {
    id: 'act_012',
    type: 'programme_updated',
    category: 'programme',
    title: 'Program dikemaskini',
    description: 'Bantuan Makanan Bulanan — perbelanjaan dikemaskini kepada RM150,000.',
    entityType: 'Programme',
    entityId: 'prog_002',
    createdAt: '2025-05-02T14:00:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_013',
    type: 'donation_receipt',
    category: 'donation',
    title: 'Resit sumbangan dikeluarkan',
    description: 'Resit #RCP-2025-0198 telah dikeluarkan untuk sumbangan RM2,500.',
    entityType: 'Donation',
    entityId: 'don_013',
    createdAt: '2025-05-02T10:30:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_014',
    type: 'member_created',
    category: 'member',
    title: 'Ahli baru didaftarkan',
    description: 'Fatimah binti Mohd Noor telah didaftarkan di bawah kategori Miskin.',
    entityType: 'Member',
    entityId: 'mem_005',
    createdAt: '2025-05-02T08:15:00Z',
    userName: 'Staff A',
  },
  {
    id: 'act_015',
    type: 'ekyc_verified',
    category: 'member',
    title: 'eKYC disahkan',
    description: 'Pengesahan identiti untuk Muhammad bin Ismail telah diluluskan.',
    entityType: 'Member',
    entityId: 'mem_003',
    createdAt: '2025-05-01T15:00:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_016',
    type: 'certificate_issued',
    category: 'volunteer',
    title: 'Sijil dikeluarkan',
    description: 'Sijil Perkhidmatan 2024 telah dikeluarkan untuk Siti Fatimah binti Abdullah.',
    entityType: 'Volunteer',
    entityId: 'vol_003',
    createdAt: '2025-05-01T12:00:00Z',
    userName: 'Admin PUSPA',
  },
  {
    id: 'act_017',
    type: 'case_closed',
    category: 'case',
    title: 'Kes ditutup',
    description: 'Kes #KES-2025-0029 telah ditutup selepas agihan selesai.',
    entityType: 'Case',
    entityId: 'case_029',
    createdAt: '2025-05-01T10:00:00Z',
    userName: 'Staff B',
  },
  {
    id: 'act_018',
    type: 'backup_completed',
    category: 'system',
    title: 'Sandaran data selesai',
    description: 'Sandaran harian pangkalan data telah berjaya diselesaikan.',
    createdAt: '2025-05-01T03:00:00Z',
  },
]

// ─── Helpers ────────────────────────────────────────────────────

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} minit lalu`
  if (diffHr < 24) return `${diffHr} jam lalu`
  if (diffDay < 7) return `${diffDay} hari lalu`
  return formatTimestamp(dateStr)
}

// ─── Component ──────────────────────────────────────────────────

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(demoActivities)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [filterCategory, filterType, startDate, endDate])

  async function fetchActivities() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      if (filterType !== 'all') params.set('type', filterType)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      params.set('page', String(page))
      params.set('limit', String(ITEMS_PER_PAGE))

      const res = await fetch(`/api/v1/activities?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setActivities(json.data)
        }
      }
    } catch {
      // Keep demo data
    } finally {
      setLoading(false)
    }
  }

  // Filter client-side for demo
  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filterCategory !== 'all' && a.category !== filterCategory) return false
      if (filterType !== 'all' && a.type !== filterType) return false
      if (startDate && new Date(a.createdAt) < new Date(startDate)) return false
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(a.createdAt) > end) return false
      }
      return true
    })
  }, [activities, filterCategory, filterType, startDate, endDate])

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Get unique types for filter
  const uniqueTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.type))
    return Array.from(types).sort()
  }, [activities])

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}
    paginated.forEach((a) => {
      const dateKey = new Date(a.createdAt).toLocaleDateString('ms-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(a)
    })
    return groups
  }, [paginated])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Aktiviti</h1>
        <p className="text-sm text-muted-foreground">Activity Log</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1) }}>
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
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="w-full sm:w-[150px]"
              placeholder="Dari"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="w-full sm:w-[150px]"
              placeholder="Hingga"
            />
            {(filterCategory !== 'all' || filterType !== 'all' || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCategory('all')
                  setFilterType('all')
                  setStartDate('')
                  setEndDate('')
                  setPage(1)
                }}
                className="gap-1"
              >
                <Filter className="h-3 w-3" />
                Set Semula
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <ActivityIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Tiada aktiviti dijumpai</p>
            <p className="text-sm text-muted-foreground">Ubah penapis untuk melihat lebih banyak</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Timeline items */}
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {items.map((activity) => {
                    const cfg = categoryConfig[activity.category] || categoryConfig.system
                    const Icon = cfg.icon

                    return (
                      <div key={activity.id} className="relative">
                        {/* Dot */}
                        <div
                          className={cn(
                            'absolute -left-5 top-1.5 h-4 w-4 rounded-full border-2 border-background',
                            cfg.dotColor
                          )}
                        />

                        {/* Content */}
                        <div className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <h4 className="text-sm font-semibold">{activity.title}</h4>
                                <Badge variant="outline" className={cn('text-[10px] w-fit', cfg.color)}>
                                  {cfg.label}
                                </Badge>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{formatTimestamp(activity.createdAt)}</span>
                                <span>•</span>
                                <span>{formatRelativeTime(activity.createdAt)}</span>
                                {activity.userName && (
                                  <>
                                    <span>•</span>
                                    <span>Oleh: {activity.userName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menunjukkan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} daripada {filtered.length} aktiviti
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelum
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Seterusnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
