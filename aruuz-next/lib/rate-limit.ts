import { prisma } from './db';

const LIMIT = 100;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function isRateLimited(ip: string, url: string): Promise<boolean> {
  const blacklisted = await prisma.blackList.findUnique({ where: { ip } });
  if (blacklisted) return true;

  const windowStart = new Date(Date.now() - WINDOW_MS);
  const count = await prisma.ipLog.count({
    where: { ip, createdAt: { gte: windowStart } },
  });

  await prisma.ipLog.create({ data: { ip, url } });

  if (count >= LIMIT) {
    await prisma.blackList.upsert({
      where: { ip },
      create: { ip },
      update: {},
    });
    return true;
  }

  return false;
}
