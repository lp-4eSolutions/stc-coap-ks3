# Regression evidence — confirmed reporting fields

The implementation starts from the latest PR branch `0929eb3`, including the confirmed 19 November definitions and revised roadmap. Reproduce with Node.js 24: `npm ci --ignore-scripts` then `npm test`. Public inputs and outputs here are fully synthetic. Keep the school workbook and 19 November Word template outside the repository.

## Automated checks

On 19 November 2026, `npm test` passed all **81 checks** on Node.js 24.22.1.

The suite checks generated binding consistency, production M syntax with Microsoft's parser, all five Office Script sources and actual script entrypoints against a workbook mock. HyperFormula evaluates the installed readiness formula, including reporting-version rejection, C2 changes/return to the unchanged staged selection, early invalidation by Process, failed writes/refresh, smaller-after-larger staging and Reset. Setup/Upgrade retain the four-option data-validation dropdown.

An independent JavaScript reference model verifies fixture name lists, band boundaries, prior/percentage independence, invalid inputs, numeric text, genuine zeroes, null means and unequal-class pupil weighting. Tests cover all eight layouts/ten subject runs and repeat all boundaries/invalid checks for every subject/term binding. The manifest is checked for all 33 fields and the supplied descending band order. The [saved full reference results](../tests/expected-results.json) cover all ten runs plus validation and long-name fixtures; `npm run expected` regenerates them after deliberate fixture/model changes and `npm test` detects stale results.

**These checks do not execute M.** The reference model is an oracle for native comparison, not proof of Power Query runtime or Word behaviour. Native checks are listed separately below.

## Revised eight-layout fixtures

Every normal fixture has 15 named synthetic pupils: class A is 01–11, class B is 12–14, and pupil 15 has no class and blank term marks. Expect **two** output rows, pupil counts 11 and 3, and `Rows_Without_Class=1` on both. Fixture headers retain the observed layouts and aliases. English now includes the required baseline header. Art's supplied header omits LAC; the five newly supplied layouts omit Sex, so those diagnostics remain unavailable/unclassified. Tests also append Sex/LAC to Art to verify the refreshed shape.

For every single-subject fixture and **Year 9 Biology**, class A Autumn is:

| Pupil numbers | Marks | Field / inclusive band |
| --- | --- | --- |
| 09, 10 | 81, 100 | `Autumn_Band_81_100_List` |
| 07, 08 | 61, 80 | `Autumn_Band_61_80_List` |
| 05, 06 | 41, 60 | `Autumn_Band_41_60_List` |
| 03, 04 | 21, 40 | `Autumn_Band_21_40_List` |
| 01, 02 | 0, 20 | `Autumn_Band_0_20_List` |
| 11 | blank | no term list / unassessed |

Each listed name is `Test Pupil NN`. Expect **10 assessed, 0 invalid, two names per band, mean 50.4%**. Prior lists are independent: Q1=01/06, Q2=02/07, Q3=03/08, Q4=04/09, Q5=05/10; pupil 11 has blank baseline. Thus Q1 pupil 01 has a low term mark and Q5 pupil 10 a high mark.

| Run scope | Autumn assessed / mean | Spring assessed / mean | Summer assessed / mean |
| --- | --- | --- | --- |
| Class A | 10 / 50.4 | 0 / blank | 10 / 50.4 |
| Class B | 3 / 4 | 2 / 50 | 2 / 30.5 |
| Supplied cohort | 13 / 516÷13 = 39.692307… | 2 / 50 | 12 / 565÷12 = 47.083333… |

Class B Autumn marks are **1, ` 5 `, 6**, demonstrating that low values are valid percentages. Spring marks are **0, `100.0`, blank**, demonstrating zero and numeric text. Summer marks are **21, 40, blank**. A's Summer marks reverse its ten Autumn marks. The year mean is repeated on each class row and is not the unweighted mean of class averages. Pupil 15's blank marks do not enter these figures; a targeted test gives that pupil 100 and verifies that the year mean includes it while class means stay unchanged.

