import { Matrix, MatrixJSON } from "./utils/Matrix";
import { fastIsNaN, pickRandom, randFloat } from "./utils/Utils";
import { ActivationType, Identitiy } from "activations";
import { MSELoss } from "./utils/Loss";
import { Logger } from "sitka";
import { Population } from "./Population";

export class Network {
  private readonly logger: Logger = Logger.getLogger({
    name: this.constructor.name,
  });
  private static readonly WEIGHT_BOUNDS: [number, number] = [-1, 1];
  private static readonly BIAS_BOUNDS: [number, number] = [-1, 1];
  adjacency: Matrix;
  nodes: Matrix;
  fitness: number;
  stagnation: number;
  readonly numInputs: number;
  readonly numOutputs: number;
  readonly activation: ActivationType;
  population: Population;
  _connections: Matrix;
  readonly options: NetworkOptions;

  constructor(options: NetworkOptions) {
    this.logger.debug("Creating network...");
    // Apply default options to options parameter
    this.options = Object.assign({}, DefaultNetworkOptions, options);

    this.numInputs = this.options.inputSize;
    this.numOutputs = this.options.outputSize;
    this.fitness = -Infinity;
    this.stagnation = 0;
    this.activation = this.options.activation;
    this.population = this.options.population;

    // Create adjacency matrix
    this.adjacency = new Matrix(this.numInputs + this.numOutputs);

    // Create bias matrix (vector)
    const nodes = [];
    for (let i = 0; i < this.numInputs; i++) {
      if (this.population) {
        nodes.push([0, i]);
        Object.assign(this.population.nodeIDs, { [-i - 1]: i });
      } else nodes.push([0]);
    }
    for (let i = 0; i < this.numOutputs; i++) {
      if (this.population) {
        nodes.push([
          this.options.randomBias ? randFloat(Network.BIAS_BOUNDS) : 1,
          i + this.numInputs,
        ]);
        Object.assign(this.population.nodeIDs, {
          [-i - this.numInputs - 1]: i + this.numInputs,
        });
      } else
        nodes.push([
          this.options.randomBias ? randFloat(Network.BIAS_BOUNDS) : 1,
        ]);
    }
    this.nodes = Matrix.from2dArray(nodes);
    this._connections = Matrix.empty;
    this.logger.debug(
      `Created network with input size ${this.numInputs} and output size ${this.numOutputs}.`
    );
  }

  get connections(): [number, number][] {
    const connections = [];
    this.adjacency.forEach((element, row, column) => {
      if (!fastIsNaN(element)) connections.push([row, column]);
    });
    return connections;
  }

  get inputNodes(): number[] {
    return this.nodes
      .getColumnArray(0)
      .map((value, index) => index)
      .filter((nodeIndex) => this.isInputNode(nodeIndex));
  }

  get outputNodes(): number[] {
    return this.nodes
      .getColumnArray(0)
      .map((value, index) => index)
      .filter((nodeIndex) => this.isOutputNode(nodeIndex));
  }

  get copy(): Network {
    return Network.fromJson(this.json);
  }

  get json(): NetworkJSON {
    return {
      options: this.options,
      adjacency: this.adjacency.json,
      nodes: this.nodes.json,
      connections: this._connections.json,
    };
  }

  static fromJson(jsonNetwork: NetworkJSON): Network {
    const out = new Network(jsonNetwork.options);
    out.adjacency = Matrix.fromJson(jsonNetwork.adjacency);
    out.nodes = Matrix.fromJson(jsonNetwork.nodes);
    out._connections = Matrix.fromJson(jsonNetwork.connections);
    return out;
  }

  addNode(index1: number, index2: number, bias = 1) {
    // Create new node
    const newNodeIndex = this.nodes.rows;
    // If working on population level, set ID for new node
    if (this.population) {
      const [fromID, toID] = [this.indexToID(index1), this.indexToID(index2)];
      const newNodeID = this.population.getNodeID(fromID, toID);
      this.nodes.addRowAtEnd([bias, newNodeID]);
    } else {
      this.nodes.addRowAtEnd([bias]);
    }
    this.adjacency.addRowAndColumnAtEnd();

    // Remove previous connection
    const weight = this.adjacency.get(index1, index2);
    this.disableConnection(index1, index2);
    // Add connection from index1 to new node with weight 1
    this.addConnection(index1, newNodeIndex, 1);
    // Add connection from new node to index2 with weight of previous connection
    this.addConnection(newNodeIndex, index2, weight);
  }

  addConnection(
    fromIndex: number,
    toIndex: number,
    weight: number = randFloat([-1, 1])
  ) {
    if (this.isOutputNode(fromIndex))
      throw new ReferenceError("Can't connect from output node!");
    if (this.isInputNode(toIndex))
      throw new ReferenceError("Can't connect to input node!");
    if (!fastIsNaN(this.adjacency.get(fromIndex, toIndex)))
      throw new ReferenceError(
        "Can't connect when there is already a connection!"
      );

    // If working on population level, set ID for new connection
    if (this.population) {
      const newConnID = this.population.getConnID(
        this.indexToID(fromIndex),
        this.indexToID(toIndex)
      );

      // search for a disabled connection with same id
      let isADisabledConn = false;
      if (this._connections.columns >= 2) {
        const connIndex = this._connections
          .getColumnArray(0)
          .indexOf(newConnID);
        if (connIndex !== -1) {
          this._connections.set(connIndex, 1, 1); // enable old connection again
          isADisabledConn = true;
        }
      }

      if (!isADisabledConn) this._connections.addRowAtEnd([newConnID, 1]);
    }

    this.adjacency.set(fromIndex, toIndex, weight);
  }

