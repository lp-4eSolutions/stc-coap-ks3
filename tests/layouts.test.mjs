import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { TaskUtils, DefaultSettings } from '@microsoft/powerquery-parser';
import { Workbook, fixture, installed, read, script } from './support/workbook.mjs';
import { config, expected, key, terms, bands } from './support/reference.mjs';

const process = script('process-pupil-data'), reset = script('reset');
const counts = (row,term) => bands.map(([, ,suffix]) => row[`${term}_Band_${suffix}_Count`]);
const near = (actual,want) => assert(Math.abs(actual-want)<1e-10,`${actual} != ${want}`);
function refreshModel(book) { book.output = expected(book.raw(), book.cell('KS3_SubjectSelection'), book.cell('KS3_CurrentRun')); }
function clearPaste(book) {
  const sheet = book.getWorksheet('Paste_SIMS'), used = sheet.getUsedRange();
  if (used && used.getRowCount() > 2) sheet.getRangeByIndexes(2,0,used.getRowCount()-2,used.getColumnCount()).clear();
}

test('all five standalone Office Scripts parse as TypeScript', () => {
  const files = fs.readdirSync('office-scripts').filter(n => n.endsWith('.ts'));
  assert.equal(files.length,5);
  for (const name of files) script(name.slice(0,-3));
});
test('production Power Query parses with the Microsoft M parser', async () => {
  const result = await TaskUtils.tryLexParse(DefaultSettings, read('power-query/KS3_Merge_Final.pq'));
  assert.equal(result.resultKind, 'Ok', result.error?.message);
});

test('map covers exactly the eight requested layouts', () => {
  assert.deepEqual(config.layouts.map(l => l.id), ['year-7-art','year-7-english','year-7-science','year-8-french','year-8-maths','year-8-science','year-9-dt','year-9-science']);
});
for (const layout of config.layouts) {
  for (const subject of layout.subjects) {
    test(`${layout.id} / ${subject.subject}: actual Process resolves and stages; reference counts and readiness`, () => {
      const book = installed(), grid = fixture(layout.id);
      const choice = layout.subjects.length > 1 ? subject.subject : 'Auto';
      book.cell('KS3_SubjectSelection',choice); book.paste(grid); process(book);
      assert.equal(book.cell('KS3_StagedYear'),layout.year);
      assert.equal(book.cell('KS3_StagedSubject'),subject.subject);
      assert.deepEqual(book.raw(),grid.map((row,r) => r===0 ? row.map(value => value.replace(/\u00a0/g,' ').trim()) : row));
      assert.equal(book.ready(),'REFRESH REQUIRED');
      refreshModel(book);
      assert.equal(book.ready(),`READY TO REVIEW: Year ${layout.year} ${subject.subject} / 2 class(es)`);
      const [a,b] = book.output;
      assert.equal(a.Subject_Class,`${subject.subject} / ${layout.year}SYN/A`);
      assert.equal(a.Pupils,11); assert.equal(b.Pupils,3); assert.equal(a.Rows_Without_Class,1);
      assert.equal(a.SEND_K_List,'Test Pupil 01'); assert.equal(a.EHCP_List,'Test Pupil 02');
      assert.equal(b.SEND_K_List,'Test Pupil 12');
      assert.equal(a.Prior_Q1_List,'Test Pupil 01\nTest Pupil 06');
      assert.equal(a.Prior_Q5_List,'Test Pupil 05\nTest Pupil 10');
      assert.equal(a.Prior_Attainment_Unassessed,1);
      const chemistry = subject.subject === 'Chemistry', physics = subject.subject === 'Physics';
      const average = chemistry ? 25 : physics ? 49.6 : 50.4;
      near(a.Autumn_Class_Average,average); near(a.Summer_Class_Average,average);
      assert.equal(a.Autumn_Assessed,10); assert.equal(a.Spring_Assessed,0); assert.equal(a.Spring_Class_Average,null);
      assert.deepEqual(counts(a,'Autumn'),chemistry ? [0,0,1,4,5] : physics ? [1,2,2,2,3] : [2,2,2,2,2]);
      assert.equal(a.Autumn_Invalid,0); assert.equal(a.Autumn_Year_Assessed,13);
      near(b.Autumn_Class_Average,chemistry ? 5/3 : physics ? 96 : 4);
      near(a.Autumn_Year_Average,chemistry ? 255/13 : physics ? 784/13 : 516/13);
      assert.equal(a.Autumn_Year_Average,b.Autumn_Year_Average);
      near(a.Spring_Year_Average,chemistry ? 25 : 50);
      if (!chemistry && !physics) {
        assert.equal(a.Autumn_Band_81_100_List,'Test Pupil 09\nTest Pupil 10');
        assert.equal(a.Autumn_Band_0_20_List,'Test Pupil 01\nTest Pupil 02');
        near(a.Summer_Year_Average,565/12);
      }
      if (layout.id === 'year-7-art') {
        assert.equal(a.LAC_Column_Status,'Unavailable'); assert.equal(a.LAC_Unknown,11);
      } else { assert.equal(a.LAC_List,'Test Pupil 02'); assert.equal(a.LAC_Unknown,0); }
      if (['year-7-art','year-8-french','year-8-maths','year-9-dt','year-9-science'].includes(layout.id)) {
        assert.equal(a.Sex_Unclassified,11); assert.equal(a.Boys_List,'');
      } else {
        assert.equal(a.Boys_List,'Test Pupil 01\nTest Pupil 03\nTest Pupil 05\nTest Pupil 07\nTest Pupil 09');
        assert.equal(a.Girls_List,'Test Pupil 02\nTest Pupil 04\nTest Pupil 06\nTest Pupil 08\nTest Pupil 10');
      }
    });
  }
}

