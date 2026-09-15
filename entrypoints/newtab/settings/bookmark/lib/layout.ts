import type { ColumnLayout } from "../model/settings";

export function resolveColumnLayout(ids: readonly string[], saved?: ColumnLayout, count = 1): ColumnLayout {
  const remaining = new Set(ids);
  const columns = (
    (saved?.columns.length ? saved.columns : undefined) ??
    Array.from({ length: Math.min(count, Math.max(ids.length, 1)) }, () => [])
  ).map((column) =>
    column.filter((id) => {
      if (!remaining.has(id)) return false;
      remaining.delete(id);
      return true;
    }),
  );
  let index = 0;
  for (const id of remaining) {
    columns[saved ? 0 : index % columns.length].push(id);
    index += 1;
  }
  const widths = columns.map((_, i) => saved?.widths[i] ?? 1);
  return compactLayout(
    columns,
    widths,
    columns.map((_, i) => saved?.rows?.[i] ?? 0),
  );
}
export function moveLayoutFolder(
  layout: ColumnLayout,
  id: string,
  destination: number,
  beforeId?: string,
  newColumnRow?: number,
  splitBelow = false,
): ColumnLayout {
  const columns = layout.columns.map((column) => column.filter((value) => value !== id));
  const widths = [...layout.widths];
  const rows = columns.map((_, index) => layout.rows?.[index] ?? 0);
  if (newColumnRow !== undefined) {
    columns.splice(destination, 0, []);
    widths.splice(destination, 0, 1);
    rows.splice(destination, 0, newColumnRow);
  } else if (!columns[destination]) {
    columns.push([]);
    widths.push(1);
    rows.push(rows.at(-1) ?? 0);
  }
  const column = columns[destination];
  const index = beforeId ? column.indexOf(beforeId) : -1;
  column.splice(index < 0 ? column.length : index, 0, id);
  if (splitBelow) return splitLayoutRow(columns, widths, rows, rows[destination], column.indexOf(id) + 1);
  return compactLayout(columns, widths, rows);
}

export function moveLayoutFolderBeside(layout: ColumnLayout, id: string, anchorId: string): ColumnLayout {
  if (id === anchorId) return layout;
  const columns = layout.columns.map((column) => column.filter((value) => value !== id));
  const anchorColumn = columns.findIndex((column) => column.includes(anchorId));
  if (anchorColumn < 0) return layout;
  const anchorPosition = columns[anchorColumn].indexOf(anchorId);
  const anchorRow = layout.rows?.[anchorColumn] ?? 0;
  const result: ColumnLayout = { columns: [], widths: [], rows: [] };
  let nextRow = 0;
  const rowIds = [...new Set(columns.map((_, index) => layout.rows?.[index] ?? 0))];
  for (const row of rowIds) {
    const indices = columns.map((_, index) => index).filter((index) => (layout.rows?.[index] ?? 0) === row);
    if (row !== anchorRow) {
      for (const index of indices) {
        result.columns.push(columns[index]);
        result.widths.push(layout.widths[index]);
        result.rows!.push(nextRow);
      }
      nextRow++;
      continue;
    }
    // Only the folders at the drop position share the new row; those below stay in subsequent rows.
    for (const part of ["before", "beside", "after"] as const) {
      for (const index of indices) {
        let items = columns[index].slice(anchorPosition + 1);
        if (part === "before") items = columns[index].slice(0, anchorPosition);
        else if (part === "beside") items = columns[index].slice(anchorPosition, anchorPosition + 1);
        if (items.length) {
          result.columns.push(items);
          result.widths.push(layout.widths[index]);
          result.rows!.push(nextRow);
        }
        if (part === "beside" && index === anchorColumn) {
          result.columns.push([id]);
          result.widths.push(layout.widths[index]);
          result.rows!.push(nextRow);
        }
      }
      nextRow++;
    }
  }
  return compactLayout(result.columns, result.widths, result.rows!);
}

export function moveLayoutFolderToRow(layout: ColumnLayout, id: string, row: number): ColumnLayout {
  const rows = layout.columns.map((_, index) => layout.rows?.[index] ?? 0);
  const next = { ...layout, rows: rows.map((value) => (value >= row ? value + 1 : value)) };
  const destination = rows.findIndex((value) => value >= row);
  return moveLayoutFolder(next, id, destination < 0 ? rows.length : destination, undefined, row);
}

export function compactLayout(columns: string[][], widths: number[], rows: number[]): ColumnLayout {
  const result: ColumnLayout = { columns: [], widths: [] };
  const rowIndices: number[] = [];
  const ranks = new Map<number, number>();
  for (let index = 0; index < columns.length; index += 1) {
    if (!columns[index].length) continue;
    const row = rows[index] ?? 0;
    if (!ranks.has(row)) ranks.set(row, ranks.size);
    result.columns.push(columns[index]);
    result.widths.push(widths[index] ?? 1);
    rowIndices.push(ranks.get(row)!);
  }
  if (ranks.size > 1) result.rows = rowIndices;
  return result;
}

function splitLayoutRow(
  columns: string[][],
  widths: number[],
  rows: number[],
  row: number,
  boundary: number,
): ColumnLayout {
  const nextColumns: string[][] = [];
  const nextWidths: number[] = [];
  const nextRows: number[] = [];
  for (const currentRow of new Set(rows)) {
    for (const below of currentRow === row ? [false, true] : [false]) {
      for (let i = 0; i < columns.length; i++) {
        if (rows[i] !== currentRow) continue;
        let items = columns[i];
        if (currentRow === row) items = below ? items.slice(boundary) : items.slice(0, boundary);
        nextColumns.push(items);
        nextWidths.push(widths[i]);
        nextRows.push(currentRow * 2 + Number(below));
      }
    }
  }
  return compactLayout(nextColumns, nextWidths, nextRows);
}
