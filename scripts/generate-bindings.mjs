// One small observed-header map; generated blocks keep standalone Office scripts and M aligned.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const config = JSON.parse(fs.readFileSync('config/layouts.json', 'utf8'));
const key = s => s.replace(/\u00a0/g, ' ').trim().toUpperCase().replace(/[ \t]/g, '');
const owners = new Map();
for (const layout of config.layouts) {
  for (const subject of layout.subjects) {
    assert.equal(subject.terms.length, 3);
    subject.terms.forEach((aliases, term) => {
      assert(aliases.length > 0);
      for (const alias of aliases) {
        const owner = `${layout.id}/${subject.subject}/${term}`;
        assert(!owners.has(key(alias)) || owners.get(key(alias)) === owner, `Alias collision: ${alias}`);
        owners.set(key(alias), owner);
      }
    });
  }
}
const m = value => typeof value === 'string' ? '"' + value.replace(/"/g, '""') + '"'
  : Array.isArray(value) ? '{' + value.map(m).join(', ') + '}' : String(value);
const layouts = config.layouts.map(l => [l.id, l.year, l.subjects.map(s => [s.subject, s.terms])]);
const blocks = [
  ['office-scripts/process-pupil-data.ts', '// BEGIN GENERATED BINDINGS', '// END GENERATED BINDINGS',
    'const profile: Binding[] = ' + JSON.stringify(config.profile, null, 2) + ';\n' +
    'const layouts: Layout[] = ' + JSON.stringify(config.layouts, null, 2) + ';'],
  ['power-query/KS3_Merge_Final.pq', '    // BEGIN GENERATED BINDINGS', '    // END GENERATED BINDINGS',
    '    ProfileBindings = ' + m(config.profile) + ',\n    Layouts = ' + m(layouts) + ',']
];
for (const [file, start, end, content] of blocks) {
  const original = fs.readFileSync(file, 'utf8');
  const from = original.indexOf(start), to = original.indexOf(end);
  assert(from >= 0 && to > from, `Missing generated block: ${file}`);
  const next = original.slice(0, from) + start + '\n' + content + '\n' + original.slice(to);
  if (process.argv.includes('--check')) assert.equal(original, next, `Run npm run generate: ${file}`);
  else fs.writeFileSync(file, next);
}
