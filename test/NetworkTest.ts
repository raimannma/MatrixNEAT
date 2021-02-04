import {expect} from "chai";
import {Network} from "../src/Network";
import {fastIsNaN} from "../src/utils/Utils";

describe('Network Test', () => {
  it("copy networks", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2
    });

    for (let _ = 0; _ < 100; _++) A.mutate();

    const B = A.copy;
    expect(A).to.be.deep.equal(B);
  });
  it("add connection", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2
    });
    expect(A.copy.addConnection.bind(A, 0, 0)).to.throw("Can't connect to input node!");
    A.addConnection(0, 2);
    expect(fastIsNaN(A.adjacency.get(0, 2))).to.be.false;
    A.addConnection(0, 2, 8888);
    expect(A.adjacency.get(0, 2)).to.be.equals(8888);
  });
  it("forward with wrong input dimensions", () => {
    const A = new Network({
      inputSize: 2,
      outputSize: 2
    });
    expect(A.forward.bind(A, [1])).to.throw("Input dimensions doesn't match net dimensions.");
    expect(A.forward.bind(A, [1, 2, 3])).to.throw("Input dimensions doesn't match net dimensions.");
  });
});