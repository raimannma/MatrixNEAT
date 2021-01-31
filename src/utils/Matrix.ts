import {fastIsNaN, isNumber, randFloat, randInt, transposeArray} from "./Utils";

export class Matrix {
  private data: number[][];

  constructor(rows: number, columns: number = rows) {
    this.data = [];
    for (let i = 0; i < rows; i++) {
      this.data.push(new Array(columns).fill(NaN));
    }
  }

  static get empty(): Matrix {
    return new Matrix(0, 0);
  }

  get size(): [number, number] {
    return [this.rows, this.columns];
  }

  get rows() {
    return this.data.length;
  }

  get columns() {
    return this.rows !== 0 ? this.data[0].length : 0;
  }

  get copy(): Matrix {
    return Matrix.from2dArray(this.to2DArray());
  }

  get isSquare(): boolean {
    return this.data.length !== 0 ? this.data.length === this.data[0].length : true;
  }

  get isSymmetric(): boolean {
    if (!this.isSquare) return false;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j <= i; j++) {
        if (this.get(i, j) !== this.get(j, i)) {
          return false;
        }
      }
    }
    return true;
  }

  get isRowVector(): boolean {
    return this.rows === 1;
  }

  get isColumnVector(): boolean {
    return this.columns === 1;
  }

  get json(): MatrixJSON {
    return {data: this.data};
  }

  get emptyColumns() {
    let out = [];
    for (let i = 0; i < this.columns; i++) {
      if (this.isEmptyColumn(i)) out.push(i);
    }
    return out;
  }

  static fromVerticalVector(vector: number[]) {
    return new Matrix(vector.length, 1).map((_, row) => vector[row]);
  }

  static zeros(rows: number, columns: number = rows): Matrix {
    return new Matrix(rows, columns).fill(0);
  }

  static ones(rows: number, columns: number = rows): Matrix {
    return new Matrix(rows, columns).fill(1);
  }

  static eye(rows: number, columns: number = rows, value: number = 1): Matrix {
    const out = this.zeros(rows, columns);
    for (let i = 0; i < Math.min(out.rows, out.columns); i++) {
      out.set(i, i, value);
    }
    return out;
  }

  static randFloat(rows: number, columns: number = rows, bounds: [number, number] = [0, 1]): Matrix {
    return new Matrix(rows, columns).map(_ => randFloat(bounds));
  }

  static randInt(rows: number, columns: number = rows, bounds: [number, number] = [-1, 1]): Matrix {
    return new Matrix(rows, columns).map(_ => randInt(bounds));
  }

  static from2dArray(arr: number[][]): Matrix {
    return new Matrix(0, 0).copyData(arr);
  }

  static fromJson(json: MatrixJSON): Matrix {
    return Matrix.from2dArray(json.data);
  }

  static dotProduct(A: Matrix, B: Matrix): number {
    if (!A.isColumnVector || !B.isColumnVector) throw new RangeError("Matrix has to be a column vector for dot multiplication");
    if (A.rows !== B.rows) throw new RangeError("Sizes of both vectors needs to be equal");

    return A.copy.transpose().mul(B).get(0, 0);
  }

  getTopologicalSort(): number[] {
    if (!this.isSquare) throw new RangeError("Topological sort only for square matrices possible");

    const copy = this.copy;
    const sortedList = [];
    const emptyColumns = copy.emptyColumns;

    while (emptyColumns.length !== 0) {
      let i = emptyColumns.splice(0, 1)[0]; // remove first node without incoming edges
      sortedList.push(i); // add it to the sorted list

      for (let j = 0; j < copy.data[i].length; j++) {
        if (fastIsNaN(copy.data[i][j])) continue;

        copy.data[i][j] = NaN;
        if (copy.isEmptyColumn(j)) emptyColumns.push(j);
      }
    }
    if (copy.emptyColumns.length !== copy.columns) throw new ReferenceError("There is a cycle in the matrix.");
    return sortedList;
  }

  mul(other: Matrix | number): Matrix {
    // scalar multiplication
    if (isNumber(other)) return this.map(element => element * (other as number));

    // Matrix multiplication
    const B = other as Matrix
    if (this.columns !== B.rows) throw new RangeError("MatrixIndexOutOfBounds");

    const result = Matrix.zeros(this.rows, B.columns);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < B.columns; j++) {
        let sum = 0;
        for (let k = 0; k < this.columns; k++) {
          let factor1 = this.get(i, k);
          let factor2 = B.get(k, j);
          if (fastIsNaN(factor1) || fastIsNaN(factor2)) continue
          sum += this.get(i, k) * B.get(k, j);
        }
        result.set(i, j, sum);
      }
    }

    this.copyData(result.to2DArray());
    return this;
  }

  get(rowIndex: number, columnIndex: number): number {
    if (!this.checkRowIndex(rowIndex) || !this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    return this.data[rowIndex][columnIndex];
  }

  set(rowIndex: number, columnIndex: number, value: number, mirror: boolean = false): Matrix {
    if (!this.checkRowIndex(rowIndex) || !this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    this.data[rowIndex][columnIndex] = value;
    return mirror
      ? this.set(columnIndex, rowIndex, value, false)
      : this;
  }

  checkRowIndex(index: number): boolean {
    return index >= 0 && index < this.rows;
  }

  checkColumnIndex(index: number): boolean {
    return index >= 0 && index < this.columns;
  }

  to2DArray(): number[][] {
    return this.data.map(row => [...row]);
  }

  transpose(): Matrix {
    this.copyData(transposeArray(this.to2DArray()));
    return this;
  }

  prettyPrint(): Matrix {
    console.log("--------------------");
    console.log("Matrix:")
    for (let row of this.data) {
      console.log(JSON.stringify(row));
    }
    return this;
  }

  fill(value: number): Matrix {
    return this.map(_ => value);
  }

  removeRow(rowIndex: number): Matrix {
    if (!this.checkRowIndex(rowIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    this.data.splice(rowIndex, 1);
    return this;
  }

  removeLastRow(): Matrix {
    return this.removeRow(this.rows - 1);
  }

  removeColumn(columnIndex: number): Matrix {
    if (!this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    for (let row of this.data) {
      row.splice(columnIndex, 1);
    }
    return this;
  }

  removeLastColumn(): Matrix {
    return this.removeColumn(this.columns - 1);
  }

  addRowAtIndex(rowIndex: number, value: number[] | number = NaN): Matrix {
    this.data.splice(
      rowIndex,
      0,
      Array.isArray(value) ? value : new Array(this.columns).fill(value)
    );
    return this;
  }

  addRowAtEnd(value: number[] | number = NaN): Matrix {
    return this.addRowAtIndex(this.rows, value);
  }

  addColumnAtIndex(columnIndex: number, value: number[] | number = NaN): Matrix {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].splice(columnIndex, 0, Array.isArray(value) ? value[i] : value);
    }
    return this;
  }

  addColumnAtEnd(value: number[] | number = NaN): Matrix {
    return this.addColumnAtIndex(this.columns, value);
  }

  addRowAndColumnAtEnd(value: number[] | number = NaN): Matrix {
    return this.addRowAtEnd(value).addColumnAtEnd(value);
  }

  map(callback: (element: number, row: number, column: number, matrix: Matrix) => number): Matrix {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.set(i, j, callback(this.get(i, j), i, j, this));
      }
    }
    return this;
  }

  forEach(callback: (element: number, row: number, column: number, matrix: Matrix) => void) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        callback(this.get(i, j), i, j, this);
      }
    }
  }

  equals(other: Matrix): boolean {
    if (this.rows !== other.rows || this.columns !== other.columns) return false;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.get(i, j) != other.get(i, j)) {
          return false;
        }
      }
    }
    return true;
  }

  getColumnArray(columnIndex: number): number[] {
    if (!this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    const out = [];
    for (let i = 0; i < this.rows; i++) {
      out.push(this.data[i][columnIndex]);
    }
    return out;
  }

  getColumnVector(columnIndex: number): Matrix {
    if (!this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    return Matrix.fromVerticalVector(this.getColumnArray(columnIndex));
  }

  getRow(rowIndex: number): number[] {
    if (!this.checkColumnIndex(rowIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    return [...this.data[rowIndex]];
  }

  isEmptyColumn(columnIndex: number): boolean {
    if (!this.checkColumnIndex(columnIndex)) throw new RangeError("MatrixIndexOutOfBounds");

    for (let i = 0; i < this.rows; i++) {
      if (!fastIsNaN(this.data[i][columnIndex])) return false;
    }
    return true;
  }

  setRow(rowIndex: number, value: number | number[] = NaN) {
    if (!this.checkRowIndex(rowIndex)) throw new RangeError("MatrixIndexOutOfBounds");
    if (Array.isArray(value)) {
      if (value.length !== this.columns) throw new RangeError("MatrixIndexOutOfBounds");
      this.data[rowIndex] = value
    } else {
      this.data[rowIndex] = new Array(this.columns).fill(value);
    }
  }

  private copyData(arr: number[][]): Matrix {
    this.data = arr;
    return this;
  }
}

export interface MatrixJSON {
  data: number[][];
}