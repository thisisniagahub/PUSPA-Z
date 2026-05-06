import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { createMemberSchema, validateRequest } from '@/lib/validation'

// GET /api/v1/members — List members with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    // Auth check: any logged-in user can view members
    await requireAuth()

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

    // Mask IC numbers for PDPA compliance
    const maskedMembers = members.map((m) => ({
      ...m,
      icNumber: m.icNumber ? '****' + m.icNumber.slice(-4) : null,
      householdMembers: m.householdMembers.map((hm) => ({
        ...hm,
        icNumber: hm.icNumber ? '****' + hm.icNumber.slice(-4) : null,
      })),
    }))

    return NextResponse.json({
      data: maskedMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: error.message?.includes('Sesi') ? 401 : 500 }
    )
  }
}

// POST /api/v1/members — Create a new member
export async function POST(request: NextRequest) {
  try {
    // Auth check: staff and above can create members
    await requireRole('staff')

    const body = await request.json()
    
    // Validate with Zod
    const validation = validateRequest(createMemberSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check for duplicate IC number
    const existing = await db.member.findUnique({
      where: { icNumber: data.icNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A member with this IC number already exists' },
        { status: 409 }
      )
    }

    const member = await db.member.create({
      data: {
        name: data.name,
        icNumber: data.icNumber,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        postcode: data.postcode || null,
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth || null,
        occupation: data.occupation || null,
        monthlyIncome: data.monthlyIncome || 0,
        householdSize: data.householdSize || 1,
        asnafCategory: data.asnafCategory || 'fakir',
        status: data.status || 'active',
        ekycStatus: 'pending',
        notes: data.notes || null,
      },
      include: {
        householdMembers: true,
      },
    })

    return NextResponse.json({ data: member }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create member' },
      { status: error.message?.includes('Akses') || error.message?.includes('Sesi') ? 403 : 500 }
    )
  }
}
