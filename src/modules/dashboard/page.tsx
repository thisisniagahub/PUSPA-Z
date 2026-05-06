'use client'

import React, { useState, useEffect } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts'
import { 
  Users, FileText, HandCoins, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ─── Demo Data ──────────────────────────────────────────────────

const DEFAULT_TREND = [
  { name: 'Jan', sumbangan: 45000, agihan: 32000 },
  { name: 'Feb', sumbangan: 52000, agihan: 38000 },
  { name: 'Mar', sumbangan: 48000, agihan: 41000 },
  { name: 'Apr', sumbangan: 71000, agihan: 55000 },
  { name: 'Mei', sumbangan: 65000, agihan: 48000 },
  { name: 'Jun', sumbangan: 89000, agihan: 62000 },
]

const DEFAULT_ASNAF = [
  { name: 'Fakir', value: 400, color: 'var(--chart-1)' },
  { name: 'Miskin', value: 750, color: 'var(--chart-2)' },
  { name: 'Muallaf', value: 120, color: 'var(--chart-3)' },
  { name: 'Gharimin', value: 85, color: 'var(--chart-4)' },
]

const DEFAULT_CASES = [
  { name: 'Intake', total: 45 },
  { name: 'Verification', total: 32 },
  { name: 'Assessment', total: 28 },
  { name: 'Approval', total: 15 },
  { name: 'Disbursement', total: 54 },
]

// ─── Sub-Components ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-background/95 p-3 shadow-xl backdrop-blur-sm">
        <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium">{entry.name}:</span>
            <span className="text-sm font-bold">RM {entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const KpiCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/30">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={24} />
        </div>
        <Badge variant={trend > 0 ? "default" : "destructive"} className="h-fit gap-1 bg-opacity-20 text-[10px] font-bold">
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </Badge>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
      </div>
    </CardContent>
  </Card>
)

// ─── Main Component ─────────────────────────────────────────────

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/v1/dashboard')
        const json = await res.json()
        if (json.success) setDashboardData(json.data)
      } catch (err) {
        console.error("Gagal memuatkan data dashboard", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const trendData = dashboardData?.trend || DEFAULT_TREND
  const asnafData = dashboardData?.asnaf || DEFAULT_ASNAF
  const caseStatusData = dashboardData?.caseStatus || DEFAULT_CASES
  const stats = dashboardData?.stats || { totalMembers: 1355, activeCases: 174 }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuatkan…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Jumlah Ahli Asnaf" 
          value={stats.totalMembers.toLocaleString()} 
          sub="↑ 42 ahli baru bulan ini" 
          icon={Users} 
          trend={12.5} 
        />
        <KpiCard 
          title="Kes Dalam Proses" 
          value={stats.activeCases.toLocaleString()} 
          sub="8 kes urgent perlukan tindakan" 
          icon={FileText} 
          trend={-3.2} 
        />
        <KpiCard 
          title="Jumlah Sumbangan" 
          value="RM 89,240" 
          sub="Kutipan Zakat & Sedekah" 
          icon={HandCoins} 
          trend={8.7} 
        />
        <KpiCard 
          title="Skor Pematuhan" 
          value="94.2%" 
          sub="ROSM & LHDN Up-to-date" 
          icon={ShieldCheck} 
          trend={2.1} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-8 shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-bold">Trend Sumbangan & Agihan</CardTitle>
              <CardDescription>Prestasi kewangan bagi 6 bulan terakhir</CardDescription>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Sumbangan</span></div>
               <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-2" /><span className="text-[10px] text-muted-foreground">Agihan</span></div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pl-0">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSumbangan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAgihan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  tickFormatter={(value) => `RM${value/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sumbangan" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSumbangan)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="agihan" 
                  stroke="var(--chart-2)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAgihan)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="lg:col-span-4 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Komposisi Ahli</CardTitle>
            <CardDescription>Mengikut kategori asnaf</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <PieChart>
                <Pie
                  data={asnafData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {asnafData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">1,355</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Jumlah Ahli</span>
            </div>
          </CardContent>
          <div className="px-6 pb-6 space-y-2">
            {asnafData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold">{Math.round((item.value/1355)*100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart - Case Flow */}
        <Card className="lg:col-span-6 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Aliran Status Kes</CardTitle>
            <CardDescription>Jumlah kes mengikut peringkat aliran kerja</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <BarChart data={caseStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  fill="var(--primary)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="lg:col-span-6 shadow-lg border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Aktiviti Terkini</CardTitle>
              <CardDescription>Log sistem masa nyata</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { user: 'Admin PUSPA', action: 'meluluskan agihan bantuan', target: 'DB-2024-0012', time: '2 minit lepas', color: 'bg-emerald-500' },
                { user: 'Siti Ops', action: 'mendaftar ahli baru', target: 'Ahmad bin Ali', time: '14 minit lepas', color: 'bg-blue-500' },
                { user: 'Sistem', action: 'auto-jana laporan', target: 'Audit Q1 2025', time: '1 jam lepas', color: 'bg-purple-500' },
                { user: 'Zaki Finance', action: 'merekod sumbangan', target: 'RM&nbsp;5,000 (Zakat)', time: '3 jam lepas', color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color} mt-1.5`} />
                    {i < 3 && <div className="absolute top-4 left-[4.5px] w-[1px] h-10 bg-border" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs leading-none">
                      <span className="font-bold">{item.user}</span> {item.action}{' '}
                      <span className="font-medium text-primary">{item.target}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="button"
              className="w-full mt-6 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            >
              Lihat Semua Aktiviti
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
