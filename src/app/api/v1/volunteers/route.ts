import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const availability = searchParams.get('availability')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (availability) where.availability = availability
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { skills: { contains: search } },
      ]
    }

    const [volunteers, total] = await Promise.all([
      db.volunteer.findMany({
        where,
        include: {
          activities: {
            select: { id: true, hours: true, role: true, status: true, date: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          certificates: {
            select: { id: true, title: true, issuedDate: true, certificateUrl: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { activities: true, certificates: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.volunteer.count({ where }),
    ])

    return NextResponse.json({ data: volunteers, total, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const volunteer = await db.volunteer.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        skills: body.skills || null,
        availability: body.availability || null,
        status: body.status || 'active',
        totalHours: 0,
        joinedAt: body.joinedAt || new Date().toISOString().split('T')[0],
        notes: body.notes || null,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'volunteer_registered',
        category: 'volunteer',
        title: `Sukarelawan baru: ${body.name}`,
        description: `${body.name} telah didaftarkan sebagai sukarelawan.`,
        entityType: 'Volunteer',
        entityId: volunteer.id,
      },
    })

    return NextResponse.json({ data: volunteer }, { status: 201 })
  } catch (error) {
    console.error('Error creating volunteer:', error)
    return NextResponse.json(
      { error: 'Failed to create volunteer' },
      { status: 500 }
    )
  }
}
