import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { inputID, name, email, comments } = await req.json();
  if (!comments) return NextResponse.json({ error: 'Comments required' }, { status: 400 });
  await prisma.report.create({ data: { inputID, name, email, comments } });
  return NextResponse.json({ ok: true });
}
