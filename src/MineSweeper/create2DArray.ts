export const create2DArray = <T>({
  rows,
  columns,
  getValue,
}: {
  rows: number;
  columns: number;
  getValue: (row: number, column: number) => T;
}) => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => getValue(row, column))
  );
};
