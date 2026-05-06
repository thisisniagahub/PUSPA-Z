import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const memberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  category: z.enum(['ADMINISTRATION', 'OPERATIONS', 'HONORARY']),
  position: z.string().min(1),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    const members = await db.organizationMember.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('[ORGANIZATION_GET_ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mengambil data organisasi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = memberSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Input tidak sah', details: validated.error.format() },
        { status: 400 }
      );
    }

    const member = await db.organizationMember.create({
      data: validated.data,
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error('[ORGANIZATION_POST_ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mencipta ahli organisasi' }, { status: 500 });
  }
}
