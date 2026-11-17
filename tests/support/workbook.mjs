import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { HyperFormula } from 'hyperformula';

export const read = file => fs.readFileSync(file, 'utf8');
export const fixture = id => {
  const rows = read(`tests/${id}.tsv`).replace(/\r/g, '').replace(/\n$/, '').split('\n').map(row => row.split('\t'));
  return rows.map(row => [...row, ...Array(Math.max(0,rows[0].length-row.length)).fill('')]);
};
export function script(name) {
  const source = read(`office-scripts/${name}.ts`);
  const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020 }, reportDiagnostics: true });
  if (result.diagnostics.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
    getCanonicalFileName: x => x, getCurrentDirectory: () => '.', getNewLine: () => '\n'
  }));
  const context = vm.createContext({ ExcelScript: {
    ClearApplyTo: { contents: 'contents' }, SheetVisibility: { hidden: 'hidden' },
    CalculationType: { full: 'full' }, CalculationMode: { automatic: 'automatic' }
  }});
  vm.runInContext(result.outputText, context);
  return (workbook, ...args) => context.main(workbook, ...args);
}
function colIndex(text) { return [...text].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1; }
function colName(index) {
  let result = '';
  for (++index; index; index = Math.floor((index - 1) / 26)) result = String.fromCharCode(65 + (index - 1) % 26) + result;
  return result;
}
class Range {
  constructor(sheet, row, col, rows = 1, cols = 1) { Object.assign(this, { sheet, row, col, rows, cols }); }
  getRowIndex() { return this.row; } getColumnIndex() { return this.col; }
  getRowCount() { return this.rows; } getColumnCount() { return this.cols; }
  getValues() { return Array.from({ length: this.rows }, (_, r) => Array.from({ length: this.cols }, (_, c) => this.sheet.cells.get(`${this.row+r},${this.col+c}`) ?? '')); }
  getValue() { return this.getValues()[0][0]; }
  setValue(value) { this.setValues([[value]]); }
  setValues(values) {
    if (this.sheet.failWrite) throw new Error('Injected write failure');
    if (values.length !== this.rows || values.some(row => row.length !== this.cols)) throw new Error('Range dimension mismatch');
    values.forEach((row, r) => row.forEach((value, c) => this.sheet.cells.set(`${this.row+r},${this.col+c}`, typeof value === 'string' && value.startsWith("'") ? value.slice(1) : value)));
  }
  setFormula(formula) { this.sheet.cells.set(`${this.row},${this.col}`, formula); }
  clear() {
    for (const address of this.sheet.cells.keys()) {
      const [r,c] = address.split(',').map(Number);
      if (r >= this.row && r < this.row+this.rows && c >= this.col && c < this.col+this.cols) this.sheet.cells.delete(address);
    }
  }
  getFormat() { return { getFill: () => ({ setColor() {} }), getFont: () => ({ setColor() {}, setBold() {} }), setColumnWidth() {} }; }
}
class Worksheet {
  cells = new Map();
  constructor(workbook, name) { Object.assign(this, { workbook, name }); }
  getRangeByIndexes(...args) { return new Range(this, ...args); }
  getRange(address) {
    const [start, end = start] = address.split(':');
    const parse = cell => { const [, col, row] = /^([A-Z]+)(\d*)$/.exec(cell); return [Number(row || 1)-1, colIndex(col)]; };
    const [r,c] = parse(start), [rr,cc] = parse(end);
    return new Range(this,r,c,rr-r+1,cc-c+1);
  }
  getUsedRange() {
    const coords = [...this.cells].filter(([,v]) => v !== '' && v !== null).map(([address]) => address.split(',').map(Number));
    if (!coords.length) return undefined;
    const r = Math.min(...coords.map(x => x[0])), c = Math.min(...coords.map(x => x[1]));
    return new Range(this,r,c,Math.max(...coords.map(x => x[0]))-r+1,Math.max(...coords.map(x => x[1]))-c+1);
  }
  addTable(range) {
    const table = { range, getWorksheet: () => this, getRange: () => table.range,
      resize: target => { table.range = target; },
      setName: name => { this.workbook.tables.set(name, table); } };
    return table;
  }
  getFreezePanes() { return { freezeRows() {} }; }
  setVisibility(value) { this.visibility = value; } activate() {}
}
export class Workbook {
  sheets = new Map(); tables = new Map(); names = new Map(); calculations = 0; output = [];
  getWorksheet(name) { return this.sheets.get(name); }
  addWorksheet(name) { const sheet = new Worksheet(this, name); this.sheets.set(name,sheet); return sheet; }
  getTable(name) { return this.tables.get(name); }
  getNamedItem(name) { return this.names.get(name); }
  addNamedItem(name, range) { this.names.set(name, { getRange: () => range, delete: () => this.names.delete(name) }); }
  getApplication() { return { calculate: () => { this.calculations++; }, setCalculationMode: mode => { this.mode = mode; } }; }
  cell(name, value) {
    const range = this.getNamedItem(name).getRange();
    if (arguments.length === 2) range.setValue(value);
    return range.getValue();
  }
  paste(values) {
    // Model clipboard cells as already stored text; quote handling applies to script writes.
    const sheet = this.getWorksheet('Paste_SIMS');
    values.forEach((row,r) => row.forEach((value,c) => sheet.cells.set(`${r+2},${c}`,value)));
  }
  raw() { return this.getTable('SIMS_Raw').getRange().getValues(); }
  // Evaluate the actual installed formula in HyperFormula. Only translate structured/named refs.
  ready() {
    let formula = this.getWorksheet('Paste_SIMS').getRange('D2').getValue();
    const columns = [...formula.matchAll(/KS3_Merge_Final\[([^\]]+)\]/g)].map(m => m[1]);
    const unique = [...new Set(columns)];
    const matrix = [unique, ...this.output.map(row => unique.map(col => row[col] ?? ''))];
    if (!this.output.length) matrix.push(unique.map(() => '')); // Excel's empty table placeholder
    formula = formula.replace(/KS3_Merge_Final\[([^\]]+)\]/g, (_, name) => {
      const column = colName(unique.indexOf(name));
      return `Merge!${column}2:${column}${Math.max(2,matrix.length)}`;
    });
    const controls = [];
    for (const name of this.names.keys()) {
      if (formula.includes(name)) {
        controls.push([this.cell(name)]);
        formula = formula.replaceAll(name, `Controls!A${controls.length}`);
      }
    }
    const hf = HyperFormula.buildFromSheets({ Merge: matrix, Controls: controls, Check: [[formula]] }, { licenseKey: 'gpl-v3' });
    const result = hf.getCellValue({ sheet: hf.getSheetId('Check'), row: 0, col: 0 });
    hf.destroy();
    return result;
  }
}
export function installed() {
  const book = new Workbook(); script('setup-pilot')(book);
  // Stand in for the current loaded query schema; no M evaluation takes place here.
  book.tables.set('KS3_Merge_Final', { getColumnByName: name => name === 'SelectionToken' ? {} : undefined });
  script('upgrade-pilot')(book); return book;
}