test('same Year 9 paste processes Biology, Physics and Chemistry from C2', () => {
  const book = installed(); book.paste(fixture('year-9-science'));
  let lastRun = '';
  for (const subject of ['Biology','Physics','Chemistry','Biology']) {
    book.cell('KS3_SubjectSelection',subject);
    assert.equal(book.cell('KS3_CurrentRun'),lastRun);
    assert.equal(book.ready(),lastRun ? 'PROCESS REQUIRED' : 'NOT READY');
    process(book); assert.notEqual(book.cell('KS3_CurrentRun'),lastRun);
    assert.equal(book.ready(),'REFRESH REQUIRED');
    refreshModel(book); assert.match(book.ready(),new RegExp(subject));
    assert.equal(book.output[0].Subject,subject); lastRun = book.cell('KS3_CurrentRun');
  }
  book.cell('KS3_SubjectSelection','Biology'); assert.match(book.ready(),/^READY TO REVIEW/);
});
test('dropdown away/back recognises the existing output when the staged run is unchanged', () => {
  const book = installed(); book.cell('KS3_SubjectSelection','Biology'); book.paste(fixture('year-9-science')); process(book); refreshModel(book);
  const run = book.cell('KS3_CurrentRun'), output = book.output, staged = book.raw(), ready = book.ready();
  for (const choice of ['Physics','Chemistry','Auto']) {
    book.cell('KS3_SubjectSelection',choice); assert.equal(book.ready(),'PROCESS REQUIRED');
    assert.equal(book.cell('KS3_CurrentRun'),run); assert.equal(book.cell('KS3_StagedSelection'),'Biology');
    assert.equal(book.output,output); assert.deepEqual(book.raw(),staged);
    book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),ready);
  }
  book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),ready);
});
test('Process reads C2 and invalidates before staging; switching back cannot revive an older run', () => {
  const book = installed(); book.cell('KS3_SubjectSelection','Biology'); book.paste(fixture('year-9-science')); process(book); refreshModel(book);
  const previousRun = book.cell('KS3_CurrentRun'), oldOutput = book.output, table = book.getTable('SIMS_Raw');
  book.cell('KS3_SubjectSelection','Physics');
  const resize = table.resize;
  let staged = false;
  table.resize = range => {
    staged = true; assert.equal(book.cell('KS3_CurrentRun'),''); assert.equal(book.ready(),'NOT READY');
    resize(range);
  };
  process(book);
  assert(staged); assert.notEqual(book.cell('KS3_CurrentRun'),previousRun);
  assert.equal(book.cell('KS3_StagedSelection'),'Physics'); assert.equal(book.cell('KS3_StagedSubject'),'Physics');
  assert.equal(book.output,oldOutput); assert.equal(book.ready(),'REFRESH REQUIRED');
  book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),'PROCESS REQUIRED');
  book.cell('KS3_SubjectSelection','Physics'); assert.equal(book.ready(),'REFRESH REQUIRED');
  refreshModel(book); assert.match(book.ready(),/Year 9 Physics/);
});
test('a failed Process after a dropdown change stays invalid when returning to the old choice', () => {
  const book = installed(); book.cell('KS3_SubjectSelection','Biology'); book.paste(fixture('year-9-science')); process(book); refreshModel(book);
  book.cell('KS3_SubjectSelection','Physics'); book.getWorksheet('Data_SIMS').failWrite = true;
  assert.throws(() => process(book),/Injected write/); assert.equal(book.ready(),'NOT READY');
  book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),'NOT READY');
});
test('a failed or cancelled refresh retains old rows but cannot mark the new run ready', () => {
  const book = installed(); book.paste(fixture('year-7-english')); process(book); refreshModel(book);
  const oldOutput = book.output, previousRun = book.cell('KS3_CurrentRun');
  process(book); assert.notEqual(book.cell('KS3_CurrentRun'),previousRun);
  // Simulate no query-table write after failure/cancellation.
  assert.equal(book.output,oldOutput); assert.equal(book.ready(),'REFRESH REQUIRED');
  refreshModel(book); assert.match(book.ready(),/^READY TO REVIEW/);
});
test('ready formula rejects mixed run IDs, wrong subjects, wrong years and invalid marks', () => {
  const book = installed(); book.paste(fixture('year-7-english')); process(book); refreshModel(book);
  for (const [field,bad] of [['RunID','old-run'],['SelectionToken','Biology'],['Subject','Art'],['Year_Group',8],['Reporting_Version','old-quintiles']]) {
    const value = book.output[1][field]; book.output[1][field] = bad;
    assert.equal(book.ready(),'REFRESH REQUIRED',field); book.output[1][field] = value;
  }
  book.output[0].Summer_Invalid = 1; assert.equal(book.ready(),'CHECK INVALID MARKS');
});

