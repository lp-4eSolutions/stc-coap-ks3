# Remaining SIMS layouts

## Upgrade the verified pilot in place

Use the same school processor workbook and existing Word document/source. Back up the workbook in the school environment and close Word before changing the source. The repository contains portable source and synthetic tests; it does not contain the operational workbook or supplied Word template.

1. Keep `Paste_SIMS!A3`, `SIMS_Raw`, the `KS3_CurrentRun` name (`B2`), C2 dropdown, and the existing `KS3_Merge_Final` query, loaded table and worksheet. Do not delete/recreate the query or change its load destination. Keep the merge worksheet limited to the query's headers and current records; keep diagnostics elsewhere.
2. Replace the saved **Process Pupil Data**, **Reset** and **Help** script contents with the files in [office-scripts](../office-scripts). Associate the updated scripts with this workbook. Add **Upgrade Pilot** from [upgrade-pilot.ts](../office-scripts/upgrade-pilot.ts). Keep the Process, Reset and Help button associations. If the earlier draft installed a Select Subject script, remove its button and workbook association; the C2 dropdown replaces it.
3. Run **Upgrade Pilot** once. It invalidates the old run, adds hidden `KS3_Control` cells and four names, and installs a data-validation dropdown in `Paste_SIMS!C2` containing exactly `Auto`, `Biology`, `Physics` and `Chemistry`, initially `Auto`. It leaves the input table and paste in place. For either the original pilot or the earlier remaining-layout draft, `D2` stays `NOT READY` until step 5. The new formula requires the percentage reporting schema; `SelectionToken` alone is insufficient.
4. Edit the **existing** query in Advanced Editor with [KS3_Merge_Final.pq](../power-query/KS3_Merge_Final.pq). Apply it and successfully refresh that query with the cleared run ID. Expect an empty result with the seven existing profile fields, the [new reporting fields](WORD_FIELDS.md), `Reporting_Version` and diagnostics. The old term `*_Q1`–`*_Q5` counts are retired, not repurposed as bands. Keep its query, table and worksheet names exactly `KS3_Merge_Final`. Disable background refresh if available and leave Refresh on Open off, so the operator can observe completion.
5. Run **Upgrade Pilot** again. It installs the readiness formula in `D2` after the new `Reporting_Version` and `Prior_Attainment_Invalid` columns exist. It sets calculation to **Automatic**, which is needed for selection changes to update readiness immediately. Repeating the script is safe and invalidates any current run. Save the workbook; run the desktop checklist below before using this upgrade for live reports.

The 19 November reporting change requires the query replacement and both Upgrade passes above even if C2 was already installed. The first pass clears the old run; the blank refresh publishes the new schema; the second pass installs a formula that also checks `Reporting_Version="Percent-2026-11-19"`. This prevents old 1–5 term outputs from being accepted. Keep the existing query's load destination and table; do not add a second Word source. No school workbook or Word template is committed here.

For a new workbook only: run [Setup Pilot](../office-scripts/setup-pilot.ts), create/load `KS3_Merge_Final` with the current M source (initial run ID is blank), then run Upgrade Pilot to install readiness. Do not run Setup Pilot over the existing school pilot.

## Operator sequence

For a different export, **Reset**, paste its entire grid including headings at **A3**, then **Process Pupil Data → refresh only KS3_Merge_Final → review → save → Word**. Reset or completely clear the old paste rectangle before replacing a large export with a smaller one; pasting over just part of the old grid leaves old pupils in the input. Process resizes the same staging table and clears old staging rows and columns.

Choose `Auto`, `Biology`, `Physics` or `Chemistry` directly from the data-validation dropdown in **Paste_SIMS!C2**. Changing C2 leaves the staged data and run ID intact. While C2 differs from the staged choice, `D2` shows **PROCESS REQUIRED** and rejects the existing output. If you return to the original choice without processing or resetting, its existing valid output can show **READY TO REVIEW** again: the staged run and matching loaded records are unchanged. Reselecting the current choice also preserves readiness.

**Process Pupil Data** reads C2 and clears the previous run ID before reading, validating or writing staged data. It creates a new ID only after successful staging. After any new Process or Reset, switching back in C2 cannot revive output from the older run; a failed Process also leaves the run invalid. Invalid or blank C2 values pasted over validation are rejected by Process.

All single-subject layouts resolve year and subject from their current-year term headers, regardless of the last Science choice; `Auto` is the usual setting. For **Year 9 Science**, paste once, choose **Biology in C2**, Process, refresh, check Biology and its lists/means, save and complete the Word merge. Close Word, choose **Physics in C2**, Process and refresh the same paste, review/save/merge; repeat for **Chemistry**. Do not Reset between those three runs. A different choice rejects the current output until you process/refresh that choice or return to the unchanged staged choice. Each successful Process creates a new run ID and captures the choice, resolved year and subject. After editing the paste, always Process before using the output.

