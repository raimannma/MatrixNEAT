import {Matrix} from "./utils/Matrix";
import {randFloat} from "./utils/Utils";
import {RELU} from "activations";

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
  private readonly numInputs: number;
  private readonly numOutputs: number;

  constructor(numInputs: number, numOutputs: number, randomBias: boolean = false) {
    this.numInputs = numInputs;
    this.numOutputs = numOutputs

    let totalStartNodes = this.numInputs + this.numOutputs;

    // Create adjacency matrix
    this.adjacency = Matrix.zeros(totalStartNodes, totalStartNodes);

    // Create bias matrix (vector)
    let biases = [];
    for (let i = 0; i < numInputs; i++) biases.push(0);
    for (let i = 0; i < numOutputs; i++) biases.push(randomBias ? randFloat([-1, 1]) : 1);
    this.nodes = Matrix.fromVerticalVector(biases);
  }

  addNode(randomBias: boolean = false) {
    this.nodes.addRowAtEnd(randomBias ? randFloat([-1, 1]) : 1);
    this.adjacency.addRowAndColumnAtEnd();
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
      column.forEach((weight, fromNode) => {
        result += weight * this.nodes.get(fromNode, 1);
      });

      // Add Bias
      result += this.nodes.get(node, 0);

      // Apply activation function
      result = RELU(result);

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
}