test('Year 7 Science Summer ignores separate exam and both prior/end-of-year quintiles', () => {
  const grid = fixture('year-7-science'), indices = grid[0].flatMap((h,i) => /End of Year|Prior Attainment Qiunti E/.test(h) ? [i] : []);
  assert.equal(indices.length,3);
  const first = expected(grid);
  for (const row of grid.slice(1)) for (const i of indices) row[i] = '1';
  assert.deepEqual(expected(grid),first);
  assert.deepEqual(counts(first[0],'Summer'),[2,2,2,2,2]);
  near(first[0].Summer_Class_Average,50.4);
});

test('reordered headers, NBSP/spacing and the two retained English aliases resolve', () => {
  const grid = fixture('year-7-english').map(row => [...row].reverse());
  grid[0] = grid[0].map(h => h.replace(/ /g,' \u00a0 '));
  for (const [from,to] of [['ENAttainmentY7(%)~2Year7Spring','EN Attainment Y7 (%) Year 7 Spring'],['ENAttainmentY7(%)SuYear7Summer','EN Attainment Y7 (%) Year 7 Summer']]) {
    const i = grid[0].findIndex(h => key(h) === key(from)); grid[0][i] = to;
  }
  const book = installed(); book.paste(grid); process(book);
  assert.equal(book.cell('KS3_StagedSubject'),'English');
  assert.deepEqual(counts(expected(book.raw())[0],'Autumn'),[2,2,2,2,2]);
});

