import { expect } from "chai";
import { describe } from "mocha";
import { Population } from "../src/Population";
import { randInt } from "../src/utils/Utils";

describe("Population Test", () => {
  describe("id system", () => {
    it("population initialization", () => {
      const population = new Population(10, { inputSize: 2, outputSize: 2 });

      expect(population.numNodeIDs).to.be.equal(4);
    });
    it("add equivalent nodes", () => {
      const population = new Population(100, { inputSize: 2, outputSize: 2 });

      const nodeIDsBefore = population.numNodeIDs;
      for (const network of population.networks) {
        network.addConnection(0, 2);
        network.addNode(0, 2);
      }
      expect(population.numNodeIDs).to.be.equal(nodeIDsBefore + 1);
    });
    it("add non equivalent nodes", () => {
      const population = new Population(2, { inputSize: 2, outputSize: 2 });

      population.networks[0].addConnection(0, 2);
      population.networks[1].addConnection(1, 2);

      const nodeIDsBefore = population.numNodeIDs;
      population.networks[0].addNode(0, 2);
      population.networks[1].addNode(1, 2);
      expect(population.numNodeIDs).to.be.equal(nodeIDsBefore + 2);
    });
    it("add equivalent connections", () => {
      const population = new Population(100, { inputSize: 2, outputSize: 2 });

      const connIDsBefore = population.numConnIDs;
      for (const network of population.networks) {
        network.addConnection(0, 2);
      }
      expect(population.numConnIDs).to.be.equal(connIDsBefore + 1);
    });
    it("add non equivalent connections", () => {
      const population = new Population(2, { inputSize: 2, outputSize: 2 });

      const connIDsBefore = population.numConnIDs;
      population.networks[0].addConnection(0, 2);
      population.networks[1].addConnection(1, 2);
      expect(population.numConnIDs).to.be.equal(connIDsBefore + 2);
    });
    it("check that #networkids < #populationids", () => {
      const population = new Population(50, { inputSize: 2, outputSize: 2 });

      for (const network of population.networks) {
        for (let i = 0; i < 10; i++) {
          network.mutate();
          expect(network.nodes.rows).to.be.at.most(population.numNodeIDs);
          expect(network.connections.length).to.be.at.most(
            population.numConnIDs
          );
        }
      }
    });
    describe("id incrementation after adding to field", () => {
      it("node id incrementation", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        const counter = population.numNodeIDs;
        population.addNodeID(7000, 7001);
        expect(population.getNodeID(7000, 7001)).to.be.equal(counter);
      });
      it("conn id incrementation", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        const counter = population.numConnIDs;
        population.addConnID(7000, 7001);
        expect(population.getConnID(7000, 7001)).to.be.equal(counter);
      });
    });
    describe("add to population", () => {
      it("add node", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        expect(population.hasNodeID(7000, 7001)).to.be.false;
        population.addNodeID(7000, 7001);
        expect(population.hasNodeID(7000, 7001)).to.be.true;
      });
      it("add node two times", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });
        population.addNodeID(7000, 7001);
        expect(population.addNodeID.bind(population, 7000, 7001)).to.throw(
          "Cantor pair already used."
        );
      });
      it("add conn", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        expect(population.hasConnID(7000, 7001)).to.be.false;
        population.addConnID(7000, 7001);
        expect(population.hasConnID(7000, 7001)).to.be.true;
      });
      it("add conn two times", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });
        population.addConnID(7000, 7001);
        expect(population.addConnID.bind(population, 7000, 7001)).to.throw(
          "Cantor pair already used."
        );
      });
    });
    describe("increment id counters", () => {
      it("node id counter", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        const counter = population.numNodeIDs;
        population.addNodeID(7000, 7001);
        expect(population.numNodeIDs).to.be.equal(counter + 1);
      });
      it("conn id counter", () => {
        const population = new Population(10, { inputSize: 2, outputSize: 2 });

        const counter = population.numConnIDs;
        population.addConnID(7000, 7001);
        expect(population.numConnIDs).to.be.equal(counter + 1);
      });
    });
    describe("network mutations", () => {
      it("random mutations add connection", () => {
        const I = randInt([2, 6]);
        const O = randInt([2, 6]);
        const population = new Population(50, { inputSize: I, outputSize: O });
        for (let i = 0; i < 100; i++) {
          for (const network of population.networks) {
            network.mutateAddConnection();
            expect(population.numConnIDs).to.be.at.least(
              network.connections.length
            );
          }
        }
      });
      it("random mutations add node without connections", () => {
        for (let k = 0; k < 100; k++) {
          const I = randInt([2, 6]);
          const O = randInt([2, 6]);
          const population = new Population(1, { inputSize: I, outputSize: O });
          for (let i = 0; i < 100; i++) {
            population.networks[0].mutateAddNode();
          }
          expect(population.numNodeIDs).to.be.equal(I + O);
          expect(population.networks[0].nodes.rows).to.be.equal(I + O);
        }
      });
      it("random mutations add node with connections", () => {
        for (let k = 0; k < 100; k++) {
          const I = randInt([2, 6]);
          const O = randInt([2, 6]);
          const population = new Population(1, { inputSize: I, outputSize: O });
          for (let i = 0; i < 100; i++) {
            population.networks[0].mutateAddConnection();
          }
          for (let i = 0; i < 5; i++) {
            const numNodes = population.networks[0].nodes.rows;
            population.networks[0].mutateAddNode();
            expect(population.networks[0].nodes.rows).to.be.equal(numNodes + 1);
          }
          expect(population.numNodeIDs).to.be.equal(I + O + 5);
        }
      });
    });
  });
});
