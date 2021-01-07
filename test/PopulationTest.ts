import {describe, it} from "mocha";
import {Population} from "../src/Population";

describe("PopulationTest", () => {
  it("TEST", function () {
    this.timeout(0)
    const population = new Population(500, {inputSize: 2, outputSize: 1});

    let error = -Infinity;
    let iteration = 0;
    while (error < -0.01) {
      iteration++;
      error = population.evolve([[0, 0], [0, 1], [1, 0], [1, 1]], [[1], [0], [0], [1]]);
      console.log("========================");
      console.log("Iteration: " + iteration);
      console.log("Error: " + error);
    }
  });
});