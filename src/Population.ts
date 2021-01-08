import {Network} from "./Network";

export class Population {
  private networks: Network[];
  private readonly populationSize: number;
  private readonly MAX_STAGNATION = 3;
  private readonly elitists: number = 10;

  constructor(size: number, netOptions: { inputSize: number, outputSize: number }, populationOptions: { elitists: number } = {elitists: Math.floor(1 / 10 * size)}) {
    this.populationSize = size;
    this.elitists = populationOptions.elitists;
    this.networks = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.networks[i] = new Network(netOptions.inputSize, netOptions.outputSize);
    }
  }

  get size(): number {
    return this.networks.length;
  }

  evolve(inputs: number[][], targets: number[][]): number {
    this.evaluateFitness(inputs, targets);
    this.networks.sort((a, b) => b.fitness - a.fitness); // sort descending

    this.networks = this.networks.filter((network, index) => network.stagnation < this.MAX_STAGNATION || index < this.elitists);
    while (this.networks.length < this.populationSize) {
      this.networks.push(new Network(this.networks[0].numInputs, this.networks[0].numOutputs))
    }

    for (let i = this.elitists; i < this.networks.length; i++) {
      this.networks[i].mutate();
    }

    return -this.networks[0].fitness;
  }

  evaluateFitness(inputs: number[][], targets: number[][]) {
    this.networks.forEach(network => network.evaluate(inputs, targets));
  }
}