'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Input, Select, Textarea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Label,
} from '@/components/ui'
import {
  FileText, Plus, Search, Filter, File, FileImage,
  FileSpreadsheet, FileCheck, Calendar, Tag, Eye, X, Upload,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────── */
interface DocumentItem {
  id: string
  title: string
  category: string
  fileName: string | null
  fileSize: number | null
  version: number
  tags: string | null
  createdAt: string
  member?: { id: string; name: string } | null
  case?: { id: string; caseNumber: string } | null
  programme?: { id: string; name: string } | null
}

/* ─── Helpers ──────────────────────────────────────────── */
const categoryConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  member: { label: 'Ahli', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: FileCheck },
  case: { label: 'Kes', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: FileText },
  programme: { label: 'Program', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300', icon: FileSpreadsheet },
  compliance: { label: 'Pematuhan', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: FileCheck },
  general: { label: 'Umum', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: File },
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (fileName: string | null) => {
  if (!fileName) return File
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return FileImage
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet
  if (['pdf'].includes(ext || '')) return FileText
  return File
}

/* ─── Demo Data ────────────────────────────────────────── */
const demoDocuments: DocumentItem[] = [
  {
    id: 'doc1', title: 'Borang Pendaftaran Ahli 2025', category: 'member', fileName: 'borang_daftar_2025.pdf', fileSize: 245000, version: 3, tags: 'borang,pendaftaran,ahli', createdAt: '2025-03-01T08:00:00Z',
    member: { id: 'm1', name: 'Ahmad bin Abdullah' },
  },
  {
    id: 'doc2', title: 'Laporan Kes Bantuan Perubatan', category: 'case', fileName: 'laporan_kes_medis.pdf', fileSize: 512000, version: 1, tags: 'laporan,perubatan,kes', createdAt: '2025-03-03T10:00:00Z',
    case: { id: 'c1', caseNumber: 'CAS-00001' },
  },
  {
    id: 'doc3', title: 'Kertas Kerja Program Pendidikan', category: 'programme', fileName: 'kertas_kerja_edu.docx', fileSize: 128000, version: 2, tags: 'kertas kerja,pendidikan', createdAt: '2025-03-05T14:00:00Z',
    programme: { id: 'p1', name: 'Program Pendidikan Anak-Anak' },
  },
  {
    id: 'doc4', title: 'Polisi Perlindungan Data Peribadi', category: 'compliance', fileName: 'polisi_pdpa.pdf', fileSize: 89000, version: 4, tags: 'polisi,pdpa,pematuhan', createdAt: '2025-03-07T09:00:00Z',
  },
  {
    id: 'doc5', title: 'Minit Mesyuarat Agung Tahunan', category: 'general', fileName: 'minit_agm_2025.pdf', fileSize: 176000, version: 1, tags: 'minit,mesyuarat,agm', createdAt: '2025-03-10T11:00:00Z',
  },
  {
    id: 'doc6', title: 'Penilaian Kesejahteraan Keluarga', category: 'case', fileName: 'penilaian_kesejahteraan.xlsx', fileSize: 64000, version: 1, tags: 'penilaian,kesejahteraan', createdAt: '2025-03-12T16:00:00Z',
    case: { id: 'c2', caseNumber: 'CAS-00002' },
  },
  {
    id: 'doc7', title: 'Sijil Penerima Zakat', category: 'member', fileName: 'sijil_zakat_ahmad.png', fileSize: 320000, version: 1, tags: 'sijil,zakat', createdAt: '2025-03-14T08:30:00Z',
    member: { id: 'm2', name: 'Siti Aminah' },
  },
  {
    id: 'doc8', title: 'Laporan Kewangan Suku Tahunan', category: 'compliance', fileName: 'laporan_kewangan_q1.pdf', fileSize: 420000, version: 2, tags: 'kewangan,laporan,suku tahunan', createdAt: '2025-03-15T10:00:00Z',
  },
]

/* ─── Component ────────────────────────────────────────── */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDoc, setDetailDoc] = useState<DocumentItem | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('general')
  const [formTags, setFormTags] = useState('')
  const [formFileName, setFormFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const res = await fetch(`/api/v1/documents?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents)
        } else {
          setDocuments(demoDocuments)
        }
      } else {
        setDocuments(demoDocuments)
      }
    } catch {
      setDocuments(demoDocuments)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!formTitle) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          tags: formTags,
          fileName: formFileName || 'document.pdf',
          fileSize: 0,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormCategory('general')
    setFormTags('')
    setFormFileName('')
  }

  const filtered = documents.filter((d) => {
    const matchSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.fileName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.tags || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter
    return matchSearch && matchCat
  })

  // Compute category counts
  const categoryCounts: Record<string, number> = {}
  documents.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengurusan Dokumen</h1>
          <p className="text-sm text-muted-foreground">Document Management — Urus dan organaikan dokumen organisasi</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Muat Naik Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Muat Naik Dokumen Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="docTitle">Tajuk Dokumen</Label>
                <Input id="docTitle" placeholder="Masukkan tajuk dokumen..." value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="member">Ahli</Select.Item>
                      <Select.Item value="case">Kes</Select.Item>
                      <Select.Item value="programme">Program</Select.Item>
                      <Select.Item value="compliance">Pematuhan</Select.Item>
                      <Select.Item value="general">Umum</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="docFile">Fail</Label>
                  <div className="flex h-9 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
                    <Plus className="h-4 w-4 mr-1" />
                    Pilih fail
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="docTags">Tag (dipisahkan koma)</Label>
                <Input id="docTags" placeholder="contoh: borang, laporan, 2025" value={formTags} onChange={(e) => setFormTags(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting || !formTitle}>
                {submitting ? 'Menyimpan...' : 'Muat Naik'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <Card key={key} className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color.split(' ')[0]}`}>
                  <config.icon className={`h-4 w-4 ${config.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                  <p className="text-lg font-bold">{categoryCounts[key] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari dokumen, fail, tag..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <Select.Value placeholder="Kategori" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">Semua Kategori</Select.Item>
                <Select.Item value="member">Ahli</Select.Item>
                <Select.Item value="case">Kes</Select.Item>
                <Select.Item value="programme">Program</Select.Item>
                <Select.Item value="compliance">Pematuhan</Select.Item>
                <Select.Item value="general">Umum</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tiada dokumen dijumpai</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const catConf = categoryConfig[doc.category] || categoryConfig.general
            const FileIcon = getFileIcon(doc.fileName)
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* File Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${catConf.color.split(' ')[0]}`}>
                      <FileIcon className={`h-5 w-5 ${catConf.color.split(' ')[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.fileName || 'Tiada fail'}</p>
                    </div>
                  </div>

                  {/* Category & Version */}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className={`text-[10px] ${catConf.color}`}>
                      {catConf.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      v{doc.version}
                    </Badge>
                  </div>

                  {/* Tags */}
                  {doc.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                          <Tag className="h-2.5 w-2.5" />
                          {tag.trim()}
                        </span>
                      ))}
                      {doc.tags.split(',').length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{doc.tags.split(',').length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Related Entity */}
                  {doc.member && (
                    <p className="text-[10px] text-muted-foreground mt-2">Ahli: {doc.member.name}</p>
                  )}
                  {doc.case && (
                    <p className="text-[10px] text-muted-foreground mt-2">Kes: {doc.case.caseNumber}</p>
                  )}
                  {doc.programme && (
                    <p className="text-[10px] text-muted-foreground mt-2">Program: {doc.programme.name}</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString('ms-MY')}
                      <span className="mx-1">•</span>
                      {formatFileSize(doc.fileSize)}
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => setDetailDoc(doc)}>
                      <Eye className="h-3 w-3" />
                      Lihat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailDoc} onOpenChange={(open) => { if (!open) setDetailDoc(null) }}>
        <DialogContent className="sm:max-w-lg">
          {detailDoc && (() => {
            const catConf = categoryConfig[detailDoc.category] || categoryConfig.general
            const FileIcon = getFileIcon(detailDoc.fileName)
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5" />
                    {detailDoc.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={catConf.color}>{catConf.label}</Badge>
                    <Badge variant="outline">Versi {detailDoc.version}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Nama Fail</p>
                      <p className="font-medium">{detailDoc.fileName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Saiz Fail</p>
                      <p className="font-medium">{formatFileSize(detailDoc.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tarikh Dimuat Naik</p>
                      <p className="font-medium">{new Date(detailDoc.createdAt).toLocaleDateString('ms-MY')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Versi</p>
                      <p className="font-medium">{detailDoc.version}</p>
                    </div>
                  </div>
                  {detailDoc.member && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Ahli Berkaitan</p>
                      <p className="font-medium">{detailDoc.member.name}</p>
                    </div>
                  )}
                  {detailDoc.case && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Kes Berkaitan</p>
                      <p className="font-medium">{detailDoc.case.caseNumber}</p>
                    </div>
                  )}
                  {detailDoc.programme && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Program Berkaitan</p>
                      <p className="font-medium">{detailDoc.programme.name}</p>
                    </div>
                  )}
                  {detailDoc.tags && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tag</p>
                      <div className="flex flex-wrap gap-1">
                        {detailDoc.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs gap-1">
                            <Tag className="h-3 w-3" />
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetailDoc(null)}>Tutup</Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
