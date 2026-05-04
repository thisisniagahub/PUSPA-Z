import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Demo data used when database is empty
function getDemoMetrics() {
  return {
    totalMembers: 1284,
    activeCases: 47,
    totalDonations: 284750,
    totalDisbursements: 198320,
    activeProgrammes: 12,
    totalVolunteers: 89,
    complianceScore: 94.5,
    pendingEkyc: 23,
  }
}

function getDemoDonationTrends() {
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun']
  return months.map((month, i) => ({
    month,
    zakat: 12000 + Math.floor(Math.random() * 8000),
    sadaqah: 8000 + Math.floor(Math.random() * 6000),
    waqf: 4000 + Math.floor(Math.random() * 4000),
    infaq: 6000 + Math.floor(Math.random() * 5000),
    general: 2000 + Math.floor(Math.random() * 3000),
  }))
}

function getDemoMemberBreakdown() {
  return [
    { category: 'Fakir', count: 342 },
    { category: 'Miskin', count: 418 },
    { category: 'Amil', count: 156 },
    { category: 'Gharim', count: 124 },
    { category: 'Riqab', count: 67 },
    { category: 'Gharim (Debt)', count: 89 },
    { category: 'Ibn Sabil', count: 52 },
    { category: 'Muallaf', count: 36 },
  ]
}

function getDemoRecentActivities() {
  const now = new Date()
  return [
    {
      id: 'demo_1',
      type: 'member_created',
      title: 'Ahli baru didaftarkan',
      description: 'Ahmad bin Hassan didaftarkan sebagai ahli baru (Fakir)',
      category: 'member',
      createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: 'demo_2',
      type: 'donation_received',
      title: 'Sumbangan diterima',
      description: 'RM 5,000 zakat diterima daripada Syarikat Maju Jaya',
      category: 'donation',
      createdAt: new Date(now.getTime() - 18 * 60000).toISOString(),
    },
    {
      id: 'demo_3',
      type: 'case_updated',
      title: 'Kes dikemas kini',
      description: 'Kes #KES-2024-0042 dipindahkan ke peringkat penilaian',
      category: 'case',
      createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
    },
    {
      id: 'demo_4',
      type: 'disbursement_approved',
      title: 'Agihan diluluskan',
      description: 'RM 3,500 diluluskan untuk bantuan perubatan Aminah binti Ali',
      category: 'disbursement',
      createdAt: new Date(now.getTime() - 120 * 60000).toISOString(),
    },
    {
      id: 'demo_5',
      type: 'programme_started',
      title: 'Program dimulakan',
      description: 'Program Bimbingan Akademik fasa 3 bermula',
      category: 'programme',
      createdAt: new Date(now.getTime() - 180 * 60000).toISOString(),
    },
    {
      id: 'demo_6',
      type: 'ekyc_verified',
      title: 'eKYC disahkan',
      description: 'Pengesahan identiti Mohd Razak bin Ismail berjaya',
      category: 'compliance',
      createdAt: new Date(now.getTime() - 240 * 60000).toISOString(),
    },
    {
      id: 'demo_7',
      type: 'volunteer_registered',
      title: 'Sukarelawan baru',
      description: 'Siti Nurhaliza mendaftar sebagai sukarelawan',
      category: 'volunteer',
      createdAt: new Date(now.getTime() - 300 * 60000).toISOString(),
    },
    {
      id: 'demo_8',
      type: 'donation_received',
      title: 'Sumbangan diterima',
      description: 'RM 1,200 sadaqah diterima secara dalam talian',
      category: 'donation',
      createdAt: new Date(now.getTime() - 360 * 60000).toISOString(),
    },
    {
      id: 'demo_9',
      type: 'case_created',
      title: 'Kes baru dicipta',
      description: 'Kes bantuan kecemasan #KES-2024-0043 didaftarkan',
      category: 'case',
      createdAt: new Date(now.getTime() - 420 * 60000).toISOString(),
    },
    {
      id: 'demo_10',
      type: 'compliance_review',
      title: 'Semakan pematuhan',
      description: 'Audit dalaman ROSM suku tahunan selesai',
      category: 'compliance',
      createdAt: new Date(now.getTime() - 480 * 60000).toISOString(),
    },
  ]
}

