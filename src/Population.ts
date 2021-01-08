import {Network} from "./Network";

export class Population {
  private networks: Network[];
  private readonly populationSize: number;
  private readonly MAX_STAGNATION = 10;

  constructor(size: number, netOptions: { inputSize: number, outputSize: number }) {
    this.populationSize = size;
    this.networks = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.networks[i] = new Network(netOptions.inputSize, netOptions.outputSize);
    }
  }

  evolve(inputs: number[][], targets: number[][]): number {
    this.evaluateFitness(inputs, targets);
    this.networks.sort((a, b) => b.fitness - a.fitness); // sort descending
    const bestNetwork = this.networks[0].copy();

    this.networks = this.networks.filter(network => network.stagnation < this.MAX_STAGNATION);
    while (this.networks.length < this.populationSize) {
      this.networks.push(new Network(this.networks[0].numInputs, this.networks[0].numOutputs))
    }

    for (let i = this.elitists; i < this.networks.length; i++) {
      this.networks[i].mutate();
    }

    this.networks.splice(this.networks.length - 1, 1);
    this.networks.splice(0, 0, bestNetwork);

    bestNetwork.evaluate(inputs, targets);
    return bestNetwork.fitness;
  }

  evaluateFitness(inputs: number[][], targets: number[][]) {
    this.networks.forEach(network => network.evaluate(inputs, targets));
  }
}