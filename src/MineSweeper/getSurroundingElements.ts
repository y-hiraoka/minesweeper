export function getSurroundingElements<T>(
  matrix: T[][],
  rowIndex: number,
  columnIndex: number
): T[] {
  // Matrix, rowIndex, columnIndexの存在確認
  if (
    matrix.length === 0 ||
    !Number.isInteger(rowIndex) ||
    !Number.isInteger(columnIndex)
  ) {
    throw new Error("Invalid input");
  }

  // 全ての内部配列が同じ長さを持つことの確認
  const rowLength = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== rowLength) {
      throw new Error("Matrix is not valid");
    }
  }

  // rowIndex, columnIndexが範囲内にあるか確認
  if (
    rowIndex < 0 ||
    rowIndex >= matrix.length ||
    columnIndex < 0 ||
    columnIndex >= rowLength
  ) {
    throw new Error("Index out of bounds");
  }

  const surroundingElements: T[] = [];
  for (
    let i = Math.max(0, rowIndex - 1);
    i <= Math.min(matrix.length - 1, rowIndex + 1);
    i++
  ) {
    for (
      let j = Math.max(0, columnIndex - 1);
      j <= Math.min(rowLength - 1, columnIndex + 1);
      j++
    ) {
      // 自身の要素はスキップ
      if (i === rowIndex && j === columnIndex) {
        continue;
      }
      surroundingElements.push(matrix[i][j]);
    }
  }
  return surroundingElements;
}
