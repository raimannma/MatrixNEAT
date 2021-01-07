import {isNumber, randFloat, randInt, transposeArray} from "./Utils";

export class Matrix {
  private data: number[][];

  constructor(rows: number, columns: number) {
    this.data = [];
    for (let i = 0; i < rows; i++) {
      this.data.push(new Array(columns));
    }
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

  static fromVerticalVector(vector: number[]) {
    return new Matrix(vector.length, 1).map((_, row) => vector[row]);
  }

  static fromHorizontalVector(vector: number[]) {
    return new Matrix(1, vector.length).map((_, row, column) => vector[column]);
  }

  static zeros(rows: number, columns: number): Matrix {
    return new Matrix(rows, columns).fill(0);
  }

  static ones(rows: number, columns: number): Matrix {
    return new Matrix(rows, columns).fill(1);
  }

  static eye(rows: number, columns: number = rows, value: number = 1): Matrix {
    const out = this.zeros(rows, columns);
    for (let i = 0; i < Math.min(out.rows, out.columns); i++) {
      out.set(i, i, value);
    }
    return out;
  }

  static randFloat(rows: number, columns: number, bounds: [number, number] = [0, 1]): Matrix {
    return new Matrix(rows, columns).map(_ => randFloat(bounds));
  }

  static randInt(rows: number, columns: number, bounds: [number, number] = [-1, 1]): Matrix {
    return new Matrix(rows, columns).map(_ => randInt(bounds));
  }

  static from2dArray(arr: number[][]): Matrix {
    return new Matrix(0, 0).copyData(arr);
  }

  static fromJsonString(json: string): Matrix {
    let data = JSON.parse(json);
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return this.from2dArray(data);
    }
    throw new TypeError("JSON String should represent 2d number array");
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
          sum += this.get(i, k) * B.get(k, j);
        }
        result.set(i, j, sum);
      }
    }

    this.copyData(result.to2DArray());
    return this;
  }

  negate(): Matrix {
    return this.mul(-1);
  }

  get(rowIndex: number, columnIndex: number): number {
    if (this.checkRowIndex(rowIndex) && this.checkColumnIndex(columnIndex)) {
      return this.data[rowIndex][columnIndex];
    }
    throw new RangeError("MatrixIndexOutOfBounds");
  }

  set(rowIndex: number, columnIndex: number, value: number): Matrix {
    if (this.checkRowIndex(rowIndex) && this.checkColumnIndex(columnIndex)) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }
    throw new RangeError("MatrixIndexOutOfBounds");
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

  copy(): Matrix {
    return Matrix.from2dArray(this.to2DArray());
  }

  transpose(): Matrix {
    this.data = transposeArray(this.to2DArray());
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
    if (this.checkRowIndex(rowIndex)) {
      this.data.splice(rowIndex, 1);
      return this;
    } else {
      throw new RangeError("MatrixIndexOutOfBounds");
    }
  }

  removeColumn(columnIndex): Matrix {
    if (this.checkColumnIndex(columnIndex)) {
      for (let row of this.data) {
        row.splice(columnIndex, 1);
      }
      return this;
    }
    throw new RangeError("MatrixIndexOutOfBounds");
  }

  addRowAtIndex(rowIndex: number, value: number[] | number = 0): Matrix {
    if (Array.isArray(value) && value.length !== this.columns) throw new RangeError("MatrixIndexOutOfBounds");

    this.data.splice(
      rowIndex,
      0,
      Array.isArray(value) ? value : new Array(this.columns).fill(value)
    );
    return this;
  }

  addRowAtEnd(value: number[] | number = 0): Matrix {
    return this.addRowAtIndex(this.rows, value);
  }

  addColumnAtIndex(columnIndex: number, value: number[] | number = 0): Matrix {
    if (Array.isArray(value) && value.length !== this.rows) throw new RangeError("MatrixIndexOutOfBounds");

    for (let i = 0; i < this.data.length; i++) {
      this.data[i].splice(columnIndex, 0, Array.isArray(value) ? value[i] : value);
    }
    return this;
  }

  addColumnAtEnd(value: number[] | number = 0): Matrix {
    return this.addColumnAtIndex(this.columns, value);
  }

  isSquare(): boolean {
    return this.data.length !== 0 ? this.data.length === this.data[0].length : true;
  }

  isSymmetric(): boolean {
    if (!this.isSquare()) return false;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j <= i; j++) {
        if (this.get(i, j) !== this.get(j, i)) {
          return false;
        }
      }
    }
    return true;
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

  isRowVector(): boolean {
    return this.rows === 1;
  }

  isColumnVector(): boolean {
    return this.columns === 1;
  }

  toJsonString(): string {
    return JSON.stringify(this.data);
  }

  private copyData(arr: number[][]): Matrix {
    this.data = arr;
    return this;
  }
}
