'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Users,
  FileText,
  HandCoins,
  Shield,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowDownToLine,
  Sparkles,
  ScanFace,
  UserPlus,
  Send,
  Receipt,
  BarChart3,
  Activity,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'

// ─── Types ──────────────────────────────────────────────────────

interface DashboardMetrics {
  totalMembers: number
  activeCases: number
  totalDonations: number
  totalDisbursements: number
  activeProgrammes: number
  totalVolunteers: number
  complianceScore: number
  pendingEkyc: number
}

interface MonthlyDonationTrend {
  month: string
  zakat: number
  sadaqah: number
  waqf: number
  infaq: number
  general: number
}

interface MemberBreakdown {
  category: string
  count: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description?: string
  createdAt: string
  category: string
}

// ─── Chart Colors (non-blue/indigo) ────────────────────────────

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const PIE_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  '#e76f51',
  '#2a9d8f',
  '#e9c46a',
]

// ─── Helpers ────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ms-MY').format(num)
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'Baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} min lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

function getActivityIcon(category: string) {
  const icons: Record<string, React.ElementType> = {
    member: UserPlus,
    case: FileText,
    donation: HandCoins,
    disbursement: ArrowDownToLine,
    programme: Calendar,
    compliance: Shield,
    volunteer: Sparkles,
    system: Activity,
  }
  return icons[category] || Activity
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    member: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    case: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    donation: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    disbursement: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    programme: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    compliance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    volunteer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    system: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
  }
  return colors[category] || colors.system
}

// ─── Metric Card Component ─────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType
  label: string
  value: string
  change?: number
  changeLabel?: string
  iconBg: string
  iconColor: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={change >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                  {change >= 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Custom Tooltip ─────────────────────────────────────────────

function DonationTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Custom Pie Label ───────────────────────────────────────────

const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
  return `${name} (${(percent * 100).toFixed(0)}%)`
}

// ─── Main Dashboard Component ───────────────────────────────────

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [donationTrends, setDonationTrends] = useState<MonthlyDonationTrend[]>([])
  const [memberBreakdown, setMemberBreakdown] = useState<MemberBreakdown[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isDemoData, setIsDemoData] = useState(false)
  const [loading, setLoading] = useState(true)
  const { setView } = useAppStore()

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/v1/dashboard')
        const data = await res.json()
        setMetrics(data.metrics)
        setDonationTrends(data.donationTrends)
        setMemberBreakdown(data.memberBreakdown)
        setRecentActivities(data.recentActivities)
        setIsDemoData(data.isDemoData)
      } catch (err) {
        console.error('Failed to fetch dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        {/* Skeleton metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Demo data banner */}
      {isDemoData && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Data demo dipaparkan. Maklumat sebenar akan dipaparkan apabila data dimasukkan ke dalam sistem.
          </p>
        </div>
      )}

      {/* ─── Top Metrics Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Jumlah Ahli"
          value={formatNumber(metrics.totalMembers)}
          change={12.5}
          changeLabel="vs bulan lepas"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          icon={FileText}
          label="Kes Aktif"
          value={formatNumber(metrics.activeCases)}
          change={-3.2}
          changeLabel="vs bulan lepas"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          icon={HandCoins}
          label="Jumlah Derma"
          value={formatCurrency(metrics.totalDonations)}
          change={8.7}
          changeLabel="vs bulan lepas"
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
        />
        <MetricCard
          icon={Shield}
          label="Skor Pematuhan"
          value={`${metrics.complianceScore}%`}
          change={2.1}
          changeLabel="vs suku lepas"
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* ─── Secondary Metrics Row ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <ArrowDownToLine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Agihan</p>
                <p className="text-sm font-bold">{formatCurrency(metrics.totalDisbursements)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Program Aktif</p>
                <p className="text-sm font-bold">{metrics.activeProgrammes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Sukarelawan</p>
                <p className="text-sm font-bold">{formatNumber(metrics.totalVolunteers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <ScanFace className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">eKYC Menunggu</p>
                <p className="text-sm font-bold">{metrics.pendingEkyc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trends Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trend Sumbangan Bulanan</CardTitle>
            <CardDescription className="text-xs">
              6 bulan terakhir mengikut kategori
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<DonationTooltip />} />
                  <Bar dataKey="zakat" name="Zakat" stackId="a" fill={CHART_COLORS[0]} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sadaqah" name="Sadaqah" stackId="a" fill={CHART_COLORS[1]} />
                  <Bar dataKey="waqf" name="Waqf" stackId="a" fill={CHART_COLORS[2]} />
                  <Bar dataKey="infaq" name="Infaq" stackId="a" fill={CHART_COLORS[3]} />
                  <Bar dataKey="general" name="Umum" stackId="a" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Member Breakdown Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pecahan Ahli Mengikut Asnaf</CardTitle>
            <CardDescription className="text-xs">
              Taburan kategori asnaf ahli berdaftar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memberBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                    label={renderPieLabel}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {memberBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Bottom Row: Activities + Quick Actions ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Aktiviti Terkini</CardTitle>
                <CardDescription className="text-xs">
                  10 aktiviti terakhir dalam sistem
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => setView('activities')}
              >
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.category)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getCategoryColor(activity.category)}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tindakan Pantas</CardTitle>
            <CardDescription className="text-xs">
              Akses pantas fungsi utama
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800 transition-colors"
                onClick={() => setView('members')}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium">Daftar Ahli Baru</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20 dark:hover:border-amber-800 transition-colors"
                onClick={() => setView('cases')}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-medium">Hantar Kes</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-rose-50 hover:border-rose-200 dark:hover:bg-rose-950/20 dark:hover:border-rose-800 transition-colors"
                onClick={() => setView('donations')}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                  <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-xs font-medium">Rekod Derma</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-950/20 dark:hover:border-teal-800 transition-colors"
                onClick={() => setView('reports')}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                  <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-xs font-medium">Laporan</span>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  eKYC Disahkan
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {formatNumber(metrics.totalMembers - metrics.pendingEkyc)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  eKYC Menunggu
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {metrics.pendingEkyc}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-3 w-3 text-rose-500" />
                  Nisbah Agihan
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {metrics.totalDonations > 0
                    ? `${Math.round((metrics.totalDisbursements / metrics.totalDonations) * 100)}%`
                    : '0%'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
