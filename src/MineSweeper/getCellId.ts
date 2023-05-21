export function getCellId(idPrefix: string, row: number, column: number) {
  return `${idPrefix}__cell-${row}-${column}`;
}
