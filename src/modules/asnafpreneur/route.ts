import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canAccessView, Role } from '@/lib/access-control'
// import { rateLimit } from '@/lib/rate-limit' // Assumption: rate-limit helper exists

/**
 * PUSPA V5 - Asnafpreneur API
 * Melindungi data usahawan dengan RBAC dan validasi ketat.
 */

const entrepreneurSchema = z.object({
  name: z.string().min(1, 'Nama usahawan diperlukan'),
  category: z.string().min(1, 'Sila pilih kategori perniagaan'),
  initialCapital: z.coerce.number().min(0, 'Modal tidak boleh negatif'),
  description: z.string().min(10, 'Sila berikan penerangan ringkas perniagaan'),
})

// Helper untuk simulasi/get user role dari session (Contoh)
async function getAuthenticatedUser(req: NextRequest) {
  // Di sini anda patut integrasikan dengan Supabase/Next-Auth session
  // Buat masa ni, kita ambil dari header untuk simulasi internal testing
  const role = (req.headers.get('x-user-role') as Role) || 'staff'
  return { role }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    // await rateLimit(request.ip, 'asnafpreneur_get') 

    // 2. Authentication & RBAC Check
    const user = await getAuthenticatedUser(request)
    if (!canAccessView('asnafpreneur', user.role)) {
      return NextResponse.json({ error: 'Akses dinafikan: Peranan tidak mencukupi' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (category && category !== 'semua') where.category = category

    const [entrepreneurs, total] = await Promise.all([
      db.entrepreneur.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.entrepreneur.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: entrepreneurs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[ASNAFPRENEUR_GET_ERROR]:', error)
    return NextResponse.json({ error: 'Gagal mengambil senarai usahawan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & RBAC Check
    const user = await getAuthenticatedUser(request)
    if (!canAccessView('asnafpreneur', user.role)) {
      return NextResponse.json({ error: 'Akses dinafikan: Anda tidak mempunyai kebenaran mendaftar' }, { status: 403 })
    }

    const body = await request.json()
    const validated = entrepreneurSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: 'Input tidak sah', details: validated.error.format() }, { status: 400 })
    }

    const { name, category, initialCapital, description } = validated.data

    const entrepreneur = await db.entrepreneur.create({
      data: {
        name: name.trim(),
        category,
        initialCapital,
        description: description.trim(),
        status: 'Aktif',
      }
    })

    await db.activity.create({
      data: {
        type: 'entrepreneur_created',
        category: 'system',
        title: `Mendaftarkan usahawan baharu: ${name}`,
        description: `Kategori: ${category}, Modal: RM ${initialCapital}`,
      }
    }).catch(err => console.error('[Activity_Log_Error]:', err))

    return NextResponse.json({ success: true, data: entrepreneur }, { status: 201 })
  } catch (error) {
    console.error('[ASNAFPRENEUR_POST_ERROR]:', error)
    return NextResponse.json({ error: 'Gagal mendaftarkan usahawan' }, { status: 500 })
  }
}