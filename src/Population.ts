import {Network, NetworkOptions} from "./Network";
import {Logger} from "sitka";

export class Population {
  private readonly logger: Logger = Logger.getLogger({
    name: this.constructor.name,
  });
  private networks: Network[];
  private readonly populationSize: number;
  private readonly MAX_STAGNATION = 3;
  private readonly elitists: number = 10;
  private readonly netOptions: NetworkOptions;
  private options: PopulationOptions;

  constructor(size: number, netOptions: NetworkOptions, populationOptions: PopulationOptions) {
    this.logger.debug("Creating population...")
    // Apply default options to options parameter
    this.options = Object.assign({}, DefaultPopulationOptions, populationOptions);

    this.populationSize = size;
    this.netOptions = netOptions;
    this.elitists = this.options.elitists;
    this.networks = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.networks[i] = new Network(netOptions);
    }
    this.logger.debug(`Created population with ${this.size} networks.`)
  }

  get size(): number {
    return this.networks.length;
  }

  evolve(inputs: number[][], targets: number[][]): number {
    this.logger.debug("Evaluating fitness...");
    this.evaluateFitness(inputs, targets);
    this.logger.debug("Finished evaluating fitness.");

    this.networks.sort((a, b) => b.fitness - a.fitness); // sort descending

    this.logger.debug("Reproducing networks...");
    this.networks = this.networks.filter((network, index) => network.stagnation < this.MAX_STAGNATION || index < this.elitists);
    while (this.networks.length < this.populationSize) {
      this.networks.push(new Network(this.netOptions))
    }
    this.logger.debug("Reproduced networks.");

    this.logger.debug("Mutate networks...");
    for (let i = this.elitists; i < this.networks.length; i++) {
      this.networks[i].mutate();
    }
    this.logger.debug("Mutated networks.");

    return -this.networks[0].fitness;
  }

  evaluateFitness(inputs: number[][], targets: number[][]) {
    this.networks.forEach(network => network.evaluate(inputs, targets));
  }
}

export interface PopulationOptions {
  elitists?: number;
}

const DefaultPopulationOptions: Partial<PopulationOptions> = {
  elitists: 2
}