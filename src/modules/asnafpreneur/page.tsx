'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useInView, useMotionValue, useMotionTemplate } from 'framer-motion'
import {
  Rocket,
  Brain,
  Code,
  Users,
  Target,
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Home,
  LayoutDashboard,
  Calculator,
  type LucideIcon,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import './asnafpreneur.css'
import Aurora from '@/components/Aurora'

// ─── Types ──────────────────────────────────────────────────────────────────

interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  y?: number
}

interface RotatingTextProps {
  words: string[]
}

interface SpotlightCardProps {
  icon: LucideIcon
  title: string
  description: string
  color?: 'primary' | 'cyan' | 'violet' | 'amber' | 'rose'
}

interface IdeaCardProps {
  emoji: string
  title: string
  description: string
  price: string
}

interface StepData {
  title: string;
  desc: string;
  duration: string;
}

// ─── Animations ─────────────────────────────────────────────────────────────

const FadeInView: React.FC<FadeInViewProps> = ({ children, delay = 0, y = 20 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

const RotatingText: React.FC<RotatingTextProps> = ({ words }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [words.length])

  return (
    <div className="rotating-wrapper">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: 'circOut' }}
          className="gradient-text"
          style={{ display: 'block', position: 'absolute', width: '100%' }}
          translate="no"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  icon: Icon,
  title,
  description,
  color = 'primary',
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className="spotlight-card group"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(155, 89, 182, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10">
        <div className={cn("card-icon", color)}>
          <Icon size={24} aria-hidden="true" />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

const IdeaCard: React.FC<IdeaCardProps> = ({ emoji, title, description, price }) => (
  <motion.div
    className="idea-card"
    whileHover={{ x: 5 }}
  >
    <div className="idea-emoji" aria-hidden="true">{emoji}</div>
    <div className="idea-info">
      <h4>{title}</h4>
      <p>{description}</p>
      <div className="idea-price" translate="no">{price}</div>
    </div>
  </motion.div>
)

const IncomeCalculator: React.FC = () => {
  const [users, setUsers] = useState(50)
  const [price, setPrice] = useState(49)

  const revenue = users * price

  return (
    <div className="income-calculator backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 calc-icon-bg rounded-lg">
          <Calculator className="calc-icon" size={20} aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-white m-0">Kalkulator Pendapatan SaaS</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm calc-label">
            <span>Jumlah Pelanggan (Subs)</span>
            <span className="font-mono" translate="no">{users} orang</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            aria-label="Jumlah Pelanggan"
            value={users}
            onChange={(e) => setUsers(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm calc-label">
            <span>Yuran Langganan / Bulan</span>
            <span className="font-mono" translate="no">RM&nbsp;{price}</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            aria-label="Yuran Langganan"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-white/10 mt-6">
          <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Potensi Recurring Revenue</div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black calc-value" translate="no">RM&nbsp;{revenue.toLocaleString()}</span>
            <span className="calc-value-sub font-medium">/ bulan</span>
          </div>
          <p className="text-[10px] text-white/40 mt-3 leading-relaxed">
            *Ini adalah anggaran pendapatan kasar berdasarkan model langganan bulanan.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS: StepData[] = [
  {
    title: 'Fasa 1: AI Foundation',
    desc: 'Belajar Prompt Engineering, Vibe Coding (Next.js/React), dan design thinking. Fokus pada membina MVP (Minimum Viable Product).',
    duration: 'Bulan 1–4',
  },
  {
    title: 'Fasa 2: Builder Sprint',
    desc: 'Membangunkan SaaS yang sebenar. Integrasi Stripe/Billplz untuk payment. Ujian beta kepada pengguna real-world.',
    duration: 'Bulan 5–8',
  },
  {
    title: 'Fasa 3: Scale & Launch',
    desc: 'Marketing menggunakan AI Automation. Pelancaran rasmi dan scaling ke pasaran global. Persediaan untuk Seed Funding.',
    duration: 'Bulan 9–12',
  },
]

const SPONSORS = [
  { icon: '🕌', name: 'PUSPA KL & Selangor' },
  { icon: '🛡️', name: 'HIJRAH Selangor' },
  { icon: '🏦', name: 'Bank Muamalat (iTEKAD)' },
  { icon: '💻', name: 'PUSPA Digital Lab' },
  { icon: '🌐', name: 'MAIWP Zakat' },
  { icon: '🏫', name: 'Yayasan PUSPA' },
  { icon: '📊', name: 'MDEC Digital Boost' },
  { icon: '🤝', name: 'YTN-Islam Selangor' },
  // Duplicate for infinite scroll loop
  { icon: '🕌', name: 'PUSPA KL & Selangor' },
  { icon: '🛡️', name: 'HIJRAH Selangor' },
  { icon: '🏦', name: 'Bank Muamalat (iTEKAD)' },
  { icon: '💻', name: 'PUSPA Digital Lab' },
  { icon: '🌐', name: 'MAIWP Zakat' },
  { icon: '🏫', name: 'Yayasan PUSPA' },
  { icon: '📊', name: 'MDEC Digital Boost' },
  { icon: '🤝', name: 'YTN-Islam Selangor' },
]

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AsnafpreneurLanding() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')
  const { scrollYProgress } = useScroll()
  const setView = useAppStore((s) => s.setView)

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Automatic Active Section Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    const sections = ['hero', 'program', 'cara', 'saas', 'sponsor']
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className="asnafpreneur-root">
      <div className="grain-overlay" />

      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--accent-primary)',
          zIndex: 1000,
          transformOrigin: '0%',
        }}
      />

      {/* Navigation */}
      <nav className="pill-nav" aria-label="Main Navigation">
        {[
          { id: 'hero', label: 'Mula' },
          { id: 'program', label: 'Program' },
          { id: 'cara', label: 'Cara' },
          { id: 'saas', label: 'SaaS' },
          { id: 'sponsor', label: 'Sponsor' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={cn(activeSection === item.id && "active")}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="absolute inset-0 z-0">
          <Aurora
            colorStops={['#101415', '#9b59b6', '#00fbfb']}
            speed={0.5}
            amplitude={1.5}
          />
        </div>
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content">
          <FadeInView delay={0}>
            <div className="hero-badge">
              <span className="dot" />
              PENDAFTARAN DIBUKA&nbsp;—&nbsp;2026
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h1>
              Dari Asnaf ke<br />
              <RotatingText words={['Usahawan AI', 'SaaS Developer', 'Digital CEO']} />
            </h1>
          </FadeInView>

          <FadeInView delay={0.2}>
            <p className="hero-subtitle">
              Program keusahawanan AI pertama di Malaysia. Bina bisnes perisian SaaS — modal RM200/bulan, potensi pendapatan RM2,000–10,000/bulan. 100% tajaan penuh.
            </p>
          </FadeInView>

          <FadeInView delay={0.3}>
            <div className="cta-group">
              <button type="button" className="btn-primary" onClick={() => scrollToSection('daftar')}>
                Daftar Sekarang <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="btn-secondary" onClick={() => scrollToSection('program')}>
                Bagaimana ia Berfungsi
              </button>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { value: 'RM0', label: 'Kos Latihan' },
            { value: '12', label: 'Bulan Inkubasi' },
            { value: '100%', label: 'Tajaan Penuh' },
            { value: 'AI', label: 'Fokus Utama' }
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number" translate="no">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" aria-hidden="true" />

      {/* Program Features */}
      <section id="program">
        <div className="section-header">
          <span className="section-tag primary">Modul Utama</span>
          <h2>Kenapa ASNAFPRENEUR?</h2>
          <p>Kami tidak mengajar cara manual. Kami mengajar cara membina empayar digital menggunakan kuasa AI.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-item-large">
            <SpotlightCard
              icon={Brain}
              title="AI Proficiency Mastery"
              description="Belajar menggunakan ChatGPT, Claude, dan Midjourney untuk menggantikan 80% kerja manual dalam bisnes. Kami ajar advance prompt engineering yang tidak diajar di tempat lain."
              color="primary"
            />
          </div>
          <div className="bento-item">
            <SpotlightCard
              icon={Code}
              title="Vibe Coding"
              description="Bina apps tanpa perlu hafal sintaks. Fokus pada logic."
              color="cyan"
            />
          </div>
          <div className="bento-item">
            <SpotlightCard
              icon={Zap}
              title="SaaS Ecosystem"
              description="Lancar perisian SaaS sendiri untuk recurring revenue."
              color="violet"
            />
          </div>
          <div className="bento-item-wide">
            <SpotlightCard
              icon={Target}
              title="Market Validation & Growth"
              description="Kami bantu validate idea SaaS anda supaya ia betul-betul ada pembeli sebelum anda mula bina. Akses kepada database asnaf untuk market testing."
              color="amber"
            />
          </div>
          <div className="bento-item">
            <SpotlightCard
              icon={Shield}
              title="Funding 2026"
              description="Tajaan penuh token AI dan server."
              color="rose"
            />
          </div>
          <div className="bento-item">
            <SpotlightCard
              icon={Users}
              title="Mentor Network"
              description="Akses terus kepada founder SaaS."
              color="primary"
            />
          </div>
        </div>
      </section>

      <div className="divider" aria-hidden="true" />

      {/* How it works (Stepper) */}
      <section id="cara">
        <div className="section-header">
          <span className="section-tag violet">Roadmap 2026</span>
          <h2>Laluan Kejayaan Anda</h2>
          <p>Dari zero ke Digital CEO dalam masa 12 bulan melalui 3 fasa intensif.</p>
        </div>

        <div className="stepper">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={cn("step", activeStep >= i && "active")}
              onMouseEnter={() => setActiveStep(i)}
            >
              <div className="step-number" translate="no">{i + 1}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <span className="step-duration">{step.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" aria-hidden="true" />

      {/* SaaS Ideas */}
      <section id="saas">
        <div className="section-header">
          <span className="section-tag cyan">Idea Bisnes</span>
          <h2>Apa yang Anda Boleh Bina?</h2>
          <p>Potensi SaaS yang asnaf boleh bina menggunakan AI dengan kos yang sangat rendah.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">
          <div className="lg:col-span-7 ideas-grid">
            {[
              { emoji: '🏪', title: 'KedaiAI', desc: 'SaaS untuk bantu kedai runcit auto-generate caption & poster marketing harian.', price: 'RM&nbsp;49/bulan' },
              { emoji: '📝', title: 'TutorBot', desc: 'Platform AI untuk bantu pelajar sekolah buat latihan subjek mengikut silibus KPM.', price: 'RM&nbsp;29/bulan' },
              { emoji: '📋', title: 'HR-Simple', desc: 'Sistem pengurusan staf & payroll untuk SME yang tak nak guna software mahal.', price: 'RM&nbsp;99/bulan' },
              { emoji: '⚖️', title: 'Shariah-Check', desc: 'AI tool untuk check status pelaburan atau kontrak mengikut hukum Shariah secara pantas.', price: 'RM&nbsp;59/bulan' }
            ].map((idea, i) => (
              <IdeaCard
                key={i}
                emoji={idea.emoji}
                title={idea.title}
                description={idea.desc}
                price={idea.price}
              />
            ))}
          </div>
          <div className="lg:col-span-5">
            <FadeInView delay={0.4}>
              <IncomeCalculator />
            </FadeInView>
          </div>
        </div>
      </section>

      <div className="divider" aria-hidden="true" />

      {/* Sponsors */}
      <section id="sponsor" className="logo-section">
        <div className="section-header mb-8">
          <p className="text-xs uppercase tracking-[2px]">Dibiayai & Disokong Oleh</p>
        </div>
        <div className="logo-track">
          {SPONSORS.map((logo, i) => (
            <div key={i} className="logo-item">
              <span className="logo-icon" aria-hidden="true">{logo.icon}</span>
              <span translate="no">{logo.name}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" aria-hidden="true" />

      {/* CTA Final */}
      <section id="daftar" className="cta-final">
        <div className="cta-final-bg" />
        <div className="cta-final-content">
          <FadeInView delay={0}>
            <h2>Ubah Masa Depan Anda Hari Ini</h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p>Penyertaan adalah terhad kepada 50 asnaf terpilih di Selangor &amp; KL bagi kohort pertama 2026.</p>
          </FadeInView>
          <FadeInView delay={0.2}>
            <div className="cta-group">
              <button type="button" className="btn-primary" onClick={() => setView('dashboard')}>
                Login ke PUSPA & Daftar <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Footer */}
      <footer role="contentinfo">
        <p>
          © 2026 ASNAFPRENEUR — Program di bawah naungan{' '}
          <button type="button" className="text-accent-primary hover:underline bg-transparent border-none p-0 cursor-pointer">
            PUSPA KL &amp; Selangor
          </button>.
        </p>
      </footer>

      {/* Mobile Dock */}
      <div className="dock-wrapper">
        <div className="dock" role="navigation" aria-label="Mobile Navigation">
          {[
            { id: 'hero', icon: Home, label: 'Mula' },
            { id: 'program', icon: LayoutDashboard, label: 'Program' },
            { id: 'saas', icon: Bot, label: 'SaaS' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className="dock-item"
              aria-label={item.label}
              onClick={() => scrollToSection(item.id)}
            >
              <item.icon size={20} />
            </button>
          ))}
          <button
            type="button"
            className="dock-item"
            aria-label="Daftar"
            onClick={() => setView('dashboard')}
          >
            <Rocket size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
