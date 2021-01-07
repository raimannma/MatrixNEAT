import {Matrix} from "./utils/Matrix";
import {MSE, pickRandom, randFloat} from "./utils/Utils";
import {TANH} from "activations";

export class Network {
  /**
   * Storing connections and weights
   * @private
   */
  adjacency: Matrix;
  /**
   * Storing the bias of each node
   * @private
   */
  nodes: Matrix;
  fitness: number;
  stagnation: number;
  readonly numInputs: number;
  readonly numOutputs: number;

  constructor(numInputs: number, numOutputs: number, randomBias: boolean = false) {
    this.numInputs = numInputs;
    this.numOutputs = numOutputs
    this.fitness = -Infinity;
    this.stagnation = 0;

    // Create adjacency matrix
    this.adjacency = Matrix.zeros(this.numInputs + this.numOutputs);

    // Create bias matrix (vector)
    let biases = [];
    for (let i = 0; i < numInputs; i++) biases.push(0);
    for (let i = 0; i < numOutputs; i++) biases.push(randomBias ? randFloat([-1, 1]) : 1);
    this.nodes = Matrix.fromVerticalVector(biases);
  }

  static fromJsonString(json: string): Network {
    let jsonNetwork = JSON.parse(json);
    const out = new Network(jsonNetwork[0], jsonNetwork[1]);
    out.adjacency = Matrix.fromJsonString(jsonNetwork[2]);
    out.nodes = Matrix.fromJsonString(jsonNetwork[2]);
    return out;
  }

  addNode(randomBias: boolean = false): number {
    this.nodes.addRowAtEnd(randomBias ? randFloat([-1, 1]) : 1);
    this.adjacency.addRowAndColumnAtEnd();
    return this.adjacency.rows - 1;
  }

  addConnection(id1: number, id2: number, weight: number = randFloat([-1, 1])) {
    if (id2 < this.numInputs) throw new ReferenceError("Can't connect to input node!");

    this.adjacency.set(id1, id2, weight);
  }

  forward(inputs: number[]) {
    if (inputs.length !== this.numInputs) throw new RangeError("Input dimensions doesn't match net dimensions.");

    const orderOfActivation = this.adjacency.topologicalSort();
    this.nodes.addColumnAtEnd(); // prepare for output values of each node

    // Set inputs
    for (let i = 0; i < this.numInputs; i++) {
      this.nodes.set(i, 1, inputs[i]);
    }

    // propagate
    for (let i = 0; i < orderOfActivation.length; i++) {
      let node = orderOfActivation[i];
      if (node < this.numInputs) continue; // do not propagate through input nodes

      // Propagate

      // Sum up input * weights
      let result = 0;
      let column = this.adjacency.getColumn(node);
      for (let i = 0; i < column.length; i++) {
        result += column[i] * this.nodes.get(i, 1);
      }

      // Add Bias
      result += this.nodes.get(node, 0);

      // Apply activation function
      result = TANH(result);

      // Store result
      this.nodes.set(node, 1, result);
    }

    // Collect outputs
    const out = [];
    for (let i = this.numInputs; i < this.numInputs + this.numOutputs; i++) {
      out.push(this.nodes.get(i, 1));
    }

    // Clear nodes matrix
    this.nodes.removeLastColumn();

    return out;
  }

  mutateModWeight(): void {
    const possible = [];
    this.adjacency.forEach((element, row, column) => {
      if (element !== 0) possible.push([row, column])
    });

    if (possible.length === 0) return;

    const randomConnection = pickRandom(possible);
    this.adjacency.set(randomConnection[0], randomConnection[1], randFloat([-1, 1]))
  }

  mutateAddConnection(): void {
    let sortedNodes = this.adjacency.topologicalSort();

    let possible = [];
    // Get all possible node pairs that don't have a connection and are forward pointing
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      for (let j = Math.max(this.numInputs, i + 1); j < sortedNodes.length; j++) {
        if (this.adjacency.get(sortedNodes[i], sortedNodes[j]) === 0) {
          possible.push([sortedNodes[i], sortedNodes[j]]);
        }
      }
    }

    if (possible.length === 0) return;

    const randomNodePair = pickRandom(possible);
    this.addConnection(randomNodePair[0], randomNodePair[1], randFloat([-1, 1]))
  }

  mutateAddNode(): void {
    const possible = [];
    this.adjacency.forEach((element, row, column) => {
      if (element !== 0) possible.push([row, column])
    });

    if (possible.length === 0) return;

    const randomConnection = pickRandom(possible);
    const newNode = this.addNode();
    this.addConnection(randomConnection[0], newNode, 1);
    this.addConnection(newNode, randomConnection[1], this.adjacency.get(randomConnection[0], randomConnection[1]));
  }

  evaluate(inputs: number[][], targets: number[][], loss: (output: number[], target: number[]) => number = MSE) {
    let error = 0;
    for (let i = 0; i < inputs.length; i++) {
      error -= loss(this.forward(inputs[i]), targets[i]);
    }
    error /= inputs.length;
    if (error <= this.fitness) this.stagnation++;
    else this.stagnation = 0;
    this.fitness = error
  }

  copy(): Network {
    return Network.fromJsonString(this.toJsonString());
  }

  toJsonString(): string {
    return JSON.stringify([this.numInputs, this.numOutputs, this.adjacency.toJsonString(), this.nodes.toJsonString()])
  }
}