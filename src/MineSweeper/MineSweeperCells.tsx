import { useEffect, useMemo } from "react";
import { create2DArray } from "./create2DArray";
import { focusCellButton } from "./focusCellButton";
import { GameStatus, useConstants, useMineSweeperState } from "./logic";
import { Cell, GetCellProps } from "./Cell";

export type GetMatrixProps = (state: {
  gameStatus: GameStatus;
}) => Omit<React.HTMLProps<HTMLDivElement>, "children">;

export type GetRowProps = (state: {
  rowIndex: number;
  gameStatus: GameStatus;
}) => Omit<React.HTMLProps<HTMLDivElement>, "children">;

export type MineSweeperCellsProps = {
  focusOnMount?: boolean;
  getMatrixProps?: GetMatrixProps;
  getRowProps?: GetRowProps;
  getCellProps?: GetCellProps;
};

export const MineSweeperCells: React.FC<MineSweeperCellsProps> = ({
  focusOnMount,
  getMatrixProps = () => ({}),
  getRowProps = () => ({}),
  getCellProps = () => ({}),
}) => {
  const { idPrefix, rows, columns } = useConstants();
  const { gameStatus } = useMineSweeperState();

  const cellsArray = useMemo(
    () =>
      create2DArray({
        rows,
        columns,
        getValue: (row, column) => ({ row, column }),
      }),
    [rows, columns]
  );

  useEffect(() => {
    if (focusOnMount) focusCellButton(idPrefix, 0, 0);
  }, [focusOnMount, idPrefix]);

  return (
    <div {...getMatrixProps({ gameStatus })}>
      {cellsArray.map((row, rowIndex) => (
        <div {...getRowProps({ rowIndex, gameStatus })} key={rowIndex}>
          {row.map((cell, columnIndex) => (
            <Cell
              key={columnIndex}
              row={cell.row}
              column={cell.column}
              gameStatus={gameStatus}
              getCellProps={getCellProps}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
