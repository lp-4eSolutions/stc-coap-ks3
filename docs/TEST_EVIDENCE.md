# Regression evidence

These are portable-source checks for the remaining-layout upgrade, based on main `988e770`. Reproduce with Node.js 24: `npm ci --ignore-scripts` then `npm test`. No operational workbook, pupil data, Word template or tenant association is committed.

## Automated

On 17 November 2026, `npm test` passed all **34 checks** on Node.js 24.22.1.

- The generated standalone Process and M binding blocks match the one observed-header map, which covers all eight layouts (ten subject runs).
- All six Office Script files parse as TypeScript. The production M source parses with Microsoft's Power Query parser.
- The **actual** Process, Select Subject, Reset, Setup and Upgrade entrypoints run against an in-memory workbook mock. Checks include all eight synthetic exports; correct resolved year/subject; repeated Biology → Physics → Chemistry on the same paste; selection changes including away/back and reselecting; missing, ambiguous, duplicate and mixed-layout headers; failed staging writes; literal source text; and clearing both dimensions of the existing staging table after wider/larger input.
- The **actual installed readiness formula** is evaluated with HyperFormula after translating structured references to ranges. Checks cover old/mixed run IDs, wrong year/subject/selection, changed selections, empty output, invalid marks, and a simulated failed/cancelled refresh that leaves old loaded rows. This is formula-engine verification, not Excel-client acceptance.
- An independent JavaScript expected-results model checks fixture counts, class isolation, all six profile lists, blank/unknown flags, invalid/text marks, preserved duplicate names and complete 32-pupil lists. Year 9 subject marks differ in every term; changing the Year 7 Science exam/prior-attainment columns leaves expected Summer counts unchanged. This model is **not an M evaluator**; these expected results must still be compared with native Power Query.

## Synthetic expected results

Each eight-pupil fixture has class A (pupils 01–05), class B (06–07), and pupil 08 without a class. Expect two output rows; `Rows_Without_Class=1` is repeated on each row. All pupil values are synthetic. Art/French/Maths/DT/Year 9 Science retain the operator's supplied header row; Science 7–8 use documented projected headers. All table names and merge-field names remain unchanged.

For English, Art, French, Maths, DT and Years 7–8 Science, class A has:

| Term | Assessed | Q1, Q2, Q3, Q4, Q5 | Invalid |
| --- | --- | --- | --- |
| Autumn | 4 | 1, 2, 0, 0, 1 | 0 |
| Spring | 0 | 0, 0, 0, 0, 0 | 0 |
| Summer | 2 | 0, 0, 1, 0, 1 | 0 |

Class B has two Autumn Q4 results and two Summer Q2 results. Its Spring marks are 1 and 3 for the original English fixture, and 3 and 3 for the new fixtures. Pupil 08 must not enter any class count or list. In Year 7 Science, the separate exam and both other Summer quintile columns are 5; Summer must still be Q3=1, Q5=1 for class A, and Q2=2 for class B.

For the **same Year 9 Science paste**, each class-A term has four assessed pupils and class B has two. Each term's marks all lie in the following single quintile, with zero counts in the other four quintiles and zero invalid marks:

| Selected subject | Autumn quintile | Spring quintile | Summer quintile |
| --- | --- | --- | --- |
| Biology | 1 | 2 | 3 |
| Physics | 2 | 3 | 4 |
| Chemistry | 5 | 4 | 1 |

Every fixture has SEND K pupil 01 and EHCP pupil 02 in class A, SEND K pupil 06 in B. Art's original row lacks LAC; report `Unavailable`, with five/two unknowns. Other fixtures have LAC pupil 02 in A and blank LAC in B (blank in a present column means No). The five supplied new rows lack Sex, so every pupil is unclassified and the Boys/Girls lists are blank. Science 7–8 and English have Boys 01/04 and Girls 02/03 in A, with one unclassified pupil; B has Boy 07 and Girl 06. Tests append Sex and LAC to Art to verify the refreshed shape.

The existing [English pilot guide](YEAR_7_ENGLISH_PILOT.md) gives exact PP lists and the original long-fixture acceptance. The long fixture still has 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP and 2 LAC names; Boys and Girls are each 703 characters including line feeds, PP is 351.

## Pending native checks

This environment has not executed Excel Power Query, the Office Scripts service/compiler, workbook refresh, shared buttons, saved workbook caching or desktop Word/ACE mail merge for this upgrade. The mock does not execute M or prove native table resize/refresh behaviour. Run the [short desktop checklist](REMAINING_LAYOUTS.md#short-desktop-acceptance-checklist--still-to-run-for-this-upgrade) on the operator's actual Excel and Word clients. The school workbook upgrade and native acceptance remain pending; the draft PR supplies installable source, synthetic fixtures and this evidence.
