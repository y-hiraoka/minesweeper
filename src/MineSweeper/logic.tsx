import {
  Reducer,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { create2DArray } from "./create2DArray";
import { selectRandomWithoutReplacement } from "./selectRandomWithoutReplacement";
import { Dispatch } from "react";
import { getSurroundingElements } from "./getSurroundingElements";
import { CellState } from "./CellState";
import { getSurroundingMinesCount } from "./getSurroundingMinesCount";

const ConstantsContext = createContext<{
  idPrefix: string;
  rows: number;
  columns: number;
  mines: number;
  cellsWithoutMines: CellState[][];
  longPressThreshold: number;
} | null>(null);

export const useConstants = () => {
  const constants = useContext(ConstantsContext);
  if (constants === null)
    throw new Error("Component must be wrapped in a <MineSweeperProvider />");
  return constants;
};

type MineSweeperContextType = {
  state: State;
  dispatch: Dispatch<Action>;
};

type ProviderProps = {
  rows: number;
  columns: number;
  mines: number;
  children: React.ReactNode;
  idPrefix: string;
  longPressThreshold: number;
};

const MineSweeperContext = createContext<MineSweeperContextType | null>(null);

export const useMineSweeperContext = () => {
  const context = useContext(MineSweeperContext);
  if (context === null) {
    throw new Error("Component must be wrapped in a <MineSweeperProvider />");
  }
  return context;
};

export const useCells = (): CellState[][] => {
  const { cellsWithoutMines } = useConstants();
  const { state } = useMineSweeperContext();

  return state.gameStatus === "not-started" ? cellsWithoutMines : state.cells;
};

export type GameStatus = "not-started" | "playing" | "lost" | "won";

export type MineSweeperState = {
  gameStatus: GameStatus;
  restMinesCount: number;
  startAt: number | null;
  lastRevealedCell: {
    row: number;
    column: number;
  } | null;
};
export const useMineSweeperState = (): MineSweeperState => {
  const context = useMineSweeperContext();
  const { mines } = useConstants();

  const gameStatus =
    context.state.gameStatus === "not-started"
      ? "not-started"
      : context.state.gameStatus === "hit-mine"
      ? "lost"
      : isAllNonMineCellsRevealed(context.state.cells)
      ? "won"
      : "playing";

  const restMinesCount =
    context.state.gameStatus === "not-started"
      ? mines
      : mines -
        context.state.cells.flat().filter((cell) => cell.status === "flagged")
          .length;

  const startAt =
    context.state.gameStatus === "not-started" ? null : context.state.startAt;

  const lastRevealedCell =
    context.state.gameStatus === "hit-mine"
      ? context.state.lastRevealedCell
      : null;

  const state: MineSweeperState = useMemo(
    () => ({
      gameStatus,
      restMinesCount,
      startAt,
      lastRevealedCell,
    }),
    [gameStatus, restMinesCount, startAt, lastRevealedCell]
  );

  return state;
};

export const useResetGame = () => {
  const { dispatch } = useMineSweeperContext();
  return useCallback(() => dispatch({ type: "reset" }), [dispatch]);
};

export const usePlayTime = () => {
  const { startAt, gameStatus } = useMineSweeperState();

  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    if (startAt !== null) {
      if (gameStatus === "playing") {
        const interval = setInterval(() => {
          setPlayTime(Date.now() - startAt);
        }, 1000);

        return () => clearInterval(interval);
      } else if (gameStatus !== "not-started") {
        setPlayTime(Date.now() - startAt);
      }
    } else {
      setPlayTime(0);
    }
  }, [startAt, gameStatus]);

  return playTime;
};

export const MineSweeperProvider: React.FC<ProviderProps> = ({
  rows,
  columns,
  mines,
  idPrefix,
  longPressThreshold,
  children,
}) => {
  const constants = useMemo(
    () => ({
      rows,
      columns,
      mines,
      longPressThreshold,
      idPrefix,
      cellsWithoutMines: createInitialCellsWithoutMines(rows, columns),
    }),
    [rows, columns, mines, longPressThreshold, idPrefix]
  );

  const [state, dispatch] = useReducer<Reducer<State, Action>, undefined>(
    reducer,
    undefined,
    () => ({
      rows,
      columns,
      mines,
      gameStatus: "not-started",
    })
  );

  return (
    <ConstantsContext.Provider value={constants}>
      <MineSweeperContext.Provider value={{ dispatch, state }}>
        {children}
      </MineSweeperContext.Provider>
    </ConstantsContext.Provider>
  );
};

type State = { rows: number; columns: number; mines: number } & (
  | {
      gameStatus: "not-started";
    }
  | {
      gameStatus: "unrevealed-mine";
      startAt: number;
      cells: CellState[][];
    }
  | {
      gameStatus: "hit-mine";
      cells: CellState[][];
      startAt: number;
      lastRevealedCell: {
        row: number;
        column: number;
      };
    }
);

