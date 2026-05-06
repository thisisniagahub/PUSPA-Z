'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Search,
  MapPin,
  Phone,
  GraduationCap,
  Home,
  Utensils,
  Heart,
  BookOpen,
  Filter,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Types ────────────────────────────────────────────────────────

interface Institution {
  id: string
  name: string
  type: 'rumah_kebajikan' | 'maahad_tahfiz' | 'kawasan_agihan'
  address?: string
  contact?: string
  isActive: boolean
}

// ─── Demo Data (from PUSPA_DATA_EXTRACTION.md) ─────────────────

const INSTITUTIONS: Institution[] = [
  // Rumah Kebajikan
  { id: 'rk1', name: 'T Ummi', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk2', name: 'Al Faeez', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk3', name: 'Kasih Murni', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk4', name: 'N Hasanah', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk5', name: 'Al Barakh', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk6', name: 'Rahoma', type: 'rumah_kebajikan', isActive: true },
  { id: 'rk7', name: 'Nur Qaseh', type: 'rumah_kebajikan', isActive: true },
  // Maahad Tahfiz
  { id: 'mt1', name: 'MT Masjid Al Ridhuan', type: 'maahad_tahfiz', isActive: true },
  { id: 'mt2', name: 'Baitul Quran', type: 'maahad_tahfiz', isActive: true },
  { id: 'mt3', name: 'MT Al Itqaan', type: 'maahad_tahfiz', isActive: true },
  { id: 'mt4', name: 'MT Darul Hidayah', type: 'maahad_tahfiz', isActive: true },
  // Kawasan Agihan
  { id: 'ka1', name: 'Taman Permata', type: 'kawasan_agihan', address: 'Gombak, Selangor', isActive: true },
  { id: 'ka2', name: 'Kampung Fajar', type: 'kawasan_agihan', address: 'Gombak, Selangor', isActive: true },
  { id: 'ka3', name: 'Hulu Klang', type: 'kawasan_agihan', address: 'Selangor', isActive: true },
  { id: 'ka4', name: 'Taman Melawati', type: 'kawasan_agihan', address: 'Kuala Lumpur', isActive: true },
  { id: 'ka5', name: 'Klang Gate', type: 'kawasan_agihan', address: 'Selangor', isActive: true },
  { id: 'ka6', name: 'Gombak', type: 'kawasan_agihan', address: 'Selangor', isActive: true },
]

const typeConfig = {
  rumah_kebajikan: {
    label: 'Rumah Kebajikan',
    icon: Home,
    color: 'from-rose-500 to-pink-600',
    bgLight: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
  maahad_tahfiz: {
    label: 'Maahad Tahfiz',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  kawasan_agihan: {
    label: 'Kawasan Agihan',
    icon: MapPin,
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
}

// ─── Components ───────────────────────────────────────────────────

function InstitutionCard({ inst, index }: { inst: Institution; index: number }) {
  const config = typeConfig[inst.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-white shrink-0 shadow-md`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{inst.name}</p>
              <Badge className={`text-[10px] mt-1 ${config.badge}`}>
                {config.label}
              </Badge>
            </div>
            <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${inst.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          {inst.address && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{inst.address}</span>
            </div>
          )}
          {inst.contact && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{inst.contact}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function InstitusiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = INSTITUTIONS
    if (filterType !== 'all') {
      list = list.filter(i => i.type === filterType)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.address?.toLowerCase().includes(q) ||
        typeConfig[i.type].label.toLowerCase().includes(q)
      )
    }
    return list
  }, [searchQuery, filterType])

  const stats = useMemo(() => ({
    rumah: INSTITUTIONS.filter(i => i.type === 'rumah_kebajikan').length,
    tahfiz: INSTITUTIONS.filter(i => i.type === 'maahad_tahfiz').length,
    kawasan: INSTITUTIONS.filter(i => i.type === 'kawasan_agihan').length,
    total: INSTITUTIONS.length,
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            Institusi & Kawasan Bantuan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Senarai institusi penerima bantuan dan kawasan agihan makanan bulanan PUSPA
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jumlah Institusi', value: stats.total, icon: Building, color: 'from-violet-500/10 to-violet-500/5 border-violet-500/20' },
          { label: 'Rumah Kebajikan', value: stats.rumah, icon: Home, color: typeConfig.rumah_kebajikan.bgLight },
          { label: 'Maahad Tahfiz', value: stats.tahfiz, icon: GraduationCap, color: typeConfig.maahad_tahfiz.bgLight },
          { label: 'Kawasan Agihan', value: stats.kawasan, icon: MapPin, color: typeConfig.kawasan_agihan.bgLight },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${stat.color} border`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                  <stat.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari institusi atau kawasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="rumah_kebajikan">Rumah Kebajikan</SelectItem>
            <SelectItem value="maahad_tahfiz">Maahad Tahfiz</SelectItem>
            <SelectItem value="kawasan_agihan">Kawasan Agihan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Menunjukkan {filtered.length} daripada {INSTITUTIONS.length} institusi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((inst, i) => (
            <InstitutionCard key={inst.id} inst={inst} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Tiada institusi dijumpai</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Cuba ubah carian atau penapis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
