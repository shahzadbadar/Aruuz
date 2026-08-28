import { type CodeLocation, makeCodeLocation, type ScanPath, makeScanPath } from './types';
import { originalHindiMeter, zamzamaMeter } from './state-machine';
import { NUM_METERS, NUM_VARIED_METERS, NUM_RUBAI_METERS } from './meters';

export class PatternTree {
  private location: CodeLocation;
  private children: PatternTree[];

  constructor(loc: CodeLocation) {
    this.location = { ...loc };
    this.children = [];
  }

  addChild(loc: CodeLocation): void {
    if (this.children.length === 0) {
      if (loc.code === 'x') {
        this.children.push(new PatternTree({ ...loc, code: '-' }));
        this.children.push(new PatternTree({ ...loc, code: '=' }));
      } else {
        this.children.push(new PatternTree(loc));
      }
    } else {
      for (const child of this.children) child.addChild(loc);
    }
  }

  isMatch(): ScanPath[] {
    const b: ScanPath[] = [];
    for (const item of this.traverseOriginalHindi(makeScanPath(), 0)) b.push(item);
    for (const item of this.traverseZamzama(makeScanPath(), 0)) b.push(item);
    return b;
  }

  private countSyllables(scn: ScanPath): number {
    let count = 0;
    for (const loc of scn.location) {
      if (loc.code === '=') count += 2;
      else if (loc.code === '-') count += 1;
    }
    return count;
  }

  private addSpecialMeter(scn: ScanPath, mainList: ScanPath[], meterIndex: number): void {
    scn.meters.push(NUM_METERS + NUM_VARIED_METERS + NUM_RUBAI_METERS + meterIndex);
    mainList.push(scn);
  }

  private traverseZamzama(scn: ScanPath, state: number): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (this.children.length > 0) {
      for (const child of this.children) {
        const localState = zamzamaMeter(child.location.code, state);
        if (localState !== -1) {
          const scpath = makeScanPath();
          scpath.location.push(...scn.location, { ...child.location });
          mainList.push(...child.traverseZamzama(scpath, localState));
        }
      }
    } else {
      const count = this.countSyllables(scn);
      const last = scn.location[scn.location.length - 1];
      const secondLast = scn.location[scn.location.length - 2];
      const tryAdd = (cnt: number, mIdx: number) => {
        if (count === cnt && last?.code === '=') this.addSpecialMeter(scn, mainList, mIdx);
        else if (count === cnt + 1 && last?.code === '-' && secondLast?.code === '=') this.addSpecialMeter(scn, mainList, mIdx);
      };
      tryAdd(32, 8); tryAdd(24, 9); tryAdd(16, 10);
    }
    return mainList;
  }

  private traverseOriginalHindi(scn: ScanPath, state: number): ScanPath[] {
    const mainList: ScanPath[] = [];
    if (this.children.length > 0) {
      for (const child of this.children) {
        const localState = originalHindiMeter(child.location.code, state);
        if (localState !== -1) {
          const scpath = makeScanPath();
          scpath.location.push(...scn.location, { ...child.location });
          mainList.push(...child.traverseOriginalHindi(scpath, localState));
        }
      }
    } else {
      const count = this.countSyllables(scn);
      const last = scn.location[scn.location.length - 1];
      const secondLast = scn.location[scn.location.length - 2];
      const tryAdd = (cnt: number, mIdx: number) => {
        if (count === cnt && last?.code === '=') this.addSpecialMeter(scn, mainList, mIdx);
        if (count === cnt + 1 && last?.code === '-' && secondLast?.code === '=') this.addSpecialMeter(scn, mainList, mIdx);
      };
      tryAdd(30,0); tryAdd(22,1); tryAdd(32,2); tryAdd(14,3);
      tryAdd(16,4); tryAdd(10,5); tryAdd(24,6); tryAdd(8,7);
    }
    return mainList;
  }
}
