import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const method = searchParams.get('method') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { donorName: { contains: search } },
        { receiptNumber: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (method) {
      where.method = method
    }

    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where,
        include: {
          donor: {
            select: { id: true, name: true, email: true, type: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.donation.count({ where }),
    ])

    // Compute stats
    const allDonations = await db.donation.findMany({
      select: { amount: true, category: true, receiptIssued: true, shariahCompliant: true, createdAt: true },
    })

    const now = new Date()
    const thisMonth = allDonations.filter((d) => {
      const dDate = new Date(d.createdAt)
      return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear()
    })

    const totalThisMonth = thisMonth.reduce((sum, d) => sum + d.amount, 0)

    const categoryTotals: Record<string, number> = {}
    allDonations.forEach((d) => {
      categoryTotals[d.category] = (categoryTotals[d.category] || 0) + d.amount
    })

    const receiptCount = allDonations.filter((d) => d.receiptIssued).length
    const shariahCount = allDonations.filter((d) => d.shariahCompliant).length
    const shariahRate = allDonations.length > 0 ? Math.round((shariahCount / allDonations.length) * 100) : 100

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalThisMonth,
        categoryTotals,
        receiptCount,
        shariahRate,
        totalDonations: allDonations.length,
        totalAmount: allDonations.reduce((sum, d) => sum + d.amount, 0),
      },
    })
  } catch (error) {
    console.error('Donations GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { donorId, donorName, category, amount, method, date, notes, shariahCompliant } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const validCategories = ['zakat', 'sadaqah', 'waqf', 'infaq', 'general']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (method) {
      const validMethods = ['cash', 'bank_transfer', 'online', 'cheque']
      if (!validMethods.includes(method)) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
      }
    }

    // Generate receipt number
    const count = await db.donation.count()
    const receiptNumber = `REC-${String(count + 1).padStart(5, '0')}`

    const donation = await db.donation.create({
      data: {
        donorId: donorId || null,
        donorName: donorName || null,
        category,
        amount: parseFloat(amount),
        method: method || null,
        receiptNumber,
        receiptIssued: false,
        shariahCompliant: shariahCompliant !== false,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null,
      },
      include: {
        donor: {
          select: { id: true, name: true, email: true, type: true },
        },
      },
    })

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    console.error('Donations POST error:', error)
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 })
  }
}
