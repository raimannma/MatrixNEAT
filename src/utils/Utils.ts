export function randFloat(bounds: [number, number]): number {
  return Math.random() * (bounds[1] - bounds[0]) + bounds[0];
}

export function randInt(bounds: [number, number]): number {
  const min = Math.ceil(bounds[0]);
  const max = Math.floor(bounds[1]);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function transposeArray(arr: number[][]): number[][] {
  return arr[0].map((col, i) => arr.map((row) => row[i]));
}

export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new RangeError("Can't pick from empty array.");

  return arr[randInt([0, arr.length - 1])];
}

export function sum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

export function cantorPair(a: number, b: number): number {
  return Math.round(b + ((a + b) * (a + b + 1)) / 2); // round to avoid float values
}

export function fastIsNaN(a: number) {
  return a !== a;
}
