export interface CodeLocation {
  code: string;
  wordRef: number;
  codeRef: number;
  word: string;
  fuzzy: number;
}

export function makeCodeLocation(): CodeLocation {
  return { code: '', wordRef: -1, codeRef: -1, word: '', fuzzy: 0 };
}

export interface ScanPath {
  location: CodeLocation[];
  meters: number[];
}

export function makeScanPath(): ScanPath {
  return { location: [], meters: [] };
}

export interface Feet {
  foot: string;
  code: string;
  words?: string;
}

export interface Words {
  id: number[];
  word: string;
  language: string[];
  taqti: string[];
  taqtiWordGraft: string[];
  code: string[];
  muarrab: string[];
  breakup: string[];
  length: number;
  isVaried: boolean[];
  error: boolean;
  modified: boolean;
}

export function makeWords(partial?: Partial<Words>): Words {
  return {
    id: [],
    word: '',
    language: [],
    taqti: [],
    taqtiWordGraft: [],
    code: [],
    muarrab: [],
    breakup: [],
    length: 0,
    isVaried: [],
    error: false,
    modified: false,
    ...partial,
  };
}

export interface ScanOutput {
  originalLine: string;
  words: Words[];
  feetList: Feet[];
  wordTaqti: string[];
  wordMuarrab: string[];
  feet: string;
  meterName: string;
  id: number;
  identifier: number;
  poet: string;
  title: string;
  text: string;
  url: string;
  numLines: number;
}

export function makeScanOutput(): ScanOutput {
  return {
    originalLine: '',
    words: [],
    feetList: [],
    wordTaqti: [],
    wordMuarrab: [],
    feet: '',
    meterName: '',
    id: 0,
    identifier: -1,
    poet: '',
    title: '',
    text: '',
    url: '',
    numLines: 0,
  };
}

export interface ScanOutputApi {
  originalLine: string;
  words: string[];
  codes: string[];
  meterName: string;
  feet: string;
}

export interface ScanOutputFuzzy {
  originalLine: string;
  words: Words[];
  error: boolean[];
  wordTaqti: string[];
  orignalTaqti: string[];
  feet: string;
  meterName: string;
  meterSyllables: string[];
  codeSyllables: string[];
  score: number;
  id: number;
  identifier: number;
  hidden: boolean;
}

export interface InputModel {
  text: string;
  isChecked: boolean;
  meter: string;
  id: number;
}

export interface MetersList {
  name: string;
  count: number;
}
