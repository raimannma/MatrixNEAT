import {expect} from "chai";
import {describe, it} from "mocha";
import {isNumber, MSE, pickRandom} from "../../src/utils/Utils";
import {Matrix} from "../../src/utils/Matrix";

describe("UtilsTest", () => {
  describe("MSE", () => {
    it("mse throw", () => {
      expect(MSE.bind([1], [1, 2])).to.throw
      expect(MSE.bind([], [])).to.throw
    });
    it("mse calculation", () => {
      let a = [0, 0];
      let b = [0, 0];
      expect(MSE(a, b)).to.be.equal(0);
      a = [1, 0];
      expect(MSE(a, b)).to.be.equal(0.5);
      a = [1, 1];
      expect(MSE(a, b)).to.be.equal(1);
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