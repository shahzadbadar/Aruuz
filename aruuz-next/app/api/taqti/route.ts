import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { Scansion } from '@/lib/scansion/scansion';
import { wordRepo } from '@/lib/word-repo';
import { isRateLimited } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const limited = await isRateLimited(ip, '/api/taqti');
  if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body = await req.json();
  const { text, isChecked, id } = body as { text: string; isChecked?: boolean; id?: number };

  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

  await prisma.inputData.create({ data: { input: text, ip } });

  const scansion = new Scansion(wordRepo);
  scansion.freeVerse = isChecked ?? false;

  const rawLines = text.split('\n').filter((l: string) => l.trim());
  for (const line of rawLines) {
    const wordsList = await scansion.loadWords(line);
    scansion.addLine(line, wordsList);
  }

  const results = await scansion.scanLines();

  if (id && results.length > 0) {
    await prisma.poetry.update({ where: { id }, data: { taqtiObject: JSON.stringify(results) } }).catch(() => {});
  }

  return NextResponse.json({ results });
}