`D2` must show **READY TO REVIEW: Year … subject / … class(es)**. Every loaded row must have the current `RunID`, `SelectionToken`, `Subject` and `Year_Group`. Check `Subject_Class`, all prior-attainment and percentage lists, class/year means and assessed/invalid diagnostics together. `Reporting_Version` must be `Percent-2026-11-19`. `CHECK INVALID MARKS` blocks readiness: correct the input and Process again. Review `Rows_Without_Class`, unknown profile flags and the class count before saving.

Always Process before a refresh attempt, including after corrections or when deliberately testing a failed/cancelled refresh. A failed/cancelled refresh may leave the previous table visible: its old run ID cannot satisfy the newly staged run. Complete a successful current refresh before merging. The formula cannot observe an arbitrary manual refresh of an already-ready run without Process. Readiness is an Excel operator check; Word cannot enforce it. After Reset, successfully refresh the blank run, save and reconnect Word if checking that no recipients remain.

## Header map and provenance

[config/layouts.json](../config/layouts.json) is the small alias map. [generate-bindings.mjs](../scripts/generate-bindings.mjs) embeds it in both the standalone Process script and M source (`npm run generate`); `npm test` rejects drift. Header matching ignores case, spaces, tabs and nonbreaking spaces. It preserves punctuation and duplicate suffixes such as `~2`, `~3` and `~4`. It does not guess from a subject prefix, column position, percentage sign, prior-year result or end-of-year exam.

Year 7 English bindings and the two retained English aliases come from the verified pilot. Years 7–8 Science bindings come from [SPEC.md](SPEC.md). Art, French, Maths, DT and Year 9 Science headers were supplied by the operator on 17 November 2026. The row initially labelled Year 9 Science contained TECH columns; it is mapped to DT. The later Science row contains BI, PH and CH. The fixture header rows preserve the supplied spacing and spellings; Years 7–8 Science fixtures project the documented headers into a compact synthetic export.

| Year / subject | Autumn | Spring | Summer |
| --- | --- | --- | --- |
| 7 English | `EN Attainment Y7 (%) Year 7 Autumn` | `EN Attainment Y7 (%)~2 Year 7 Spring` | `EN Attainment Y7 (%)Su Year 7 Summer` |
| 7 Art | `Art Attainment Yr7 (%) Year 7 Autumn` | `AR AttainmentY7 (%) Sp Year 7 Spring` | `AR Attainment Y7(%) Su Year 7 Summer` |
| 7 Science | `SC Exam Y7 (%) Au Year 7 Autumn` | `SC Exam Y7 (%) Sp Year 7 Spring` | `SC Exam Y7 (%) Su Year 7 Summer` |
| 8 French | `FR Attainment Y8 (%) Au Year 8 Autumn` | `FR Attainment Y8 (%) Sp Year 8 Spring` | `FR AttainmentY8 (%) Su Year 8 Summer` |
| 8 Maths | `MA Attainment Y8 (%)Au Year 8 Autumn` | `MA Attainment Y8(%)Sp Year 8 Spring` | `MA AttainmentY8 (%)Su Year 8 Summer` |
| 8 Science | `SC Exam Y8 (%)~2 Year 8 Autumn` | `SC Exam Y8 (%)~3 Year 8 Spring` | `SC Exam Y8 (%)~4 Year 8 Summer` |
| 9 DT | `TECH Attainment Y9 (%)~3 Year 9 Autumn` | `TECH Attainment Y9 (%)~2 Year 9 Spring` | `TECH Attainment Y9 (%) Year 9 Summer` |
| 9 Biology | `BI Attainment Y9 (%) Year 9 Autumn` | `BI Attainment Y9 (%) Sp Year 9 Spring` | `BI Attainment Y9 (%)~3 Year 9 Summer` |
| 9 Physics | `PH Attainment Y9 (%) Year 9 Autumn` | `PH Attainment Y9 (%) Sp Year 9 Spring` | `PH Attainment Y9 (%)~3 Year 9 Summer` |
| 9 Chemistry | `CH Attainment Y9 (%) Year 9 Autumn` | `CH Attainment Y9 (%) Sp Year 9 Spring` | `CH Attainment Y9 (%)~3 Year 9 Summer` |

A missing prior-attainment header, a missing required term, more than one matching column, or headers identifying more than one layout stops processing. The query independently checks bindings and staged selection. Teaching `Class` drives grouping, including DT; `Reg Group` is not used. No cross-subject joins or deduplication by name are introduced. Original exam and prior-attainment columns remain distinct in `SIMS_Raw` and do not enter term metrics.

