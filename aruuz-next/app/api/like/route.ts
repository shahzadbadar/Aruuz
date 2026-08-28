import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { url, action } = await req.json() as { url: string; action: 'like' | 'dislike' };
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
  await prisma.likeDislike.create({ data: { url, action: action === 'like' ? 1 : 0 } });
  return NextResponse.json({ ok: true });
}
