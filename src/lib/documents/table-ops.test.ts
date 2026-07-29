import { describe, expect, it } from 'vitest';
import {
  addTableColumn,
  addTableRow,
  removeTableColumn,
  removeTableRow,
  type TableData,
} from './table-ops';

const table: TableData = {
  headers: ['Name', 'Value'],
  rows: [
    ['a', '1'],
    ['b', '2'],
  ],
};

describe('table-ops', () => {
  it('adds a row shaped like the header row', () => {
    const next = addTableRow(table);
    expect(next.rows).toHaveLength(3);
    expect(next.rows[2]).toEqual(['', '']);
  });

  it('removes a row by index', () => {
    const next = removeTableRow(table, 0);
    expect(next.rows).toEqual([['b', '2']]);
  });

  it('adds a column to the header and every row', () => {
    const next = addTableColumn(table);
    expect(next.headers).toEqual(['Name', 'Value', '']);
    expect(next.rows).toEqual([
      ['a', '1', ''],
      ['b', '2', ''],
    ]);
  });

  it('removes a column from the header and every row', () => {
    const next = removeTableColumn(table, 0);
    expect(next.headers).toEqual(['Value']);
    expect(next.rows).toEqual([['1'], ['2']]);
  });
});
