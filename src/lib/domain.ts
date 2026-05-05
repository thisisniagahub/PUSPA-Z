/**
 * PUSPA V5 — Domain Normalization (Bilingual)
 * Ported from PUSPA-V4/src/lib/domain.ts
 * Enhanced with additional bilingual aliases for V5 schema.
 *
 * Provides:
 * - Value normalization: Malay ↔ English alias mapping
 * - Label rendering: canonical value → Malay display label
 * - Covers: member status, marital status, case type, asnaf category,
 *   donation category, compliance category, programme category/status,
 *   partner type, disbursement status, volunteer status
 */

// ─── Helpers ──────────────────────────────────────────────────────

const sanitizeKey = (value: string) =>
  value.trim().toLowerCase().replace(/[\s-]+/g, '_')

const normalizeAlias = <T extends string>(
  value: string | null | undefined,
  aliases: Record<string, T>
): T | undefined => {
  if (!value) return undefined
  return aliases[sanitizeKey(value)]
}

// ─── Member Status ────────────────────────────────────────────────

export const MEMBER_STATUS_VALUES = ['active', 'inactive', 'blacklisted', 'pending'] as const
export type MemberStatusValue = (typeof MEMBER_STATUS_VALUES)[number]

export const MEMBER_STATUS_LABELS: Record<MemberStatusValue, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  blacklisted: 'Senarai Hitam',
  pending: 'Menunggu',
}

const MEMBER_STATUS_ALIASES: Record<string, MemberStatusValue> = {
  active: 'active',
  aktif: 'active',
  inactive: 'inactive',
  tidak_aktif: 'inactive',
  'tidak aktif': 'inactive',
  blacklisted: 'blacklisted',
  senarai_hitam: 'blacklisted',
  'senarai hitam': 'blacklisted',
  suspended: 'blacklisted',
  ditangguh: 'blacklisted',
  pending: 'pending',
  menunggu: 'pending',
}

// ─── Marital Status ───────────────────────────────────────────────

export const MARITAL_STATUS_VALUES = ['single', 'married', 'divorced', 'widowed'] as const
export type MaritalStatusValue = (typeof MARITAL_STATUS_VALUES)[number]

export const MARITAL_STATUS_LABELS: Record<MaritalStatusValue, string> = {
  single: 'Bujang',
  married: 'Berkahwin',
  divorced: 'Bercerai',
  widowed: 'Janda/Duda',
}

const MARITAL_STATUS_ALIASES: Record<string, MaritalStatusValue> = {
  single: 'single',
  bujang: 'single',
  married: 'married',
  berkahwin: 'married',
  divorced: 'divorced',
  bercerai: 'divorced',
  widowed: 'widowed',
  janda_duda: 'widowed',
  'janda duda': 'widowed',
}

// ─── Case Type ────────────────────────────────────────────────────

export const CASE_TYPE_VALUES = [
  'welfare',
  'medical',
  'education',
  'housing',
  'emergency',
  'financial',
] as const
export type CaseTypeValue = (typeof CASE_TYPE_VALUES)[number]

export const CASE_TYPE_LABELS: Record<CaseTypeValue, string> = {
  welfare: 'Kebajikan',
  medical: 'Perubatan',
  education: 'Pendidikan',
  housing: 'Perumahan',
  emergency: 'Kecemasan',
  financial: 'Kewangan',
}

const CASE_TYPE_ALIASES: Record<string, CaseTypeValue> = {
  welfare: 'welfare',
  kebajikan: 'welfare',
  medical: 'medical',
  perubatan: 'medical',
  health: 'medical',
  kesihatan: 'medical',
  education: 'education',
  pendidikan: 'education',
  housing: 'housing',
  perumahan: 'housing',
  emergency: 'emergency',
  kecemasan: 'emergency',
  financial: 'financial',
  kewangan: 'financial',
}

// ─── Case Status ──────────────────────────────────────────────────

export const CASE_STATUS_VALUES = [
  'draft',
  'intake',
  'verification',
  'assessment',
  'approval',
  'disbursement',
  'follow_up',
  'closed',
  'rejected',
] as const
export type CaseStatusValue = (typeof CASE_STATUS_VALUES)[number]

export const CASE_STATUS_LABELS: Record<CaseStatusValue, string> = {
  draft: 'Draf',
  intake: 'Penerimaan',
  verification: 'Pengesahan',
  assessment: 'Penilaian',
  approval: 'Kelulusan',
  disbursement: 'Pembayaran',
  follow_up: 'Susulan',
  closed: 'Ditutup',
  rejected: 'Ditolak',
}

