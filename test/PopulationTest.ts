import {expect} from "chai";
import {describe, it} from "mocha";
import {Population} from "../src/Population";

describe("PopulationTest", () => {

  const data = {
    AND: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [0],
        [0],
        [0],
        [1],
      ]
    },
    OR: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [0],
        [1],
        [1],
        [1],
      ]
    },
    XOR: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [0],
        [1],
        [1],
        [0],
      ]
    },
    NOT: {
      inputs: [
        [0],
        [1],
      ],
      outputs: [
        [1],
        [0],
      ]
    },
    NAND: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [1],
        [1],
        [1],
        [0],
      ]
    },
    NOR: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [1],
        [0],
        [0],
        [0],
      ]
    },
    XNOR: {
      inputs: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ],
      outputs: [
        [1],
        [0],
        [0],
        [1],
      ]
    },
  };

  describe("Logic Gates", () => {
    for (const [key, value] of Object.entries(data)) {
      it(`Test convergence on ${key}`, () => {
        const population = new Population(
          100,
          {
            inputSize: value.inputs[0].length,
            outputSize: value.outputs[0].length
          }, {
            elitists: 5
          }
        );

        const startError = population.evolve(value.inputs, value.outputs);

        // error should not grow over iterations
        for (let i = 0; i < 50; i++) {
          let currentError = population.evolve(value.inputs, value.outputs);
          expect(currentError).to.be.at.most(startError);
        }
      });
    }
  });
});