export async function GET() {
  try {
    // Try to get real data from database
    const [
      totalMembers,
      activeCases,
      donations,
      disbursements,
      activeProgrammes,
      totalVolunteers,
      complianceRecords,
      pendingEkyc,
      recentActivities,
    ] = await Promise.all([
      db.member.count(),
      db.case.count({ where: { status: { notIn: ['closed', 'rejected'] } } }),
      db.donation.aggregate({ _sum: { amount: true } }),
      db.disbursement.aggregate({ _sum: { amount: true } }),
      db.programme.count({ where: { status: 'active' } }),
      db.volunteer.count({ where: { status: 'active' } }),
      db.complianceRecord.findMany(),
      db.member.count({ where: { ekycStatus: 'pending' } }),
      db.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          category: true,
          createdAt: true,
        },
      }),
    ])

    // Calculate compliance score
    let complianceScore = 94.5 // default demo
    if (complianceRecords.length > 0) {
      const compliant = complianceRecords.filter(
        (r) => r.status === 'compliant'
      ).length
      complianceScore = Math.round((compliant / complianceRecords.length) * 100 * 10) / 10
    }

    // Monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const recentDonations = await db.donation.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        category: true,
        amount: true,
        createdAt: true,
      },
    })

    // Group donations by month and category
    const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
    const donationByMonth: Record<string, { zakat: number; sadaqah: number; waqf: number; infaq: number; general: number }> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      donationByMonth[key] = { zakat: 0, sadaqah: 0, waqf: 0, infaq: 0, general: 0 }
    }

    recentDonations.forEach((d) => {
      const key = `${new Date(d.createdAt).getFullYear()}-${String(new Date(d.createdAt).getMonth() + 1).padStart(2, '0')}`
      if (donationByMonth[key]) {
        const cat = d.category as keyof typeof donationByMonth[string]
        if (cat in donationByMonth[key]) {
          donationByMonth[key][cat] += d.amount
        }
      }
    })

    const donationTrends = Object.entries(donationByMonth).map(([key, values]) => {
      const [year, month] = key.split('-')
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
        ...values,
      }
    })

    // Member breakdown by asnaf category
    const memberBreakdownRaw = await db.member.groupBy({
      by: ['asnafCategory'],
      _count: { asnafCategory: true },
    })

    const categoryLabels: Record<string, string> = {
      fakir: 'Fakir',
      miskin: 'Miskin',
      amil: 'Amil',
      gharim: 'Gharim',
      riqab: 'Riqab',
      'ibn sabil': 'Ibn Sabil',
      muallaf: 'Muallaf',
    }

    const memberBreakdown = memberBreakdownRaw.map((item) => ({
      category: categoryLabels[item.asnafCategory] || item.asnafCategory,
      count: item._count.asnafCategory,
    }))

    // Determine if we should use demo data
    const hasData = totalMembers > 0

    const metrics = hasData
      ? {
          totalMembers,
          activeCases,
          totalDonations: donations._sum.amount || 0,
          totalDisbursements: disbursements._sum.amount || 0,
          activeProgrammes,
          totalVolunteers,
          complianceScore,
          pendingEkyc,
        }
      : getDemoMetrics()

    const trends = hasData && recentDonations.length > 0 ? donationTrends : getDemoDonationTrends()
    const breakdown = hasData && memberBreakdown.length > 0 ? memberBreakdown : getDemoMemberBreakdown()
    const activities = hasData && recentActivities.length > 0
      ? recentActivities.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        }))
      : getDemoRecentActivities()

    return NextResponse.json({
      metrics,
      donationTrends: trends,
      memberBreakdown: breakdown,
      recentActivities: activities,
      isDemoData: !hasData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    // Fallback to demo data on any error
    return NextResponse.json({
      metrics: getDemoMetrics(),
      donationTrends: getDemoDonationTrends(),
      memberBreakdown: getDemoMemberBreakdown(),
      recentActivities: getDemoRecentActivities(),
      isDemoData: true,
    })
  }
}
