import { type CodeLocation, makeCodeLocation, type ScanPath, makeScanPath } from './types';
import { NUM_METERS, NUM_VARIED_METERS, NUM_RUBAI_METERS, METERS, METERS_VARIED, RUBAI_METERS, METER_USAGE } from './meters';
import { PatternTree } from './pattern-tree';

export class CodeTree {
  private location: CodeLocation;
  private children: CodeTree[];
  errorParam: number = 2;
  fuzzy: boolean = false;
  freeVerse: boolean = false;

  constructor(loc: CodeLocation) {
    this.location = { ...loc };
    this.children = [];
  }

  addChild(loc: CodeLocation): void {
    if (this.children.length > 0) {
      if (this.children[0].location.wordRef === loc.wordRef) {
        if (!this.children.some(c => c.location.codeRef === loc.codeRef)) {
          const child = new CodeTree(loc);
          child.errorParam = this.errorParam;
          this.children.push(child);
        }
      } else {
        for (const child of this.children) { child.errorParam = this.errorParam; child.addChild(loc); }
      }
    } else {
      if (this.location.wordRef === loc.wordRef - 1) {
        const child = new CodeTree(loc);
        child.errorParam = this.errorParam;
        this.children.push(child);
      }
    }
  }

  findMeter(meters: number[]): ScanPath[] {
    let flag = false;
    let indices: number[] = [];
    if (meters.length === 0) {
      for (let i = 0; i < NUM_METERS; i++) indices.push(i);
      for (let i = NUM_METERS; i < NUM_METERS + NUM_RUBAI_METERS; i++) indices.push(i);
    } else if (meters[0] === -2) {
      for (let i = NUM_METERS; i < NUM_METERS + NUM_RUBAI_METERS; i++) indices.push(i);
    } else {
      for (const m of meters) { if (m !== -1) indices.push(m); else flag = true; }
    }

    const scn = makeScanPath();
    scn.meters = indices;
    scn.location.push(makeCodeLocation());

    let mainList: ScanPath[] = [];
    if (this.fuzzy) {
      mainList = this.traverseFuzzy(scn);
    } else if (this.freeVerse) {
      mainList = this.traverseFreeVerse(scn);
    } else {
      mainList = this.traverse(scn);
      if (flag || meters.length === 0) {
        const a = this.getCode(scn);
        const rootLoc = makeCodeLocation();
        rootLoc.code = 'root'; rootLoc.word = ''; rootLoc.wordRef = -1; rootLoc.codeRef = -1;
        for (const sp of a) {
          const pTree = new PatternTree(rootLoc);
          for (let j = 0; j < sp.location.length; j++) {
            const loc = sp.location[j];
            for (let k = 0; k < loc.code.length; k++) {
              const locn: CodeLocation = { codeRef: loc.codeRef, word: loc.word, wordRef: loc.wordRef, code: loc.code[k], fuzzy: loc.fuzzy };
              if (j === sp.location.length - 1 && k === loc.code.length - 1 && locn.code === 'x') locn.code = '=';
              pTree.addChild(locn);
            }
          }
          const b = pTree.isMatch();
          if (b.length > 0) mainList.push(...this.compressList(b));
        }
      }
    }
    return mainList;
  }

  private compressList(lst: ScanPath[]): ScanPath[] {
    const list: ScanPath[] = [];
    for (const item of lst) {
      const sc = makeScanPath();
      sc.meters = [...item.meters];
      let code = '';
      let j = 0;
      for (j = 0; j < item.location.length - 1; j++) {
        if (j === 0) {
          const L = makeCodeLocation(); L.codeRef = -1; L.word = 'root'; L.wordRef = -1; L.code = '';
          sc.location.push(L);
        }
        if (item.location[j].wordRef === item.location[j + 1].wordRef) {
          code += item.location[j].code;
        } else {
          const cL = makeCodeLocation();
          cL.codeRef = item.location[j].codeRef; cL.word = item.location[j].word;
          cL.wordRef = item.location[j].wordRef; code += item.location[j].code; cL.code = code; code = '';
          sc.location.push(cL);
        }
      }
      const prevWordRef = item.location[j - 1]?.wordRef ?? -1;
      if (prevWordRef === item.location[item.location.length - 1].wordRef) code += item.location[j].code;
      else code = item.location[j].code;
      const cL2 = makeCodeLocation();
      cL2.codeRef = item.location[j].codeRef; cL2.word = item.location[j].word;
      cL2.wordRef = item.location[j].wordRef; cL2.code = code;
      sc.location.push(cL2);
      list.push(sc);
    }
    return list;
  }

