import {describe, it} from "mocha"
import {expect} from "chai";
import {ALL_LOSSES} from "../../src/utils/Loss";
import {randFloat} from "../../src/utils/Utils";

describe("Loss", () => {
  Object.values(ALL_LOSSES).forEach((loss) => {
    describe(`${loss.name}`, () => {
      const targets: number[] = [randFloat([-50, 50]), randFloat([-50, 50]), randFloat([-50, 50])];
      const outputs: number[] = [randFloat([-50, 50]), randFloat([-50, 50]), randFloat([-50, 50])];

      it(`Loss.${loss.constructor.name}(targets=[${targets}], outputs=[${outputs}]) => {number}`, () => {
        expect(loss(targets, outputs)).to.be.a("number");
        expect(Number.isFinite(loss(targets, outputs))).to.be.true;
      });
    });
  });
});