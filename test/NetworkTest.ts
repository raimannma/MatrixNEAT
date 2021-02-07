import { expect } from "chai";
import { Network } from "../src/Network";
import { fastIsNaN } from "../src/utils/Utils";
import { Population } from "../src/Population";

describe("Network Test", () => {
  it("copy networks", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2,
    });

    for (let _ = 0; _ < 100; _++) A.mutate();

    const B = A.copy;
    expect(A).to.be.deep.equal(B);
  });
  it("add connection", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2,
    });
    expect(A.copy.addConnection.bind(A, 2, 3)).to.throw(
      "Can't connect from output node!"
    );
    expect(A.copy.addConnection.bind(A, 0, 0)).to.throw(
      "Can't connect to input node!"
    );
    A.addConnection(0, 2);
    expect(fastIsNaN(A.adjacency.get(0, 2))).to.be.false;
    expect(A.addConnection.bind(A, 0, 2)).to.throw(
      "Can't connect when there is already a connection!"
    );
    A.addConnection(0, 3, 8888);
    expect(A.adjacency.get(0, 3)).to.be.equals(8888);
  });
  it("forward with wrong input dimensions", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2,
    });
    expect(A.forward.bind(A, [1])).to.throw(
      "Input dimensions doesn't match net dimensions."
    );
    expect(A.forward.bind(A, [1, 2, 3])).to.throw(
      "Input dimensions doesn't match net dimensions."
    );
  });
  describe("is disabled", function () {
    it("is disabled network", () => {
      // Disabling connections does only work on population level, so expect always false
      const A = new Network({ inputSize: 2, outputSize: 2 });
      A.addConnection(0, 2);
      expect(A.isDisabled(0, 2)).to.be.false;
      A.disableConnection(0, 2);
      expect(A.isDisabled(0, 2)).to.be.false;
    });

    it("is disabled population", () => {
      const population = new Population(10, { inputSize: 2, outputSize: 2 });
      const A = population.networks[0];
      A.addConnection(0, 2);
      expect(A.isDisabled(0, 2)).to.be.false;
      A.disableConnection(0, 2);
      expect(A.isDisabled(0, 2)).to.be.true;
    });
  });
});
