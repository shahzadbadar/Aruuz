import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const results = await prisma.poetry.findMany({
    where: { OR: [{ poet: { contains: q } }, { title: { contains: q } }, { searchString: { contains: q } }] },
    take: 30,
    select: { id: true, poet: true, title: true, type: true, meterID: true },
  });

  return NextResponse.json({ results });
}