The newly supplied rows omit `Sex`; Art also omits `Looked After`. Those historical layouts still process: sex is unclassified and missing LAC is unavailable. Blank values in a **present** LAC column mean No. The confirmed refreshed SIMS marksheets should include Sex and Art's Looked After before live profile reporting; validate them locally. The automated Art variant appends those two headers with synthetic values to check the refreshed shape. Unknown PP stays unknown.

## Reporting definitions and Word fields

The reporting definitions are confirmed in [SPEC.md](SPEC.md). [WORD_FIELDS.md](WORD_FIELDS.md) maps all 33 fields to the 19 November template: the seven existing profiles plus five prior-attainment lists, fifteen percentage-band lists and six means. Preserve the supplied template headings and descending percentage-band order. Keep the template in the school environment.

`Prior Attainment Quintile` (or `Prior Attainment Qiuntine`) is now required. Values 1–5 produce `Prior_Q1_List` through `Prior_Q5_List`, independently of term marks; Q1 is highest. Invalid quintiles are flagged and excluded; blanks are unclassified. The common sorted name helper still joins with a line feed and retains distinct pupils with the same name.

For each selected term, valid percentages are whole numbers 0–100, including trimmed numeric text such as `0.0`, ` 5 ` and `100.0`. Fractional, out-of-range and unexpected-text marks are invalid. Bands are inclusive: 81–100, 61–80, 41–60, 21–40, 0–20, in that order. A genuine zero enters the lowest band and both averages. Blank marks enter neither a band nor a mean. No score is inferred from prior attainment.

Class means use valid marks in that teaching class. Year means use all valid marks from named pupils in the supplied subject/year cohort, weighted by pupil, including named pupils with no class; those pupils enter no class record and trigger `Rows_Without_Class`. No valid marks means a null/blank average, not zero. Means retain full precision on the 0–100 scale; display rounding belongs to Word. Check that the supplied export is the intended cohort before issuing a year figure.

Readiness checks the new reporting version, run/selection/year/subject, term invalid counts (including invalid marks in cohort rows with no class) and prior-attainment invalid counts in class rows. Missing-class and unclassified profile/prior rows remain review diagnostics. Teacher, intervention and evaluation boxes remain manual.

## Focused desktop Word acceptance — new reporting fields pending

Earlier native profile/dropdown acceptance does not certify these new calculations. Record pass/fail, current run IDs and Excel/Word versions locally.

- [ ] Upgrade in place, successfully refresh and save. Confirm `Reporting_Version=Percent-2026-11-19`, current RunID/selection and exactly the current classes. Run all eight revised fixtures, including Biology/Physics/Chemistry on one paste; compare the full [saved reference results](../tests/expected-results.json) and [human expectations](TEST_EVIDENCE.md). Check Year 7 Science Summer with the separate exam present and DT teaching classes.
- [ ] Reconnect the **19 November** Word template to the same saved workbook/`KS3_Merge_Final`. Insert the 26 additions using [the manifest](WORD_FIELDS.md), keeping the seven existing fields and supplied headings. Check top Q1–Q5 are prior attainment and each term's columns run 100%–81% down to 20%–0% from left to right.
- [ ] Merge both classes from the English fixture: class A Autumn has ten assessed pupils, two names per band and **50.4%**; class B has three assessed and **4.0%**; both year cells show **39.7%** to one decimal (raw 516/13). Spring A's lists/mean are blank, Spring B's mean is **50.0%**, and the year mean is **50.0%**. Verify a Q1 pupil with mark 0 and a Q5 pupil with mark 100 against the independent prior lists. Null averages must stay blank in Word; genuine zero must display as zero.
- [ ] Merge the revised 32-pupil fixture: `Prior_Q1_List`, Autumn's highest band and Spring's lowest band must each show all 32 full names, sorted with one pupil starting per line, including the final name. Each is 1,407 characters including line feeds. Summer lists and means are blank; Autumn mean is 100 and Spring mean is 0. Check all existing profile lists too. Names may wrap and reports may span pages; no clipping, missing names, `0` substitutions in lists or class leakage is acceptable.
- [ ] Process [percentage-validation.tsv](../tests/percentage-validation.tsv): expect CHECK INVALID MARKS. Inspect diagnostics and means against the reference results but do not issue a report from that invalid run. Test missing/ambiguous prior/term headers, Reset and a failed refresh. Re-run valid data before merging. C2 away/back can recognise unchanged staged output; a new Process must require a new successful refresh.
- [ ] Repeat LONG → two classes → LONG → Reset, successfully refreshing/saving at each stage. Reconnect Word and verify exact current recipients, then none after Reset. Before live reporting, reconcile one populated SIMS export and intended cohort, confirm refreshed Sex/Art LAC columns, and record Process/refresh timings on the widest export.
