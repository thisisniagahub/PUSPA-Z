import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/v1/cases — List cases with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const priority = searchParams.get('priority') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { caseNumber: { contains: search } },
        { description: { contains: search } },
        { member: { name: { contains: search } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (priority) {
      where.priority = priority
    }

    const [cases, total] = await Promise.all([
      db.case.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              icNumber: true,
            },
          },
          notes: {
            include: {
              author: {
                select: { id: true, name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.case.count({ where }),
    ])

    // Mask IC numbers for PDPA compliance
    const maskedCases = cases.map((c) => ({
      ...c,
      member: {
        ...c.member,
        icNumber: c.member.icNumber ? '****' + c.member.icNumber.slice(-4) : null,
      },
    }))

    return NextResponse.json({
      data: maskedCases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

// POST /api/v1/cases — Create a new case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    const requiredFields = ['memberId', 'type']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    // Validate type
    const validTypes = ['welfare', 'medical', 'education', 'housing', 'emergency', 'financial']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate member exists
    const member = await db.member.findUnique({
      where: { id: body.memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Generate case number
    const caseCount = await db.case.count()
    const caseNumber = `KES-${String(caseCount + 1).padStart(5, '0')}-${new Date().getFullYear()}`

    const caseRecord = await db.case.create({
      data: {
        caseNumber,
        memberId: body.memberId,
        type: body.type,
        priority: body.priority || 'medium',
        status: 'draft',
        description: body.description || null,
        requestedAmount: body.requestedAmount ? parseFloat(body.requestedAmount) : null,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            icNumber: true,
          },
        },
      },
    })

    // Mask IC number for PDPA compliance
    const maskedCaseRecord = {
      ...caseRecord,
      member: {
        ...caseRecord.member,
        icNumber: caseRecord.member.icNumber ? '****' + caseRecord.member.icNumber.slice(-4) : null,
      },
    }

    return NextResponse.json({ data: maskedCaseRecord }, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}
