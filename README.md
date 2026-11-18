# KS3 Class on a Page

A SIMS-to-Word reporting tool for Years 7–9. The operator pastes a SIMS marksheet into Excel, uses Office Scripts to prepare or reset the input, refreshes the Power Query output, and merges one report per teaching class in desktop Word.

- [Remaining layouts: in-place upgrade and desktop checklist](docs/REMAINING_LAYOUTS.md)
- [Automated checks, expected results and native checks still pending](docs/TEST_EVIDENCE.md)
- [Year 7 English pilot setup and expected results](docs/YEAR_7_ENGLISH_PILOT.md)
- [Release 1 specification](docs/SPEC.md)
- [One-week build and acceptance plan](docs/ROADMAP.md)

This public repository holds portable source and fully synthetic fixtures. Keep operational workbooks, school templates, SIMS exports, pupil data, generated reports and tenant-specific links or script associations in the school's Microsoft 365 environment.

Supported exports: Year 7 English, Art and Science; Year 8 French, Maths and Science; Year 9 DT and a combined Science export processed separately for Biology, Physics and Chemistry. Choose the subject from the `Paste_SIMS!C2` dropdown. Keep one processor workbook and the existing `KS3_Merge_Final` Word source.

For source checks, run `npm ci --ignore-scripts` and `npm test`. Edit header aliases in `config/layouts.json`, then run `npm run generate` to update both standalone runtime sources.
