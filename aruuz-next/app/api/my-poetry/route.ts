import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'لاگ ان ضروری ہے' }, { status: 401 });
  const poems = await prisma.myPoetry.findMany({
    where: { name: session.user.email },
    select: { id: true, title: true, url: true, mozun: true, publish: true, createdAt: true },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json({ poems });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'لاگ ان ضروری ہے' }, { status: 401 });
  const { title, text, url } = await req.json();
  if (!title || !text) return NextResponse.json({ error: 'عنوان اور متن ضروری ہیں' }, { status: 400 });
  const poem = await prisma.myPoetry.create({ data: { name: session.user.email, title, text, url: url ?? '' } });
  return NextResponse.json({ id: poem.id });
}
