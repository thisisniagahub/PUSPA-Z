'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { 
  Rocket, 
  Users, 
  TrendingUp, 
  HandCoins, 
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const BRAND_COLOR = '#6A0DAD' // PUSPA Purple
const CHART_COLORS = ['#6A0DAD', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']

const entrepreneurSchema = z.object({
  name: z.string().min(1, 'Nama usahawan diperlukan'),
  category: z.string().min(1, 'Sila pilih kategori perniagaan'),
  initialCapital: z.preprocess((v) => Number(v), z.number().min(0, 'Modal tidak boleh negatif')),
  description: z.string().min(10, 'Sila berikan penerangan ringkas perniagaan (min 10 aksara)'),
})

type EntrepreneurFormValues = z.infer<typeof entrepreneurSchema>

export default function AsnafpreneurPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('semua')

  const fetchEntrepreneurs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (categoryFilter !== 'semua') params.set('category', categoryFilter)
      
      const response = await fetch(`/api/v1/asnafpreneur?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setEntrepreneurs(result.data)
      } else {
        setEntrepreneurs(MOCK_ENTREPRENEURS) // Fallback ke mock jika API gagal
      }
    } catch (error) {
      console.error('Error fetching entrepreneurs:', error)
      setEntrepreneurs(MOCK_ENTREPRENEURS)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter])

  useEffect(() => {
    fetchEntrepreneurs()
  }, [fetchEntrepreneurs])

  // Logik agihan statistik kategori untuk carta
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    const source = entrepreneurs.length > 0 ? entrepreneurs : MOCK_ENTREPRENEURS
    
    source.forEach((item: any) => {
      // Normalisasi nama kategori untuk paparan carta yang kemas
      const rawCat = item.category || 'Lain-lain'
      const cat = rawCat.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      stats[cat] = (stats[cat] || 0) + 1
    })

    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }, [entrepreneurs])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EntrepreneurFormValues, unknown, EntrepreneurFormValues>({
    resolver: zodResolver(entrepreneurSchema) as any,
    defaultValues: {
      name: '',
      category: '',
      initialCapital: 0,
      description: '',
    },
  })

  const onSubmit = async (data: EntrepreneurFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/asnafpreneur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mendaftarkan usahawan')
      }

      toast.success('Pendaftaran Berjaya', {
        description: `Usahawan ${data.name} telah didaftarkan ke dalam sistem.`,
      })
      
      setDialogOpen(false)
      form.reset()
      fetchEntrepreneurs() // Segarkan senarai selepas pendaftaran
    } catch (error) {
      toast.error('Ralat', {
        description: error instanceof Error ? error.message : 'Gagal mendaftarkan usahawan. Sila cuba lagi.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 sm:p-6 lg:p-8"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: BRAND_COLOR }}>
            Asnafpreneur
          </h1>
          <p className="text-muted-foreground mt-1">
            Program transformasi ekonomi asnaf melalui bimbingan perniagaan dan bantuan modal.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0" style={{ backgroundColor: BRAND_COLOR }}>
              <Plus className="h-4 w-4" />
              Daftar Usahawan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Daftar Usahawan Baru</DialogTitle>
              <DialogDescription>
                Masukkan maklumat usahawan asnaf untuk pemantauan prestasi dan agihan modal.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Penuh Usahawan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Ahmad bin Zulkifli" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Perniagaan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="makanan">Makanan & Minuman</SelectItem>
                            <SelectItem value="jahitan">Jahitan & Tekstil</SelectItem>
                            <SelectItem value="perkhidmatan">Perkhidmatan Am</SelectItem>
                            <SelectItem value="pertanian">Pertanian</SelectItem>
                            <SelectItem value="kraftangan">Kraftangan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initialCapital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modal Awal (RM)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penerangan Perniagaan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Terangkan jenis produk atau perkhidmatan yang ditawarkan..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {isSubmitting ? 'Mendaftarkan...' : 'Simpan Maklumat'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Usahawan" value="124" sub="Aktif berniaga" icon={Users} color="purple" />
        <StatCard title="Modal Diagihkan" value="RM 450,200" sub="Tahun 2024" icon={HandCoins} color="amber" />
        <StatCard title="Latihan Selesai" value="86%" sub="Kadar tamat modul" icon={GraduationCap} color="emerald" />
        <StatCard title="Purata ROI" value="12.5%" sub="Peningkatan pendapatan" icon={TrendingUp} color="rose" />
      </div>

      {/* Main Module Tabs */}
      <Tabs defaultValue="usahawan" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="usahawan">Usahawan</TabsTrigger>
          <TabsTrigger value="analitik">Analitik</TabsTrigger>
          <TabsTrigger value="latihan">Latihan</TabsTrigger>
          <TabsTrigger value="geran">Geran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usahawan" className="space-y-4 mt-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Senarai Usahawan Asnaf</CardTitle>
                  <CardDescription>Pangkalan data profil dan prestasi perniagaan.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64 hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari usahawan..." 
                      className="pl-8 h-9 text-xs" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 w-[180px] text-xs">
                      <Filter className="h-3.5 w-3.5 mr-2" />
                      <SelectValue placeholder="Tapis Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Kategori</SelectItem>
                      <SelectItem value="makanan">Makanan & Minuman</SelectItem>
                      <SelectItem value="jahitan">Jahitan & Tekstil</SelectItem>
                      <SelectItem value="perkhidmatan">Perkhidmatan Am</SelectItem>
                      <SelectItem value="pertanian">Pertanian</SelectItem>
                      <SelectItem value="kraftangan">Kraftangan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Usahawan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pendapatan (Purata)</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Memuatkan data...</TableCell></TableRow>
                  ) : entrepreneurs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Tiada usahawan dijumpai.</TableCell></TableRow>
                  ) : entrepreneurs.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'Aktif' ? 'default' : 'secondary'} 
                          className={item.status === 'Aktif' ? 'bg-emerald-500' : ''}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>RM {item.initialCapital?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" /> Lihat Profil</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><Pencil className="h-4 w-4" /> Kemaskini</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive"><Briefcase className="h-4 w-4" /> Rekod Jualan</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analitik" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carta Pie: Pecahan Peratusan */}
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pecahan Sektor Perniagaan</CardTitle>
                <CardDescription>Taburan usahawan asnaf mengikut kategori utama.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Carta Bar: Perbandingan Jumlah */}
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Jumlah Usahawan</CardTitle>
                <CardDescription>Bilangan usahawan bagi setiap kategori perniagaan.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(106, 13, 173, 0.05)' }} />
                    <Bar dataKey="value" fill={BRAND_COLOR} radius={[0, 4, 4, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

/** Helper Component for Summary Cards */
function StatCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap: any = {
    purple: 'from-purple-400 to-purple-600 bg-purple-100 text-purple-600',
    amber: 'from-amber-400 to-amber-600 bg-amber-100 text-amber-600',
    emerald: 'from-emerald-400 to-emerald-600 bg-emerald-100 text-emerald-600',
    rose: 'from-rose-400 to-rose-600 bg-rose-100 text-rose-600'
  }
  
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color].split(' ').slice(2).join(' ')}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${colorMap[color].split(' ').slice(0, 2).join(' ')}`} />
    </Card>
  )
}

const MOCK_ENTREPRENEURS = [
  { id: '1', name: 'Ahmad bin Zulkifli', category: 'Makanan & Minuman', status: 'Aktif', income: 'RM 3,500' },
  { id: '2', name: 'Siti Aminah binti Ali', category: 'Jahitan & Tekstil', status: 'Aktif', income: 'RM 2,800' },
  { id: '3', name: 'Mohd Fadhil bin Musa', category: 'Perkhidmatan Am', status: 'Latihan', income: 'RM 1,200' },
  { id: '4', name: 'Nurul Huda binti Hassan', category: 'Kraftangan', status: 'Aktif', income: 'RM 2,100' },
]