const CASE_STATUS_ALIASES: Record<string, CaseStatusValue> = {
  draft: 'draft',
  draf: 'draft',
  intake: 'intake',
  penerimaan: 'intake',
  submitted: 'intake',
  verification: 'verification',
  pengesahan: 'verification',
  verifying: 'verification',
  assessment: 'assessment',
  penilaian: 'assessment',
  scoring: 'assessment',
  approval: 'approval',
  kelulusan: 'approval',
  approved: 'approval',
  disbursement: 'disbursement',
  pembayaran: 'disbursement',
  disbursing: 'disbursement',
  follow_up: 'follow_up',
  susulan: 'follow_up',
  closed: 'closed',
  ditutup: 'closed',
  rejected: 'rejected',
  ditolak: 'rejected',
}

// ─── Asnaf Category ───────────────────────────────────────────────

export const ASNAF_CATEGORY_VALUES = [
  'fakir',
  'miskin',
  'amil',
  'muallaf',
  'gharim',
  'riqab',
  'ibn_sabil',
  'fisabilillah',
] as const
export type AsnafCategoryValue = (typeof ASNAF_CATEGORY_VALUES)[number]

export const ASNAF_CATEGORY_LABELS: Record<AsnafCategoryValue, string> = {
  fakir: 'Fakir',
  miskin: 'Miskin',
  amil: 'Amil',
  muallaf: 'Muallaf',
  gharim: 'Gharim',
  riqab: 'Riqab',
  ibn_sabil: 'Ibnu Sabil',
  fisabilillah: 'Fi Sabilillah',
}

const ASNAF_CATEGORY_ALIASES: Record<string, AsnafCategoryValue> = {
  fakir: 'fakir',
  miskin: 'miskin',
  poor: 'miskin',
  amil: 'amil',
  muallaf: 'muallaf',
  mualaf: 'muallaf',
  gharim: 'gharim',
  riqab: 'riqab',
  ibn_sabil: 'ibn_sabil',
  'ibn sabil': 'ibn_sabil',
  'ibnu sabil': 'ibn_sabil',
  ibnu_sabil: 'ibn_sabil',
  fisabilillah: 'fisabilillah',
  'fi sabilillah': 'fisabilillah',
  fi_sabilillah: 'fisabilillah',
}

// ─── Donation Category ────────────────────────────────────────────

export const DONATION_CATEGORY_VALUES = [
  'zakat',
  'sadaqah',
  'waqf',
  'infaq',
  'general',
] as const
export type DonationCategoryValue = (typeof DONATION_CATEGORY_VALUES)[number]

export const DONATION_CATEGORY_LABELS: Record<DonationCategoryValue, string> = {
  zakat: 'Zakat',
  sadaqah: 'Sedekah',
  waqf: 'Wakaf',
  infaq: 'Infak',
  general: 'Umum',
}

const DONATION_CATEGORY_ALIASES: Record<string, DonationCategoryValue> = {
  zakat: 'zakat',
  sadaqah: 'sadaqah',
  sedekah: 'sadaqah',
  charity: 'sadaqah',
  waqf: 'waqf',
  wakaf: 'waqf',
  endowment: 'waqf',
  infaq: 'infaq',
  infak: 'infaq',
  general: 'general',
  umum: 'general',
  other: 'general',
}

// ─── Compliance Category ──────────────────────────────────────────

export const COMPLIANCE_CATEGORY_VALUES = [
  'rosm',
  'lhdn',
  'pdpa',
  'internal',
  'audit',
] as const
export type ComplianceCategoryValue = (typeof COMPLIANCE_CATEGORY_VALUES)[number]

export const COMPLIANCE_CATEGORY_LABELS: Record<ComplianceCategoryValue, string> = {
  rosm: 'ROSM',
  lhdn: 'LHDN',
  pdpa: 'PDPA',
  internal: 'Dalaman',
  audit: 'Audit',
}

const COMPLIANCE_CATEGORY_ALIASES: Record<string, ComplianceCategoryValue> = {
  rosm: 'rosm',
  lhdn: 'lhdn',
  pdpa: 'pdpa',
  internal: 'internal',
  dalaman: 'internal',
  audit: 'audit',
}

// ─── Programme Category ───────────────────────────────────────────

export const PROGRAMME_CATEGORY_VALUES = [
  'food_aid',
  'education',
  'skills_training',
  'healthcare',
  'financial_assistance',
  'community',
  'emergency_relief',
  'dawah',
  'welfare',
  'health',
  'economic',
  'social',
  'religious',
] as const
export type ProgrammeCategoryValue = (typeof PROGRAMME_CATEGORY_VALUES)[number]

