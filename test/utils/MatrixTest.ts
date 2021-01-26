import {describe, it} from "mocha"
import {Matrix} from "../../src/utils/Matrix";
import {randFloat, randInt} from "../../src/utils/Utils";
import {expect} from "chai";

describe("Matrix Test", () => {
  describe("square matrix", () => {
    it("square matrix test", () => {
      const A = Matrix.zeros(5, 5);
      expect(A.isSquare).to.be.true;

      // Add row makes it not squared
      A.addRowAtEnd(5);
      expect(A.isSquare).to.be.false;

      // Add column makes it squared again
      A.addColumnAtEnd(5);
      expect(A.isSquare).to.be.true;

      // Remove row makes it not squared
      A.removeRow(2);
      expect(A.isSquare).to.be.false;

      // Remove column makes it squared again
      A.removeColumn(2);
      expect(A.isSquare).to.be.true;
    });
    it("square matrix random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        expect(A.isSquare).to.be.equal(i === j);
      }
    });
  });
  describe("symmetric matrix", () => {
    it("symmetric matrix test", () => {
      const A = Matrix.eye(5, 5);
      expect(A.isSymmetric).to.be.true;

      // Change values makes matrix asymmetric
      A.set(3, 4, 10);
      expect(A.isSymmetric).to.be.false;

      // Change value on the opposite makes it symmetric again
      A.set(4, 3, 10);
      expect(A.isSymmetric).to.be.true;
    });
    it("symmetric matrix random tests", () => {
      // Test non square matrices -> should always return false
      for (let i = 0; i < 1000; i++) {
        const A = Matrix.randFloat(3, 4);
        expect(A.isSymmetric).to.be.false;
      }

      // Test random matrices
      for (let i = 0; i < 1000; i++) {
        let i = randInt([3, 5]);
        let j = randInt([3, 5]);
        const A = Matrix.randInt(i, j, [0, 1]);
        const A_Transpose = A.copy.transpose();

        // If it is symetric then it should be equal to it's transposed
        expect(A.isSymmetric).to.be.equal(A.equals(A_Transpose))
      }
    });
  });
  describe("transpose matrix", () => {
    it("transpose matrix test", () => {
      const A = Matrix.randFloat(5, 7);
      const transposed = A.copy.transpose();

      // Dimensions should flip
      expect(A.rows).to.be.equal(transposed.columns);
      expect(A.columns).to.be.equal(transposed.rows);

      // Check entries
      for (let i = 0; i < A.rows; i++) {
        for (let j = 0; j < A.columns; j++) {
          expect(A.get(i, j)).to.be.equals(transposed.get(j, i));
        }
      }

      // Two times transpose should be the same as original
      expect(A.equals(transposed.transpose())).to.be.true
    });
    it("transpose matrix random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        // All Matrices should flip size dimensions
        expect(A.rows).to.be.equals(A.copy.transpose().columns);
        expect(A.columns).to.be.equals(A.copy.transpose().rows);

        // Symmetric matrices shouldn't change after transpose
        if (A.isSymmetric) expect(A.equals(A.copy.transpose())).to.be.true;

        // All matrices shouldn't change after two times transpose
        expect(A.equals(A.copy.transpose().transpose())).to.be.true

        // Scalar multiplication
        const scalar = randFloat([-5, 5]);
        expect(A.copy.mul(scalar).transpose().equals(A.copy.transpose().mul(scalar))).to.be.true;
      }
    });
  });

  describe("matrix get", () => {
    it("get outside of matrix random tests", () => {
      for (let k = 0; k < 1000; k++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        expect(A.get.bind(-1, -1)).to.throw;
        expect(A.get.bind(-1, 0)).to.throw;
        expect(A.get.bind(0, -1)).to.throw;
        expect(A.get.bind(i, j)).to.throw;
        expect(A.get.bind(i, 0)).to.throw;
        expect(A.get.bind(0, j)).to.throw;
      }
    });
    it("get value in matrix random tests", () => {
      for (let k = 0; k < 1000; k++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        for (let h = 0; h < 10; h++) {
          let [rowIndex, columnIndex] = [randInt([0, i - 1]), randInt([0, j - 1])];
          let value = randFloat([-1, 1]);
          A.set(rowIndex, columnIndex, value);
          expect(A.get(rowIndex, columnIndex)).to.be.equals(value);
        }
      }
    });
  });

  describe("matrix set", () => {
    it("set outside of matrix random tests", () => {
      for (let k = 0; k < 1000; k++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        expect(A.set.bind(-1, -1, 0, false)).to.throw;
        expect(A.set.bind(-1, 0, 0, false)).to.throw;
        expect(A.set.bind(0, -1, 0, false)).to.throw;
        expect(A.set.bind(i, j, 0, false)).to.throw;
        expect(A.set.bind(i, 0, 0, false)).to.throw;
        expect(A.set.bind(0, j, 0, false)).to.throw;
      }
    });
    it("set value in matrix random tests", () => {
      for (let k = 0; k < 1000; k++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-1, 1]);

        A.set(0, 0, -8000, false);
        A.forEach(((element, row, column) => {
          if (row === 0 && column === 0) expect(element).to.be.equals(-8000)
          else {
            expect(element).to.be.at.most(1);
            expect(element).to.be.at.least(-1);
          }
        }));
      }
    });
    it("mirror values in set matrix random tests", () => {
      for (let k = 0; k < 1000; k++) {
        let i = randInt([5, 6]);
        const A = Matrix.zeros(i);

        for (let h = 0; h < 100; h++) {
          A.set(randInt([0, i - 1]), randInt([0, i - 1]), randFloat([-9, 9]), true);
        }

        expect(A.isSymmetric).to.be.true
      }
    });
  });

  describe("scalar matrix multiplication", () => {
    it("scalar matrix multiplication test", () => {
      const A = Matrix.randFloat(4, 7);
      const original = A.to2DArray();

      const scalar = 5;
      A.mul(scalar);

      A.forEach((element, row, column) => {
        expect(element).to.be.equal(original[row][column] * scalar);
      });
    });
    it("scalar matrix multiplication random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        const original = A.to2DArray();

        const scalar = randFloat([-10, 10]);
        A.mul(scalar);

        A.forEach((element, row, column) => {
          expect(element).to.be.equal(original[row][column] * scalar);
        });
      }
    });
  });
  describe("matrix multiplication", () => {
    it("test specific matrix", () => {
      const A = Matrix.from2dArray([
        [3, 2, 1],
        [1, 0, 2],
      ]);
      const B = Matrix.from2dArray([
        [1, 2],
        [0, 1],
        [4, 0]
      ]);
      const expectedResult = Matrix.from2dArray([
        [7, 8],
        [9, 2]
      ]);
      expect(A.copy.mul(B).equals(expectedResult)).to.be.true;
    });
    it("matrix multiplication test", () => {
      let A = Matrix.randFloat(3, 3);
      const I = Matrix.eye(3);

      // Check identity matrix multiplication
      expect(A.copy.mul(I).equals(A)).to.be.true
      expect(I.copy.mul(A).equals(A)).to.be.true

      // Check sizes after multiplication
      A = Matrix.randFloat(2, 3);
      const B = Matrix.randFloat(3, 2);
      expect(A.copy.mul(B).rows).to.be.eq(2);
      expect(A.copy.mul(B).columns).to.be.eq(2);

      // Check transpose rule
      expect(A.copy.mul(B).transpose().equals(B.copy.transpose().mul(A.copy.transpose()))).to.be.true
    });
    it("matrix multiplication random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 10]);
        let j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        const B = Matrix.randFloat(i, j, [-5, 5]);
        const C = Matrix.randFloat(j, i, [-5, 5]);

        if (i !== j) expect(A.copy.mul.bind(B)).to.throw;
        else expect(A.copy.mul(B).isSquare).to.be.true;

        expect(A.copy.mul(C).rows).to.be.eq(A.rows);
        expect(A.copy.mul(C).columns).to.be.eq(C.columns);
      }
    });
    it("matrix multiplication identity random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 10]);
        const A = Matrix.randFloat(i, i, [-5, 5]);
        const I = Matrix.eye(i);
        expect(A.copy.mul(I).equals(A));
        expect(I.copy.mul(A).equals(A));
      }
    });
  });

  describe("dot product", () => {
    it("no column vector", () => {
      for (let i = 0; i < 1000; i++) {
        let j = randInt([2, 10]);
        const A = Matrix.randFloat(10, j, [-5, 5]);
        const B = Matrix.randFloat(10, j, [-5, 5]);
        expect(Matrix.dotProduct.bind(A, B)).to.throw;
      }
    });
    it("column vecotors of different length", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([2, 10]);
        const A = Matrix.randFloat(i, 1, [-5, 5]);
        const B = Matrix.randFloat(i + 1, 1, [-5, 5]);
        expect(Matrix.dotProduct.bind(A, B)).to.throw;
      }
    })
    it("orthogonal vectors", () => {
      const A = Matrix.fromVerticalVector([1, 0]);
      const B = Matrix.fromVerticalVector([0, 1]);
      expect(Matrix.dotProduct(A, B)).to.be.equal(0);
    });
    it("symmetric multiplication", () => {
      for (let i = 0; i < 1000; i++) {
        let i = randInt([1, 50]);
        const A = Matrix.randFloat(i, 1, [-5, 5]);
        const B = Matrix.randFloat(i, 1, [-5, 5]);
        expect(Matrix.dotProduct(A, B)).to.be.equal(Matrix.dotProduct(B, A));
      }
    });
  });

  describe("topological sorting", () => {
    it("topological sorting cycle graph", () => {
      const graph = new Matrix(4, 4);
      graph.set(0, 1, 1);
      graph.set(0, 2, 1);
      graph.set(2, 1, 1);
      graph.set(2, 3, 1);
      graph.set(3, 2, 1);
      expect(graph.getTopologicalSort).to.throw
    });
    it("topological sort non cycle graph", () => {
      const graph = new Matrix(6, 6);
      graph.set(0, 1, 1);
      graph.set(1, 2, 1);
      graph.set(1, 3, 1);
      graph.set(2, 4, 1);
      graph.set(2, 5, 1);
      graph.set(4, 5, 1);
      graph.set(5, 3, 1);

      const sort = graph.getTopologicalSort();
      for (let node of sort) {
        expect(graph.isEmptyColumn(node)).to.be.true;
        graph.setRow(node);
      }

      const graph2 = new Matrix(7, 7);
      graph2.set(0, 1, 1);
      graph2.set(1, 2, 1);
      graph2.set(1, 3, 1);
      graph2.set(1, 4, 1);
      graph2.set(2, 3, 1);
      graph2.set(2, 4, 1);
      graph2.set(3, 4, 1);
      graph2.set(4, 5, 1);
      graph2.set(6, 3, 1);

      const sort2 = graph2.getTopologicalSort();
      for (let node of sort2) {
        expect(graph2.isEmptyColumn(node)).to.be.true;
        graph2.setRow(node);
      }
    });
  });
  describe("get row", () => {
    it("get row random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1])
        ];

        const matrix = Matrix.from2dArray([
          [a, b, c],
          [d, e, f],
          [g, h, i],
        ]);
        expect(matrix.getRow(0)).to.be.eql([a, b, c]);
        expect(matrix.getRow(1)).to.be.eql([d, e, f]);
        expect(matrix.getRow(2)).to.be.eql([g, h, i]);
      }
    });
  });
  describe("get column array", () => {
    it("get column array random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1])
        ];

        const matrix = Matrix.from2dArray([
          [a, b, c],
          [d, e, f],
          [g, h, i],
        ]);
        expect(matrix.getColumnArray(0)).to.be.eql([a, d, g]);
        expect(matrix.getColumnArray(1)).to.be.eql([b, e, h]);
        expect(matrix.getColumnArray(2)).to.be.eql([c, f, i]);
      }
    });
  });
  describe("get column vector", () => {
    it("get column vector random tests", () => {
      for (let i = 0; i < 1000; i++) {
        let [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1])
        ];

        const matrix = Matrix.from2dArray([
          [a, b, c],
          [d, e, f],
          [g, h, i],
        ]);
        expect(matrix.getColumnVector(0)).to.be.eql(Matrix.from2dArray([[a], [d], [g]]));
        expect(matrix.getColumnVector(1)).to.be.eql(Matrix.from2dArray([[b], [e], [h]]));
        expect(matrix.getColumnVector(2)).to.be.eql(Matrix.from2dArray([[c], [f], [i]]));
      }
    });
  });
});