'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Building2, Users, Search, Crown, Shield, Briefcase, Star,
  ChevronDown, Landmark, UserCheck, Network, LayoutGrid, X,
  Phone, Mail, MapPin, Award, Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import s from './carta.module.css'

// ═══════════════════════════════════════════════════════════════
//  DATA LAYER
// ═══════════════════════════════════════════════════════════════

interface Person {
  id: string
  name: string
  title: string
  tier: 'chairman' | 'deputy' | 'secretary' | 'treasurer' | 'auditor' | 'advisor' | 'honorary' | 'ops' | 'bureau'
  children?: Person[]
}

const ROLE_COLORS: Record<Person['tier'], string> = {
  chairman:  'linear-gradient(135deg, #b8860b, #daa520)',
  deputy:    'linear-gradient(135deg, #7c3aed, #a855f7)',
  secretary: 'linear-gradient(135deg, #6366f1, #818cf8)',
  treasurer: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  auditor:   'linear-gradient(135deg, #059669, #34d399)',
  advisor:   'linear-gradient(135deg, #dc2626, #f87171)',
  honorary:  'linear-gradient(135deg, #be185d, #f472b6)',
  ops:       'linear-gradient(135deg, #ea580c, #fb923c)',
  bureau:    'linear-gradient(135deg, #4f46e5, #818cf8)',
}

const TIER_LABELS: Record<Person['tier'], string> = {
  chairman: 'Pengerusi', deputy: 'Timbalan', secretary: 'Setiausaha',
  treasurer: 'Bendahari', auditor: 'Pemeriksa Kira-Kira', advisor: 'Penasihat',
  honorary: 'Kehormat', ops: 'Operasi', bureau: 'Biro',
}

const TIER_ICONS: Record<Person['tier'], LucideIcon> = {
  chairman: Crown, deputy: Crown, secretary: Briefcase, treasurer: Briefcase,
  auditor: Shield, advisor: Star, honorary: Landmark, ops: UserCheck, bureau: Briefcase,
}

// ── Admin Hierarchy (Tree) ──
const ADMIN_TREE: Person = {
  id: '1', name: "Dato' Dr Narimah Awin", title: 'Pengerusi', tier: 'chairman',
  children: [
    {
      id: '2', name: 'Datin Noor Khayatee Mohd Adnan', title: 'Timbalan Pengerusi', tier: 'deputy',
      children: [
        { id: '3', name: 'Puan Faeza Arashah', title: 'Setiausaha 1', tier: 'secretary' },
        { id: '4', name: 'Tuan HJ Mohamad Zaki MD Zakaria', title: 'Setiausaha 2', tier: 'secretary' },
        { id: '5', name: 'Puan HJH Shahidah Hashim', title: 'Bendahari', tier: 'treasurer' },
      ],
    },
    {
      id: 'aud', name: 'Pemeriksa Kira-Kira', title: 'Audit', tier: 'auditor',
      children: [
        { id: '6', name: 'Puan HJH Mahidah Ibrahim', title: 'Pemeriksa 1', tier: 'auditor' },
        { id: '7', name: 'Puan HJH Fariza Hashim', title: 'Pemeriksa 2', tier: 'auditor' },
      ],
    },
    {
      id: 'adv', name: 'Panel Penasihat', title: 'Penasihat', tier: 'advisor',
      children: [
        { id: '8', name: 'Ustaz HJ Mohammad Yodi Tohir', title: 'Penasihat Agama', tier: 'advisor' },
        { id: '9', name: 'Datuk Prof Emeritus HJ Ismail Hassan', title: 'Penasihat Umum', tier: 'advisor' },
      ],
    },
  ],
}

// ── Operations Hierarchy (Tree) ──
const OPS_TREE: Person = {
  id: '18', name: 'Datin HJH Noor Khayatee Mohd Adnan', title: 'Ketua Pegawai Operasi', tier: 'ops',
  children: [
    {
      id: '19', name: 'Puan HJH Shahidah Hashim', title: 'Timbalan Pegawai Operasi', tier: 'ops',
      children: [
        { id: '20', name: 'Tuan HJ Mohamad Zaki MD Zakaria', title: 'Pembantu Operasi 1', tier: 'ops' },
        { id: '21', name: 'Encik Mohd Izharin Ismail', title: 'Pembantu Operasi 2', tier: 'ops' },
      ],
    },
    { id: 'b1', name: 'HJH Nasimah Ahmad', title: 'Biro Kebajikan', tier: 'bureau' },
    { id: 'b2', name: 'Mohd Izharin Ismail', title: 'Biro Lojistik', tier: 'bureau' },
    { id: 'b3', name: 'HJ Mohamad Zaki', title: 'Biro Keusahawanan', tier: 'bureau' },
    { id: 'b4', name: 'Jumanah Amir', title: 'Biro Agihan Bulanan', tier: 'bureau' },
    { id: 'b5', name: 'Umi Kalthum A Bakar', title: 'Biro Sedekah Jumaat', tier: 'bureau' },
    { id: 'b6', name: 'HJH Shahidah Hashim', title: 'Biro Pendidikan', tier: 'bureau' },
    { id: 'b7', name: 'HJH Noor Khayatee', title: 'Biro Perhubungan Awam', tier: 'bureau' },
    { id: 'b8', name: 'HJH Noor Khayatee', title: 'Biro Seketariat Acara', tier: 'bureau' },
  ],
}

