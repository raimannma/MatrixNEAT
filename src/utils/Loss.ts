import { sum } from "./Utils";

export type lossType = (targets: number[], outputs: number[]) => number;

export const MSELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += (targets[index] - value) ** 2;
  });
  return error / outputs.length;
};
export const MBELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += targets[index] - value;
  });
  return error / outputs.length;
};
export const BinaryLoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += Math.round(targets[index] * 2) !== Math.round(value * 2) ? 1 : 0;
  });
  return error / outputs.length;
};
export const MAELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += Math.abs(targets[index] - value);
  });
  return error / outputs.length;
};
export const MAPELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += Math.abs(
      (value - targets[index]) / Math.max(targets[index], 1e-15)
    );
  });
  return error / outputs.length;
};
export const WAPELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += Math.abs(targets[index] - value);
  });
  return error / sum(targets);
};
export const MSLELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error +=
      Math.log(Math.max(targets[index], 1e-15)) -
      Math.log(Math.max(value, 1e-15));
  });
  return error / outputs.length;
};

export const HINGELoss: lossType = (
  targets: number[],
  outputs: number[]
): number => {
  let error = 0;
  outputs.forEach((value, index) => {
    error += Math.max(0, 1 - value * targets[index]);
  });
  return error / outputs.length;
};

export const ALL_LOSSES = [
  MSELoss,
  MBELoss,
  BinaryLoss,
  MAELoss,
  MAPELoss,
  WAPELoss,
  MSLELoss,
  HINGELoss,
];
