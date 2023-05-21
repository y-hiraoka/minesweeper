import { ReactNode } from "react";
import { MineSweeperProvider } from "./logic";

export type MineSweeperProps = {
  rows: number;
  columns: number;
  mines: number;
  longPressThreshold?: number;
  idPrefix?: string;
  children: ReactNode;
};

export const MineSweeper: React.FC<MineSweeperProps> = ({
  rows,
  columns,
  mines,
  longPressThreshold = 400,
  idPrefix = "minesweeper",
  children,
}) => {
  if (rows < 1) throw new Error("rows must be greater than 0");
  if (columns < 1) throw new Error("columns must be greater than 0");
  if (mines < 1) throw new Error("mines must be greater than 0");
  if (rows * columns < mines)
    throw new Error("mines must be less than rows * columns");

  return (
    <MineSweeperProvider
      key={`${rows}-${columns}-${mines}`}
      rows={rows}
      columns={columns}
      mines={mines}
      longPressThreshold={longPressThreshold}
      idPrefix={idPrefix}
    >
      {children}
    </MineSweeperProvider>
  );
};