type Action =
  | {
      type: "reveal";
      payload: {
        row: number;
        column: number;
      };
    }
  | {
      type: "revealSurrounding";
      payload: {
        row: number;
        column: number;
      };
    }
  | {
      type: "toggleFlag";
      payload: {
        row: number;
        column: number;
      };
    }
  | {
      type: "reset";
    };

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "reveal": {
      const { row, column } = action.payload;
      return revealRecursively(state, row, column);
    }

    case "revealSurrounding": {
      const { row, column } = action.payload;
      if (state.gameStatus !== "unrevealed-mine") return state;

      const cell = state.cells[row][column];
      if (cell.status !== "revealed") return state;

      const surroundingMinesCount = getSurroundingMinesCount(
        state.cells,
        row,
        column
      );
      const surroundingCells = getSurroundingElements(state.cells, row, column);
      const surroundingFlagsCount = surroundingCells.filter(
        (cell) => cell.status === "flagged"
      ).length;

      if (surroundingMinesCount !== surroundingFlagsCount) return state;

      return surroundingCells.reduce<State>(
        (state, cell) =>
          revealRecursively(state, cell.rowIndex, cell.columnIndex),
        state
      );
    }

    case "toggleFlag": {
      const { row, column } = action.payload;
      if (state.gameStatus === "not-started") {
        const cells = createInitialCells({
          rows: state.rows,
          columns: state.columns,
          mines: state.mines,
        });

        cells[row][column].status = "flagged";

        return {
          ...state,
          gameStatus: "unrevealed-mine",
          cells,
          startAt: Date.now(),
        };
      }

      if (state.gameStatus === "hit-mine") return state;

      const cell = state.cells[row][column];
      if (cell.status === "revealed") return state;
      const newCell: CellState = {
        ...cell,
        status: cell.status === "flagged" ? "hidden" : "flagged",
      };
      const newCells = [...state.cells];
      newCells[row] = [...state.cells[row]];
      newCells[row][column] = newCell;
      return {
        ...state,
        cells: newCells,
      };
    }

    case "reset": {
      return {
        ...state,
        gameStatus: "not-started",
      };
    }
  }
};

// 地雷ではないセルが全て開かれているかどうか
const isAllNonMineCellsRevealed = (cells: CellState[][]) =>
  cells.flat().every((cell) => cell.status === "revealed" || cell.isMine);

const createInitialCellsWithoutMines = (rows: number, columns: number) =>
  create2DArray<CellState>({
    rows,
    columns,
    getValue: (row, column) => ({
      rowIndex: row,
      columnIndex: column,
      status: "hidden",
      isMine: false,
    }),
  });

const createInitialCells = ({
  rows,
  columns,
  mines,
  firstRevealedCell,
}: {
  rows: number;
  columns: number;
  mines: number;
  firstRevealedCell?: {
    row: number;
    column: number;
  };
}) => {
  const cellStates = createInitialCellsWithoutMines(rows, columns);
  const cellsWithMine = selectRandomWithoutReplacement(
    firstRevealedCell
      ? cellStates
          .flat()
          .filter(
            (cell) =>
              cell.rowIndex !== firstRevealedCell.row ||
              cell.columnIndex !== firstRevealedCell.column
          )
      : cellStates.flat(),
    mines
  );
  for (const cell of cellsWithMine) {
    cell.isMine = true;
  }
  return cellStates;
};

const revealRecursively = (
  state: State,
  row: number,
  column: number
): State => {
  if (state.gameStatus === "not-started") {
    const cells = createInitialCells({
      rows: state.rows,
      columns: state.columns,
      mines: state.mines,
      firstRevealedCell: { row, column },
    });

    return revealRecursively(
      {
        ...state,
        gameStatus: "unrevealed-mine",
        startAt: Date.now(),
        cells,
      },
      row,
      column
    );
  }

  if (state.gameStatus === "hit-mine") return state;

  const cell = state.cells[row][column];
  if (cell.status !== "hidden") return state;
  const newCell: CellState = {
    ...cell,
    status: "revealed",
  };
  const newCells = [...state.cells];
  newCells[row] = [...state.cells[row]];
  newCells[row][column] = newCell;

  if (newCell.isMine) {
    return {
      ...state,
      cells: newCells,
      gameStatus: "hit-mine",
      lastRevealedCell: { row, column },
    };
  }

  const newState: State = {
    ...state,
    cells: newCells,
  };

  const surroundingMinesCount = getSurroundingMinesCount(
    newState.cells,
    row,
    column
  );
  if (surroundingMinesCount > 0) return newState;
  const surroundingCells = getSurroundingElements(newState.cells, row, column);
  const newerState = surroundingCells.reduce<State>(
    (state, cell) => revealRecursively(state, cell.rowIndex, cell.columnIndex),
    newState
  );

  return newerState;
};
