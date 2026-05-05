'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Label, Progress, Separator,
} from '@/components/ui'
import {
  ScanFace, Search, Filter, Clock, CheckCircle2, XCircle,
  AlertTriangle, Eye, Shield, User, CreditCard, Camera,
  FileText, ThumbsUp, ThumbsDown, Calendar,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface Member {
  id: string
  name: string
  icNumber: string
  phone: string | null
  email: string | null
  asnafCategory: string
  status: string
}

interface EKYCVerification {
  id: string
  memberId: string
  icFrontUrl: string | null
  icBackUrl: string | null
  selfieUrl: string | null
  ocrExtracted: string | null
  faceMatchScore: number | null
  riskLevel: string
  status: string
  verifiedBy: string | null
  verifiedAt: string | null
  notes: string | null
  createdAt: string
  member?: Member
}

interface EKYCStats {
  total: number
  pendingCount: number
  verifiedCount: number
  rejectedCount: number
  highRiskCount: number
}

/* ─── Helpers ──────────────────────────────────────────── */
const riskConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  low: { label: 'Rendah', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  medium: { label: 'Sederhana', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
  high: { label: 'Tinggi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  submitted: { label: 'Dihantar', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: FileText },
  under_review: { label: 'Sedang Semakan', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300', icon: Eye },
  verified: { label: 'Disahkan', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
}

const getScoreColor = (score: number | null) => {
  if (score === null) return 'text-muted-foreground'
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoVerifications: EKYCVerification[] = [
  {
    id: 'ekyc1', memberId: 'm1', icFrontUrl: '/images/ic-front.jpg', icBackUrl: '/images/ic-back.jpg', selfieUrl: '/images/selfie.jpg',
    ocrExtracted: JSON.stringify({ name: 'Ahmad bin Abdullah', icNumber: '850101-01-5123', address: 'No 12, Jalan Maju, 50000 KL', gender: 'Lelaki', nationality: 'Warganegara', dateOfBirth: '01-01-1985' }),
    faceMatchScore: 95.2, riskLevel: 'low', status: 'verified', verifiedBy: 'Admin PUSPA', verifiedAt: '2025-03-15T10:30:00Z', notes: 'Pengesahan berjaya',
    createdAt: '2025-03-14T08:00:00Z',
    member: { id: 'm1', name: 'Ahmad bin Abdullah', icNumber: '850101015123', phone: '012-3456789', email: 'ahmad@email.com', asnafCategory: 'fakir', status: 'active' },
  },
  {
    id: 'ekyc2', memberId: 'm2', icFrontUrl: '/images/ic-front.jpg', icBackUrl: '/images/ic-back.jpg', selfieUrl: '/images/selfie.jpg',
    ocrExtracted: JSON.stringify({ name: 'Siti Aminah bte Hassan', icNumber: '900215-02-5456', address: 'No 8, Jalan Harmoni, 60000 KL', gender: 'Perempuan', nationality: 'Warganegara', dateOfBirth: '15-02-1990' }),
    faceMatchScore: 78.5, riskLevel: 'medium', status: 'under_review', verifiedBy: null, verifiedAt: null, notes: null,
    createdAt: '2025-03-16T09:00:00Z',
    member: { id: 'm2', name: 'Siti Aminah bte Hassan', icNumber: '900215025456', phone: '013-4567890', email: 'siti@email.com', asnafCategory: 'miskin', status: 'active' },
  },
  {
    id: 'ekyc3', memberId: 'm3', icFrontUrl: null, icBackUrl: null, selfieUrl: '/images/selfie.jpg',
    ocrExtracted: null, faceMatchScore: null, riskLevel: 'pending', status: 'pending', verifiedBy: null, verifiedAt: null, notes: null,
    createdAt: '2025-03-17T14:00:00Z',
    member: { id: 'm3', name: 'Mohd Razak bin Ismail', icNumber: '780808-10-5789', phone: '014-5678901', email: 'razak@email.com', asnafCategory: 'gharim', status: 'active' },
  },
  {
    id: 'ekyc4', memberId: 'm4', icFrontUrl: '/images/ic-front.jpg', icBackUrl: '/images/ic-back.jpg', selfieUrl: '/images/selfie.jpg',
    ocrExtracted: JSON.stringify({ name: 'Fatimah Zahra', icNumber: '950530-04-5234', address: 'No 3, Jalan Sentosa, 40000 SJ', gender: 'Perempuan', nationality: 'Warganegara', dateOfBirth: '30-05-1995' }),
    faceMatchScore: 42.1, riskLevel: 'high', status: 'rejected', verifiedBy: 'Admin PUSPA', verifiedAt: '2025-03-18T11:00:00Z', notes: 'Padanan wajah terlalu rendah. IC mungkin tidak sah.',
    createdAt: '2025-03-17T16:00:00Z',
    member: { id: 'm4', name: 'Fatimah Zahra', icNumber: '950530045234', phone: '016-6789012', email: 'fatimah@email.com', asnafCategory: 'muallaf', status: 'active' },
  },
  {
    id: 'ekyc5', memberId: 'm5', icFrontUrl: '/images/ic-front.jpg', icBackUrl: '/images/ic-back.jpg', selfieUrl: '/images/selfie.jpg',
    ocrExtracted: JSON.stringify({ name: 'Abdul Karim bin Osman', icNumber: '870312-03-5890', address: 'No 25, Jalan Merdeka, 50000 KL', gender: 'Lelaki', nationality: 'Warganegara', dateOfBirth: '12-03-1987' }),
    faceMatchScore: 88.7, riskLevel: 'low', status: 'verified', verifiedBy: 'Bendahari', verifiedAt: '2025-03-19T09:30:00Z', notes: 'Semua dokumen sah',
    createdAt: '2025-03-18T08:00:00Z',
    member: { id: 'm5', name: 'Abdul Karim bin Osman', icNumber: '870312035890', phone: '017-7890123', email: 'karim@email.com', asnafCategory: 'amil', status: 'active' },
  },
  {
    id: 'ekyc6', memberId: 'm6', icFrontUrl: '/images/ic-front.jpg', icBackUrl: '/images/ic-back.jpg', selfieUrl: '/images/selfie.jpg',
    ocrExtracted: JSON.stringify({ name: 'Nurul Huda bte Md', icNumber: '920718-01-5612', address: 'No 15, Jalan Bakti, 60000 KL', gender: 'Perempuan', nationality: 'Warganegara', dateOfBirth: '18-07-1992' }),
    faceMatchScore: 65.3, riskLevel: 'medium', status: 'submitted', verifiedBy: null, verifiedAt: null, notes: 'Menunggu semakan',
    createdAt: '2025-03-19T10:00:00Z',
    member: { id: 'm6', name: 'Nurul Huda bte Md', icNumber: '920718015612', phone: '018-8901234', email: 'nurul@email.com', asnafCategory: 'riqab', status: 'active' },
  },
]

const demoStats: EKYCStats = {
  total: 6,
  pendingCount: 2,
  verifiedCount: 2,
  rejectedCount: 1,
  highRiskCount: 1,
}

/* ─── Component ────────────────────────────────────────── */
export default function EKYCPage() {
  const [verifications, setVerifications] = useState<EKYCVerification[]>([])
  const [stats, setStats] = useState<EKYCStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState<EKYCVerification | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (riskFilter !== 'all') params.set('riskLevel', riskFilter)

      const res = await fetch(`/api/v1/ekyc?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.verifications && data.verifications.length > 0) {
          setVerifications(data.verifications)
          setStats(data.stats)
        } else {
          setVerifications(demoVerifications)
          setStats(demoStats)
        }
      } else {
        setVerifications(demoVerifications)
        setStats(demoStats)
      }
    } catch {
      setVerifications(demoVerifications)
      setStats(demoStats)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, riskFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = verifications.filter((v) => {
    const memberName = v.member?.name || ''
    const matchSearch = !search ||
      memberName.toLowerCase().includes(search.toLowerCase()) ||
      (v.member?.icNumber || '').includes(search)
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    const matchRisk = riskFilter === 'all' || v.riskLevel === riskFilter
    return matchSearch && matchStatus && matchRisk
  })

  const openDetail = (v: EKYCVerification) => {
    setSelectedVerification(v)
    setReviewNotes('')
    setReviewAction(null)
    setDetailOpen(true)
  }

  const parseOcrData = (ocrString: string | null): Record<string, string> | null => {
    if (!ocrString) return null
    try {
      return JSON.parse(ocrString)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengesahan eKYC</h1>
        <p className="text-sm text-muted-foreground">eKYC Verification — Sahkan identiti ahli secara digital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Menunggu Semakan</p>
                <p className="text-lg font-bold">{stats?.pendingCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disahkan</p>
                <p className="text-lg font-bold">{stats?.verifiedCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ditolak</p>
                <p className="text-lg font-bold">{stats?.rejectedCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risiko Tinggi</p>
                <p className="text-lg font-bold">{stats?.highRiskCount ?? 0}</p>
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
                placeholder="Cari nama ahli, No. IC..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="submitted">Dihantar</SelectItem>
                <SelectItem value="under_review">Sedang Semakan</SelectItem>
                <SelectItem value="verified">Disahkan</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risiko" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Risiko</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
                <SelectItem value="medium">Sederhana</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Senarai Pengesahan eKYC</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Ahli</TableHead>
                  <TableHead>Risiko</TableHead>
                  <TableHead className="hidden md:table-cell">Padanan Wajah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Disahkan Oleh</TableHead>
                  <TableHead className="hidden lg:table-cell">Tarikh</TableHead>
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
                      Tiada pengesahan eKYC dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((v) => {
                    const riskConf = riskConfig[v.riskLevel] || riskConfig.pending
                    const statConf = statusConfig[v.status] || statusConfig.pending
                    const StatusIcon = statConf.icon
                    return (
                      <TableRow key={v.id} className={v.riskLevel === 'high' ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {(v.member?.name || 'U').charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{v.member?.name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{v.member?.icNumber || '—'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={riskConf.color}>{riskConf.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-sm font-mono font-semibold ${getScoreColor(v.faceMatchScore)}`}>
                            {v.faceMatchScore !== null ? `${v.faceMatchScore}%` : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${statConf.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{v.verifiedBy || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(v.createdAt).toLocaleDateString('ms-MY')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => openDetail(v)}>
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

      {/* Verification Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="h-5 w-5" />
              Butiran Pengesahan eKYC
            </DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6 py-4">
              {/* Member Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <User className="h-4 w-4" /> Maklumat Ahli
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Nama</p>
                    <p className="font-medium text-sm">{selectedVerification.member?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">No. IC</p>
                    <p className="font-medium text-sm">{selectedVerification.member?.icNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="text-sm">{selectedVerification.member?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedVerification.member?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kategori Asnaf</p>
                    <p className="text-sm capitalize">{selectedVerification.member?.asnafCategory || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status Ahli</p>
                    <p className="text-sm capitalize">{selectedVerification.member?.status || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Document Images */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <CreditCard className="h-4 w-4" /> Dokumen Pengenalan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IC Hadapan</p>
                    <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center bg-muted/30">
                      <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground mt-1">IC Hadapan</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IC Belakang</p>
                    <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center bg-muted/30">
                      <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground mt-1">IC Belakang</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Gambar Sendiri</p>
                    <div className="aspect-[1.6/1] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center bg-muted/30">
                      <Camera className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground mt-1">Selfie</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* OCR Extracted Data */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" /> Data OCR Diekstrak
                </h3>
                {parseOcrData(selectedVerification.ocrExtracted) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-muted/50">
                    {Object.entries(parseOcrData(selectedVerification.ocrExtracted)!).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">
                    Tiada data OCR tersedia
                  </p>
                )}
              </div>

              <Separator />

              {/* Face Match Score */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <ScanFace className="h-4 w-4" /> Skor Padanan Wajah
                </h3>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Padanan Wajah</span>
                    <span className={`text-lg font-bold ${getScoreColor(selectedVerification.faceMatchScore)}`}>
                      {selectedVerification.faceMatchScore !== null ? `${selectedVerification.faceMatchScore}%` : 'N/A'}
                    </span>
                  </div>
                  <Progress
                    value={selectedVerification.faceMatchScore ?? 0}
                    className="h-3"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span className="text-red-500">42%</span>
                    <span className="text-amber-500">70%</span>
                    <span className="text-green-500">90%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Current Status & Risk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status Semasa</p>
                  <Badge variant="secondary" className={`${(statusConfig[selectedVerification.status] || statusConfig.pending).color} gap-1`}>
                    {(() => { const c = statusConfig[selectedVerification.status] || statusConfig.pending; const I = c.icon; return <I className="h-3 w-3" />; })()}
                    {(statusConfig[selectedVerification.status] || statusConfig.pending).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tahap Risiko</p>
                  <Badge variant="secondary" className={(riskConfig[selectedVerification.riskLevel] || riskConfig.pending).color}>
                    {(riskConfig[selectedVerification.riskLevel] || riskConfig.pending).label}
                  </Badge>
                </div>
              </div>

              {/* Existing notes */}
              {selectedVerification.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Catatan Sedia Ada</p>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedVerification.notes}</p>
                </div>
              )}

              {/* Approve/Reject Actions (only for pending/review items) */}
              {['pending', 'submitted', 'under_review'].includes(selectedVerification.status) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tindakan Pengesahan</h3>
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <Label htmlFor="reviewNotes">Catatan Semakan</Label>
                        <Textarea
                          id="reviewNotes"
                          placeholder="Masukkan catatan semakan..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setReviewAction('approve')
                            // Placeholder action
                            setDetailOpen(false)
                          }}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Lulus
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setReviewAction('reject')
                            // Placeholder action
                            setDetailOpen(false)
                          }}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Tolak
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
