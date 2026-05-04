import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const riskLevel = searchParams.get('riskLevel') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (riskLevel) {
      where.riskLevel = riskLevel
    }

    const [verifications, total] = await Promise.all([
      db.eKYCVerification.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              icNumber: true,
              phone: true,
              email: true,
              asnafCategory: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.eKYCVerification.count({ where }),
    ])

    // Compute stats
    const allVerifications = await db.eKYCVerification.findMany({
      select: { status: true, riskLevel: true },
    })

    const pendingCount = allVerifications.filter((v) => v.status === 'pending' || v.status === 'submitted' || v.status === 'under_review').length
    const verifiedCount = allVerifications.filter((v) => v.status === 'verified').length
    const rejectedCount = allVerifications.filter((v) => v.status === 'rejected').length
    const highRiskCount = allVerifications.filter((v) => v.riskLevel === 'high').length

    return NextResponse.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: allVerifications.length,
        pendingCount,
        verifiedCount,
        rejectedCount,
        highRiskCount,
      },
    })
  } catch (error) {
    console.error('eKYC GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch eKYC verifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, icFrontUrl, icBackUrl, selfieUrl, ocrExtracted, faceMatchScore, riskLevel, notes } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Check member exists
    const member = await db.member.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const validRiskLevels = ['pending', 'low', 'medium', 'high']
    if (riskLevel && !validRiskLevels.includes(riskLevel)) {
      return NextResponse.json({ error: 'Invalid risk level' }, { status: 400 })
    }

    const verification = await db.eKYCVerification.create({
      data: {
        memberId,
        icFrontUrl: icFrontUrl || null,
        icBackUrl: icBackUrl || null,
        selfieUrl: selfieUrl || null,
        ocrExtracted: ocrExtracted ? JSON.stringify(ocrExtracted) : null,
        faceMatchScore: faceMatchScore != null ? parseFloat(faceMatchScore) : null,
        riskLevel: riskLevel || 'pending',
        status: 'pending',
        notes: notes || null,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            icNumber: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ verification }, { status: 201 })
  } catch (error) {
    console.error('eKYC POST error:', error)
    return NextResponse.json({ error: 'Failed to create eKYC verification' }, { status: 500 })
  }
}
