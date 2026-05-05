'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Progress,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui'
import {
  BarChart3, Download, Calendar, TrendingUp,
  PieChart as PieChartIcon, BarChart as BarChartIcon,
} from 'lucide-react'
import {
  BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

/* ─── Types ────────────────────────────────────────────── */
interface OperationalData {
  type: string
  caseStats: { total: number; statusCounts: Record<string, number>; typeCounts: Record<string, number> }
  memberStats: { total: number; statusCounts: Record<string, number>; asnafCategoryCounts: Record<string, number>; monthlyGrowth: { month: string; count: number }[] }
  activitySummary: { totalLast30Days: number; categoryCounts: Record<string, number> }
}

interface FinancialData {
  type: string
  donationTotals: { total: number; categoryTotals: Record<string, number>; monthlyTrends: { month: string; amount: number }[]; shariahRate: number }
  disbursementTotals: { total: number; categoryTotals: Record<string, number>; statusTotals: Record<string, number>; monthlyTrends: { month: string; amount: number }[] }
}

interface ComplianceReportData {
  type: string
  overallScore: number
  totalRecords: number
  compliantCount: number
  categoryScores: Record<string, { total: number; compliant: number; score: number }>
  statusBreakdown: Record<string, number>
  overdueItems: { id: string; title: string; dueDate: string | null; category: string; status: string }[]
}

interface ProgrammeReportData {
  type: string
  programmeStats: { total: number; statusCounts: Record<string, number>; categoryCounts: Record<string, number>; totalBudget: number; totalSpent: number; overallUtilization: number }
  programmeBudgetData: { name: string; budget: number; spent: number; utilization: number; beneficiaries: number; target: number; status: string }[]
}

/* ─── Helpers ──────────────────────────────────────────── */
const formatRM = (val: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)

const formatMonth = (m: string) => {
  const [y, mm] = m.split('-')
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
  return `${months[parseInt(mm) - 1]} ${y.slice(2)}`
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draf', intake: 'Intak', verification: 'Pengesahan', assessment: 'Penilaian',
  approval: 'Kelulusan', disbursement: 'Agihan', follow_up: 'Susulan', closed: 'Ditutup', rejected: 'Ditolak',
  compliant: 'Patuh', pending: 'Menunggu', under_review: 'Dalam Semakan', non_compliant: 'Tidak Patuh',
}

const CATEGORY_LABELS: Record<string, string> = {
  zakat: 'Zakat', sadaqah: 'Sadaqah', waqf: 'Waqf', infaq: 'Infaq', general: 'Umum',
  welfare: 'Kebajikan', medical: 'Perubatan', education: 'Pendidikan', housing: 'Perumahan',
  emergency: 'Kecemasan', monthly_aid: 'Bantuan Bulanan',
  rosm: 'ROSM', lhdn: 'LHDN', pdpa: 'PDPA', internal: 'Dalaman', audit: 'Audit',
  member: 'Ahli', case: 'Kes', donation: 'Sumbangan', programme: 'Program', volunteer: 'Sukarelawan', compliance: 'Pematuhan',
}

/* ─── Custom Tooltip ──────────────────────────────────── */
function ChartTooltip({ active, payload, label, valueFormatter }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  valueFormatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      {label && <p className="text-sm font-semibold mb-1.5">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{CATEGORY_LABELS[entry.name] || STATUS_LABELS[entry.name] || entry.name}:</span>
          <span className="font-medium">{valueFormatter ? valueFormatter(entry.value) : entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoOperational: OperationalData = {
  type: 'operational',
  caseStats: { total: 156, statusCounts: { draft: 12, intake: 18, verification: 15, assessment: 20, approval: 10, disbursement: 8, follow_up: 22, closed: 45, rejected: 6 }, typeCounts: { welfare: 40, medical: 30, education: 25, housing: 20, emergency: 15, financial: 26 } },
  memberStats: { total: 342, statusCounts: { active: 280, inactive: 42, pending: 20 }, asnafCategoryCounts: { fakir: 80, miskin: 120, amil: 30, gharim: 40, riqab: 15, 'ibn sabil': 22, muallaf: 35 }, monthlyGrowth: [
    { month: '2024-07', count: 15 }, { month: '2024-08', count: 22 }, { month: '2024-09', count: 18 },
    { month: '2024-10', count: 28 }, { month: '2024-11', count: 32 }, { month: '2024-12', count: 25 },
    { month: '2025-01', count: 30 }, { month: '2025-02', count: 35 }, { month: '2025-03', count: 42 },
    { month: '2025-04', count: 38 }, { month: '2025-05', count: 45 }, { month: '2025-06', count: 50 },
  ] },
  activitySummary: { totalLast30Days: 127, categoryCounts: { member: 35, case: 28, donation: 22, programme: 18, volunteer: 14, compliance: 10 } },
}

const demoFinancial: FinancialData = {
  type: 'financial',
  donationTotals: {
    total: 525000,
    categoryTotals: { zakat: 180000, sadaqah: 120000, waqf: 85000, infaq: 95000, general: 45000 },
    monthlyTrends: [
      { month: '2024-07', amount: 35000 }, { month: '2024-08', amount: 42000 }, { month: '2024-09', amount: 38000 },
      { month: '2024-10', amount: 55000 }, { month: '2024-11', amount: 48000 }, { month: '2024-12', amount: 62000 },
      { month: '2025-01', amount: 45000 }, { month: '2025-02', amount: 52000 }, { month: '2025-03', amount: 58000 },
      { month: '2025-04', amount: 41000 }, { month: '2025-05', amount: 49000 }, { month: '2025-06', amount: 56000 },
    ],
    shariahRate: 92,
  },
  disbursementTotals: {
    total: 380000,
    categoryTotals: { welfare: 95000, medical: 78000, education: 65000, housing: 55000, emergency: 42000, monthly_aid: 45000 },
    statusTotals: { pending: 8, approved: 12, disbursed: 35, verified: 28, cancelled: 3 },
    monthlyTrends: [
      { month: '2024-07', amount: 25000 }, { month: '2024-08', amount: 30000 }, { month: '2024-09', amount: 28000 },
      { month: '2024-10', amount: 35000 }, { month: '2024-11', amount: 32000 }, { month: '2024-12', amount: 38000 },
      { month: '2025-01', amount: 33000 }, { month: '2025-02', amount: 36000 }, { month: '2025-03', amount: 40000 },
      { month: '2025-04', amount: 29000 }, { month: '2025-05', amount: 34000 }, { month: '2025-06', amount: 37000 },
    ],
  },
}

const demoCompliance: ComplianceReportData = {
  type: 'compliance',
  overallScore: 65,
  totalRecords: 12,
  compliantCount: 8,
  categoryScores: {
    rosm: { total: 3, compliant: 2, score: 67 },
    lhdn: { total: 2, compliant: 1, score: 50 },
    pdpa: { total: 3, compliant: 2, score: 67 },
    internal: { total: 2, compliant: 2, score: 100 },
    audit: { total: 2, compliant: 1, score: 50 },
  },
  statusBreakdown: { compliant: 8, pending: 2, under_review: 1, non_compliant: 1 },
  overdueItems: [
    { id: 'ov1', title: 'LHDN Tax Filing Q1', dueDate: '2025-04-30', category: 'lhdn', status: 'pending' },
    { id: 'ov2', title: 'Internal Policy Review', dueDate: '2025-02-28', category: 'internal', status: 'non_compliant' },
  ],
}

const demoProgramme: ProgrammeReportData = {
  type: 'programme',
  programmeStats: { total: 8, statusCounts: { planning: 2, active: 4, completed: 1, suspended: 1 }, categoryCounts: { education: 2, welfare: 2, health: 1, economic: 1, social: 1, religious: 1 }, totalBudget: 450000, totalSpent: 285000, overallUtilization: 63 },
  programmeBudgetData: [
    { name: 'Program Pendidikan', budget: 80000, spent: 55000, utilization: 69, beneficiaries: 45, target: 60, status: 'active' },
    { name: 'Bantuan Kebajikan', budget: 100000, spent: 72000, utilization: 72, beneficiaries: 80, target: 100, status: 'active' },
    { name: 'Klinik Kesihatan', budget: 60000, spent: 35000, utilization: 58, beneficiaries: 120, target: 150, status: 'active' },
    { name: 'Program Ekonomi', budget: 70000, spent: 48000, utilization: 69, beneficiaries: 30, target: 50, status: 'active' },
    { name: 'Aktiviti Sosial', budget: 50000, spent: 32000, utilization: 64, beneficiaries: 200, target: 250, status: 'planning' },
    { name: 'Program Keagamaan', budget: 40000, spent: 28000, utilization: 70, beneficiaries: 60, target: 80, status: 'completed' },
    { name: 'Bantuan Perumahan', budget: 35000, spent: 12000, utilization: 34, beneficiaries: 15, target: 30, status: 'planning' },
    { name: 'Program Latihan', budget: 15000, spent: 3000, utilization: 20, beneficiaries: 8, target: 25, status: 'suspended' },
  ],
}

/* ─── Component ────────────────────────────────────────── */
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('operational')
  const [dateRange, setDateRange] = useState('this_year')
  const [loading, setLoading] = useState(true)
  const [operationalData, setOperationalData] = useState<OperationalData | null>(null)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceReportData | null>(null)
  const [programmeData, setProgrammeData] = useState<ProgrammeReportData | null>(null)

  const fetchReport = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/reports?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        switch (type) {
          case 'operational': setOperationalData(data.caseStats ? data : demoOperational); break
          case 'financial': setFinancialData(data.donationTotals ? data : demoFinancial); break
          case 'compliance': setComplianceData(data.overallScore !== undefined ? data : demoCompliance); break
          case 'programme': setProgrammeData(data.programmeStats ? data : demoProgramme); break
        }
      } else {
        switch (type) {
          case 'operational': setOperationalData(demoOperational); break
          case 'financial': setFinancialData(demoFinancial); break
          case 'compliance': setComplianceData(demoCompliance); break
          case 'programme': setProgrammeData(demoProgramme); break
        }
      }
    } catch {
      switch (type) {
        case 'operational': setOperationalData(demoOperational); break
        case 'financial': setFinancialData(demoFinancial); break
        case 'compliance': setComplianceData(demoCompliance); break
        case 'programme': setProgrammeData(demoProgramme); break
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReport(activeTab) }, [activeTab, fetchReport])

  const isLoading = loading && !(
    (activeTab === 'operational' && operationalData) ||
    (activeTab === 'financial' && financialData) ||
    (activeTab === 'compliance' && complianceData) ||
    (activeTab === 'programme' && programmeData)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan &amp; Analitik</h1>
          <p className="text-sm text-muted-foreground">Reports &amp; Analytics — Analisis data dan laporan platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">Bulan Ini</SelectItem>
              <SelectItem value="last_3_months">3 Bulan Lepas</SelectItem>
              <SelectItem value="this_year">Tahun Ini</SelectItem>
              <SelectItem value="all_time">Semua Masa</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Eksport</span>
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="operational" className="gap-1"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Operasi</span></TabsTrigger>
          <TabsTrigger value="financial" className="gap-1"><TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Kewangan</span></TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1"><PieChartIcon className="h-4 w-4" /><span className="hidden sm:inline">Pematuhan</span></TabsTrigger>
          <TabsTrigger value="programme" className="gap-1"><BarChartIcon className="h-4 w-4" /><span className="hidden sm:inline">Program</span></TabsTrigger>
        </TabsList>

        {/* Operational Tab */}
        <TabsContent value="operational">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
              ))}
            </div>
          ) : operationalData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900"><BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Kes</p><p className="text-lg font-bold">{operationalData.caseStats.total}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900"><TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Ahli</p><p className="text-lg font-bold">{operationalData.memberStats.total}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900"><PieChartIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-xs text-muted-foreground">Kes Ditutup</p><p className="text-lg font-bold">{operationalData.caseStats.statusCounts.closed || 0}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900"><Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" /></div><div><p className="text-xs text-muted-foreground">Aktiviti 30 Hari</p><p className="text-lg font-bold">{operationalData.activitySummary.totalLast30Days}</p></div></div></CardContent></Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Case Status Pie */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Status Kes</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip content={<ChartTooltip />} />
                          <Pie data={Object.entries(operationalData.caseStats.statusCounts).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
                            {Object.entries(operationalData.caseStats.statusCounts).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend formatter={(value: string) => <span className="text-xs text-muted-foreground">{STATUS_LABELS[value] || value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Growth Line */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Pertumbuhan Ahli</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={operationalData.memberStats.monthlyGrowth.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip />} />
                          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Case Type Bar */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Kes Mengikut Jenis</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(operationalData.caseStats.typeCounts).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {Object.entries(operationalData.caseStats.typeCounts).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Category Bar */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Aktiviti Mengikut Kategori (30 Hari)</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(operationalData.activitySummary.categoryCounts).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {Object.entries(operationalData.activitySummary.categoryCounts).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
              ))}
            </div>
          ) : financialData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900"><TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Sumbangan</p><p className="text-lg font-bold">{formatRM(financialData.donationTotals.total)}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900"><BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Agihan</p><p className="text-lg font-bold">{formatRM(financialData.disbursementTotals.total)}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900"><PieChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div><div><p className="text-xs text-muted-foreground">Kadar Patuh Syariah</p><p className="text-lg font-bold">{financialData.donationTotals.shariahRate}%</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900"><Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" /></div><div><p className="text-xs text-muted-foreground">Baki</p><p className="text-lg font-bold">{formatRM(financialData.donationTotals.total - financialData.disbursementTotals.total)}</p></div></div></CardContent></Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Sumbangan Mengikut Kategori</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(financialData.donationTotals.categoryTotals).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip valueFormatter={(v) => formatRM(v)} />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {Object.entries(financialData.donationTotals.categoryTotals).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Trend Sumbangan Bulanan</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financialData.donationTotals.monthlyTrends.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip valueFormatter={(v) => formatRM(v)} />} />
                          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Agihan Mengikut Kategori</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(financialData.disbursementTotals.categoryTotals).map(([name, value]) => ({ name, value }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip valueFormatter={(v) => formatRM(v)} />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {Object.entries(financialData.disbursementTotals.categoryTotals).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Trend Agihan Bulanan</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financialData.disbursementTotals.monthlyTrends.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip valueFormatter={(v) => formatRM(v)} />} />
                          <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Disbursement Summary */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Ringkasan Status Agihan</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(financialData.disbursementTotals.statusTotals).map(([status, count]) => (
                      <div key={status} className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
                        <p className="text-xl font-bold">{count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
              ))}
            </div>
          ) : complianceData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900"><PieChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">Skor Pematuhan</p><p className="text-lg font-bold">{complianceData.overallScore}%</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900"><BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Rekod</p><p className="text-lg font-bold">{complianceData.totalRecords}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900"><TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div><div><p className="text-xs text-muted-foreground">Patuh</p><p className="text-lg font-bold">{complianceData.compliantCount}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900"><Calendar className="h-5 w-5 text-red-600 dark:text-red-400" /></div><div><p className="text-xs text-muted-foreground">Tamat Tempoh</p><p className="text-lg font-bold">{complianceData.overdueItems.length}</p></div></div></CardContent></Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Skor Pematuhan Mengikut Kategori</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(complianceData.categoryScores).map(([name, data]) => ({ name, score: data.score }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {Object.entries(complianceData.categoryScores).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Pecahan Status</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip content={<ChartTooltip />} />
                          <Pie data={Object.entries(complianceData.statusBreakdown).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
                            {Object.entries(complianceData.statusBreakdown).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend formatter={(value: string) => <span className="text-xs text-muted-foreground">{STATUS_LABELS[value] || value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overdue Items */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Item Tamat Tempoh</CardTitle></CardHeader>
                <CardContent className="p-4">
                  {complianceData.overdueItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Tiada item tamat tempoh</p>
                  ) : (
                    <div className="space-y-3">
                      {complianceData.overdueItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">Kategori: {CATEGORY_LABELS[item.category] || item.category} · Tarikh Akhir: {item.dueDate || '—'}</p>
                          </div>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 w-fit">
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Programme Tab */}
        <TabsContent value="programme">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
              ))}
            </div>
          ) : programmeData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900"><BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Program</p><p className="text-lg font-bold">{programmeData.programmeStats.total}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900"><TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-xs text-muted-foreground">Jumlah Bajet</p><p className="text-lg font-bold">{formatRM(programmeData.programmeStats.totalBudget)}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900"><PieChartIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-xs text-muted-foreground">Perbelanjaan</p><p className="text-lg font-bold">{formatRM(programmeData.programmeStats.totalSpent)}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900"><Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div><div><p className="text-xs text-muted-foreground">Penggunaan</p><p className="text-lg font-bold">{programmeData.programmeStats.overallUtilization}%</p></div></div></CardContent></Card>
              </div>

              {/* Budget Chart */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Bajet vs Perbelanjaan Mengikut Program</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={programmeData.programmeBudgetData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} className="text-muted-foreground" />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => formatRM(v)} />} />
                        <Legend />
                        <Bar dataKey="budget" name="Bajet" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="spent" name="Perbelanjaan" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Programme Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programmeData.programmeBudgetData.map((prog) => (
                  <Card key={prog.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">{prog.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">{prog.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Penggunaan Bajet</span>
                          <span className="font-medium">{prog.utilization}%</span>
                        </div>
                        <Progress value={prog.utilization} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Bajet:</span> <span className="font-medium">{formatRM(prog.budget)}</span></div>
                          <div><span className="text-muted-foreground">Belanja:</span> <span className="font-medium">{formatRM(prog.spent)}</span></div>
                          <div><span className="text-muted-foreground">Penerima:</span> <span className="font-medium">{prog.beneficiaries}</span></div>
                          <div><span className="text-muted-foreground">Sasaran:</span> <span className="font-medium">{prog.target}</span></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
