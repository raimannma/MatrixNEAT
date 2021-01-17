import {expect} from "chai";
import {describe, it} from "mocha";
import {isNumber, pickRandom, randFloat, randInt, transposeArray} from "../../src/utils/Utils";
import {Matrix} from "../../src/utils/Matrix";

describe("UtilsTest", () => {
  describe("rand float", () => {
    it("random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let rand = randFloat([-10, 10]);
        expect(isNumber(rand)).to.be.true;
        expect(rand).to.be.at.most(10);
        expect(rand).to.be.at.least(-10);
      }
    });
  });

  describe("rand integer", () => {
    it("random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let rand = randInt([-10, 10]);
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
        [3, 4]
      ];
      const transposed = [
        [1, 3],
        [2, 4]
      ];
      expect(transposeArray(arr)).to.be.eql(transposed)
    });
    it("transpose array random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let A = randInt([5, 15]);
        let B = randInt([5, 15]);
        const arr = new Array(B).fill(new Array(A).fill(0));
        const transposed = new Array(A).fill(new Array(B).fill(0));
        expect(transposeArray(arr)).to.be.eql(transposed);
      }
    });
  });

  describe("pick random", () => {
    it("pick random throw", () => {
      expect(pickRandom.bind([])).to.throw;
      expect(pickRandom.bind([1])).not.to.throw;
    });
    it("pick random element", () => {
      const arr = [8, 3, 6, 3];
      expect(arr).to.include(pickRandom(arr));
    });
  });

  describe("is number", () => {
    it("is number of string", () => {
      expect(isNumber("asas")).to.be.false;
    });
    it("is number of number", () => {
      expect(isNumber(0)).to.be.true;
      expect(isNumber(10000)).to.be.true;
    });
    it("is number of object", () => {
      expect(isNumber(Matrix.ones(1))).to.be.false;
    });
  });
});