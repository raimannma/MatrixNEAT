import { describe, it } from "mocha";
import { Matrix } from "../../src/utils/Matrix";
import { randFloat, randInt } from "../../src/utils/Utils";
import { expect } from "chai";

describe("Matrix Test", () => {
  it("matrix size random tests", () => {
    for (let _ = 0; _ < 1000; _++) {
      const i = randInt([1, 10]);
      const j = randInt([1, 10]);
      const A = Matrix.randFloat(i, j, [-5, 5]);
      expect(A.rows).to.be.equal(i);
      expect(A.columns).to.be.equal(j);
      expect(A.size).to.be.deep.equal([i, j]);
    }
  });
  it("empty matrix", () => {
    const E = Matrix.empty;
    expect(E.rows).to.be.equal(0);
    expect(E.columns).to.be.equal(0);
  });
  it("is row/column vector random tests", () => {
    for (let _ = 0; _ < 1000; _++) {
      const i = randInt([1, 5]);
      const j = randInt([1, 10]);
      const A = Matrix.randFloat(i, j, [-5, 5]);
      expect(A.isRowVector).to.be.equal(i === 1);
      expect(A.isColumnVector).to.be.equal(j === 1);
    }
  });
  it("copy matrices with copy function", () => {
    for (let _ = 0; _ < 1000; _++) {
      const i = randInt([1, 5]);
      const j = randInt([1, 10]);
      const A = Matrix.randFloat(i, j, [-5, 5]);
      const copy = A.copy;
      expect(A.equals(copy)).to.be.true;
    }
  });
  it("copy matrices with json", () => {
    for (let _ = 0; _ < 1000; _++) {
      const i = randInt([1, 5]);
      const j = randInt([1, 10]);
      const A = Matrix.randFloat(i, j, [-5, 5]);
      const copy = Matrix.fromJson(A.json);
      expect(A.equals(copy)).to.be.true;
    }
  });

  describe("remove row", () => {
    it("outside of matrix", () => {
      for (let i = 0; i < 1000; i++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        expect(A.removeRow.bind(A, i)).to.throw("MatrixIndexOutOfBounds");
      }
    });
    it("remove row from example matrices", () => {
      const A = Matrix.from2dArray([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      const B = Matrix.from2dArray([
        [1, 2, 3],
        [7, 8, 9],
      ]);
      expect(A.copy.removeRow(1).equals(B)).to.be.true;
    });
    it("remove last row", () => {
      for (let i = 0; i < 1000; i++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        expect(A.copy.removeRow(i - 1).equals(A.copy.removeLastRow())).to.be
          .true;
      }
    });
  });

  describe("remove column", () => {
    it("outside of matrix", () => {
      for (let i = 0; i < 1000; i++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        expect(A.removeColumn.bind(A, j)).to.throw("MatrixIndexOutOfBounds");
      }
    });
    it("remove column from example matrices", () => {
      const A = Matrix.from2dArray([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      const B = Matrix.from2dArray([
        [1, 3],
        [4, 6],
        [7, 9],
      ]);
      expect(A.copy.removeColumn(1).equals(B)).to.be.true;
    });
    it("remove last column", () => {
      for (let i = 0; i < 1000; i++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        expect(A.copy.removeColumn(j - 1).equals(A.copy.removeLastColumn())).to
          .be.true;
      }
    });
  });

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

      // Empty matrix is square
      expect(Matrix.empty.isSquare).to.be.true;
    });
    it("square matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
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
      for (let _ = 0; _ < 1000; _++) {
        const A = Matrix.randFloat(3, 4);
        expect(A.isSymmetric).to.be.false;
      }

      // Test random matrices
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([3, 5]);
        const j = randInt([3, 5]);
        const A = Matrix.randInt(i, j, [0, 1]);
        const A_Transpose = A.copy.transpose();

        // If it is symetric then it should be equal to it's transposed
        expect(A.isSymmetric).to.be.equal(A.equals(A_Transpose));
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
      expect(A.equals(transposed.transpose())).to.be.true;
    });
    it("transpose matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        // All Matrices should flip size dimensions
        expect(A.rows).to.be.equals(A.copy.transpose().columns);
        expect(A.columns).to.be.equals(A.copy.transpose().rows);

        // Symmetric matrices shouldn't change after transpose
        if (A.isSymmetric) expect(A.equals(A.copy.transpose())).to.be.true;

        // All matrices shouldn't change after two times transpose
        expect(A.equals(A.copy.transpose().transpose())).to.be.true;

        // Scalar multiplication
        const scalar = randFloat([-5, 5]);
        expect(
          A.copy.mul(scalar).transpose().equals(A.copy.transpose().mul(scalar))
        ).to.be.true;
      }
    });
  });

  describe("matrix get", () => {
    it("get outside of matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        expect(A.get.bind(A, -1, -1)).to.throw("MatrixIndexOutOfBounds");
        expect(A.get.bind(A, -1, 0)).to.throw("MatrixIndexOutOfBounds");
        expect(A.get.bind(A, 0, -1)).to.throw("MatrixIndexOutOfBounds");
        expect(A.get.bind(A, i, j)).to.throw("MatrixIndexOutOfBounds");
        expect(A.get.bind(A, i, 0)).to.throw("MatrixIndexOutOfBounds");
        expect(A.get.bind(A, 0, j)).to.throw("MatrixIndexOutOfBounds");
      }
    });
    it("get value in matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        for (let h = 0; h < 10; h++) {
          const [rowIndex, columnIndex] = [
            randInt([0, i - 1]),
            randInt([0, j - 1]),
          ];
          const value = randFloat([-1, 1]);
          A.set(rowIndex, columnIndex, value);
          expect(A.get(rowIndex, columnIndex)).to.be.equals(value);
        }
      }
    });
  });

  describe("matrix set", () => {
    it("set outside of matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);

        expect(A.set.bind(A, -1, -1, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
        expect(A.set.bind(A, -1, 0, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
        expect(A.set.bind(A, 0, -1, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
        expect(A.set.bind(A, i, j, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
        expect(A.set.bind(A, i, 0, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
        expect(A.set.bind(A, 0, j, 0, false)).to.throw(
          "MatrixIndexOutOfBounds"
        );
      }
    });
    it("set value in matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-1, 1]);

        A.set(0, 0, -8000, false);
        A.forEach((element, row, column) => {
          if (row === 0 && column === 0) expect(element).to.be.equals(-8000);
          else {
            expect(element).to.be.at.most(1);
            expect(element).to.be.at.least(-1);
          }
        });
      }
    });
    it("mirror values in set matrix random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 6]);
        const A = Matrix.zeros(i);

        for (let __ = 0; __ < 100; __++) {
          A.set(
            randInt([0, i - 1]),
            randInt([0, i - 1]),
            randFloat([-9, 9]),
            true
          );
        }

        expect(A.isSymmetric).to.be.true;
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
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
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
        [4, 0],
      ]);
      const expectedResult = Matrix.from2dArray([
        [7, 8],
        [9, 2],
      ]);
      expect(A.copy.mul(B).equals(expectedResult)).to.be.true;
    });
    it("matrix multiplication test", () => {
      let A = Matrix.randFloat(3, 3);
      const I = Matrix.eye(3);

      // Check identity matrix multiplication
      expect(A.copy.mul(I).equals(A)).to.be.true;
      expect(I.copy.mul(A).equals(A)).to.be.true;

      // Check sizes after multiplication
      A = Matrix.randFloat(2, 3);
      const B = Matrix.randFloat(3, 2);
      expect(A.copy.mul(B).rows).to.be.eq(2);
      expect(A.copy.mul(B).columns).to.be.eq(2);

      // Check transpose rule
      expect(
        A.copy
          .mul(B)
          .transpose()
          .equals(B.copy.transpose().mul(A.copy.transpose()))
      ).to.be.true;
    });
    it("matrix multiplication random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const j = randInt([1, 10]);
        const A = Matrix.randFloat(i, j, [-5, 5]);
        const B = Matrix.randFloat(i, j, [-5, 5]);
        const C = Matrix.randFloat(j, i, [-5, 5]);

        if (i !== j)
          expect(A.copy.mul.bind(A, B)).to.throw("MatrixIndexOutOfBounds");
        else expect(A.copy.mul(B).isSquare).to.be.true;

        expect(A.copy.mul(C).rows).to.be.eq(A.rows);
        expect(A.copy.mul(C).columns).to.be.eq(C.columns);
      }
    });
    it("matrix multiplication identity random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 10]);
        const A = Matrix.randFloat(i, i, [-5, 5]);
        const I = Matrix.eye(i);
        expect(A.copy.mul(I).equals(A));
        expect(I.copy.mul(A).equals(A));
      }
    });
  });

  describe("dot product", () => {
    it("no column vector", () => {
      for (let _ = 0; _ < 1000; _++) {
        const j = randInt([2, 10]);
        const A = Matrix.randFloat(10, j, [-5, 5]);
        const B = Matrix.randFloat(10, j, [-5, 5]);
        expect(Matrix.dotProduct.bind(null, A, B)).to.throw(
          "Matrix has to be a column vector for dot multiplication"
        );
      }
    });
    it("column vectors of different length", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([2, 10]);
        const A = Matrix.randFloat(i, 1, [-5, 5]);
        const B = Matrix.randFloat(i + 1, 1, [-5, 5]);
        expect(Matrix.dotProduct.bind(null, A, B)).to.throw(
          "Sizes of both vectors needs to be equal"
        );
      }
    });
    it("orthogonal vectors", () => {
      const A = Matrix.fromVerticalVector([1, 0]);
      const B = Matrix.fromVerticalVector([0, 1]);
      expect(Matrix.dotProduct(A, B)).to.be.equal(0);
    });
    it("symmetric multiplication", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([1, 50]);
        const A = Matrix.randFloat(i, 1, [-5, 5]);
        const B = Matrix.randFloat(i, 1, [-5, 5]);
        expect(Matrix.dotProduct(A, B)).to.be.equal(Matrix.dotProduct(B, A));
      }
    });
  });

  describe("topological sorting", () => {
    it("non square matrices random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 10]);
        let j = randInt([5, 10]);
        if (i === j) j++; // guarantee non square matrix
        const A = Matrix.randFloat(i, j);
        expect(A.getTopologicalSort.bind(A)).to.throw(
          "Topological sort only for square matrices possible"
        );
      }
    });
    it("topological sorting cycle graph", () => {
      const graph = new Matrix(4, 4);
      graph.set(0, 1, 1);
      graph.set(0, 2, 1);
      graph.set(2, 1, 1);
      graph.set(2, 3, 1);
      graph.set(3, 2, 1);
      expect(graph.getTopologicalSort.bind(graph)).to.throw(
        "There is a cycle in the matrix."
      );
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
      expect(graph.getTopologicalSort()).to.be.eql([0, 1, 2, 4, 5, 3]);

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
      expect(graph2.getTopologicalSort()).to.be.eql([0, 6, 1, 2, 3, 4, 5]);

      const graph3 = new Matrix(5, 5);
      graph3.set(0, 1, 1);
      graph3.set(0, 2, 1);
      graph3.set(2, 3, 1);
      graph3.set(2, 4, 1);

      const sort = graph3.getTopologicalSort();
      const parallel_sort = graph3.getTopologicalSort(false);

      expect(parallel_sort.flat()).to.be.eql(sort);
      expect(sort).to.be.eql([0, 1, 2, 3, 4]);
      expect(parallel_sort).to.be.eql([[0], [1, 2], [3, 4]]);
    });
  });
  describe("get row", () => {
    it("get row random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
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
      for (let _ = 0; _ < 1000; _++) {
        const [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
        ];

        const matrix = Matrix.from2dArray([
          [a, b, c],
          [d, e, f],
          [g, h, i],
        ]);
        expect(matrix.getColumnArray(0)).to.be.eql([a, d, g]);
        expect(matrix.getColumnArray(1)).to.be.eql([b, e, h]);
        expect(matrix.getColumnArray(2)).to.be.eql([c, f, i]);
        expect(matrix.getColumnArray.bind(matrix, 3)).to.throw(
          "MatrixIndexOutOfBounds"
        );
      }
    });
  });
  describe("get column vector", () => {
    it("get column vector random tests", () => {
      for (let _ = 0; _ < 1000; _++) {
        const [a, b, c, d, e, f, g, h, i] = [
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
          randFloat([-1, 1]),
        ];

        const matrix = Matrix.from2dArray([
          [a, b, c],
          [d, e, f],
          [g, h, i],
        ]);
        expect(matrix.getColumnVector(0)).to.be.eql(
          Matrix.from2dArray([[a], [d], [g]])
        );
        expect(matrix.getColumnVector(1)).to.be.eql(
          Matrix.from2dArray([[b], [e], [h]])
        );
        expect(matrix.getColumnVector(2)).to.be.eql(
          Matrix.from2dArray([[c], [f], [i]])
        );
        expect(matrix.getColumnVector.bind(matrix, 3)).to.throw(
          "MatrixIndexOutOfBounds"
        );
      }
    });
  });
  describe("set row", () => {
    it("outside of matrix", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 10]);
        const j = randInt([5, 10]);
        const A = Matrix.randFloat(i, j);
        expect(A.setRow.bind(A, i)).to.throw("MatrixIndexOutOfBounds");
      }
    });
    it("set row to scalar", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 10]);
        const j = randInt([5, 10]);
        const A = Matrix.randFloat(i, j);
        const scalar = randFloat([-10, 10]);
        A.setRow(3, scalar);
        expect(A.getRow(3)).to.be.eql(Array(j).fill(scalar));
      }
    });
    it("set row to array", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 10]);
        const j = randInt([5, 10]);
        const A = Matrix.randFloat(i, j);
        const array = Array(j).map(() => randFloat([-10, 10]));
        A.setRow(3, array);
        expect(A.getRow(3)).to.be.eql(array);
      }
    });
    it("set row to array with different size", () => {
      for (let _ = 0; _ < 1000; _++) {
        const i = randInt([5, 10]);
        const j = randInt([5, 10]);
        const A = Matrix.randFloat(i, j);
        const array = Array(j + 1).map(() => randFloat([-10, 10]));
        expect(A.setRow.bind(A, 3, array)).to.throw("MatrixIndexOutOfBounds");
      }
    });
  });
});