All ordinary A profiles have SEND K=01, EHCP=02, PP=01. B has SEND K/PP=12 and no EHCP. Present LAC has pupil 02 only, with blank cells meaning No. Art reports LAC Unavailable. In fixtures containing Sex, A Boys=01/03/05/07/09, Girls=02/04/06/08/10 and one unclassified; B Boy=13, Girl=12 and one unclassified. The other layouts' Sex counts are fully unclassified. Unknown PP counts are 9 in A and 1 in B.

## Same Year 9 paste, three different subjects

Physics uses `100 − Biology mark`; Chemistry uses `floor(Biology mark ÷ 2)` for valid marks. Blank marks stay blank. This deliberately changes bands as well as means, catching cross-subject binding.

| Selected subject | A Autumn mean | A Autumn band counts, high → low | B Autumn mean | Year Autumn mean |
| --- | --- | --- | --- | --- |
| Biology | 50.4 | 2, 2, 2, 2, 2 | 4 | 516÷13 = 39.692307… |
| Physics | 49.6 | 1, 2, 2, 2, 3 | 96 | 784÷13 = 60.307692… |
| Chemistry | 25 | 0, 0, 1, 4, 5 | 5÷3 | 255÷13 = 19.615384… |

Spring A is blank for all three; Spring cohort means are Biology=50, Physics=50, Chemistry=25. Summer cohort means are Biology=565÷12, Physics=635÷12, Chemistry=280÷12. Prior lists are unchanged between selections. Check exact names and all means in the saved JSON. Year 7 Science keeps the separate Summer exam at **99**, both other Summer quintile columns at **5**, and actual term marks at the boundary values; only the actual term column feeds its bands/mean.

## Invalid and long-list cases

[percentage-validation.tsv](../tests/percentage-validation.tsv) puts -1, 101, 20.5 and `absent` in class A Autumn. Valid values there are 0, ` 20 `, 21, `0.0`, `100.0`, 6; pupil 11 is blank. Expect **6 assessed, 4 invalid, class mean 24.5**, B mean 4 and cohort mean **159÷9 = 17.666666…**. Invalid values enter no name list or mean and readiness shows CHECK INVALID MARKS. Separate tests cover invalid/ambiguous/missing baseline columns, boolean/unexpected input, wholly invalid terms, wholly blank terms and all-zero terms. Whole numeric-text `5.0` is valid, fractional `20.5` is invalid.

The revised [32-pupil English fixture](../tests/year-7-english-32-pupils.tsv) retains its original long names and six profile-list counts: 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP, 2 LAC. Now all 32 have prior Q1, Autumn=100, Spring=`0.0`, Summer blank. `Prior_Q1_List`, `Autumn_Band_81_100_List` and `Spring_Band_0_20_List` each contain **32 sorted full names and 1,407 characters** including line feeds. Boys/Girls remain 703 characters each, PP 351. Other prior/term cells and Summer means are blank; Autumn means are 100 and Spring means are 0.

## Native evidence and pending checks

The operator's earlier evidence is retained: on 18 November the C2 dropdown/selection cycle and native Year 9 subject outputs passed; on 19 November the previous revision's long/two-class profile merges and Reset-to-empty passed. Those checks used the previous term-quintile revision. They establish prior import/profile/Word transport behaviour and **do not certify these new percentage/prior-attainment fields or revised fixtures**.

This environment has not executed the new M query in Excel, Office Scripts compilation/service, real query-table schema refresh, saved workbook/ACE field discovery, or the updated 19 November Word template. Run the [focused desktop acceptance checklist](REMAINING_LAYOUTS.md#focused-desktop-word-acceptance--new-reporting-fields-pending). Verify blank means, zero means, numeric formatting, all long new lists, heading/order fidelity and full field binding on the actual clients. Record run IDs, Excel/Word versions and results locally. PR #3 remains open/draft for review and desktop acceptance. Automated checks do not replace the native checklist.
