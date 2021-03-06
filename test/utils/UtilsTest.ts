import { expect } from "chai";
import { describe, it } from "mocha";
import {
  cantorPair,
  fastIsNaN,
  pickRandom,
  randFloat,
  randInt,
  transposeArray,
} from "../../src/utils/Utils";

describe("UtilsTest", () => {
  describe("rand float", () => {
    it("random tests", () => {
      for (let i = 0; i < 1000; i++) {
        const rand = randFloat([-10, 10]);
        expect(rand).to.be.at.most(10);
        expect(rand).to.be.at.least(-10);
      }
    });
  });

  describe("rand integer", () => {
    it("random tests", () => {
      for (let i = 0; i < 1000; i++) {
        const rand = randInt([-10, 10]);
        expect(rand).to.be.at.most(10);
        expect(rand).to.be.at.least(-10);
        expect(Number.isInteger(rand)).to.be.true;
      }
    });
  });

  describe("transpose array", () => {
    it("transpose 2d arr", () => {
      const arr = [
        [1, 2],
        [3, 4],
      ];
      const transposed = [
        [1, 3],
        [2, 4],
      ];
      expect(transposeArray(arr)).to.be.eql(transposed);
    });
    it("transpose array random tests", () => {
      for (let i = 0; i < 1000; i++) {
        const A = randInt([5, 15]);
        const B = randInt([5, 15]);
        const arr = new Array(B).fill(new Array(A).fill(0));
        const transposed = new Array(A).fill(new Array(B).fill(0));
        expect(transposeArray(arr)).to.be.eql(transposed);
      }
    });
  });

  describe("pick random", () => {
    it("pick random throw", () => {
      expect(pickRandom.bind(null, [])).to.throw(
        "Can't pick from empty array."
      );
      expect(pickRandom.bind(null, [1])).not.to.throw;
    });
    it("pick random element", () => {
      const arr = [8, 3, 6, 3];
      expect(arr).to.include(pickRandom(arr));
    });
  });

  describe("cantor pair", () => {
    it("cantorPair(int,int) is int random tests", () => {
      for (let i = 0; i < 1000; i++) {
        const a = randInt([0, 100]);
        const b = randInt([0, 100]);
        const pair = cantorPair(a, b);
        expect(Number.isInteger(pair)).to.be.true;
      }
    });
    it("invert cantor pair random tests", () => {
      for (let i = 0; i < 1000; i++) {
        const a = randInt([0, 100]);
        const b = randInt([0, 100]);
        const pair = cantorPair(a, b);
        const w = Math.floor((Math.sqrt(8 * pair + 1) - 1) / 2);
        const t = (w * w + w) / 2;
        const b2 = pair - t;
        const a2 = w - b2;
        expect(a).to.be.equal(a2);
        expect(b).to.be.equal(b2);
      }
    });
    const examples = [
      { input: [2, 0], pair: 3 },
      { input: [3, 2], pair: 17 },
      { input: [2, 2], pair: 12 },
      { input: [0, 3], pair: 9 },
      { input: [47, 32], pair: 3192 },
      { input: [52, 1], pair: 1432 },
    ];
    for (const example of examples) {
      it(`calculate example cantorPair(${example.input}) -> ${example.pair}`, () => {
        expect(cantorPair(example.input[0], example.input[1])).to.be.equal(
          example.pair
        );
      });
    }
  });
  describe("fast is NaN", () => {
    it("test with NaN", () => {
      expect(fastIsNaN(NaN)).to.be.true;
    });
    it("test with no NaN", () => {
      for (let i = 0; i < 1000; i++) {
        expect(fastIsNaN(randFloat([-10, 10]))).to.be.false;
      }
      expect(fastIsNaN(Infinity)).to.be.false;
      expect(fastIsNaN(null)).to.be.false;
      expect(fastIsNaN(undefined)).to.be.false;
    });
  });
});
