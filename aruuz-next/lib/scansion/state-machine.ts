const HINDI_METER_TRANSITION: Record<string, number[]> = {
  '-': [2, 4, -1, 0, 5, -1, 7, -1],
  '=': [1, 0, 3, -1, 6, 1, -1, 0],
};

const ZAMZAMA_METER_TRANSITION: Record<string, number[]> = {
  '-': [1, 2, -1, -1],
  '=': [3, -1, 0, 0],
};

const ORIGINAL_HINDI_METER_TRANSITION: Record<string, number[]> = {
  '-': [-1, 2, 3, -1],
  '=': [1, 0, -1, 1],
};

function nextState(transition: Record<string, number[]>, input: string, state: number): number {
  const row = transition[input];
  if (!row || state < 0 || state >= row.length) return -1;
  return row[state];
}

export function hindiMeter(input: string, state: number): number {
  return nextState(HINDI_METER_TRANSITION, input, state);
}

export function zamzamaMeter(input: string, state: number): number {
  return nextState(ZAMZAMA_METER_TRANSITION, input, state);
}

export function originalHindiMeter(input: string, state: number): number {
  return nextState(ORIGINAL_HINDI_METER_TRANSITION, input, state);
}
