import { type Words, makeWords, type ScanOutput, makeScanOutput, type ScanPath } from './types';
import { CodeTree } from './code-tree';
import { NUM_METERS, NUM_VARIED_METERS, NUM_RUBAI_METERS, METERS, METER_NAMES, METER_USAGE, METERS_VARIED, RUBAI_METERS, METER_IDS, SPECIAL_METER_NAMES, RUBAI_METER_NAMES, afail, afail2 } from './meters';

const ARAAB_CHARS = ['ّ','ِ','ْ','ٖ','٘','ٰ','ً','ٍ','َ','ُ','ٔ'];

export function removeAraab(word: string): string {
  if (!word) return '';
  let result = word;
  for (const ch of ARAAB_CHARS) result = result.split(ch).join('');
  return result;
}

export function isMuarrabStr(word: string): boolean {
  for (const ch of word) for (const a of ARAAB_CHARS) if (ch === a) return true;
  return false;
}

export function isMuarrabChar(letter: string): boolean {
  for (const a of ARAAB_CHARS) if (letter === a) return true;
  return false;
}

export function isVowelPlusH(letter: string): boolean {
  return letter === 'ا' || letter === 'ی' || letter === 'ے' || letter === 'و' || letter === 'ہ' || letter === 'ؤ';
}

export function isIzafat(word: string): boolean {
  const last = word[word.length - 1];
  return last === ARAAB_CHARS[1] || last === ARAAB_CHARS[10] || last === 'ۂ';
}

export function locateAraab(word: string): string {
  let loc = '';
  for (let i = 0; i < word.length; i++) {
    if (i < word.length - 1 && isMuarrabChar(word[i + 1])) { loc += word[i + 1]; i++; }
    else loc += ' ';
  }
  return loc;
}

export function containsNoon(stripped: string): boolean { return stripped.indexOf('ن') !== -1; }

export function noonGhunna(substr: string, code: string): string {
  if (removeAraab(substr)[removeAraab(substr).length - 1] === 'ن' && code.length > 0 && code[code.length - 1] === '-')
    return code.slice(0, -1) + 'x';
  return code;
}

