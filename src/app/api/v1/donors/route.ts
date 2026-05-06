import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (type) {
      where.type = type
    }

    const [donors, total] = await Promise.all([
      db.donor.findMany({
        where,
        include: {
          donations: {
            select: { id: true, amount: true, category: true, date: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.donor.count({ where }),
    ])

    // Enrich with computed fields
    const enrichedDonors = donors.map((donor) => {
      const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0)
      const donationCount = donor.donations.length
      return {
        ...donor,
        totalDonated,
        donationCount,
      }
    })

    return NextResponse.json({
      donors: enrichedDonors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Donors GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, type, category, notes } = body

    // Validation
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const validTypes = ['individual', 'corporate', 'government']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid donor type' }, { status: 400 })
    }

    const validCategories = ['regular', 'occasional', 'one_time']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid donor category' }, { status: 400 })
    }

    // Semakan kewujudan penderma (Duplicate Check)
    const existingDonor = await db.donor.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email.trim() }] : []),
          ...(phone ? [{ phone: phone.trim() }] : []),
        ].filter(Boolean),
      },
    })

    if (existingDonor) {
      const duplicateField = existingDonor.email === email?.trim() ? 'emel' : 'nombor telefon'
      return NextResponse.json(
        { error: `Penderma dengan ${duplicateField} ini sudah pun berdaftar.` },
        { status: 409 }
      )
    }

    const donor = await db.donor.create({
      data: {
        donorNumber: `DNR-${Date.now()}`,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        type: type || 'individual',
        category: category || null,
        notes: notes?.trim() || null,
      },
      include: {
        donations: true,
      },
    })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    console.error('Donors POST error:', error)
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 })
  }
}
