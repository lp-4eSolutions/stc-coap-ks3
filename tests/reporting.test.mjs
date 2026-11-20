import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, installed, read, script } from './support/workbook.mjs';
import { bands, config, expected, key, terms, whole } from './support/reference.mjs';
const process = script('process-pupil-data');
const near = (value,want) => assert(Math.abs(value-want)<1e-10, `${value} != ${want}`);
const list = values => values.map(i => `Test Pupil ${String(i).padStart(2,'0')}`).join('\n');
const termIndex = (grid,subject,t) => grid[0].findIndex(h => subject.terms[t].some(a => key(a) === key(h)));
const priorIndex = grid => grid[0].findIndex(h => ['PRIORATTAINMENTQUINTILE','PRIORATTAINMENTQIUNTINE'].includes(key(h)));

for (const layout of config.layouts) for (const subject of layout.subjects) for (const [t,term] of terms.entries()) {
  test(`reference results: ${layout.id}/${subject.subject}/${term} boundaries, blanks and invalid marks`, () => {
    const grid = fixture(layout.id), index = termIndex(grid,subject,t), choice = layout.subjects.length>1 ? subject.subject : 'Auto';
    const boundary = [0,' 20 ',21,40,41,60,61,80,'81.0','100',''];
    boundary.forEach((v,i) => { grid[i+1][index] = v; });
    const book = installed(); book.cell('KS3_SubjectSelection',choice); book.paste(grid); process(book);
    const result = expected(book.raw(),choice,book.cell('KS3_CurrentRun'));
    const a = result[0]; assert.equal(a[term+'_Assessed'],10); assert.equal(a[term+'_Invalid'],0);
    near(a[term+'_Class_Average'],50.4);
    for (const [b,[,,suffix]] of bands.entries()) {
      assert.equal(a[`${term}_Band_${suffix}_Count`],2);
      assert.equal(a[`${term}_Band_${suffix}_List`],list([9-2*b,10-2*b]));
    }
    [-1,101,20.5,'unexpected'].forEach((v,i) => { grid[i+1][index] = v; });
    const invalid = expected(grid,choice)[0];
    assert.equal(invalid[term+'_Assessed'],6); assert.equal(invalid[term+'_Invalid'],4);
    near(invalid[term+'_Class_Average'],70.5);
    assert.equal(invalid[`${term}_Band_0_20_List`],''); assert.equal(invalid[`${term}_Band_21_40_List`],'');
    book.output = expected(grid,choice,book.cell('KS3_CurrentRun'));
    assert.equal(book.ready(),'CHECK INVALID MARKS');
  });
}

