import {Matrix, MatrixJSON} from "./utils/Matrix";
import {fastIsNaN, pickRandom, randFloat} from "./utils/Utils";
import {ActivationType, Identitiy} from "activations";
import {MSELoss} from "./utils/Loss";

export class Network {
  private static readonly WEIGHT_BOUNDS: [number, number] = [-1, 1];
  private static readonly BIAS_BOUNDS: [number, number] = [-1, 1];
  adjacency: Matrix;
  nodes: Matrix;
  fitness: number;
  stagnation: number;
  readonly numInputs: number;
  readonly numOutputs: number;
  readonly activation: ActivationType;
  readonly options: NetworkOptions;

  constructor(options: NetworkOptions) {
    // Apply default options to options parameter
    this.options = Object.assign({}, DefaultNetworkOptions, options);

    this.numInputs = this.options.inputSize;
    this.numOutputs = this.options.outputSize;
    this.fitness = -Infinity;
    this.stagnation = 0;
    this.activation = this.options.activation;

    // Create adjacency matrix
    this.adjacency = new Matrix(this.numInputs + this.numOutputs);

    // Create bias matrix (vector)
    let biases = [];
    for (let i = 0; i < this.numInputs; i++) biases.push(0);
    for (let i = 0; i < this.numOutputs; i++) biases.push(this.options.randomBias ? randFloat(Network.BIAS_BOUNDS) : 1);
    this.nodes = Matrix.fromVerticalVector(biases);
  }

  get connections(): [number, number][] {
    let connections = [];
    this.adjacency.forEach(((element, row, column) => {
      if (!fastIsNaN(element)) connections.push([row, column]);
    }));
    return connections;
  }

  get inputNodes(): number[] {
    return this.nodes.getColumnArray(0).map((value, index) => index).filter(nodeIndex => this.isInputNode(nodeIndex));
  }

  get outputNodes(): number[] {
    return this.nodes.getColumnArray(0).map((value, index) => index).filter(nodeIndex => this.isOutputNode(nodeIndex));
  }

  get copy(): Network {
    return Network.fromJson(this.json);
  }

  get json(): NetworkJSON {
    return {
      options: this.options,
      adjacency: this.adjacency.json,
      nodes: this.nodes.json,
    };
  }

  static fromJson(jsonNetwork: NetworkJSON): Network {
    const out = new Network(jsonNetwork.options);
    out.adjacency = Matrix.fromJson(jsonNetwork.adjacency);
    out.nodes = Matrix.fromJson(jsonNetwork.nodes);
    return out;
  }

  addNode(randomBias: boolean = false): number {
    this.nodes.addRowAtEnd(randomBias ? randFloat(Network.BIAS_BOUNDS) : 1);
    this.adjacency.addRowAndColumnAtEnd();
    return this.adjacency.rows - 1;
  }

  addConnection(index1: number, index2: number, weight: number = randFloat(Network.WEIGHT_BOUNDS)) {
    if (index2 < this.numInputs) throw new ReferenceError("Can't connect to input node!");

    this.adjacency.set(index1, index2, weight);
  }

  forward(inputs: number[]) {
    if (inputs.length !== this.numInputs) throw new RangeError("Input dimensions doesn't match net dimensions.");

    // get topological order, filter out input nodes
    const orderOfActivation = this.adjacency.getTopologicalSort().filter(nodeIndex => !this.isInputNode(nodeIndex));

    // prepare for output values of each node
    const outputColumn = this.nodes.columns;
    this.nodes.addColumnAtEnd();

    // Set inputs
    for (let nodeIndex of this.inputNodes) this.nodes.set(nodeIndex, outputColumn, inputs[nodeIndex]);

    // propagate
    orderOfActivation.forEach(node => {
      // Sum up input[i] * weights[i]
      let weights = this.adjacency.getColumnVector(node)
      let inputs = this.nodes.getColumnVector(outputColumn);

      let result = Matrix.dotProduct(weights, inputs);

      // Add Bias
      result += this.nodes.get(node, 0);

      // Apply activation function
      result = this.activation(result);

      // Store result
      this.nodes.set(node, outputColumn, result);
    });

    // Collect outputs
    const outputs = this.nodes.getColumnArray(outputColumn);
    // Clear nodes matrix
    this.nodes.removeColumn(outputColumn);
    return this.outputNodes.map(nodeIndex => outputs[nodeIndex]);
  }

  mutateModWeight(): void {
    if (this.connections.length === 0) return;

    const randomConnection = pickRandom(this.connections);
    this.adjacency.set(randomConnection[0], randomConnection[1], randFloat(Network.WEIGHT_BOUNDS))
  }

  mutateAddConnection(): void {
    let sortedNodes = this.adjacency.getTopologicalSort();

    let possible = [];
    // Get all possible node pairs that don't have a connection and are forward pointing
    for (let fromIndex = 0; fromIndex < sortedNodes.length - 1; fromIndex++) {
      for (let toIndex = fromIndex + 1; toIndex < sortedNodes.length; toIndex++) {
        const [fromNodeIndex, toNodeIndex] = [sortedNodes[fromIndex], sortedNodes[toIndex]];
        if (this.isOutputNode(fromNodeIndex)) continue;
        if (this.isInputNode(toNodeIndex)) continue;
        if (!fastIsNaN(this.getWeight(fromNodeIndex, toNodeIndex))) continue;

        possible.push([fromNodeIndex, toNodeIndex]);
      }
    }

    if (possible.length === 0) return;

    const randomNodePair = pickRandom(possible);
    this.addConnection(randomNodePair[0], randomNodePair[1], randFloat(Network.WEIGHT_BOUNDS))
  }

  mutateAddNode(): void {
    const possible = this.connections

    if (possible.length === 0) return;

    const randomConnection = pickRandom(possible);
    const newNode = this.addNode();
    this.addConnection(randomConnection[0], newNode, 1);
    this.addConnection(newNode, randomConnection[1], this.adjacency.get(randomConnection[0], randomConnection[1]));
  }

  evaluate(inputs: number[][], targets: number[][], loss: (output: number[], target: number[]) => number = MSELoss) {
    let error = 0;
    for (let i = 0; i < inputs.length; i++) {
      error -= loss(this.forward(inputs[i]), targets[i]);
    }
    error /= inputs.length;

    if (error <= this.fitness) this.stagnation++;
    else this.stagnation = 0;

    this.fitness = error;
  }

  mutate(distribution: { addNode: number, addConnection: number, modWeight: number } = {
    addNode: 0.6,
    addConnection: 0.4,
    modWeight: 0.6
  }) {
    if (Math.random() <= distribution.addNode) this.mutateAddNode();
    if (Math.random() <= distribution.addConnection) this.mutateAddConnection();
    if (Math.random() <= distribution.modWeight) this.mutateModWeight();
  }

  isInputNode(index: number): boolean {
    return index < this.numInputs;
  }

  isOutputNode(index: number): boolean {
    return this.numInputs <= index && index < this.numInputs + this.numOutputs;
  }

  private getWeight(fromIndex: number, toIndex: number): number {
    return this.adjacency.get(fromIndex, toIndex);
  }
}

export interface NetworkJSON {
  options: NetworkOptions;
  adjacency: MatrixJSON;
  nodes: MatrixJSON;
}

export interface NetworkOptions {
  inputSize: number;
  outputSize: number;
  randomBias?: boolean;
  activation?: ActivationType;
}

const DefaultNetworkOptions: Partial<NetworkOptions> = {
  randomBias: false,
  activation: Identitiy
}