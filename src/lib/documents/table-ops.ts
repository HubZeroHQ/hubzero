import type { Block } from './blocks';

export type TableData = Extract<Block, { type: 'table' }>['data'];

/**
 * Pure row/column operations for the Table block, shared by the inline grid
 * (`editor/fields/TableFields.tsx`) and the inspector's contextual row/column
 * controls (CMS_PRODUCT_DESIGN.md §5 names this exact pairing as the
 * canonical example of "a Table block's row/column controls" living in the
 * inspector).
 */
export function addTableRow(data: TableData): TableData {
  return { ...data, rows: [...data.rows, data.headers.map(() => '')] };
}

export function removeTableRow(data: TableData, rowIndex: number): TableData {
  return { ...data, rows: data.rows.filter((_, index) => index !== rowIndex) };
}

export function addTableColumn(data: TableData): TableData {
  return {
    headers: [...data.headers, ''],
    rows: data.rows.map((row) => [...row, '']),
  };
}

export function removeTableColumn(data: TableData, columnIndex: number): TableData {
  return {
    headers: data.headers.filter((_, index) => index !== columnIndex),
    rows: data.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
  };
}