const HONORARY: Person[] = [
  { id: '10', name: 'Tuan HJ Zaid Johan', title: 'Masjid As Sobirin', tier: 'honorary' },
  { id: '11', name: 'Ustaz Dr Mohamad Deen Napiah', title: 'Masjid Al Hidayah T. Melawati', tier: 'honorary' },
  { id: '12', name: 'Tuan HJ Ahmad Hazrin Hashim', title: 'Masjid Lama Al Hidayah', tier: 'honorary' },
  { id: '13', name: 'Tuan HJ Jamal Abdul Nasir', title: 'Masjid Kg Klang Gate Baharu', tier: 'honorary' },
  { id: '14', name: 'YB Puan Juwariya Zulkifli', title: 'Penyelaras DUN H Kelang', tier: 'honorary' },
  { id: '15', name: 'Tuan Mohamed Radziff Hasan', title: 'Wakil Majlis MPAJ Zon 1', tier: 'honorary' },
  { id: '16', name: 'Puan Rosmayana Abu Rahim', title: 'Wakil Majlis MPAJ Zon 3', tier: 'honorary' },
  { id: '17', name: 'YB Puan Sri Kalsom Ismail', title: 'Individu Kehormat', tier: 'honorary' },
]

// ═══════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════

function getInitials(name: string) {
  const parts = name.replace(/^(Dato'|Datin|Puan|Tuan|Encik|Ustaz|Datuk|Prof|YB|HJ|HJH|Dr)\s*/gi, '').split(' ')
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

function Avatar({ person, size = 42 }: { person: Person; size?: number }) {
  return (
    <div className={s.avatar} style={{ width: size, height: size, background: ROLE_COLORS[person.tier], fontSize: size * 0.33 }}>
      <div className={s.avatarRing} />
      {getInitials(person.name)}
    </div>
  )
}

// ── Tree Node (recursive) ──
function TreeNode({
  person,
  depth = 0,
  selectedId,
  onSelect,
}: {
  person: Person
  depth?: number
  selectedId: string | null
  onSelect: (p: Person) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = person.children && person.children.length > 0

  return (
    <div className={s.tree}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`${s.node} ${selectedId === person.id ? s.nodeActive : ''}`}
        onClick={() => onSelect(person)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar person={person} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {person.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {person.title}
            </div>
          </div>
          {hasChildren && (
            <button
              aria-label={expanded ? 'Tutup senarai' : 'Buka senarai'}
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              <ChevronDown style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={s.treeChildren}
          >
            {person.children!.map((child) => (
              <div key={child.id} className={s.treeBranch}>
                <TreeNode person={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Grid Card ──
function GridCard({ person, onClick, index }: { person: Person; onClick: () => void; index: number }) {
  const Icon = TIER_ICONS[person.tier]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className={s.gridCard}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar person={person} size={48} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{person.name}</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 3 }}>{person.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Icon size={12} opacity={0.4} />
            <span style={{ fontSize: 11, opacity: 0.4, fontWeight: 500 }}>{TIER_LABELS[person.tier]}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Detail Panel ──
function DetailPanel({ person, onClose }: { person: Person; onClose: () => void }) {
  const Icon = TIER_ICONS[person.tier]
  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={s.mobileBackdrop}
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`${s.detailPanel} ${s.detailPanelPos}`}
      >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
        <Avatar person={person} size={56} />
        <button aria-label="Tutup panel" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: 4 }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{person.name}</h3>
      <p style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>{person.title}</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <Badge style={{ background: ROLE_COLORS[person.tier], color: 'white', border: 'none', fontSize: 11 }}>
          <Icon size={12} className="mr-1" />
          {TIER_LABELS[person.tier]}
        </Badge>
        <Badge variant="outline" style={{ fontSize: 11 }}>Aktif</Badge>
      </div>

      <Separator style={{ margin: '20px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <DetailRow icon={Award} label="Jawatan" value={person.title} />
        <DetailRow icon={Building2} label="Organisasi" value="PUSPA" />
        <DetailRow icon={MapPin} label="Lokasi" value="Gombak, Selangor" />
        <DetailRow icon={Phone} label="Telefon" value="—" />
        <DetailRow icon={Mail} label="E-mel" value="—" />
      </div>

      {person.children && person.children.length > 0 && (
        <>
          <Separator style={{ margin: '20px 0' }} />
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, opacity: 0.6 }}>
            DIRECT REPORTS ({person.children.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {person.children.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <Avatar person={c} size={28} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.4 }}>{c.title}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
    </>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(262 60% 60% / 0.1)', flexShrink: 0 }}>
        <Icon size={14} opacity={0.5} />
      </div>
      <div>
        <div style={{ fontSize: 10, opacity: 0.4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

function flattenTree(node: Person): Person[] {
  const result = [node]
  if (node.children) node.children.forEach(c => result.push(...flattenTree(c)))
  return result
}

export default function CartaOrganisasiPage() {
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree')
  const [selected, setSelected] = useState<Person | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [activeTab, setActiveTab] = useState('admin')

  const allPeople = useMemo(() => [
    ...flattenTree(ADMIN_TREE),
    ...flattenTree(OPS_TREE),
    ...HONORARY,
  ], [])

  const filteredGrid = useMemo(() => {
    if (!searchQ.trim()) return allPeople
    const q = searchQ.toLowerCase()
    return allPeople.filter(p => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
  }, [searchQ, allPeople])

  const totalCount = allPeople.length
  const handleSelect = useCallback((p: Person) => setSelected(p), [])

  return (
    <div className={s.pageLayout}>
      {/* ── Main Content ── */}
      <div className={s.mainContent}>

        {/* Hero */}
        <div className={`${s.heroCard} ${s.heroResponsive}`}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 style={{ width: 20, height: 20, color: 'white' }} />
                  </div>
                  <div>
                    <h1 className={s.heroTitle}>Carta Organisasi</h1>
                    <p style={{ fontSize: 12, opacity: 0.5 }}>Pertubuhan Urus Peduli Asnaf • 2025</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Ahli', value: totalCount, icon: Users },
                  { label: 'Biro', value: 8, icon: Briefcase },
                  { label: 'Penasihat', value: 2, icon: Star },
                ].map(st => (
                  <div key={st.label} className={s.statPill}>
                    <st.icon style={{ width: 14, height: 14, opacity: 0.4 }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{st.value}</div>
                      <div style={{ fontSize: 10, opacity: 0.4 }}>{st.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={s.toolbar}>
          <div className={s.searchWrap}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, opacity: 0.3 }} />
            <Input
              placeholder="Cari ahli organisasi..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`${s.viewBtn} ${viewMode === 'tree' ? s.viewBtnActive : ''}`} onClick={() => setViewMode('tree')}>
              <Network style={{ width: 14, height: 14, marginRight: 6, verticalAlign: -2 }} />
              Hierarki
            </button>
            <button className={`${s.viewBtn} ${viewMode === 'grid' ? s.viewBtnActive : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid style={{ width: 14, height: 14, marginRight: 6, verticalAlign: -2 }} />
              Grid
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'tree' && !searchQ.trim() ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList style={{ marginBottom: 8 }}>
              <TabsTrigger value="admin" className="gap-1.5 text-xs">
                <Building2 style={{ width: 14, height: 14 }} /> Carta Administrasi
              </TabsTrigger>
              <TabsTrigger value="ops" className="gap-1.5 text-xs">
                <Users style={{ width: 14, height: 14 }} /> Carta Operasi
              </TabsTrigger>
              <TabsTrigger value="honorary" className="gap-1.5 text-xs">
                <Landmark style={{ width: 14, height: 14 }} /> Ahli Kehormat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <div className={s.chartScroll}>
                <div style={{ display: 'inline-flex', minWidth: '100%', justifyContent: 'center' }}>
                  <TreeNode person={ADMIN_TREE} selectedId={selected?.id || null} onSelect={handleSelect} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ops">
              <div className={s.chartScroll}>
                <div style={{ display: 'inline-flex', minWidth: '100%', justifyContent: 'center' }}>
                  <TreeNode person={OPS_TREE} selectedId={selected?.id || null} onSelect={handleSelect} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="honorary">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {HONORARY.map((p, i) => (
                  <GridCard key={p.id} person={p} index={i} onClick={() => handleSelect(p)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Grid / Search Results */
          <div>
            <p style={{ fontSize: 12, opacity: 0.4, marginBottom: 12 }}>
              {searchQ.trim() ? `${filteredGrid.length} hasil carian` : `${allPeople.length} ahli organisasi`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredGrid.map((p, i) => (
                <GridCard key={p.id} person={p} index={i} onClick={() => handleSelect(p)} />
              ))}
            </div>
            {filteredGrid.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.3 }}>
                <Search style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>Tiada ahli dijumpai untuk &ldquo;{searchQ}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Panel (Right Sidebar) ── */}
      <AnimatePresence>
        {selected && (
          <DetailPanel person={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
