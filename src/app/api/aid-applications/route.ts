import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aidAppSchema = z.object({
  applicantName: z.string().min(1),
  applicantIC: z.string().optional(),
  fullAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  employment: z.string().optional(),
  monthlyRent: z.number().optional(),
  monthlyIncome: z.number().optional(),
  healthStatus: z.string().optional(),
  spouseName: z.string().optional(),
  spouseRelation: z.string().optional(),
  spouseJob: z.string().optional(),
  spouseIncome: z.number().optional(),
  spouseHealth: z.string().optional(),
  dependents: z.any().optional(), // JSON
  otherAgencyHelp: z.boolean().default(false),
  agencyDetails: z.string().optional(),
  careAidReceived: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      db.aidApplication.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.aidApplication.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[AID_APP_GET_ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mengambil permohonan bantuan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = aidAppSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Input tidak sah', details: validated.error.format() },
        { status: 400 }
      );
    }

    const application = await db.aidApplication.create({
      data: validated.data,
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('[AID_APP_POST_ERROR]:', error);
    return NextResponse.json({ error: 'Gagal mencipta permohonan bantuan' }, { status: 500 });
  }
}
