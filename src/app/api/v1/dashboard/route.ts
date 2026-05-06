import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 1. Tentukan julat masa (6 bulan terakhir)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // 2. Ambil data sumbangan (Donation)
    const donations = await db.donation.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    })

    // 3. Ambil data agihan (Disbursement)
    // Nota: Gunakan status yang konsisten berdasarkan Enum di schema.prisma
    const disbursements = await db.disbursement.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        // Cadangan: Pastikan status selari dengan DisbursementStatus enum
        status: { in: ['disbursed', 'verified', 'approved'] }, 
      },
      select: {
        amount: true,
        createdAt: true,
      },
    })

    // 4. Proses data mengikut bulan (Aggregation)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis']
    const trendData: Array<{ name: string; sumbangan: number; agihan: number }> = []

    for (let i = 0; i < 6; i++) {
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() - (5 - i))
      const m = targetDate.getMonth()
      const y = targetDate.getFullYear()

      // Filter & Sum Donations untuk bulan tersebut
      const monthDonations = donations
        .filter(d => {
          const date = new Date(d.createdAt)
          return date.getMonth() === m && date.getFullYear() === y
        })
        .reduce((sum, d) => sum + Number(d.amount || 0), 0)

      // Filter & Sum Disbursements untuk bulan tersebut
      const monthDisbursements = disbursements
        .filter(d => {
          const date = new Date(d.createdAt)
          return date.getMonth() === m && date.getFullYear() === y
        })
        .reduce((sum, d) => sum + Number(d.amount || 0), 0)

      trendData.push({
        name: monthNames[m],
        sumbangan: monthDonations,
        agihan: monthDisbursements,
      })
    }

    // 5. Ambil data Komposisi Asnaf (Pie Chart)
    const asnafRaw = await db.member.groupBy({
      by: ['asnafCategory'],
      _count: { _all: true }
    })

    const asnafData = asnafRaw.map((r, i) => ({
      name: r.asnafCategory ? r.asnafCategory.charAt(0).toUpperCase() + r.asnafCategory.slice(1) : 'Lain-lain',
      value: r._count._all,
      color: `var(--chart-${(i % 5) + 1})`
    }))

    // 6. Ambil data Status Kes (Bar Chart)
    const statusRaw = await db.case.groupBy({
      by: ['status'],
      _count: { _all: true }
    })

    const caseStatusData = statusRaw.map(r => ({
      name: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      total: r._count._all
    }))

    // 7. Ambil KPI Ringkas
    const totalMembers = await db.member.count()
    const activeCases = await db.case.count({ where: { status: { notIn: ['closed', 'rejected'] } } })

    return NextResponse.json({
      success: true,
      data: {
        trend: trendData,
        asnaf: asnafData.length > 0 ? asnafData : null,
        caseStatus: caseStatusData.length > 0 ? caseStatusData : null,
        stats: { totalMembers, activeCases }
      },
    })

  } catch (error) {
    console.error('[DASHBOARD_API_ERROR]:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data trend dashboard' },
      { status: 500 }
    )
  }
}