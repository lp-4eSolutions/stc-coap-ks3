# Year 7 English pilot record

The original pilot established the single-workbook A3 → Process → `KS3_Merge_Final` → desktop Word workflow and the seven profile fields. It used term quintiles 1–5. On 19 November, the confirmed definition changed term reporting to whole-number percentages; current fixtures and instructions now use those confirmed definitions.

Use the [current in-place upgrade and operating instructions](REMAINING_LAYOUTS.md), [19 November field manifest](WORD_FIELDS.md) and [revised expected results](TEST_EVIDENCE.md). The historical installation formula and term-quintile expectations have been superseded; the commit history retains that pilot source/evidence.

## Retained profile and Word evidence

The operator initially saw `0` for some name fields. The original cause remained unconfirmed; supplied synthetic workbook inspection found equivalent saved name strings and ACE reader options. After a clean source repeat, the operator confirmed full profile lists using `KS3_Merge_Final` directly. Retain the direct query source and keep diagnostic formulas off its merge worksheet.

On 18 November 2026, the operator confirmed the C2 dropdown behaviour: a different selection requires Process, returning to the unchanged staged choice recognises its valid output, and starting a new Process prevents the previous output from being accepted. On 19 November, the operator supplied the earlier long/two-class English outputs and Word profiles, and confirmed no previous recipients after Reset, successful refresh and save. These checks precede the new reporting implementation and are not native acceptance of its additional fields.

The [32-pupil fixture](../tests/year-7-english-32-pupils.tsv) retains the exact long profile names: 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP and 2 LAC. Boys and Girls each have 703 characters including line feeds, PP 351. The revised fixture also has three new lists of 32 names/1,407 characters: prior Q1, Autumn's highest percentage band and Spring's lowest percentage band. Autumn means are 100, Spring means 0 and Summer means blank.

## Repeat sequence on the current source

| Stage | Fixture | Expected Word recipients |
| --- | --- | --- |
| 1 | 32-pupil fixture | One: `7SYN/LONG`, 32 pupils |
| 2 | Revised two-class fixture | Two: `7SYN/A` (11 pupils), `7SYN/B` (3 pupils); no LONG |
| 3 | 32-pupil fixture again | One: `7SYN/LONG`; no A or B |
| 4 | Reset, successfully refresh and save | No previous class recipients |

For each populated stage, close Word, Reset, paste at A3, choose Auto in C2, Process and successfully refresh. Check readiness, reporting version, current run ID, class count and the reference results; save/close Excel and explicitly reconnect the 19 November Word template to that saved workbook/source. Check all 33 mapped fields, full names including final names, correct blank cells and the supplied headings. Long names can wrap and reports may span pages; clipping, missing names, class leakage or `0` substituted in name lists fail acceptance. The [focused checklist](REMAINING_LAYOUTS.md#focused-desktop-word-acceptance--new-reporting-fields-pending) includes percentage means and independent prior/term groups.

Reset invalidates the run immediately but does not itself clear loaded query rows. Complete a successful blank-run refresh and save before reconnecting Word to check empty recipients. After any failed Process or refresh, complete a successful current run before merging. Native acceptance of the new reporting fields remains pending.
