import { prisma } from './db';
import type { WordRepo } from './scansion/scansion';

export const wordRepo: WordRepo = {
  async findException(word) {
    const rows = await prisma.exceptions.findMany({ where: { word } });
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      code2: r.code2 ?? undefined,
      code3: r.code3 ?? undefined,
    }));
  },

  async findMasterTable(word) {
    const variants = [word, `${word} 1`, `${word} 2`, `${word} 3`, `${word} 4`,
      `${word} 5`, `${word} 6`, `${word} 7`, `${word} 8`, `${word} 9`,
      `${word} 10`, `${word} 11`, `${word} 12`];
    const rows = await prisma.mastertable.findMany({ where: { word: { in: variants } } });
    return rows.map(r => ({
      id: r.id,
      muarrab: r.muarrab,
      taqti: r.taqti,
      language: r.language ?? undefined,
      isVaried: r.isVaried,
    }));
  },

  async findVariations(id) {
    const rows = await prisma.variations.findMany({ where: { masterId: id } });
    return rows.map(r => ({ id: r.id, muarrab: r.muarrab, taqti: r.taqti }));
  },

  async findPlurals(word) {
    const rows = await prisma.plurals.findMany({ where: { word } });
    return rows.map(r => ({ id: r.id, muarrab: r.muarrab, taqti: r.taqti }));
  },
};
