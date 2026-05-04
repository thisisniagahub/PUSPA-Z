import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const programmes = await db.programme.findMany({
      where,
      include: {
        beneficiaries: {
          select: { id: true, status: true, memberId: true },
        },
        _count: {
          select: { beneficiaries: true, disbursements: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute beneficiary count for each programme
    const result = programmes.map((p) => ({
      ...p,
      beneficiaryCount: p._count.beneficiaries,
    }))

    return NextResponse.json({ data: result, total: result.length })
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programmes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const programme = await db.programme.create({
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category,
        status: body.status || 'planning',
        budget: body.budget ? parseFloat(String(body.budget)) : 0,
        spent: 0,
        startDate: body.startDate || null,
        endDate: body.endDate || null,
        location: body.location || null,
        targetBeneficiaries: body.targetBeneficiaries
          ? parseInt(String(body.targetBeneficiaries))
          : 0,
        impactMetric: body.impactMetric || null,
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'programme_created',
        category: 'programme',
        title: `Program baru: ${body.name}`,
        description: `Program "${body.name}" telah dicipta di bawah kategori ${body.category}.`,
        entityType: 'Programme',
        entityId: programme.id,
        programmeId: programme.id,
      },
    })

    return NextResponse.json({ data: programme }, { status: 201 })
  } catch (error) {
    console.error('Error creating programme:', error)
    return NextResponse.json(
      { error: 'Failed to create programme' },
      { status: 500 }
    )
  }
}
