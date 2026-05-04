'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Select, Progress,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart3, Download, Calendar, TrendingUp,
  PieChart as PieChartIcon, BarChart, LineChart,
} from 'lucide-react'
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Cell,
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

/* ─── Chart Configs ────────────────────────────────────── */
const caseStatusChartConfig: ChartConfig = {
  draft: { label: 'Draf', color: '#94a3b8' },
  intake: { label: 'Intak', color: '#f59e0b' },
  verification: { label: 'Pengesahan', color: '#3b82f6' },
  assessment: { label: 'Penilaian', color: '#8b5cf6' },
  approval: { label: 'Kelulusan', color: '#06b6d4' },
  disbursement: { label: 'Agihan', color: '#10b981' },
  follow_up: { label: 'Susulan', color: '#ec4899' },
  closed: { label: 'Ditutup', color: '#22c55e' },
  rejected: { label: 'Ditolak', color: '#ef4444' },
}

const donationCategoryChartConfig: ChartConfig = {
  zakat: { label: 'Zakat', color: '#10b981' },
  sadaqah: { label: 'Sadaqah', color: '#14b8a6' },
  waqf: { label: 'Waqf', color: '#f59e0b' },
  infaq: { label: 'Infaq', color: '#8b5cf6' },
  general: { label: 'Umum', color: '#6b7280' },
}

const complianceCategoryChartConfig: ChartConfig = {
  rosm: { label: 'ROSM', color: '#8b5cf6' },
  lhdn: { label: 'LHDN', color: '#14b8a6' },
  pdpa: { label: 'PDPA', color: '#f59e0b' },
  internal: { label: 'Dalaman', color: '#06b6d4' },
  audit: { label: 'Audit', color: '#f43f5e' },
}

const memberGrowthChartConfig: ChartConfig = {
  count: { label: 'Ahli Baharu', color: '#10b981' },
}

const donationTrendChartConfig: ChartConfig = {
  amount: { label: 'Sumbangan', color: '#10b981' },
}

const disbursementTrendChartConfig: ChartConfig = {
  amount: { label: 'Agihan', color: '#f59e0b' },
}

