export type CellState = {
  rowIndex: number;
  columnIndex: number;
  status: "hidden" | "flagged" | "revealed";
  isMine: boolean;
};
