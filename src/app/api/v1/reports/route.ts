import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'operational'

    switch (type) {
      case 'operational': {
        // Case stats
        const cases = await db.case.findMany({
          select: { status: true, type: true, createdAt: true },
        })

        const caseStatusCounts: Record<string, number> = {}
        const caseTypeCounts: Record<string, number> = {}
        cases.forEach((c) => {
          caseStatusCounts[c.status] = (caseStatusCounts[c.status] || 0) + 1
          caseTypeCounts[c.type] = (caseTypeCounts[c.type] || 0) + 1
        })

        // Member stats
        const members = await db.member.findMany({
          select: { status: true, asnafCategory: true, createdAt: true },
        })

        const memberStatusCounts: Record<string, number> = {}
        const asnafCategoryCounts: Record<string, number> = {}
        members.forEach((m) => {
          memberStatusCounts[m.status] = (memberStatusCounts[m.status] || 0) + 1
          asnafCategoryCounts[m.asnafCategory] = (asnafCategoryCounts[m.asnafCategory] || 0) + 1
        })

        // Monthly member growth (last 12 months)
        const now = new Date()
        const monthlyGrowth: { month: string; count: number }[] = []
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStr = d.toISOString().slice(0, 7)
          const count = members.filter((m) => {
            const created = new Date(m.createdAt)
            return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()
          }).length
          monthlyGrowth.push({ month: monthStr, count })
        }

        // Activity summary (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const activities = await db.activity.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { category: true, createdAt: true },
        })

        const activityCategoryCounts: Record<string, number> = {}
        activities.forEach((a) => {
          activityCategoryCounts[a.category] = (activityCategoryCounts[a.category] || 0) + 1
        })

        return NextResponse.json({
          type: 'operational',
          caseStats: {
            total: cases.length,
            statusCounts: caseStatusCounts,
            typeCounts: caseTypeCounts,
          },
          memberStats: {
            total: members.length,
            statusCounts: memberStatusCounts,
            asnafCategoryCounts,
            monthlyGrowth,
          },
          activitySummary: {
            totalLast30Days: activities.length,
            categoryCounts: activityCategoryCounts,
          },
        })
      }

      case 'financial': {
        // Donation totals by category
        const donations = await db.donation.findMany({
          select: { amount: true, category: true, createdAt: true, shariahCompliant: true },
        })

        const donationCategoryTotals: Record<string, number> = {}
        donations.forEach((d) => {
          donationCategoryTotals[d.category] = (donationCategoryTotals[d.category] || 0) + d.amount
        })

        // Monthly donation trends (last 12 months)
        const now = new Date()
        const monthlyDonations: { month: string; amount: number }[] = []
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStr = d.toISOString().slice(0, 7)
          const amount = donations
            .filter((don) => {
              const created = new Date(don.createdAt)
              return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()
            })
            .reduce((sum, don) => sum + don.amount, 0)
          monthlyDonations.push({ month: monthStr, amount })
        }

        // Disbursement totals
        const disbursements = await db.disbursement.findMany({
          select: { amount: true, category: true, status: true, createdAt: true },
        })

        const disbursementCategoryTotals: Record<string, number> = {}
        const disbursementStatusTotals: Record<string, number> = {}
        disbursements.forEach((d) => {
          disbursementCategoryTotals[d.category] = (disbursementCategoryTotals[d.category] || 0) + d.amount
          disbursementStatusTotals[d.status] = (disbursementStatusTotals[d.status] || 0) + 1
        })

        // Monthly disbursement trends
        const monthlyDisbursements: { month: string; amount: number }[] = []
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStr = d.toISOString().slice(0, 7)
          const amount = disbursements
            .filter((dis) => {
              const created = new Date(dis.createdAt)
              return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()
            })
            .reduce((sum, dis) => sum + dis.amount, 0)
          monthlyDisbursements.push({ month: monthStr, amount })
        }

        const totalDonations = donations.reduce((s, d) => s + d.amount, 0)
        const totalDisbursed = disbursements
          .filter((d) => d.status === 'disbursed' || d.status === 'verified')
          .reduce((s, d) => s + d.amount, 0)
        const shariahRate = donations.length > 0
          ? Math.round((donations.filter((d) => d.shariahCompliant).length / donations.length) * 100)
          : 100

        return NextResponse.json({
          type: 'financial',
          donationTotals: {
            total: totalDonations,
            categoryTotals: donationCategoryTotals,
            monthlyTrends: monthlyDonations,
            shariahRate,
          },
          disbursementTotals: {
            total: totalDisbursed,
            categoryTotals: disbursementCategoryTotals,
            statusTotals: disbursementStatusTotals,
            monthlyTrends: monthlyDisbursements,
          },
        })
      }

      case 'compliance': {
        // Compliance scores
        const allRecords = await db.complianceRecord.findMany({
          select: { status: true, category: true },
        })

        const compliantCount = allRecords.filter((r) => r.status === 'compliant').length
        const overallScore = allRecords.length > 0
          ? Math.round((compliantCount / allRecords.length) * 100)
          : 0

        const categories = ['rosm', 'lhdn', 'pdpa', 'internal', 'audit'] as const
        const categoryScores: Record<string, { total: number; compliant: number; score: number }> = {}
        for (const cat of categories) {
          const catRecords = allRecords.filter((r) => r.category === cat)
          const catCompliant = catRecords.filter((r) => r.status === 'compliant').length
          categoryScores[cat] = {
            total: catRecords.length,
            compliant: catCompliant,
            score: catRecords.length > 0 ? Math.round((catCompliant / catRecords.length) * 100) : 0,
          }
        }

        // Overdue items
        const overdueRecords = await db.complianceRecord.findMany({
          where: {
            status: { notIn: ['compliant', 'expired'] },
            dueDate: { lt: new Date().toISOString().split('T')[0] },
          },
          orderBy: { dueDate: 'asc' },
          take: 20,
        })

        // Status breakdown
        const statusBreakdown: Record<string, number> = {}
        allRecords.forEach((r) => {
          statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1
        })

        return NextResponse.json({
          type: 'compliance',
          overallScore,
          totalRecords: allRecords.length,
          compliantCount,
          categoryScores,
          statusBreakdown,
          overdueItems: overdueRecords,
        })
      }

      case 'programme': {
        // Programme stats
        const programmes = await db.programme.findMany({
          select: {
            status: true,
            category: true,
            budget: true,
            spent: true,
            targetBeneficiaries: true,
            beneficiaries: { select: { id: true } },
          },
        })

        const programmeStatusCounts: Record<string, number> = {}
        const programmeCategoryCounts: Record<string, number> = {}
        let totalBudget = 0
        let totalSpent = 0
        const budgetUtilization: { name: string; budget: number; spent: number; utilization: number; beneficiaries: number; target: number }[] = []

        programmes.forEach((p) => {
          programmeStatusCounts[p.status] = (programmeStatusCounts[p.status] || 0) + 1
          programmeCategoryCounts[p.category] = (programmeCategoryCounts[p.category] || 0) + 1
          totalBudget += p.budget
          totalSpent += p.spent
          budgetUtilization.push({
            name: '', // Would need name from programme - using generic
            budget: p.budget,
            spent: p.spent,
            utilization: p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0,
            beneficiaries: p.beneficiaries.length,
            target: p.targetBeneficiaries,
          })
        })

        // Re-fetch with names for better display
        const programmesWithNames = await db.programme.findMany({
          select: {
            name: true,
            budget: true,
            spent: true,
            targetBeneficiaries: true,
            status: true,
            beneficiaries: { select: { id: true } },
          },
        })

        const programmeBudgetData = programmesWithNames.map((p) => ({
          name: p.name,
          budget: p.budget,
          spent: p.spent,
          utilization: p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0,
          beneficiaries: p.beneficiaries.length,
          target: p.targetBeneficiaries,
          status: p.status,
        }))

        return NextResponse.json({
          type: 'programme',
          programmeStats: {
            total: programmes.length,
            statusCounts: programmeStatusCounts,
            categoryCounts: programmeCategoryCounts,
            totalBudget,
            totalSpent,
            overallUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
          },
          programmeBudgetData,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid report type. Use: operational, financial, compliance, programme' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
