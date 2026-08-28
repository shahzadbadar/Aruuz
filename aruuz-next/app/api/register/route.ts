import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'تمام خانے پُر کریں' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'پاسورڈ کم از کم 6 حروف کا ہونا چاہیے' }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'یہ ای میل پہلے سے موجود ہے' }, { status: 409 });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
