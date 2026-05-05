import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/v1/members — List members with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const asnafCategory = searchParams.get('asnafCategory') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { icNumber: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (asnafCategory) {
      where.asnafCategory = asnafCategory
    }

    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        include: {
          householdMembers: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.member.count({ where }),
    ])

    return NextResponse.json({
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST /api/v1/members — Create a new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    const requiredFields = ['name', 'icNumber']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    // Check for duplicate IC number
    const existing = await db.member.findUnique({
      where: { icNumber: body.icNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A member with this IC number already exists' },
        { status: 409 }
      )
    }

    // Validate asnafCategory
    const validCategories = ['fakir', 'miskin', 'amil', 'gharim', 'riqab', 'ibn_sabil', 'muallaf', 'fisabilillah']
    if (body.asnafCategory && !validCategories.includes(body.asnafCategory)) {
      return NextResponse.json(
        { error: `Invalid asnafCategory. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate gender
    const validGenders = ['male', 'female']
    if (body.gender && !validGenders.includes(body.gender)) {
      return NextResponse.json(
        { error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` },
        { status: 400 }
      )
    }

    const member = await db.member.create({
      data: {
        name: body.name,
        icNumber: body.icNumber,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postcode: body.postcode || null,
        gender: body.gender || null,
        dateOfBirth: body.dateOfBirth || null,
        occupation: body.occupation || null,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : 0,
        householdSize: body.householdSize ? parseInt(body.householdSize) : 1,
        asnafCategory: body.asnafCategory || 'fakir',
        status: body.status || 'active',
        ekycStatus: 'pending',
        notes: body.notes || null,
      },
      include: {
        householdMembers: true,
      },
    })

    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
