import {
  MineSweeper,
  MineSweeperCells,
  useMineSweeperState,
  usePlayTime,
  useResetGame,
} from "./MineSweeper";
import styles from "./App.module.css";
import { useState } from "react";

function median(numbers: number[]): number {
  // 数値をソート
  numbers.sort((a, b) => a - b);

  // 配列の長さが偶数の場合と奇数の場合で場合分け
  if (numbers.length % 2 === 0) {
    // 配列の長さが偶数の場合、中央の2つの数値の平均を取る
    return (numbers[numbers.length / 2 - 1] + numbers[numbers.length / 2]) / 2;
  } else {
    // 配列の長さが奇数の場合、中央の数値を返す
    return numbers[Math.floor(numbers.length / 2)];
  }
}

function App() {
  const [rowsText, setRowsText] = useState("30");
  const [columnsText, setColumnsText] = useState("30");
  const [minesText, setMinesText] = useState("100");

  const rows = Number.isNaN(Number(rowsText))
    ? 1
    : median([2, Number(rowsText), 30]);
  const columns = Number.isNaN(Number(columnsText))
    ? 1
    : median([2, Number(columnsText), 30]);
  const mines = Number.isNaN(Number(minesText))
    ? 1
    : median([1, Number(minesText), rows * columns - 1]);

  return (
    <div className={styles.page}>
      <div className={styles.settings}>
        <label className={styles.settingsLabel} htmlFor="rows">
          Rows
        </label>
        <input
          className={styles.settingsInput}
          id="rows"
          type="number"
          value={rowsText}
          onChange={(e) => setRowsText(e.target.value)}
          min={2}
          max={30}
          aria-describedby="rows-helper-text"
        />
        <p id="rows-helper-text" className={styles.settingsHelperText}>
          {"1 - 30"}
        </p>
        <label className={styles.settingsLabel} htmlFor="columns">
          Columns
        </label>
        <input
          className={styles.settingsInput}
          id="columns"
          type="number"
          value={columnsText}
          onChange={(e) => setColumnsText(e.target.value)}
          min={2}
          max={30}
          aria-describedby="columns-helper-text"
        />
        <p id="columns-helper-text" className={styles.settingsHelperText}>
          {"1 - 30"}
        </p>
        <label className={styles.settingsLabel} htmlFor="mines">
          Mines
        </label>
        <input
          className={styles.settingsInput}
          id="mines"
          type="number"
          value={minesText}
          onChange={(e) => setMinesText(e.target.value)}
          min={1}
          max={rows * columns - 1}
          aria-describedby="mines-helper-text"
        />
        <p id="mines-helper-text" className={styles.settingsHelperText}>
          {"1 - (rows * columns - 1)"}
        </p>
      </div>

      <MineSweeper
        rows={rows > 0 ? rows : 1}
        columns={columns > 0 ? columns : 1}
        mines={mines > 0 && mines < rows * columns - 1 ? mines : 1}
      >
        <div className={styles.minesweeperRoot}>
          <MineSweeperControls />
          <div className={styles.matrixContainer}>
            <MineSweeperCells
              focusOnMount={false}
              getMatrixProps={() => ({
                className: styles.matrix,
              })}
              getRowProps={() => ({
                className: styles.row,
              })}
              getCellProps={({
                isMine,
                cellStatus,
                surroundingMineCount,
                lastRevealed,
              }) => ({
                className: styles.cell,
                "data-revealed": cellStatus === "revealed",
                "data-last-revealed": lastRevealed,
                children: (
                  <>
                    {cellStatus === "flagged"
                      ? "🚩"
                      : cellStatus === "revealed" && isMine
                      ? "💣"
                      : cellStatus === "revealed" && surroundingMineCount > 0
                      ? surroundingMineCount
                      : cellStatus === "revealed"
                      ? ""
                      : null}
                  </>
                ),
              })}
            />
          </div>
        </div>
      </MineSweeper>
    </div>
  );
}

export default App;

const MineSweeperControls: React.FC = () => {
  const resetGame = useResetGame();
  const { restMinesCount, gameStatus } = useMineSweeperState();
  const playTime = usePlayTime();

  return (
    <div className={styles.controls}>
      <p className={styles.controlsRestMinesCount}>{restMinesCount}</p>
      <button
        type="button"
        className={styles.controlsResetGame}
        onClick={resetGame}
      >
        {gameStatus === "lost" ? "😵" : gameStatus === "won" ? "😎" : "😀"}
      </button>
      <p className={styles.controlsPlayTime}>{Math.floor(playTime / 1000)}</p>
    </div>
  );
};
