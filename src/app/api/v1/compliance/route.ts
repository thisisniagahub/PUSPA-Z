import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const [records, total] = await Promise.all([
      db.complianceRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.complianceRecord.count({ where }),
    ])

    // Compute compliance score
    const allRecords = await db.complianceRecord.findMany({
      select: { status: true, category: true, dueDate: true },
    })

    const compliantCount = allRecords.filter((r) => r.status === 'compliant').length
    const overallScore = allRecords.length > 0
      ? Math.round((compliantCount / allRecords.length) * 100)
      : 0

    // Category breakdown
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
    const now = new Date().toISOString().split('T')[0]
    const overdueItems = allRecords.filter((r) =>
      r.status !== 'compliant' && r.status !== 'expired' && r.dueDate && r.dueDate < now
    ).length

    // Status breakdown
    const statusBreakdown: Record<string, number> = {}
    allRecords.forEach((r) => {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1
    })

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        overallScore,
        totalRecords: allRecords.length,
        compliantCount,
        overdueCount: overdueItems,
        categoryScores,
        statusBreakdown,
      },
    })
  } catch (error) {
    console.error('Compliance GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, status, dueDate, assignedTo, evidenceUrl, notes } = body

    // Validation
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const validCategories = ['rosm', 'lhdn', 'pdpa', 'internal', 'audit']
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Valid category is required (rosm, lhdn, pdpa, internal, audit)' }, { status: 400 })
    }

    const validStatuses = ['pending', 'compliant', 'non_compliant', 'expired', 'under_review']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const record = await db.complianceRecord.create({
      data: {
        title,
        description: description || null,
        category,
        status: status || 'pending',
        dueDate: dueDate || null,
        evidenceUrl: evidenceUrl || null,
        notes: notes || null,
        assignedTo: assignedTo || null,
      },
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    console.error('Compliance POST error:', error)
    return NextResponse.json({ error: 'Failed to create compliance record' }, { status: 500 })
  }
}