const invalidHeaders = [
  ['missing Autumn', grid => { const i = grid[0].findIndex(h => /Autumn/.test(h)); return grid.map(row => row.filter((_,j) => j !== i)); }, /Missing Autumn/],
  ['ambiguous Spring aliases', grid => grid.map((row,i) => [...row,i === 0 ? 'EN Attainment Y7 (%) Year 7 Spring' : '5']), /Multiple columns match Spring/],
  ['mixed layouts', grid => grid.map((row,i) => [...row,i === 0 ? 'SC Exam Y8 (%)~2 Year 8 Autumn' : '5']), /Ambiguous year\/subject/],
  ['duplicate heading', grid => grid.map((row,i) => [...row,i === 0 ? ' Class ' : 'wrong']), /repeated column/],
  ['blank heading', grid => { grid[0][1] = ''; return grid; }, /missing or repeated/],
  ['no supported term headers', grid => { grid[0] = grid[0].map(h => /Attainment Y7/.test(h) ? 'Unknown '+h : h); return grid; }, /No supported/]
];
for (const [name,change,message] of invalidHeaders) test(`${name} clears the old run before failing`, () => {
  const book = installed(); book.paste(fixture('year-7-english')); process(book); refreshModel(book);
  clearPaste(book); const grid = change(fixture('year-7-english')); book.paste(grid);
  assert.throws(() => process(book),message); assert.equal(book.ready(),'NOT READY');
  assert.equal(book.cell('KS3_CurrentRun'),''); assert.deepEqual(book.getWorksheet('Paste_SIMS').getRangeByIndexes(2,0,grid.length,grid[0].length).getValues(),grid);
});
test('Year 9 Science needs an explicit selection and rejects missing/ambiguous selected terms', () => {
  const book = installed(); book.paste(fixture('year-9-science'));
  assert.throws(() => process(book),/choose Biology/);
  book.cell('KS3_SubjectSelection','Physics');
  const grid = fixture('year-9-science'); grid[0][grid[0].findIndex(h => key(h) === key('PH Attainment Y9 (%)~3 Year 9 Summer'))] = 'unknown Physics Summer';
  clearPaste(book); book.paste(grid); assert.throws(() => process(book),/Missing Summer/);
  assert.equal(book.ready(),'NOT READY');
});
test('failed staging write preserves paste and invalidates the previous output', () => {
  const book = installed(), grid = fixture('year-7-english'); book.paste(grid); process(book); refreshModel(book);
  book.getWorksheet('Data_SIMS').failWrite = true;
  assert.throws(() => process(book),/Injected write/); assert.equal(book.ready(),'NOT READY');
  assert.deepEqual(book.getWorksheet('Paste_SIMS').getRangeByIndexes(2,0,grid.length,grid[0].length).getValues(),grid);
});
test('larger/wider → smaller/narrower clears raw tails and keeps the same table; Reset clears loaded readiness', () => {
  const book = installed(), table = book.getTable('SIMS_Raw');
  book.paste(fixture('year-9-science')); book.cell('KS3_SubjectSelection','Biology'); process(book); refreshModel(book);
  clearPaste(book); const long = fixture('year-7-english-32-pupils'); book.paste(long); book.cell('KS3_SubjectSelection','Auto'); process(book); refreshModel(book);
  assert.equal(book.output.length,1); assert.equal(book.output[0].Pupils,32);
  const small = fixture('year-7-english');
  clearPaste(book); book.paste(small); process(book); refreshModel(book);
  assert.equal(book.getTable('SIMS_Raw'),table); assert.deepEqual(book.raw(),small);
  assert.equal(book.getWorksheet('Data_SIMS').getUsedRange().getRowCount(),small.length);
  assert.equal(book.getWorksheet('Data_SIMS').getUsedRange().getColumnCount(),small[0].length);
  assert.deepEqual(book.output.map(row => row.Class),['7SYN/A','7SYN/B']);
  reset(book); assert.equal(book.ready(),'NOT READY'); assert.deepEqual(book.raw(),[['Surname Forename','Class'],['','']]);
  assert.equal(book.cell('KS3_SubjectSelection'),'Auto'); assert.equal(book.cell('KS3_StagedSubject'),'');
  assert.equal(book.getWorksheet('Paste_SIMS').validation.get('1,2').rule.list.source,'Auto,Biology,Physics,Chemistry');
  // The real query's RunID="" path publishes an empty table; this mock doesn't execute M.
  book.output = []; assert.equal(book.ready(),'NOT READY');
});
test('formula-looking pupil text is staged literally', () => {
  const book = installed(), grid = fixture('year-7-english');
  const names = ['=1+1','+Test','-Test','@Test',"'Test"];
  names.forEach((name,i) => { grid[i+1][0] = name; });
  book.paste(grid); process(book); assert.deepEqual(book.raw().slice(1,6).map(r => r[0]),names);
});
test('profile lists, refreshed Art, shared names and complete long lists remain unchanged', () => {
  const grid = fixture('year-7-english'), [a] = expected(grid);
  assert.equal(a.PP_Unknown,9); assert.equal(a.LAC_Unknown,0);
  const art = fixture('year-7-art').map((row,i) => [...row,i === 0 ? 'Sex' : i % 2 ? 'F' : 'M',i === 0 ? 'Looked After' : i === 2 ? 'Y' : '']);
  const artA = expected(art)[0]; assert.equal(artA.Sex_Unclassified,0); assert.equal(artA.LAC_List,'Test Pupil 02');
  const sameNames = fixture('year-7-english'); sameNames[3][0] = sameNames[1][0];
  assert.equal(expected(sameNames)[0].Boys_List.split('\n').filter(n => n === 'Test Pupil 01').length,2);
  const [long] = expected(fixture('year-7-english-32-pupils'));
  for (const [field,count] of Object.entries({SEND_K_List:4,EHCP_List:4,Boys_List:16,Girls_List:16,PP_List:8,LAC_List:2,
      Prior_Q1_List:32,Autumn_Band_81_100_List:32,Spring_Band_0_20_List:32})) {
    assert.equal(long[field].split('\n').length,count); assert.deepEqual(long[field].split('\n'),long[field].split('\n').sort());
  }
  assert.equal(long.Boys_List.length,703); assert.equal(long.Girls_List.length,703); assert.equal(long.PP_List.length,351);
  assert.equal(long.Prior_Q1_List.length,1407); assert.equal(long.Autumn_Band_81_100_List.length,1407);
  assert.equal(long.Autumn_Class_Average,100); assert.equal(long.Spring_Class_Average,0);
  assert.equal(long.Summer_Class_Average,null); assert.equal(long.Summer_Year_Average,null);
  assert.equal(long.Prior_Q2_List,''); assert.equal(long.Summer_Band_0_20_List,'');
});
test('in-place upgrade preserves tables, query source and paste; it can be repeated', () => {
  const book = installed(); book.paste(fixture('year-7-english')); process(book); refreshModel(book);
  const table = book.getTable('SIMS_Raw'), output = book.output, raw = book.raw();
  script('upgrade-pilot')(book);
  assert.equal(book.getTable('SIMS_Raw'),table); assert.equal(book.output,output); assert.deepEqual(book.raw(),raw);
  assert.equal(book.ready(),'NOT READY'); assert.equal(book.mode,'automatic');
});