export const PROGRAMME_CATEGORY_LABELS: Record<ProgrammeCategoryValue, string> = {
  food_aid: 'Bantuan Makanan',
  education: 'Pendidikan',
  skills_training: 'Latihan Kemahiran',
  healthcare: 'Kesihatan',
  financial_assistance: 'Bantuan Kewangan',
  community: 'Komuniti',
  emergency_relief: 'Bantuan Kecemasan',
  dawah: 'Dakwah',
  welfare: 'Kebajikan',
  health: 'Kesihatan',
  economic: 'Ekonomi',
  social: 'Sosial',
  religious: 'Keagamaan',
}

const PROGRAMME_CATEGORY_ALIASES: Record<string, ProgrammeCategoryValue> = {
  food_aid: 'food_aid',
  education: 'education',
  pendidikan: 'education',
  skills_training: 'skills_training',
  healthcare: 'healthcare',
  health: 'health',
  kesihatan: 'health',
  financial_assistance: 'financial_assistance',
  community: 'community',
  social_welfare: 'community',
  community_development: 'community',
  komuniti: 'community',
  emergency_relief: 'emergency_relief',
  dawah: 'dawah',
  dakwah: 'dawah',
  religious: 'religious',
  keagamaan: 'religious',
  welfare: 'welfare',
  kebajikan: 'welfare',
  economic: 'economic',
  ekonomi: 'economic',
  economic_empowerment: 'economic',
  social: 'social',
  sosial: 'social',
  other: 'community',
}

// ─── Programme Status ─────────────────────────────────────────────

export const PROGRAMME_STATUS_VALUES = ['planning', 'active', 'completed', 'suspended'] as const
export type ProgrammeStatusValue = (typeof PROGRAMME_STATUS_VALUES)[number]

export const PROGRAMME_STATUS_LABELS: Record<ProgrammeStatusValue, string> = {
  planning: 'Dirancang',
  active: 'Aktif',
  completed: 'Siap',
  suspended: 'Ditangguh',
}

const PROGRAMME_STATUS_ALIASES: Record<string, ProgrammeStatusValue> = {
  planning: 'planning',
  dirancang: 'planning',
  planned: 'planning',
  draft: 'planning',
  active: 'active',
  aktif: 'active',
  completed: 'completed',
  siap: 'completed',
  suspended: 'suspended',
  ditangguh: 'suspended',
}

// ─── Disbursement Status ──────────────────────────────────────────

export const DISBURSEMENT_STATUS_VALUES = [
  'pending',
  'approved',
  'disbursed',
  'verified',
  'cancelled',
] as const
export type DisbursementStatusValue = (typeof DISBURSEMENT_STATUS_VALUES)[number]

export const DISBURSEMENT_STATUS_LABELS: Record<DisbursementStatusValue, string> = {
  pending: 'Menunggu',
  approved: 'Diluluskan',
  disbursed: 'Dibayar',
  verified: 'Disahkan',
  cancelled: 'Dibatalkan',
}

const DISBURSEMENT_STATUS_ALIASES: Record<string, DisbursementStatusValue> = {
  pending: 'pending',
  menunggu: 'pending',
  approved: 'approved',
  diluluskan: 'approved',
  disbursed: 'disbursed',
  dibayar: 'disbursed',
  completed: 'disbursed',
  verified: 'verified',
  disahkan: 'verified',
  cancelled: 'cancelled',
  dibatalkan: 'cancelled',
}

// ─── Volunteer Status ─────────────────────────────────────────────

export const VOLUNTEER_STATUS_VALUES = ['active', 'inactive', 'suspended'] as const
export type VolunteerStatusValue = (typeof VOLUNTEER_STATUS_VALUES)[number]

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatusValue, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  suspended: 'Digantung',
}

// ─── Partner Type ─────────────────────────────────────────────────

const PARTNER_TYPE_ALIASES: Record<string, string> = {
  government: 'government',
  kerajaan: 'government',
  corporate: 'corporate',
  korporat: 'corporate',
  ngo: 'ngo',
  academic: 'foundation',
  religious: 'masjid',
  healthcare: 'foundation',
  media: 'foundation',
  community: 'ngo',
  komuniti: 'ngo',
  international: 'foundation',
  other: 'foundation',
  foundation: 'foundation',
  masjid: 'masjid',
  individual: 'individual',
}

