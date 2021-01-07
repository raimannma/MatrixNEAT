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

export function MSE(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length) throw new RangeError("Array dimensions doesn't match.");
  let error = 0;
  for (let i = 0; i < arr1.length; i++) {
    error += Math.pow(arr1[i] - arr2[i], 2);
  }
  return error / arr1.length;
}

export function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new RangeError("Can't pick from empty array.");

  return arr[randInt([0, arr.length - 1])];
}