  private getMeterString(i: number): string {
    if (i < NUM_METERS) return METERS[i];
    if (i < NUM_METERS + NUM_VARIED_METERS) return METERS_VARIED[i - NUM_METERS];
    if (i < NUM_METERS + NUM_VARIED_METERS + NUM_RUBAI_METERS) return RUBAI_METERS[i - NUM_METERS - NUM_VARIED_METERS];
    return '';
  }

  private checkCodeLength(code: string, indices: number[]): number[] {
    const list = [...indices];
    for (const i of indices) {
      let meter = this.getMeterString(i).replace(/\//g, '');
      const meter2 = meter.replace(/\+/g, '') + '-';
      const meter3 = meter.replace(/\+/g, '-') + '-';
      const meter4 = meter.replace(/\+/g, '-');
      meter = meter.replace(/\+/g, '');
      const check = (pat: string): boolean => {
        if (pat.length !== code.length) return true;
        for (let j = 0; j < pat.length; j++) {
          const m = pat[j], c = code[j];
          if (m === '-' && c !== '-' && c !== 'x') return true;
          if (m === '=' && c !== '=' && c !== 'x') return true;
        }
        return false;
      };
      if (check(meter) && check(meter2) && check(meter3) && check(meter4)) {
        const idx = list.indexOf(i); if (idx !== -1) list.splice(idx, 1);
      }
    }
    return list;
  }

  private levenshteinDistance(pattern: string, code: string): number {
    const m = pattern.length, n = code.length;
    const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const p = pattern[i - 1], c = code[j - 1];
        if ((p === c || c === 'x') && p !== '~') { d[i][j] = d[i - 1][j - 1]; }
        else if (p === '~') { d[i][j] = c === '-' ? d[i-1][j-1] : Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+1); }
        else { d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+1); }
      }
    }
    return d[m][n];
  }

  private isMatch(meter: string, tentativeCode: string, wordCode: string): boolean {
    meter = meter.replace(/\//g, '');
    const cleanMeter = meter.replace(/\+/g, '');
    const meter2 = cleanMeter + '-';
    const meter3 = meter.replace(/\+/g, '-') + '-';
    const meter4 = meter.replace(/\+/g, '-');
    const total = tentativeCode.length + wordCode.length;
    if (total === 0) return false;
    if (meter.length > total && meter[total - 1] === '+' && wordCode.length >= 2 && wordCode[wordCode.length - 1] !== '-') return false;
    const code = wordCode;
    const check = (pat: string, isVar: boolean): boolean => {
      if (pat.length < tentativeCode.length + code.length) return false;
      const sub = pat.substring(tentativeCode.length);
      for (let k = 0; k < code.length; k++) {
        const m = sub[k], c = code[k];
        if (isVar && k === code.length - 1 && c !== '-') return false;
        if (m === '-' && c !== '-' && c !== 'x') return false;
        if (m === '=' && c !== '=' && c !== 'x') return false;
      }
      return true;
    };
    return !check(cleanMeter, false) || !check(meter2, true) || !check(meter3, true) || !check(meter4, false);
  }

  private getCode(scn: ScanPath): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (this.children.length > 0) {
      for (const child of this.children) {
        const scpath = makeScanPath();
        scpath.location.push(...scn.location, { ...child.location });
        mainList.push(...child.getCode(scpath));
      }
    } else { mainList.push(scn); }
    return mainList;
  }

  private traverse(scn: ScanPath): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (scn.meters.length === 0) return mainList;
    if (this.children.length > 0) {
      const code = scn.location.map(l => l.code).join('');
      for (const child of this.children) {
        const wordCode = child.location.code;
        const indices = [...scn.meters];
        let flag = false;
        for (const mi of [...scn.meters]) {
          const meter = this.getMeterString(mi);
          if (meter && !this.isMatch(meter, code, wordCode)) { const idx = indices.indexOf(mi); if (idx !== -1) indices.splice(idx, 1); }
          else if (meter) flag = true;
        }
        if (flag) {
          const scpath = makeScanPath();
          scpath.meters = indices; scpath.location.push(...scn.location, { ...child.location });
          mainList.push(...child.traverse(scpath));
        }
      }
    } else {
      const code = scn.location.map(l => l.code).join('');
      const met = this.checkCodeLength(code, scn.meters);
      if (met.length !== 0) { scn.meters = met; mainList.push(scn); }
    }
    return mainList;
  }

  private checkCodeLengthFuzzy(code: string, indices: number[]): number[] {
    const list = [...indices];
    for (const i of indices) {
      let meter = this.getMeterString(i).replace(/\//g, '');
      const meter2 = meter.replace(/\+/g, '') + '~';
      const meter3 = meter.replace(/\+/g, '~') + '~';
      const meter4 = meter.replace(/\+/g, '~');
      meter = meter.replace(/\+/g, '');
      if (code.length > 0) {
        const f1 = this.levenshteinDistance(meter, code);
        const f2 = this.levenshteinDistance(meter2, code);
        const f3 = this.levenshteinDistance(meter3, code);
        const f4 = this.levenshteinDistance(meter4, code);
        if (Math.min(f1, f2, f3, f4) > this.errorParam) { const idx = list.indexOf(i); if (idx !== -1) list.splice(idx, 1); }
      }
    }
    return list;
  }

  private traverseFuzzy(scn: ScanPath): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (scn.meters.length === 0) return mainList;
    if (this.children.length > 0) {
      for (const child of this.children) {
        const scpath = makeScanPath();
        scpath.meters = [...scn.meters]; scpath.location.push(...scn.location, { ...child.location });
        mainList.push(...child.traverseFuzzy(scpath));
      }
    } else {
      const code = scn.location.map(l => l.code).join('');
      const met = this.checkCodeLengthFuzzy(code, scn.meters);
      if (met.length !== 0) { scn.meters = met; mainList.push(scn); }
    }
    return mainList;
  }

  private checkMeterFreeVerse(code: string, indices: number[]): number[] {
    const list = [...indices];
    for (const i of indices) {
      if (i >= NUM_METERS + NUM_VARIED_METERS) continue;
      const meter = i < NUM_METERS ? METERS[i] : METERS_VARIED[i - NUM_METERS];
      const residue = meter.replace(/ /g, '').replace(/\+/g, ' ').replace(/\//g, ' ');
      const feet = [...new Set(residue.split(' ').filter(Boolean))];
      let f = true;
      if (code.length > 0) {
        let j = 0;
        while (j < code.length) {
          let index = -1;
          for (let k = 0; k < feet.length; k++) {
            if (j + feet[k].length > code.length) continue;
            const slice = code.substring(j, j + feet[k].length);
            let match = true;
            for (let z = 0; z < feet[k].length; z++) { if (slice[z] !== feet[k][z] && slice[z] !== 'x') { match = false; break; } }
            if (match) { index = k; break; }
          }
          if (index >= 0) j += feet[index].length;
          else { f = false; break; }
        }
        if (!f) { const idx = list.indexOf(i); if (idx !== -1) list.splice(idx, 1); }
      }
    }
    return list;
  }

  private traverseFreeVerse(scn: ScanPath): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (scn.meters.length === 0) return mainList;
    if (this.children.length > 0) {
      for (const child of this.children) {
        const scpath = makeScanPath();
        scpath.meters = [...scn.meters]; scpath.location.push(...scn.location, { ...child.location });
        mainList.push(...child.traverseFreeVerse(scpath));
      }
    } else {
      const code = scn.location.map(l => l.code).join('');
      const met = this.checkMeterFreeVerse(code, scn.meters);
      if (met.length !== 0) { scn.meters = met; mainList.push(scn); }
    }
    return mainList;
  }
}
