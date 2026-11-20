// Synthetic reference results for native comparison; this does not execute Power Query.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fixture } from '../tests/support/workbook.mjs';
import { config, expected } from '../tests/support/reference.mjs';
const runs = config.layouts.flatMap(layout => layout.subjects.map(subject =>
  [layout.id,subject.subject,layout.subjects.length>1 ? subject.subject : 'Auto']));
runs.push(['year-7-english-32-pupils','English','Auto'],['percentage-validation','English','Auto']);
const data = Object.fromEntries(runs.map(([id,subject,choice]) => [id+'/'+subject,
  expected(fixture(id),choice).map(({RunID,...row}) => row)]));
const file = 'tests/expected-results.json', text = JSON.stringify(data,null,2)+'\n';
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file,'utf8'),text,'Regenerate deliberate fixture/reference changes with npm run expected');
else fs.writeFileSync(file,text);
