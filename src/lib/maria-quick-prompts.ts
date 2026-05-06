import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  HandCoins,
  Heart,
  ShieldCheck,
  Users,
  Sparkles,
  HandHeart,
} from 'lucide-react'

export interface MariaPromptSuggestion {
  /** Stable key for lists */
  id: string
  /** Label untuk cip bergulir / mobile pendek */
  chipShort: string
  /** Teks penuh pada butang tablet/desktop */
  title: string
  /** Mesej yang dihantar kepada Maria — jelas untuk tool calls */
  prompt: string
  icon: LucideIcon
}

/**
 * Cadangan pantas konsisten antara panel Maria dan halaman AI.
 * Prompt digubal untuk mencetuskan penggunaan alatan seperti ringkasan papan pemuka,
 * kes aktif, statistik sumbangan, pematuhan, dll.
 */
export const MARIA_QUICK_PROMPTS: MariaPromptSuggestion[] = [
  {
    id: 'dash-overview',
    chipShort: 'Papan pemuka',
    title: 'Gambaran papan pemuka hari ini',
    prompt:
      'Berikan gambaran papan pemuka PUSPA untuk masa sekarang: ringkaskan kes aktiviti utama, situasi sumbangan terbaru atau trend ringkas jika anda boleh akses sistem, serta sebut sama ada pangkalan data tersedia. Gunakan fungsi/dashboard dan data dalaman jika tersedia; jika tidak, katakan apa yang perlu dibuka.',
    icon: LayoutDashboard,
  },
  {
    id: 'cases-active',
    chipShort: 'Kes aktif',
    title: 'Kes kritikal & tindakan lanjut',
    prompt:
      'Senaraikan kes asnaf atau kes aktif yang memerlukan tindakan serta-merta. Sekiranya anda boleh menggunakan data aplikasi: nyatakan status, nama ringkas kes (ikut privasi semasa), dan cadangkan dua langkah operasi untuk pentadbiran.',
    icon: FileText,
  },
  {
    id: 'donations-stats',
    chipShort: 'Trend derma',
    title: 'Analisis ringkas sumbangan',
    prompt:
      'Analisis ringkas sumbangan: banding atau ringkaskan statistik sumbangan bulan semasa atau terkini menggunakan data sistem. Tekankan jumlah, corak utama, serta 2–3 poin yang membantu juruaudit atau pentadbiran membuat keputusan.',
    icon: HandCoins,
  },
  {
    id: 'donors-activity',
    chipShort: 'Penderma',
    title: 'Aktiviti & nilai penderma',
    prompt:
      'Ringkaskan aktiviti penderma utama: sumbangan terbaru atau penderma bernilai tinggi menggunakan data rekod sistem jika anda boleh aksesnya. Tekankan apa yang boleh difokus dalam hubungan komunikasi minggu ini.',
    icon: Heart,
  },
  {
    id: 'compliance',
    chipShort: 'Pematuhan',
    title: 'Status pematuhan & dokumentasi',
    prompt:
      'Apakah status pematuhan, audit, atau isu dokumentasi kritikal daripada sistem sekarang yang perlu disemak hari ini? Gunakan pemeriksaan atau data rasmi aplikasi sekiranya tersedia; jika gagal nyatakan punca ringkas.',
    icon: ShieldCheck,
  },
  {
    id: 'members-snapshot',
    chipShort: 'Ahli asnaf',
    title: 'Statistik ahli & taburan ringkas',
    prompt:
      'Berikan pandangan cepat kepada statistik ahli asnaf: taburan, trend pendaftaran atau garis panduan utama mengikut data yang ada dalam sistem.',
    icon: Users,
  },
  {
    id: 'asnaf-categories-guide',
    chipShort: 'Kategori asnaf',
    title: 'Panduan kategori asnaf PUSPA',
    prompt:
      'Terangkan ringkas bagaimana PUSPA mengelaskan kumpulan asnaf (contoh faktor utama semakan kelayakan) dan apa yang rekod utama perlu dokumentasikan bagi setiap kategori untuk audit yang konsisten — jawab secara amalan pegangan tanpa nama peribadi.',
    icon: Sparkles,
  },
  {
    id: 'volunteers-programmes',
    chipShort: 'Sukarelawan',
    title: 'Sukarelawan & program berjalan',
    prompt:
      'Ringkas tenaga sukarelawan dan program utama yang sedang berjalan: bilangan sukarelawan aktif atau statistik utama, serta cadangan komunikasi jika anda boleh menggunakan data aplikasi tersebut.',
    icon: HandHeart,
  },
]

/** Bilangan pertama untuk grid 2×2 cepat pada mobile (belum termasuk Reset). */
export const MARIA_QUICK_PROMPTS_MOBILE_GRID = 3
