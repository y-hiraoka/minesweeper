import { getCellId } from "./getCellId";

export const focusCellButton = (
  idPrefix: string,
  row: number,
  column: number
) => {
  const button = document.getElementById(getCellId(idPrefix, row, column));
  if (button) {
    button.focus();
  }
};
