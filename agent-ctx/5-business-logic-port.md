# Task 5 — Business Logic Port from PUSPA-V4 to V5

## Agent: Business Logic Port
## Status: COMPLETED

## Summary
Ported 6 critical business logic libraries from PUSPA-V4 to V5, adapting all imports, model references, and schema differences.

## Files Created/Modified

### Schema Changes
- `prisma/schema.prisma` — Added 9 fields to Donor model (donorNumber, ic, isAnonymous, preferredContact, status, totalDonated, donationCount, firstDonationAt, lastDonationAt) and 6 fields to Donation model (donorIC, donorEmail, donorPhone, isAnonymous, status, donatedAt)

### New Library Files
1. **`src/lib/case-intelligence.ts`** — Case Intelligence Engine
   - 6 core functions: computeEligibility, computeRecommendation, computeRiskFlags, computeBeneficiary360, computeNextAction, computeDisbursementReconciliation
   - 2 DB-backed wrappers: computeEligibilityFromDB, computeBeneficiary360FromDB
   - Adapted V4 types to V5 schema (ic→icNumber, added eKYC fields, V5 case statuses)

2. **`src/lib/donor-sync.ts`** — Donor Sync Engine
   - 4 core functions: findOrCreateDonorForDonation, findMatchingDonorIdsForDonation, syncDonorTotals, backfillDonorsFromDonations
   - 3 convenience wrappers using default db client
   - Uses createWithGeneratedUniqueValue from sequence.ts

3. **`src/lib/domain.ts`** — Domain Normalization (Bilingual)
   - 10+ domain categories with Malay/English alias maps
   - Normalizer functions and label functions for: member status, marital status, case type, case status, asnaf category, donation category, compliance category, programme category/status, disbursement status, volunteer status

4. **`src/lib/sequence.ts`** — Sequence Generator (Collision-Safe)
   - createWithGeneratedUniqueValue with P2002 retry
   - 3 generators: generateCaseNumber (CAS-YYYYMMDD-XXXX), generateReceiptNumber (RCP-YYYYMMDD-XXXX), generateDonorNumber (DNR-XXXX)

5. **`src/lib/rate-limit.ts`** — Rate Limiter
   - Token bucket with configurable window/max
   - Trusted proxy support, X-RateLimit-* headers
   - 4 pre-configured presets: API (100/min), AI (20/min), Auth (5/min), Donation (10/min)

6. **`src/lib/api-utils.ts`** — API Input Validation Utility
   - Pagination, search sanitization, sort parsing
   - Standardized error/success response helpers
   - Body parsing utilities

## Verification
- `bun run db:push` — Schema synced successfully
- `bun run lint` — Passes with zero errors
- Dev server compiles and serves 200 OK
