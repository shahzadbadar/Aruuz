import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

const PAGE_SIZE = 15;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const poet = searchParams.get('poet');
  const meter = searchParams.get('meter');

  const where = {
    ...(poet ? { poet: { contains: poet } } : {}),
    ...(meter ? { meterID: { contains: meter } } : {}),
  };

  const [total, poems] = await Promise.all([
    prisma.poetry.count({ where }),
    prisma.poetry.findMany({ where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { id: true, poet: true, title: true, type: true, meterID: true } }),
  ]);

  return NextResponse.json({ poems, pagination: { currentPage: page, maxPages: Math.ceil(total / PAGE_SIZE) } });
}

export async function POST(req: NextRequest) {
  const { title, poet, type, text, meters } = await req.json();
  if (!title || !poet || !text || !meters) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  const poem = await prisma.poetry.create({ data: { title, poet, type: parseInt(type ?? '0'), text, meterID: meters } });
  return NextResponse.json({ id: poem.id });
}