test('Office Script array callbacks use supported arrow syntax', () => {
  for (const file of fs.readdirSync('office-scripts').filter(f => f.endsWith('.ts'))) {
    const ast = ts.createSourceFile(file,read('office-scripts/'+file),ts.ScriptTarget.Latest,true);
    const visit = node => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
          && ['map','filter','some','every','find','forEach','reduce'].includes(node.expression.name.text)) {
        assert(ts.isArrowFunction(node.arguments[0]),file+': array callbacks must be arrow functions');
      }
      ts.forEachChild(node,visit);
    };
    visit(ast);
  }
});
test('old pilot upgrades in two passes without referencing missing output columns', () => {
  const book = new Workbook(), paste = book.addWorksheet('Paste_SIMS'), raw = book.addWorksheet('Data_SIMS');
  raw.getRange('A1:B2').setValues([['Surname Forename','Class'],['Test Pupil 01','7SYN/A']]);
  raw.addTable(raw.getRange('A1:B2')).setName('SIMS_Raw');
  book.addNamedItem('KS3_CurrentRun',paste.getRange('B2')); book.cell('KS3_CurrentRun','old-run');
  book.tables.set('KS3_Merge_Final',{getColumnByName: () => undefined});
  const table = book.getTable('SIMS_Raw');
  script('upgrade-pilot')(book);
  assert.equal(book.cell('KS3_CurrentRun'),''); assert.equal(paste.getRange('D2').getValue(),'NOT READY');
  assert.match(paste.getRange('A2').getValue(),/Replace the query/); assert.equal(book.getTable('SIMS_Raw'),table);
  // Stand in for the first successful blank-run refresh loading the new schema.
  book.tables.set('KS3_Merge_Final',{getColumnByName: () => ({})});
  script('upgrade-pilot')(book);
  assert.match(paste.getRange('D2').getValue(),/^=IF/); assert.equal(book.ready(),'NOT READY');
});
test('unheaded data beyond the input and header-only input both invalidate the run', () => {
  const book = installed(), grid = fixture('year-7-english');
  const overflow = grid.map((row,i) => [...row,i === 1 ? 'unexpected' : '']);
  book.paste(overflow); assert.throws(() => process(book),/beyond the last heading/);
  assert.equal(book.ready(),'NOT READY'); clearPaste(book);
  book.paste([grid[0]]); assert.throws(() => process(book),/headers and pupil rows/);
  assert.equal(book.ready(),'NOT READY');
});

