import { ComponentProps, useRef } from "react";
import { focusCellButton } from "./focusCellButton";
import { getCellId } from "./getCellId";
import { getSurroundingMinesCount } from "./getSurroundingMinesCount";
import {
  useCells,
  useMineSweeperContext,
  useConstants,
  GameStatus,
} from "./logic";

export type GetCellProps = (state: {
  row: number;
  column: number;
  cellStatus: "hidden" | "flagged" | "revealed";
  isMine: boolean;
  gameStatus: GameStatus;
  surroundingMineCount: number;
  lastRevealed: boolean;
}) => Omit<
  ComponentProps<"button">,
  "id" | "type" | "disabled" | "onContextMenu" | "onClick" | "onKeyDown"
>;

type Props = {
  row: number;
  column: number;
  gameStatus: GameStatus;
  getCellProps: GetCellProps;
};

export const Cell: React.FC<Props> = ({
  row,
  column,
  gameStatus,
  getCellProps,
}) => {
  const { idPrefix, longPressThreshold } = useConstants();
  const cells = useCells();
  const { dispatch, state } = useMineSweeperContext();

  const isDisabled = gameStatus === "lost" || gameStatus === "won";

  const cellState = cells[row][column];
  const surroundingMineCount = getSurroundingMinesCount(cells, row, column);

  const onArrowUoKeyDown = () => {
    const targetRow = row === 0 ? cells.length - 1 : row - 1;
    focusCellButton(idPrefix, targetRow, column);
  };

  const onArrowDownKeyDown = () => {
    const targetRow = row === cells.length - 1 ? 0 : row + 1;
    focusCellButton(idPrefix, targetRow, column);
  };

  const onArrowLeftKeyDown = () => {
    const targetColumn = column === 0 ? cells[row].length - 1 : column - 1;
    focusCellButton(idPrefix, row, targetColumn);
  };

  const onArrowRightKeyDown = () => {
    const targetColumn = column === cells[row].length - 1 ? 0 : column + 1;
    focusCellButton(idPrefix, row, targetColumn);
  };

  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  return (
    <button
      {...getCellProps({
        row,
        column,
        cellStatus: cellState.status,
        isMine: cellState.isMine,
        gameStatus,
        surroundingMineCount,
        lastRevealed:
          state.gameStatus === "hit-mine" &&
          state.lastRevealedCell?.row === row &&
          state.lastRevealedCell?.column === column,
      })}
      id={getCellId(idPrefix, row, column)}
      type="button"
      disabled={isDisabled}
      onMouseDown={(event) => {
        if (event.button === 2) {
          event.preventDefault();
          dispatch({ type: "toggleFlag", payload: { row, column } });
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        if (isLongPressRef.current) {
          isLongPressRef.current = false;
        } else {
          if (cellState.status === "revealed") {
            dispatch({ type: "revealSurrounding", payload: { row, column } });
          } else {
            dispatch({ type: "reveal", payload: { row, column } });
          }
        }
      }}
      onTouchStart={() => {
        longPressTimerRef.current = window.setTimeout(() => {
          isLongPressRef.current = true;
          dispatch({ type: "toggleFlag", payload: { row, column } });
        }, longPressThreshold);
      }}
      onTouchEnd={() => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }}
      // Fキーで toogleFlag を実行する。
      onKeyDown={(event) => {
        keyBinding(event, {
          f: () => dispatch({ type: "toggleFlag", payload: { row, column } }),
          r: () => {
            if (cellState.status === "revealed") {
              dispatch({ type: "revealSurrounding", payload: { row, column } });
            } else {
              dispatch({ type: "reveal", payload: { row, column } });
            }
          },
          n: () => dispatch({ type: "reset" }),
          ArrowUp: onArrowUoKeyDown,
          ArrowDown: onArrowDownKeyDown,
          ArrowLeft: onArrowLeftKeyDown,
          ArrowRight: onArrowRightKeyDown,
          k: onArrowUoKeyDown,
          j: onArrowDownKeyDown,
          h: onArrowLeftKeyDown,
          l: onArrowRightKeyDown,
        });
      }}
    />
  );
};

function keyBinding(
  event: React.KeyboardEvent<HTMLButtonElement>,
  mapping: { [key: string]: () => void }
): void {
  const handler = mapping[event.key];
  if (handler) {
    event.preventDefault();
    handler();
  }
}
