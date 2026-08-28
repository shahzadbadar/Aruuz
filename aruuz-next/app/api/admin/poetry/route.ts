import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;
  if (!session?.user || userRole !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, poet, type, text, meters, searchString } = await req.json();
  if (!title || !poet || !text || !meters) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const poem = await prisma.poetry.create({ data: { title, poet, type: parseInt(type ?? '0'), text, meterID: meters, searchString } });
  return NextResponse.json({ id: poem.id });
}