const activityCategoryChartConfig: ChartConfig = {
  member: { label: 'Ahli', color: '#3b82f6' },
  case: { label: 'Kes', color: '#f59e0b' },
  donation: { label: 'Sumbangan', color: '#10b981' },
  programme: { label: 'Program', color: '#8b5cf6' },
  volunteer: { label: 'Sukarelawan', color: '#ec4899' },
  compliance: { label: 'Pematuhan', color: '#ef4444' },
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
          case 'operational':
            setOperationalData(data.caseStats ? data : demoOperational)
            break
          case 'financial':
            setFinancialData(data.donationTotals ? data : demoFinancial)
            break
          case 'compliance':
            setComplianceData(data.overallScore !== undefined ? data : demoCompliance)
            break
          case 'programme':
            setProgrammeData(data.programmeStats ? data : demoProgramme)
            break
        }
      } else {
        // Fallback to demo
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

  useEffect(() => {
    fetchReport(activeTab)
  }, [activeTab, fetchReport])

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
            <Select.Trigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="this_month">Bulan Ini</Select.Item>
              <Select.Item value="last_3_months">3 Bulan Lepas</Select.Item>
              <Select.Item value="this_year">Tahun Ini</Select.Item>
              <Select.Item value="all_time">Semua Masa</Select.Item>
            </Select.Content>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Eksport
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="operational" className="gap-1"><BarChart3 className="h-4 w-4" />Operasi</TabsTrigger>
          <TabsTrigger value="financial" className="gap-1"><TrendingUp className="h-4 w-4" />Kewangan</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1"><PieChartIcon className="h-4 w-4" />Pematuhan</TabsTrigger>
          <TabsTrigger value="programme" className="gap-1"><BarChart className="h-4 w-4" />Program</TabsTrigger>
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
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Kes</p>
                        <p className="text-lg font-bold">{operationalData.caseStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Ahli</p>
                        <p className="text-lg font-bold">{operationalData.memberStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                        <PieChartIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kes Ditutup</p>
                        <p className="text-lg font-bold">{operationalData.caseStats.statusCounts.closed || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                        <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Aktiviti 30 Hari</p>
                        <p className="text-lg font-bold">{operationalData.activitySummary.totalLast30Days}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Case Status Pie Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Status Kes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={caseStatusChartConfig} className="h-[280px] w-full">
                      <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={Object.entries(operationalData.caseStats.statusCounts).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                        >
                          {Object.entries(operationalData.caseStats.statusCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Member Growth Line Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pertumbuhan Ahli</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={memberGrowthChartConfig} className="h-[280px] w-full">
                      <LineChart data={operationalData.memberStats.monthlyGrowth.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Case Type Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Kes Mengikut Jenis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={activityCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={Object.entries(operationalData.caseStats.typeCounts).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {Object.entries(operationalData.caseStats.typeCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Activity Category Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Aktiviti Mengikut Kategori (30 Hari)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={activityCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={Object.entries(operationalData.activitySummary.categoryCounts).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {Object.entries(operationalData.activitySummary.categoryCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
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
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Sumbangan</p>
                        <p className="text-lg font-bold">{formatRM(financialData.donationTotals.total)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                        <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Agihan</p>
                        <p className="text-lg font-bold">{formatRM(financialData.disbursementTotals.total)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <PieChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kadar Patuh Syariah</p>
                        <p className="text-lg font-bold">{financialData.donationTotals.shariahRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                        <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Baki</p>
                        <p className="text-lg font-bold">{formatRM(financialData.donationTotals.total - financialData.disbursementTotals.total)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donation by Category */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sumbangan Mengikut Kategori</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={donationCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={Object.entries(financialData.donationTotals.categoryTotals).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {Object.entries(financialData.donationTotals.categoryTotals).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Monthly Donation Trend */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Trend Sumbangan Bulanan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={donationTrendChartConfig} className="h-[280px] w-full">
                      <LineChart data={financialData.donationTotals.monthlyTrends.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Disbursement by Category */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Agihan Mengikut Kategori</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={donationCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={Object.entries(financialData.disbursementTotals.categoryTotals).map(([name, value]) => ({ name, value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {Object.entries(financialData.disbursementTotals.categoryTotals).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Monthly Disbursement Trend */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Trend Agihan Bulanan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={disbursementTrendChartConfig} className="h-[280px] w-full">
                      <LineChart data={financialData.disbursementTotals.monthlyTrends.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Disbursement Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ringkasan Status Agihan</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(financialData.disbursementTotals.statusTotals).map(([status, count]) => (
                      <div key={status} className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
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
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <PieChartIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Skor Pematuhan</p>
                        <p className="text-lg font-bold">{complianceData.overallScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Rekod</p>
                        <p className="text-lg font-bold">{complianceData.totalRecords}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Patuh</p>
                        <p className="text-lg font-bold">{complianceData.compliantCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                        <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tamat Tempoh</p>
                        <p className="text-lg font-bold">{complianceData.overdueItems.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Score by Category */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Skor Pematuhan Mengikut Kategori</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={complianceCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={Object.entries(complianceData.categoryScores).map(([name, data]) => ({ name, score: data.score }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {Object.entries(complianceData.categoryScores).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Status Breakdown Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pecahan Status</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={caseStatusChartConfig} className="h-[280px] w-full">
                      <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={Object.entries(complianceData.statusBreakdown).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                        >
                          {Object.entries(complianceData.statusBreakdown).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Overdue Items List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Item Tamat Tempoh</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {complianceData.overdueItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Tiada item tamat tempoh</p>
                  ) : (
                    <div className="space-y-3">
                      {complianceData.overdueItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                          <div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Kategori: {item.category} · Tarikh Akhir: {item.dueDate || '—'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            {item.status}
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
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                        <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Program</p>
                        <p className="text-lg font-bold">{programmeData.programmeStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Jumlah Bajet</p>
                        <p className="text-lg font-bold">{formatRM(programmeData.programmeStats.totalBudget)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                        <PieChartIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Belanja</p>
                        <p className="text-lg font-bold">{formatRM(programmeData.programmeStats.totalSpent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900">
                        <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Penggunaan Bajet</p>
                        <p className="text-lg font-bold">{programmeData.programmeStats.overallUtilization}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Utilization Progress Bars */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Penggunaan Bajet Program</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {programmeData.programmeBudgetData.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge variant="secondary" className={`text-[10px] ${
                            p.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            p.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            p.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {p.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatRM(p.spent)} / {formatRM(p.budget)} ({p.utilization}%)
                        </span>
                      </div>
                      <Progress value={p.utilization} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Penerima: {p.beneficiaries} / {p.target}</span>
                        <span>Baki: {formatRM(p.budget - p.spent)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Programme Status Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Status Program</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={caseStatusChartConfig} className="h-[280px] w-full">
                      <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={Object.entries(programmeData.programmeStats.statusCounts).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                        >
                          {Object.entries(programmeData.programmeStats.statusCounts).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Beneficiary Count by Programme */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Penerima Mengikut Program</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ChartContainer config={complianceCategoryChartConfig} className="h-[280px] w-full">
                      <BarChart data={programmeData.programmeBudgetData.map(p => ({
                        name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
                        beneficiaries: p.beneficiaries,
                        target: p.target,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="beneficiaries" name="Penerima" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="target" name="Sasaran" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
