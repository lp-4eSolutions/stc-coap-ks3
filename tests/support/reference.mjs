// Independent expected-results model, NOT an M evaluator. Native Power Query checks remain required.
import { read } from './workbook.mjs';
export const config = JSON.parse(read('config/layouts.json'));
export const clean = value => String(value ?? '').replace(/\u00a0/g,' ').trim();
export const key = value => clean(value).toUpperCase().replace(/[ \t]/g,'');
export const terms = ['Autumn','Spring','Summer'];
export const bands = [[81,100,'81_100'],[61,80,'61_80'],[41,60,'41_60'],[21,40,'21_40'],[0,20,'0_20']];
export const reportingVersion = 'Percent-2026-11-19';
// Accept decimal numeric text, then validate the represented value is a whole number.
export function whole(value,min,max) {
  const text = clean(value);
  if (text === '') return null;
  const n = typeof value === 'number' ? value : typeof value === 'string' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : -1;
}
const mean = values => values.length ? values.reduce((a,b) => a+b,0)/values.length : null;
export function expected(grid, selection = 'Auto', runID = 'test-run') {
  const headers = grid[0].map(key);
  const matches = config.layouts.filter(l => l.subjects.some(s => s.terms.flat().some(a => headers.includes(key(a)))));
  if (matches.length !== 1) throw new Error('Missing or ambiguous layout');
  const layout = matches[0];
  const subject = layout.subjects.length === 1 ? layout.subjects[0] : layout.subjects.find(s => s.subject === selection);
  if (!subject) throw new Error('Select a science');
  const bindings = [...config.profile, ...subject.terms.map((aliases, t) => [terms[t],true,aliases])];
  const indices = Object.fromEntries(bindings.map(([name,required,aliases]) => {
    const indices = headers.flatMap((h,i) => aliases.some(a => key(a) === h) ? [i] : []);
    if (indices.length > 1 || (required && !indices.length)) throw new Error(`Missing or ambiguous ${name}`);
    return [name,indices[0] ?? -1];
  }));
  const flag = (value, blankNo = false) => ['Y','YES'].includes(value) ? true : ['N','NO'].includes(value) || (blankNo && !value) ? false : null;
  const rows = grid.slice(1).map(values => {
    const row = Object.fromEntries(Object.entries(indices).map(([name,i]) => [name,clean(values[i])]));
    for (const name of ['Sex','SEN']) row[name] = row[name].toUpperCase();
    row.PP = flag(row.PP.toUpperCase()); row.LAC = indices.LAC < 0 ? null : flag(row.LAC.toUpperCase(),true);
    row.PriorAttainment = whole(values[indices.PriorAttainment],1,5);
    for (const term of terms) row[term] = whole(values[indices[term]],0,100);
    return row;
  }).filter(row => row.Pupil || row.Class);
  const classes = [...new Set(rows.map(r => r.Class).filter(Boolean))].sort();
  if (!classes.length || rows.some(row => row.Class && !row.Pupil)) throw new Error('Missing class/pupil');
  const cohort = rows.filter(r => r.Pupil);
  return classes.map(classCode => {
    const members = rows.filter(row => row.Class === classCode);
    const names = predicate => members.filter(predicate).map(r => r.Pupil).sort().join('\n');
    const output = {
      Class: classCode, Subject: subject.subject, Subject_Class: subject.subject + ' / ' + classCode,
      Year_Group: layout.year, RunID:runID, SelectionToken:selection, Reporting_Version:reportingVersion, Pupils:members.length,
      SEND_K_List:names(r => r.SEN === 'K'), EHCP_List:names(r => r.SEN === 'E'),
      Boys_List:names(r => ['M','MALE'].includes(r.Sex)), Girls_List:names(r => ['F','FEMALE'].includes(r.Sex)),
      PP_List:names(r => r.PP === true), LAC_List:indices.LAC < 0 ? 'Unavailable' : names(r => r.LAC === true),
      Sex_Unclassified:members.filter(r => !['M','MALE','F','FEMALE'].includes(r.Sex)).length,
      PP_Unknown:members.filter(r => r.PP === null).length, LAC_Unknown:members.filter(r => r.LAC === null).length,
      LAC_Column_Status:indices.LAC < 0 ? 'Unavailable' : 'Present', Rows_Without_Class:rows.filter(r => !r.Class).length,
      Prior_Attainment_Assessed:members.filter(r => r.PriorAttainment >= 1).length,
      Prior_Attainment_Invalid:members.filter(r => r.PriorAttainment === -1).length,
      Prior_Attainment_Unassessed:members.filter(r => r.PriorAttainment === null).length
    };
    for (let q=1;q<=5;q++) output[`Prior_Q${q}_List`] = names(r => r.PriorAttainment === q);
    for (const term of terms) {
      const values = members.map(r => r[term]), valid = values.filter(v => v !== null && v >= 0);
      const yearValues = cohort.map(r => r[term]), yearValid = yearValues.filter(v => v !== null && v >= 0);
      output[term+'_Assessed'] = valid.length;
      output[term+'_Invalid'] = values.filter(v => v === -1).length;
      output[term+'_Year_Assessed'] = yearValid.length;
      output[term+'_Year_Invalid'] = yearValues.filter(v => v === -1).length;
      output[term+'_Class_Average'] = mean(valid);
      output[term+'_Year_Average'] = mean(yearValid);
      for (const [min,max,suffix] of bands) {
        const contains = value => value !== null && value >= min && value <= max;
        output[`${term}_Band_${suffix}_List`] = names(r => contains(r[term]));
        output[`${term}_Band_${suffix}_Count`] = valid.filter(contains).length;
      }
    }
    return output;
  });
}
