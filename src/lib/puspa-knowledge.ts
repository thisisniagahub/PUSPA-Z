// PUSPA V4 — Maria Puspa Knowledge Base
// Comprehensive PUSPA organizational data for RAG-based responses
// This data is injected into the system prompt for accurate, grounded answers

export const PUSPA_KNOWLEDGE_BASE = `
## PUSPA — Pertubuhan Urus Peduli Asnaf (Official Knowledge Base)

### Identity & Registration
- Full Name: Pertubuhan Urus Peduli Asnaf (PUSPA)
- Acronym: PUSPA
- Registration: PPM-024-10-05012022
- Geographic Focus: Kuala Lumpur and Selangor
- Primary Areas: Hulu Klang, Taman Permata, Taman Melawati, Kg Fajar, Klang Gate, Gombak
- Official Website: https://puspa.org.my/ (under construction as of 2026)
- Email: salam.puspaKL@gmail.com
- Phone: +6012-3183369
- Address: 2253, Jalan Permata 22, Taman Permata, 53300 Gombak, Selangor
- Donation Account: Maybank 562209677503
- Facebook: Pertubuhan Urus Peduli Asnaf KL & Selangor

### Leadership (Carta Administrasi 2025)
- Chairman (Pengerusi): Dato' Dr Narimah Awin
- Deputy Chairman (Timbalan Pengerusi): Datin Noor Khayatee Mohd Adnan
- Secretary 1 (Setiausaha 1): Puan Faeza Arashah
- Secretary 2 (Setiausaha 2): Tuan HJ Mohamad Zaki MD Zakaria
- Treasurer (Bendahari): Puan HJH Shahidah Hashim
- Auditor 1 (Pemeriksa Kira-Kira): Puan HJH Mahidah Ibrahim
- Auditor 2: Puan HJH Fariza Hashim
- Religious Adviser (Penasihat Agama): Ustaz HJ Mohammad Yodi Tohir
- General Adviser (Penasihat Umum): Datuk Profesor Emeritus HJ Ismail Hassan
NOTE: Updated from 2025 official admin chart. Previous 2023 data listed Treasurer as YM Raja Nuraini Raja Hassan — role may have changed.

### Verified Partners & Funders
- Perumahan Kinrara Berhad (PKB) — Major funder via zakat
- S P Setia Foundation / S P Setia — Major partner for tuition & Ramadan programmes
- Jaya Grocer — Donated 100 food packs (Sep 2021)
- Free Food Society — Distribution/documentation partner
- Kloth Cares / Kloth Circularity — Upcycled curtain distribution partner
- Lembaga Zakat Selangor (LZS) — Strategic partner in financial literacy
- ASNB — Strategic partner in 2023 financial literacy programme
- AKPK — Strategic partner in 2023 financial literacy programme

### Verified Programmes (Third-Party Corroborated)
1. 9 Sep 2021 — Food-pack distribution: 100 Jaya Grocer food packs for asnaf families in Hulu Klang (Taman Permata, Taman Melawati, Kg Fajar, Klang Gate)
2. 30 Apr 2022 — Annual zakat handover at Masjid Lama Al Hidayah, Taman Melawati
3. 20 Feb–2 Mar 2023 — Sincerely, Setia Tuition Mission: English, BM, Mathematics, extracurricular activities for asnaf children at Dewan Serbaguna MPAJ, Gombak
4. 14 Apr 2023 — Financial Literacy Programme: 80 asnaf individuals, RM300/pax zakat, RM80 basket, 20 volunteers, 100 volunteer hours (with LZS, ASNB, AKPK, PKB)
5. 15 Apr 2023 — Ramadan Mubarak with Asnaf Children & Families: 162 beneficiaries, 20 volunteers, 80 volunteer hours at Masjid Al Hidayah, Taman Melawati
6. 27 Apr 2023 — The Star coverage: 160+ adults & children, 122 curtain sets, PUSPA chair present, PKB zakat funding
7. 17 Dec 2023 — First AGM

### Self-Reported Programme Portfolio (Official Website)
- Food Aid: 1,200+ families, monthly distribution, 15 locations
- Education Support: 850+ students, 50+ tutors, 95% pass rate
- Skills Training: 300+ participants, 12 courses, 70% employment
- Healthcare Support: 2,000+ beneficiaries, 25+ doctors, quarterly checkups
- Overall: 5,000+ families supported, 100+ active volunteers, 25+ community programmes, 7 years of service
NOTE: These metrics are self-reported and not independently verified. Cite as "menurut laman web PUSPA" when referencing.

### Transparency Assessment
- Audited financial statements: Not publicly available
- Annual reports: Not publicly available
- ROS registration: PPM-024-10-05012022 (registered)
- Constitution/bylaws: Not publicly available
- Current board page: Not on official website
- Donor list: Not published
- Tax deductibility: Not confirmed

### Key Dates
- Founded: Claims "since 2018" (self-reported)
- Earliest verified public activity: September 2021
- First AGM: 17 December 2023
- Current year: 2026

### Important Notes for AI Responses
1. When asked about PUSPA metrics, always distinguish between "verified" and "self-reported" data
2. Leadership names are from 2023 — may not reflect current (2026) positions
3. The official website is under construction — some data may be outdated
4. The acronym PUSPA is also used by unrelated entities (UniSZA academic unit, Kelantan org) — always clarify this is Pertubuhan Urus Peduli Asnaf in KL/Selangor
5. ROS number PPM-024-10-05012022 is confirmed in the system registration
`

/**
 * Get the PUSPA knowledge context for injection into system prompts
 */
export function getPuspaKnowledgeContext(): string {
  return PUSPA_KNOWLEDGE_BASE
}