const PARTNER_VERIFIED_STATUS_ALIASES: Record<string, string> = {
  claimed: 'claimed',
  unverified: 'claimed',
  pending: 'partner_confirmed',
  partner_confirmed: 'partner_confirmed',
  verified: 'publicly_verified',
  publicly_verified: 'publicly_verified',
}

// ─── Normalizer Functions ─────────────────────────────────────────

export const normalizeMemberStatus = (value: string | null | undefined) =>
  normalizeAlias(value, MEMBER_STATUS_ALIASES)

export const normalizeMaritalStatus = (value: string | null | undefined) =>
  normalizeAlias(value, MARITAL_STATUS_ALIASES)

export const normalizeCaseType = (value: string | null | undefined) =>
  normalizeAlias(value, CASE_TYPE_ALIASES)

export const normalizeCaseStatus = (value: string | null | undefined) =>
  normalizeAlias(value, CASE_STATUS_ALIASES)

export const normalizeAsnafCategory = (value: string | null | undefined) =>
  normalizeAlias(value, ASNAF_CATEGORY_ALIASES)

export const normalizeDonationCategory = (value: string | null | undefined) =>
  normalizeAlias(value, DONATION_CATEGORY_ALIASES)

export const normalizeComplianceCategory = (value: string | null | undefined) =>
  normalizeAlias(value, COMPLIANCE_CATEGORY_ALIASES)

export const normalizeProgrammeCategory = (value: string | null | undefined) =>
  normalizeAlias(value, PROGRAMME_CATEGORY_ALIASES)

export const normalizeProgrammeStatus = (value: string | null | undefined) =>
  normalizeAlias(value, PROGRAMME_STATUS_ALIASES)

export const normalizeDisbursementStatus = (value: string | null | undefined) =>
  normalizeAlias(value, DISBURSEMENT_STATUS_ALIASES)

export const normalizePartnerType = (value: string | null | undefined) =>
  normalizeAlias(value, PARTNER_TYPE_ALIASES) ?? (value ? sanitizeKey(value) : undefined)

export const normalizePartnerRelationship = (value: string | null | undefined) =>
  value?.trim() || undefined

export const normalizePartnerVerifiedStatus = (value: string | null | undefined) =>
  normalizeAlias(value, PARTNER_VERIFIED_STATUS_ALIASES) ??
  (value ? sanitizeKey(value) : undefined)

// ─── Label Functions ──────────────────────────────────────────────

export const getMemberStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeMemberStatus(value)
  return normalized ? MEMBER_STATUS_LABELS[normalized] : value || '-'
}

export const getMaritalStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeMaritalStatus(value)
  return normalized ? MARITAL_STATUS_LABELS[normalized] : value || '-'
}

export const getCaseTypeLabel = (value: string | null | undefined) => {
  const normalized = normalizeCaseType(value)
  return normalized ? CASE_TYPE_LABELS[normalized] : value || '-'
}

export const getCaseStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeCaseStatus(value)
  return normalized ? CASE_STATUS_LABELS[normalized] : value || '-'
}

export const getAsnafCategoryLabel = (value: string | null | undefined) => {
  const normalized = normalizeAsnafCategory(value)
  return normalized ? ASNAF_CATEGORY_LABELS[normalized] : value || '-'
}

export const getDonationCategoryLabel = (value: string | null | undefined) => {
  const normalized = normalizeDonationCategory(value)
  return normalized ? DONATION_CATEGORY_LABELS[normalized] : value || '-'
}

export const getComplianceCategoryLabel = (value: string | null | undefined) => {
  const normalized = normalizeComplianceCategory(value)
  return normalized ? COMPLIANCE_CATEGORY_LABELS[normalized] : value || '-'
}

export const getProgrammeStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeProgrammeStatus(value)
  return normalized ? PROGRAMME_STATUS_LABELS[normalized] : value || '-'
}

export const getProgrammeCategoryLabel = (value: string | null | undefined) => {
  const normalized = normalizeProgrammeCategory(value)
  return normalized ? PROGRAMME_CATEGORY_LABELS[normalized] : value || '-'
}

export const getDisbursementStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeDisbursementStatus(value)
  return normalized ? DISBURSEMENT_STATUS_LABELS[normalized] : value || '-'
}

export const getVolunteerStatusLabel = (value: string | null | undefined) => {
  const normalized = value?.toLowerCase()
  if (normalized && normalized in VOLUNTEER_STATUS_LABELS) {
    return VOLUNTEER_STATUS_LABELS[normalized as VolunteerStatusValue]
  }
  return value || '-'
}