export function processLine(line: string): { word: string; length: number }[] {
  const cleaned = line
    .replace(/,/g,'').replace(/"/g,'').replace(/\*/g,'').replace(/'/g,'')
    .replace(/-/g,'').replace(/۔/g,'').replace(/،/g,'').replace(/\?/g,'')
    .replace(/!/g,'').replace(/ﺔ/g,'').replace(/؟/g,'').replace(/‘/g,'')
    .replace(/\(/g,'').replace(/\)/g,'').replace(/؛/g,'').replace(/;/g,'')
    .replace(/​/g,'').replace(/‌/g,'').replace(/‍/g,'').replace(/﻿/g,'')
    .replace(/\./g,'').replace(/︒/g,'').replace(/︎/g,'').replace(/=/g,'')
    .replace(/︑/g,'').replace(/︓/g,'').replace(/﷽/g,'').replace(/ﷺ/g,'')
    .replace(/:/g,'').replace(/’/g,'');
  return cleaned.split(/[\s,]+/).filter(Boolean).map(s => {
    const w = replaceWord(s.trim());
    return { word: w, length: removeAraab(w).length };
  }).filter(w => w.length > 0);
}

export function replaceWord(word: string): string {
  if (!word || word.length === 0) return word;
  if (word[word.length - 1] === 'ئ') word = word.slice(0, -1) + 'یٔ';
  if (word.length >= 2) {
    word = word.replace(/آ/g, 'آ');
    word = word.replace(/ۂ/g, 'ۂ');
  }
  return word;
}

export function lengthOneScan(substr: string): string {
  return removeAraab(substr) === 'آ' ? '=' : '-';
}

export function lengthTwoScan(substr: string): string {
  const subStr = substr.replace(/ھ/g,'').replace(/ں/g,'');
  const stripped = removeAraab(subStr);
  if (substr[0] === 'آ') return '=-';
  if (isVowelPlusH(stripped[stripped.length - 1])) return 'x';
  return '=';
}

export function lengthThreeScan(substr: string): string {
  const subStr = substr.replace(/ھ/g,'').replace(/ں/g,'');
  const stripped = removeAraab(subStr);
  if (stripped.length === 1) return stripped[0] === 'آ' ? '-' : '=';
  if (stripped.length === 2) return lengthTwoScan(substr);
  let code = '';
  if (isMuarrabStr(subStr)) {
    const loc = locateAraab(subStr);
    if (loc[1] === ARAAB_CHARS[2]) code = stripped[0] === 'آ' ? '=--' : '=-';
    else if (loc[1]===ARAAB_CHARS[1]||loc[1]===ARAAB_CHARS[8]||loc[1]===ARAAB_CHARS[9]) code = '-=';
    else if (loc[1]===ARAAB_CHARS[0]) code = '==';
    else if (stripped[2]==='ا') code = '-=';
    else if (isVowelPlusH(stripped[2])) code = stripped[1]==='ا' ? '=-' : '-=';
    else if (stripped[1]==='ا'||isVowelPlusH(stripped[1])) code = '=-';
    else code = '=-';
  } else {
    if (stripped[0]==='آ') code = '==';
    else if (stripped[1]==='ا') code = '=-';
    else if (stripped[2]==='ا') code = '-=';
    else if (stripped[1]==='ی'||stripped[1]==='ے'||stripped[1]==='و'||stripped[1]==='ہ') {
      if (stripped[2]==='ہ') code = '=-';
      else if (stripped[2]==='ی'||stripped[2]==='ے'||stripped[2]==='و') code = '-=';
      else code = '=-';
    } else if (isVowelPlusH(stripped[2])) code = '-=';
    else if (isVowelPlusH(stripped[0])) code = '-=';
    else code = '-=';
  }
  if (containsNoon(stripped)) code = noonGhunna(substr, code);
  return code;
}

export function lengthFourScan(substr: string): string {
  const subStr = substr.replace(/ھ/g,'').replace(/ں/g,'');
  const stripped = removeAraab(subStr);
  if (stripped.length === 1) return lengthOneScan(subStr);
  if (stripped.length === 2) return lengthTwoScan(subStr);
  if (stripped.length === 3) return lengthThreeScan(subStr);
  let code = '';
  if (stripped[0]==='آ') {
    code = '=' + lengthThreeScan(subStr.slice(1));
  } else if (isMuarrabStr(subStr)) {
    const loc = locateAraab(subStr);
    if (stripped[1]==='ا') code = loc[2]===ARAAB_CHARS[2] ? '=--' : '==';
    else if (stripped[2]==='ا') code = '-=-';
    else if (stripped[1]==='و') {
      if (stripped[3]==='ت'&&loc[3]===ARAAB_CHARS[2]) code = '=-';
      else if (loc[1]===ARAAB_CHARS[1]||loc[1]===ARAAB_CHARS[8]||loc[1]===ARAAB_CHARS[9]) code = '-=-';
      else code = loc[2]===ARAAB_CHARS[2] ? '=--' : '==';
    } else if (stripped[1]==='ی') {
      if (stripped[3]==='ت'&&loc[3]===ARAAB_CHARS[2]) code = '=-';
      else if (loc[0]===ARAAB_CHARS[1]||loc[0]===ARAAB_CHARS[8]||loc[0]===ARAAB_CHARS[9]) {
        if (loc[1]===ARAAB_CHARS[1]||loc[1]===ARAAB_CHARS[8]||loc[1]===ARAAB_CHARS[9]) code = '-=-';
        else code = loc[2]===ARAAB_CHARS[2] ? '=--' : '==';
      } else code = '==';
    } else {
      if (loc[0]===ARAAB_CHARS[1]||loc[0]===ARAAB_CHARS[8]||loc[0]===ARAAB_CHARS[9]) {
        if (loc[1]===ARAAB_CHARS[1]||loc[1]===ARAAB_CHARS[8]||loc[1]===ARAAB_CHARS[9]) {
          if (isVowelPlusH(stripped[2])||loc[2]===ARAAB_CHARS[2]) code = '-=-'; else code = '--=';
        } else if (loc[1]===ARAAB_CHARS[2]) code = '==';
        else if (loc[2]===ARAAB_CHARS[2]) code = '-=-';
        else code = stripped[3]==='ا'||stripped[3]==='ی' ? '--=' : '-=-';
      } else if (loc[1]===ARAAB_CHARS[2]) code = loc[2]===ARAAB_CHARS[2] ? '==' : '=--';
      else if (loc[2]===ARAAB_CHARS[2]) code = '-=-';
      else if (loc[2]===ARAAB_CHARS[1]||loc[2]===ARAAB_CHARS[8]||loc[2]===ARAAB_CHARS[9]) code = '==';
      else if (isVowelPlusH(stripped[2])) code = '-=-';
      else code = '==';
    }
  } else if (isVowelPlusH(stripped[2])) {
    if (stripped[3]==='ا') code = '==';
    else if (isVowelPlusH(stripped[1])) code = '==';
    else code = '-=-';
  } else code = '==';
  if (containsNoon(stripped)) code = noonGhunna(substr, code);
  return code;
}

export function lengthFiveScan(substr: string): string {
  const subStr = substr.replace(/ھ/g,'').replace(/ں/g,'');
  const stripped = removeAraab(subStr);
  if (stripped.length === 3) return lengthThreeScan(substr);
  if (stripped.length === 4) return lengthFourScan(substr);
  if (stripped.length < 3) return lengthThreeScan(substr);
  let code = '';
  if (stripped[0]==='آ') code = '=' + lengthFourScan(subStr.slice(2));
  else if (stripped[1]==='ا') code = '=' + lengthThreeScan(subStr.slice(2));
  else if (stripped[2]==='ا') code = '-=' + lengthTwoScan(subStr.slice(3));
  else if (isVowelPlusH(stripped[1])) {
    if (isVowelPlusH(stripped[2])) code = '=' + lengthThreeScan(subStr.slice(2));
    else if (isVowelPlusH(stripped[3])) code = '==' + lengthOneScan(subStr.slice(4));
    else code = '=' + lengthThreeScan(subStr.slice(2));
  } else if (isVowelPlusH(stripped[2])) code = '-=' + lengthTwoScan(subStr.slice(3));
  else if (isVowelPlusH(stripped[3])) code = '--=' + lengthOneScan(subStr.slice(4));
  else code = '--=';
  if (containsNoon(stripped)) code = noonGhunna(substr, code);
  return code;
}

export function assignCode(word: Words): string {
  let word1 = removeAraab(word.word).replace(/ھ/g,'').replace(/ں/g,'');
  const taqti = word.taqti[word.taqti.length - 1] ?? '';
  const taqtiClean = taqti.replace(/ھ/g,'').replace(/ں/g,'');
  if (word1.length === 2) return lengthTwoScan(word1);
  if (word1.length === 1) return lengthOneScan(word1);
  const subStrings = taqtiClean.trim().split(/[+ ]+/).filter(Boolean);
  let code = '';
  for (const subString of subStrings) {
    const cleanLen = removeAraab(subString.replace(/ھ/g,'').replace(/ں/g,'')).length;
    if (cleanLen===1) code += lengthOneScan(subString);
    else if (cleanLen===2) { const s2=removeAraab(subString); code += s2[0]==='آ' ? '=-' : '='; }
    else if (cleanLen===3) code += lengthThreeScan(subString);
    else if (cleanLen===4) code += lengthFourScan(subString);
    else if (cleanLen===5) code += lengthFiveScan(subString);
  }
  if (code) {
    const lastChar = code[code.length - 1];
    if (lastChar==='='||lastChar==='x') {
      const w1Last = removeAraab(word1)[word1.length-1];
      if (isVowelPlusH(w1Last)) {
        if (w1Last==='ا'||w1Last==='ی') {
          const hasArabic = word.language.some(l => l==='عربی');
          const hasFarsiAlif = word.language.some(l => l==='فارسی') && w1Last==='ا';
          code = (hasArabic||hasFarsiAlif)&&!word.modified ? code.slice(0,-1)+'=' : code.slice(0,-1)+'x';
        } else code = code.slice(0,-1)+'x';
      }
    }
  }
  return code;
}

export interface WordRepo {
  findException(word: string): Promise<{ id: number; code: string; code2?: string; code3?: string }[]>;
  findMasterTable(word: string): Promise<{ id: number; muarrab: string; taqti: string; language?: string; isVaried: boolean }[]>;
  findVariations(id: number): Promise<{ id: number; muarrab: string; taqti: string }[]>;
  findPlurals(word: string): Promise<{ id: number; muarrab: string; taqti: string }[]>;
}

export async function findWord(wrd: Words, repo: WordRepo): Promise<Words> {
  const searchWord = removeAraab(wrd.word);
  const exceptions = await repo.findException(searchWord);
  if (exceptions.length > 0) {
    for (const ex of exceptions) {
      wrd.id.push(-ex.id); wrd.code.push(ex.code.replace(/ /g,''));
      if (ex.code2) wrd.code.push(ex.code2.replace(/ /g,''));
      if (ex.code3) wrd.code.push(ex.code3.replace(/ /g,''));
    }
    return wrd;
  }
  const master = await repo.findMasterTable(searchWord);
  if (master.length > 0) {
    for (const row of master) {
      wrd.id.push(row.id); wrd.muarrab.push(row.muarrab.trim()); wrd.taqti.push(row.taqti.trim());
      if (row.language) wrd.language.push(row.language);
      wrd.isVaried.push(row.isVaried); wrd.code.push(assignCode(wrd));
    }
    if (wrd.isVaried.length > 0 && wrd.isVaried[0]) {
      const vars = await repo.findVariations(wrd.id[0]);
      for (const v of vars) { wrd.id.push(v.id); wrd.muarrab.push(v.muarrab.trim()); wrd.taqti.push(v.taqti.trim()); wrd.code.push(assignCode(wrd)); }
    }
    return wrd;
  }
  const plurals = await repo.findPlurals(searchWord);
  for (const p of plurals) { wrd.id.push(p.id); wrd.muarrab.push(p.muarrab.trim()); wrd.taqti.push(p.taqti.trim()); wrd.code.push(assignCode(wrd)); }
  return wrd;
}

function resolveWordTaqti(so: ScanOutput, index: number, code: string): void {
  if (index >= NUM_METERS + NUM_VARIED_METERS + NUM_RUBAI_METERS) return;
  const meterStr = index < NUM_METERS ? METERS[index] : index < NUM_METERS + NUM_VARIED_METERS ? METERS_VARIED[index - NUM_METERS] : RUBAI_METERS[index - NUM_METERS - NUM_VARIED_METERS];
  const base = meterStr.replace(/\//g,'');
  const m1 = base.replace(/\+/g,''), m2 = m1+'-', m3 = base.replace(/\+/g,'-')+'-', m4 = base.replace(/\+/g,'-');
  const check = (pat: string): boolean => {
    if (pat.length !== code.length) return false;
    for (let j = 0; j < pat.length; j++) {
      if (pat[j]==='-'&&code[j]!=='-'&&code[j]!=='x') return false;
      if (pat[j]==='='&&code[j]!=='='&&code[j]!=='x') return false;
    }
    return true;
  };
  let mete = '';
  if (check(m1)) mete=m1; else if (check(m2)) mete=m2; else if (check(m3)) mete=m3; else if (check(m4)) mete=m4; else return;
  let z = 0;
  for (let x = 0; x < so.wordTaqti.length; x++) {
    let temp = '';
    for (let y = 0; y < so.wordTaqti[x].length; y++) temp += mete[z++];
    so.wordTaqti[x] = temp;
  }
}

export class Scansion {
  private lines: Array<{ wordsList: Words[]; originalLine: string }> = [];
  numLines = 0;
  isChecked = false;
  freeVerse = false;
  fuzzy = false;
  errorParam = 8;
  meter: number[] = [];
  private repo: WordRepo;

  constructor(repo: WordRepo) { this.repo = repo; }

  addLine(originalLine: string, wordsList: Words[]): void {
    if (wordsList.length > 0) { this.lines.push({ wordsList, originalLine }); this.numLines++; }
  }

  async loadWords(originalLine: string): Promise<Words[]> {
    const rawWords = processLine(originalLine);
    const result: Words[] = [];
    for (const { word, length } of rawWords) {
      let wrd = makeWords({ word, length });
      wrd = await findWord(wrd, this.repo);
      result.push(wrd);
    }
    return result;
  }

  private buildTree(lineIdx: number): CodeTree {
    const rootLoc = { code: 'root', wordRef: -1, codeRef: -1, word: '', fuzzy: 0 };
    const tree = new CodeTree(rootLoc);
    tree.errorParam = this.errorParam; tree.fuzzy = this.fuzzy; tree.freeVerse = this.freeVerse;
    const line = this.lines[lineIdx];
    for (let w = 0; w < line.wordsList.length; w++) {
      const wrd = line.wordsList[w];
      const codeList: { code: string; codeRef: number }[] = [];
      const addCode = (code: string, codeRef: number) => {
        if (!codeList.some(c => c.code === code)) {
          codeList.push({ code, codeRef });
          tree.addChild({ code, codeRef, wordRef: w, word: wrd.word, fuzzy: 0 });
        }
      };
      for (let i = 0; i < wrd.code.length; i++) addCode(wrd.code[i], i);
      for (let k = 0; k < wrd.taqtiWordGraft.length; k++) addCode(wrd.taqtiWordGraft[k], wrd.code.length + k);
    }
    return tree;
  }

  async scan(lineNum: number): Promise<ScanPath[]> {
    return this.buildTree(lineNum).findMeter(this.meter);
  }

  async scanLines(): Promise<ScanOutput[]> {
    const list: ScanOutput[] = [];
    for (let k = 0; k < this.numLines; k++) {
      const sp = await this.scan(k);
      if (sp.length === 0) continue;
      const curIndex = list.length;
      for (const path of sp) {
        for (const meterIdx of path.meters) {
          const so = makeScanOutput();
          so.originalLine = this.lines[k].originalLine;
          for (let i = 1; i < path.location.length; i++) {
            const loc = path.location[i];
            so.words.push(this.lines[k].wordsList[loc.wordRef]);
            so.wordTaqti.push(loc.code);
            so.wordMuarrab.push(this.lines[k].wordsList[loc.wordRef].muarrab[loc.codeRef] ?? this.lines[k].wordsList[loc.wordRef].word);
          }
          const code = so.wordTaqti.join('');
          if (meterIdx < NUM_METERS) {
            so.meterName = METER_NAMES[meterIdx];
            const feetList = afail2(METERS[meterIdx], code);
            so.feetList = feetList; so.feet = feetList.map(f => f.foot).join(' ');
            if (METER_USAGE[meterIdx]===0) so.feet += ' (غیر مستعمل وزن)';
            so.id = METER_IDS[meterIdx];
          } else if (meterIdx < NUM_METERS + NUM_VARIED_METERS) {
            so.feet = afail(METERS_VARIED[meterIdx - NUM_METERS]);
          } else if (meterIdx < NUM_METERS + NUM_VARIED_METERS + NUM_RUBAI_METERS) {
            so.feet = afail(RUBAI_METERS[meterIdx - NUM_METERS - NUM_VARIED_METERS]); so.id = -2;
          } else {
            const si = meterIdx - NUM_METERS - NUM_VARIED_METERS - NUM_RUBAI_METERS;
            so.meterName = SPECIAL_METER_NAMES[si]; so.id = -2 - si;
          }
          resolveWordTaqti(so, meterIdx, code);
          const isDuplicate = (n: number) => list.slice(n).some(x => x.meterName === so.meterName);
          if (!so.feet || isDuplicate(this.numLines > 1 ? 0 : curIndex)) continue;
          list.push(so);
        }
      }
    }
    return list;
  }
}
