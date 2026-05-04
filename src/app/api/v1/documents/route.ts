import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { fileName: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        include: {
          member: { select: { id: true, name: true } },
          case: { select: { id: true, caseNumber: true } },
          programme: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.document.count({ where }),
    ])

    // Compute category counts
    const allDocs = await db.document.findMany({ select: { category: true } })
    const categoryCounts: Record<string, number> = {}
    allDocs.forEach((d) => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1
    })

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categoryCounts,
    })
  } catch (error) {
    console.error('Documents GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, fileName, fileUrl, fileSize, mimeType, tags, memberId, caseId, programmeId, uploadedBy } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const validCategories = ['member', 'case', 'programme', 'compliance', 'general']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const document = await db.document.create({
      data: {
        title,
        category,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        version: 1,
        tags: tags || null,
        memberId: memberId || null,
        caseId: caseId || null,
        programmeId: programmeId || null,
        uploadedBy: uploadedBy || null,
      },
      include: {
        member: { select: { id: true, name: true } },
        case: { select: { id: true, caseNumber: true } },
        programme: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Documents POST error:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
