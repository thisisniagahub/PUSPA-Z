import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const [disbursements, total] = await Promise.all([
      db.disbursement.findMany({
        where,
        include: {
          member: {
            select: { id: true, name: true, icNumber: true, asnafCategory: true },
          },
          case: {
            select: { id: true, caseNumber: true, type: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.disbursement.count({ where }),
    ])

    // Compute stats
    const allDisbursements = await db.disbursement.findMany({
      select: { amount: true, status: true, category: true, createdAt: true },
    })

    const totalDisbursed = allDisbursements
      .filter((d) => d.status === 'disbursed' || d.status === 'verified')
      .reduce((sum, d) => sum + d.amount, 0)

    const pendingCount = allDisbursements.filter((d) => d.status === 'pending').length
    const approvedCount = allDisbursements.filter((d) => d.status === 'approved').length
    const scheduledCount = allDisbursements.filter((d) => d.status === 'approved').length
    const verifiedCount = allDisbursements.filter((d) => d.status === 'verified').length

    return NextResponse.json({
      disbursements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalDisbursed,
        pendingCount,
        approvedCount,
        scheduledCount,
        verifiedCount,
        totalDisbursements: allDisbursements.length,
      },
    })
  } catch (error) {
    console.error('Disbursements GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch disbursements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, caseId, amount, category, paymentMethod, scheduledDate, notes } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const validCategories = ['welfare', 'medical', 'education', 'housing', 'emergency', 'monthly_aid']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (paymentMethod) {
      const validMethods = ['cash', 'bank_transfer', 'cheque']
      if (!validMethods.includes(paymentMethod)) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
      }
    }

    // Verify member exists
    const member = await db.member.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify case exists if provided
    if (caseId) {
      const caseRecord = await db.case.findUnique({ where: { id: caseId } })
      if (!caseRecord) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
      }
    }

    const disbursement = await db.disbursement.create({
      data: {
        memberId,
        caseId: caseId || null,
        amount: parseFloat(amount),
        category,
        status: 'pending',
        paymentMethod: paymentMethod || null,
        scheduledDate: scheduledDate || null,
        notes: notes || null,
      },
      include: {
        member: {
          select: { id: true, name: true, icNumber: true, asnafCategory: true },
        },
        case: {
          select: { id: true, caseNumber: true, type: true },
        },
      },
    })

    return NextResponse.json({ disbursement }, { status: 201 })
  } catch (error) {
    console.error('Disbursements POST error:', error)
    return NextResponse.json({ error: 'Failed to create disbursement' }, { status: 500 })
  }
}