for (const name of ['setup-pilot','upgrade-pilot']) test(`${name} installs the C2 validation dropdown with exactly four choices`, () => {
  const book = name === 'setup-pilot' ? new Workbook() : installed();
  script(name)(book);
  const sheet = book.getWorksheet('Paste_SIMS'), validation = sheet.validation.get('1,2');
  assert.equal(sheet.getRange('C2').getValue(),'Auto');
  assert.equal(validation.rule.list.source,'Auto,Biology,Physics,Chemistry');
  assert.equal(validation.rule.list.inCellDropDown,true);
  assert.equal(validation.ignoreBlanks,false);
  assert.equal(validation.errorAlert.showAlert,true); assert.equal(validation.errorAlert.style,'stop');
  assert.equal(sheet.getRange('C1').getValue(),'Subject (choose in C2)');
});
test('Process rejects blank or unsupported choices even if pasted over data validation', () => {
  for (const choice of ['', 'Geography', 'English']) {
    const book = installed(); book.cell('KS3_SubjectSelection','Biology'); book.paste(fixture('year-9-science')); process(book); refreshModel(book);
    const raw = book.raw(); book.cell('KS3_SubjectSelection',choice);
    assert.equal(book.ready(),'PROCESS REQUIRED');
    assert.throws(() => process(book),/C2 dropdown/); assert.equal(book.ready(),'NOT READY');
    assert.deepEqual(book.raw(),raw);
    book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),'NOT READY');
  }
});
test('Help describes the C2 dropdown and preserves the current valid run', () => {
  const book = installed(); book.paste(fixture('year-7-english')); process(book); refreshModel(book);
  const run = book.cell('KS3_CurrentRun'), ready = book.ready(); script('help')(book);
  assert.match(book.getWorksheet('Paste_SIMS').getRange('A2').getValue(),/choose C2/);
  assert.equal(book.cell('KS3_CurrentRun'),run); assert.equal(book.ready(),ready);
});

test('restaging changed Biology marks prevents away/back from recognising the old output', () => {
  const book = installed(), grid = fixture('year-9-science');
  book.cell('KS3_SubjectSelection','Biology'); book.paste(grid); process(book); refreshModel(book);
  const oldOutput = book.output, oldRun = book.cell('KS3_CurrentRun');
  const summer = grid[0].findIndex(h => key(h) === key('BI Attainment Y9 (%)~3 Year 9 Summer'));
  grid[1][summer] = '5'; clearPaste(book); book.paste(grid); process(book);
  assert.notEqual(book.cell('KS3_CurrentRun'),oldRun); assert.equal(book.output,oldOutput);
  assert.equal(book.ready(),'REFRESH REQUIRED');
  book.cell('KS3_SubjectSelection','Physics'); assert.equal(book.ready(),'PROCESS REQUIRED');
  book.cell('KS3_SubjectSelection','Biology'); assert.equal(book.ready(),'REFRESH REQUIRED');
  refreshModel(book); assert.match(book.ready(),/Year 9 Biology/);
  assert.deepEqual(counts(book.output[0],'Summer'),[1,2,2,2,3]);
});
