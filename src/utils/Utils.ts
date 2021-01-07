export function randFloat(bounds: [number, number]): number {
  return Math.random() * (bounds[1] - bounds[0]) + bounds[0];
}

export function randInt(bounds: [number, number]): number {
  let min = Math.ceil(bounds[0]);
  let max = Math.floor(bounds[1]);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function transposeArray(arr: number[][]): number[][] {
  return arr[0].map((col, i) => arr.map(row => row[i]));
}

export function isNumber(n: any) {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}