test('whole numeric and numeric-text values include 0, 1, 5 and 6; fractions, bounds and text are invalid', () => {
  for (const [value,want] of [[0,0],[' 0 ',0],['0.0',0],[1,1],[5,5],[6,6],['100.0',100],['+21',21],['',null],[' \u00a0 ',null],[null,null],[-1,-1],[101,-1],[20.5,-1],['20.5',-1],[true,-1],['20%',-1],['absent',-1]]) {
    assert.equal(whole(value,0,100),want,JSON.stringify(value));
  }
  for (const [value,want] of [[1,1],[' 5.0 ',5],[0,-1],[6,-1],[1.5,-1],['',null]]) assert.equal(whole(value,1,5),want);
});
test('independent prior-attainment lists: Q1 pupil can have 0 and Q5 pupil 100', () => {
  const grid = fixture('year-7-english'), a = expected(grid)[0], prior = priorIndex(grid);
  assert(a.Prior_Q1_List.includes('Test Pupil 01')); assert(a.Autumn_Band_0_20_List.includes('Test Pupil 01'));
  assert(a.Prior_Q5_List.includes('Test Pupil 10')); assert(a.Autumn_Band_81_100_List.includes('Test Pupil 10'));
  for (const row of grid.slice(1)) row[prior] = '1';
  const changedPrior = expected(grid)[0];
  for (const [field,value] of Object.entries(a).filter(([name]) => /^(Autumn|Spring|Summer)_/.test(name))) assert.equal(changedPrior[field],value,field);
  assert.equal(changedPrior.Prior_Q1_List.split('\n').length,11);
  const subject = config.layouts.find(l => l.id === 'year-7-english').subjects[0];
  grid[1][termIndex(grid,subject,0)] = 100;
  const changedPercentage = expected(grid)[0];
  for (let q=1;q<=5;q++) assert.equal(changedPercentage[`Prior_Q${q}_List`],changedPrior[`Prior_Q${q}_List`]);
});
test('prior-attainment alias is required and ambiguous baseline columns stop actual Process', () => {
  const grid = fixture('year-7-science'), baseline = priorIndex(grid);
  assert.equal(key(grid[0][baseline]),key('Prior Attainment Qiuntine'));
  const book = installed(); book.paste(grid); process(book);
  assert.equal(expected(book.raw())[0].Prior_Q5_List,list([5,10]));
  const noPrior = grid.map(row => row.filter((_,i) => i !== baseline));
  book.getWorksheet('Paste_SIMS').getRangeByIndexes(2,0,grid.length,grid[0].length).clear();
  book.paste(noPrior); assert.throws(() => process(book),/Missing PriorAttainment/);
  const both = grid.map((row,i) => [...row,i===0 ? 'Prior Attainment Quintile' : '1']);
  book.paste(both); assert.throws(() => process(book),/Multiple columns match PriorAttainment/);
  assert.equal(book.ready(),'NOT READY');
});
test('invalid and blank prior quintiles never enter a prior list and invalid values block readiness', () => {
  const grid = fixture('year-7-english'), index = priorIndex(grid), book = installed();
  [0,6,1.5,'unexpected',''].forEach((value,i) => { grid[i+1][index]=value; });
  book.paste(grid); process(book); book.output = expected(book.raw(),'Auto',book.cell('KS3_CurrentRun'));
  const a = book.output[0]; assert.equal(a.Prior_Attainment_Invalid,4); assert.equal(a.Prior_Attainment_Unassessed,2);
  assert.equal(a.Prior_Attainment_Assessed,5); assert.equal(book.ready(),'CHECK INVALID MARKS');
  assert.equal(a.Autumn_Class_Average,50.4);
});
test('year means weight pupil marks across unequal classes and include a named pupil missing a class', () => {
  const grid = fixture('year-7-english'), [a,b] = expected(grid);
  near(a.Autumn_Class_Average,50.4); near(b.Autumn_Class_Average,4); near(a.Autumn_Year_Average,516/13);
  assert.notEqual(a.Autumn_Year_Average,(a.Autumn_Class_Average+b.Autumn_Class_Average)/2);
  const index = grid[0].findIndex(h => h.includes('Autumn'));
  grid[15][index] = 100;
  const changed = expected(grid);
  near(changed[0].Autumn_Year_Average,44); assert.equal(changed[0].Autumn_Year_Assessed,14);
  assert.equal(changed[0].Autumn_Class_Average,a.Autumn_Class_Average);
  assert.equal(changed[1].Autumn_Class_Average,b.Autumn_Class_Average);
  assert.equal(changed[0].Rows_Without_Class,1);
  grid[15][index] = 101;
  const book = installed(); book.paste(grid); process(book); book.output = expected(book.raw(),'Auto',book.cell('KS3_CurrentRun'));
  assert.equal(book.output[0].Autumn_Year_Invalid,1); assert.equal(book.output[0].Autumn_Invalid,0);
  assert.equal(book.ready(),'CHECK INVALID MARKS');
});
test('entirely blank or entirely invalid terms leave both means null; valid all-zero terms have mean 0', () => {
  const grid = fixture('year-7-english'), index = grid[0].findIndex(h => h.includes('Autumn'));
  for (const value of ['',101,'0.0']) {
    for (const row of grid.slice(1)) row[index]=value;
    const rows = expected(grid);
    for (const row of rows) {
      assert.equal(row.Autumn_Class_Average,value==='0.0' ? 0 : null);
      assert.equal(row.Autumn_Year_Average,value==='0.0' ? 0 : null);
      assert.equal(row.Autumn_Band_81_100_List,'');
      if (value!=='0.0') assert.equal(row.Autumn_Band_0_20_List,'');
    }
  }
});
test('validation fixture contains 6 assessed A pupils and four invalids; no invalid mark enters means or bands', () => {
  const [a,b] = expected(fixture('percentage-validation'));
  assert.equal(a.Autumn_Assessed,6); assert.equal(a.Autumn_Invalid,4); near(a.Autumn_Class_Average,147/6);
  assert.equal(b.Autumn_Assessed,3); near(b.Autumn_Class_Average,4);
  near(a.Autumn_Year_Average,159/9);
});
test('old remaining-layout schema with SelectionToken alone cannot install the new readiness formula', () => {
  const book = installed();
  book.tables.set('KS3_Merge_Final',{getColumnByName: name => name==='SelectionToken' ? {} : undefined});
  script('upgrade-pilot')(book);
  assert.equal(book.getWorksheet('Paste_SIMS').getRange('D2').getValue(),'NOT READY');
  assert.match(book.getWorksheet('Paste_SIMS').getRange('A2').getValue(),/Replace the query/);
});

test('field manifest covers all 26 new reporting fields and preserves seven profile names and band ordering', () => {
  const manifest = JSON.parse(read('config/word-fields.json'));
  assert.equal(manifest.template_date,'2026-11-19'); assert.equal(manifest.fields.length,33);
  assert.equal(new Set(manifest.fields.map(f=>f.field)).size,33);
  assert.deepEqual(manifest.fields.slice(0,7).map(f=>f.field),['Subject_Class','SEND_K_List','EHCP_List','Boys_List','Girls_List','PP_List','LAC_List']);
  const rows = expected(fixture('year-7-english'));
  for (const field of manifest.fields) {
    assert(Object.hasOwn(rows[0],field.field),field.field);
    assert(read('docs/WORD_FIELDS.md').includes('`'+field.field+'`'),field.field+' missing from human manifest');
  }
  for (const term of terms) {
    assert.deepEqual(manifest.fields.filter(f=>f.section===term).slice(0,5).map(f=>f.heading),['100% – 81%','80% – 61%','60% – 41%','40% – 21%','20% – 0%']);
  }
});
test('all saved reference results and the long fixture contain the manifest fields', () => {
  const saved = JSON.parse(read('tests/expected-results.json')), manifest=JSON.parse(read('config/word-fields.json'));
  assert.equal(Object.keys(saved).length,12);
  for (const rows of Object.values(saved)) for (const row of rows) for (const f of manifest.fields) assert(Object.hasOwn(row,f.field));
});
