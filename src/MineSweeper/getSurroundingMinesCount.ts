import { CellState } from "./CellState";
import { getSurroundingElements } from "./getSurroundingElements";

export function getSurroundingMinesCount(
  cellsMatrix: CellState[][],
  rowIndex: number,
  columnIndex: number
): number {
  const surroundingCells = getSurroundingElements(
    cellsMatrix,
    rowIndex,
    columnIndex
  );
  return surroundingCells.filter((cell) => cell.isMine).length;
}