  forward(inputs: number[]) {
    this.logger.debug("Forward through network...");
    if (inputs.length !== this.numInputs)
      throw new RangeError("Input dimensions doesn't match net dimensions.");

    // get topological order, filter out input nodes
    const orderOfActivation = this.adjacency
      .getTopologicalSort()
      .filter((nodeIndex) => !this.isInputNode(nodeIndex));

    // prepare for output values of each node
    const outputColumn = this.nodes.columns;
    this.nodes.addColumnAtEnd();

    // Set inputs
    for (const nodeIndex of this.inputNodes)
      this.nodes.set(nodeIndex, outputColumn, inputs[nodeIndex]);

    // propagate
    orderOfActivation.forEach((node) => {
      // Sum up input[i] * weights[i]
      const weights = this.adjacency.getColumnVector(node);
      const inputs = this.nodes.getColumnVector(outputColumn);

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
    return this.outputNodes.map((nodeIndex) => outputs[nodeIndex]);
  }

  mutateModWeight(): void {
    this.logger.debug("Mutating mod weight...");
    if (this.connections.length === 0) return;

    const randomConnection = pickRandom(this.connections);
    this.adjacency.set(
      randomConnection[0],
      randomConnection[1],
      randFloat(Network.WEIGHT_BOUNDS)
    );
  }

  mutateAddConnection(): void {
    this.logger.debug("Mutating add connection...");
    const sortedNodes = this.adjacency.getTopologicalSort();

    const possible = [];
    // Get all possible node pairs that don't have a connection and are forward pointing
    for (let fromIndex = 0; fromIndex < sortedNodes.length - 1; fromIndex++) {
      for (
        let toIndex = fromIndex + 1;
        toIndex < sortedNodes.length;
        toIndex++
      ) {
        const [fromNodeIndex, toNodeIndex] = [
          sortedNodes[fromIndex],
          sortedNodes[toIndex],
        ];
        if (this.isOutputNode(fromNodeIndex)) continue;
        if (this.isInputNode(toNodeIndex)) continue;
        if (!fastIsNaN(this.getWeight(fromNodeIndex, toNodeIndex))) continue;

        possible.push([fromNodeIndex, toNodeIndex]);
      }
    }

    if (possible.length === 0) return;

    const randomNodePair = pickRandom(possible);
    this.addConnection(
      randomNodePair[0],
      randomNodePair[1],
      randFloat(Network.WEIGHT_BOUNDS)
    );
  }

  mutateAddNode(): void {
    this.logger.debug("Mutating add node...");
    const possible = !this.population
      ? this.connections
      : this.connections.filter((conn) => {
          const [fromID, toID] = [
            this.indexToID(conn[0]),
            this.indexToID(conn[1]),
          ];
          if (!this.population.hasNodeID(fromID, toID)) return true;

          // Prevent parallel paths TODO: Find another method for this
          return !this.nodes
            .getColumnArray(1)
            .includes(this.population.getNodeID(fromID, toID));
        });

    if (possible.length === 0) return;

    const randomConnection = pickRandom(possible);
    this.addNode(randomConnection[0], randomConnection[1]);
  }

  evaluate(
    inputs: number[][],
    targets: number[][],
    loss: (output: number[], target: number[]) => number = MSELoss
  ) {
    let error = 0;
    for (let i = 0; i < inputs.length; i++) {
      error -= loss(this.forward(inputs[i]), targets[i]);
    }
    error /= inputs.length;

    if (error <= this.fitness) this.stagnation++;
    else this.stagnation = 0;

    this.fitness = error;
  }

  mutate(
    distribution: {
      addNode: number;
      addConnection: number;
      modWeight: number;
    } = {
      addNode: 0.6,
      addConnection: 0.4,
      modWeight: 0.6,
    }
  ) {
    this.logger.debug("Mutating...");
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

  private indexToID(index: number) {
    return this.nodes.get(index, 1);
  }

  private getWeight(fromIndex: number, toIndex: number): number {
    return this.adjacency.get(fromIndex, toIndex);
  }

  disableConnection(index1: number, index2: number) {
    if (this.population) {
      const connID = this.population.getConnID(
        this.indexToID(index1),
        this.indexToID(index2)
      );
      const connIndex = this._connections.getColumnArray(0).indexOf(connID);
      this._connections.set(connIndex, 1, 0); // disable connection
    }
    this.adjacency.set(index1, index2, NaN); // Set weight to NaN
  }

  isDisabled(index1: number, index2: number): boolean {
    if (this.population) {
      const connID = this.population.getConnID(
        this.indexToID(index1),
        this.indexToID(index2)
      );
      const connIndex = this._connections.getColumnArray(0).indexOf(connID);
      return this._connections.get(connIndex, 1) === 0;
    }
    return false;
  }
}

export interface NetworkJSON {
  options: NetworkOptions;
  adjacency: MatrixJSON;
  nodes: MatrixJSON;
  connections: MatrixJSON;
}

export interface NetworkOptions {
  inputSize: number;
  outputSize: number;
  randomBias?: boolean;
  activation?: ActivationType;
  population?: Population;
}

const DefaultNetworkOptions: Partial<NetworkOptions> = {
  randomBias: false,
  activation: Identitiy,
};
