# Remaining SIMS layouts

## Upgrade the verified pilot in place

Use the same school processor workbook and existing Word document/source. Back up the workbook in the school environment and close Word before changing the source. The repository contains portable source and synthetic tests; it does not contain the operational workbook or supplied Word template.

1. Keep `Paste_SIMS!A3`, `SIMS_Raw`, the `KS3_CurrentRun` name (`B2`), and the existing `KS3_Merge_Final` query, loaded table and worksheet. Do not delete/recreate the query or change its load destination. Keep the merge worksheet limited to the query's headers and current records; keep diagnostics elsewhere.
2. Replace the saved **Process Pupil Data**, **Reset** and **Help** script contents with the files in [office-scripts](../office-scripts). Associate the updated scripts with this workbook. Add **Upgrade Pilot** from [upgrade-pilot.ts](../office-scripts/upgrade-pilot.ts). Keep the Process, Reset and Help button associations. If the earlier draft installed a Select Subject script, remove its button and workbook association; the C2 dropdown replaces it.
3. Run **Upgrade Pilot** once. It invalidates the old run, adds hidden `KS3_Control` cells and four names, and installs a data-validation dropdown in `Paste_SIMS!C2` containing exactly `Auto`, `Biology`, `Physics` and `Chemistry`, initially `Auto`. It leaves the input table and paste in place. If the old output schema is still loaded, `D2` stays `NOT READY` until step 5; this avoids installing a formula referencing a column that does not yet exist.
4. Edit the **existing** query in Advanced Editor with [KS3_Merge_Final.pq](../power-query/KS3_Merge_Final.pq). Apply it and successfully refresh that query with the cleared run ID. Expect an empty result with the original columns plus `SelectionToken`. Keep its query, table and worksheet names exactly `KS3_Merge_Final`. Disable background refresh if available and leave Refresh on Open off, so the operator can observe completion.
5. Run **Upgrade Pilot** again. It installs the readiness formula in `D2` after the new `SelectionToken` column exists. It sets calculation to **Automatic**, which is needed for selection changes to update readiness immediately. Repeating the script is safe and invalidates any current run. Save the workbook; run the desktop checklist below before using this upgrade for live reports.

If the earlier remaining-layout draft is already installed and the output has `SelectionToken`, replace the scripts and run Upgrade Pilot once to install the dropdown and readiness formula. It resets the choice to Auto and invalidates the current run. The query text is unchanged by this dropdown update.

For a new workbook only: run [Setup Pilot](../office-scripts/setup-pilot.ts), create/load `KS3_Merge_Final` with the current M source (initial run ID is blank), then run Upgrade Pilot to install readiness. Do not run Setup Pilot over the existing school pilot.

## Operator sequence

For a different export, **Reset**, paste its entire grid including headings at **A3**, then **Process Pupil Data → refresh only KS3_Merge_Final → review → save → Word**. Reset or completely clear the old paste rectangle before replacing a large export with a smaller one; pasting over just part of the old grid leaves old pupils in the input. Process resizes the same staging table and clears old staging rows and columns.

Choose `Auto`, `Biology`, `Physics` or `Chemistry` directly from the data-validation dropdown in **Paste_SIMS!C2**. Changing C2 leaves the staged data and run ID intact. While C2 differs from the staged choice, `D2` shows **PROCESS REQUIRED** and rejects the existing output. If you return to the original choice without processing or resetting, its existing valid output can show **READY TO REVIEW** again: the staged run and matching loaded records are unchanged. Reselecting the current choice also preserves readiness.

**Process Pupil Data** reads C2 and clears the previous run ID before reading, validating or writing staged data. It creates a new ID only after successful staging. After any new Process or Reset, switching back in C2 cannot revive output from the older run; a failed Process also leaves the run invalid. Invalid or blank C2 values pasted over validation are rejected by Process.

All single-subject layouts resolve year and subject from their current-year term headers, regardless of the last Science choice; `Auto` is the usual setting. For **Year 9 Science**, paste once, choose **Biology in C2**, Process, refresh, check Biology and its counts, save and complete the Word merge. Close Word, choose **Physics in C2**, Process and refresh the same paste, review/save/merge; repeat for **Chemistry**. Do not Reset between those three runs. A different choice rejects the current output until you process/refresh that choice or return to the unchanged staged choice. Each successful Process creates a new run ID and captures the choice, resolved year and subject. After editing the paste, always Process before using the output.

`D2` must show **READY TO REVIEW: Year … subject / … class(es)**. Every loaded row must have the current `RunID`, `SelectionToken`, `Subject` and `Year_Group`. Check `Subject_Class` and the selected subject's `Autumn_*`, `Spring_*` and `Summer_*` counts together. `CHECK INVALID MARKS` blocks readiness: correct the input and Process again. Review `Rows_Without_Class`, unknown profile flags and the class count before saving.

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

A missing required term, more than one matching column, or headers identifying more than one layout stops processing. The query independently checks bindings and staged selection. Teaching `Class` drives grouping, including DT; `Reg Group` is not used. No cross-subject joins or deduplication by name are introduced. Original exam and prior-attainment columns remain distinct in `SIMS_Raw` and do not enter term metrics.

The newly supplied rows omit `Sex`; Art also omits `Looked After`. Those historical layouts still process: sex is unclassified and missing LAC is unavailable. Blank values in a **present** LAC column mean No. The confirmed refreshed SIMS marksheets should include Sex and Art's Looked After before live profile reporting; validate them locally. The automated Art variant appends those two headers with synthetic values to check the refreshed shape. Unknown PP stays unknown.

## Word fields and pending decisions

Keep the same seven fields: `Subject_Class`, `SEND_K_List`, `EHCP_List`, `Boys_List`, `Girls_List`, `PP_List`, `LAC_List`. All six name lists use the existing sorted `#(lf)` helper: one pupil per line, with distinct pupils sharing a name retained. Keep the supplied Word headings unchanged and teacher entry manual. Connect the saved workbook's existing `KS3_Merge_Final` source; do not add a values-only merge sheet or diagnostic rows.

Power Query in Excel calculates each term's `Assessed`, `Invalid` and `Q1`–`Q5` counts from that subject's valid integer quintiles 1–5. Blanks are unassessed; trimmed text `1`–`5` is valid. These metrics remain available for Excel review. Leave Word percentage bands, averages and top quintile lists unbound pending the deputy's definitions. No average or band mapping is added.

## Short desktop acceptance checklist — still to run for this upgrade

Record Excel/Word versions, pass/fail and run IDs locally. The prior English pilot's desktop acceptance does not certify these new bindings.

- [ ] Upgrade the existing workbook as above; check its table/query/source names and shared script/button permissions. Confirm calculation is Automatic. Run each of the eight fixtures in [tests](../tests), with the single Science paste processed as Biology, Physics and Chemistry. Compare class rosters, selected subject and all term counts with [TEST_EVIDENCE.md](TEST_EVIDENCE.md). Check DT uses teaching/rotation classes, not registration groups.
- [ ] Check C2 offers exactly Auto, Biology, Physics and Chemistry, with a Stop alert for other typed values. From a ready Biology run, change C2 to Physics: readiness must immediately show PROCESS REQUIRED. Return to Biology without processing: its unchanged valid output must be ready again with the same run ID. Choose Physics and Process: expect a new ID and REFRESH REQUIRED; switching back to Biology must now reject the old output. Refresh Physics, then process/refresh Chemistry and verify their different marks, not only the subject label.
- [ ] On a copy of the synthetic input, remove a required term column, add a second English Spring alias, and use an invalid mark `6`. Expect clear validation/invalid-mark feedback and no ready output. After a valid run, Process again and cancel/fail refresh; old records may remain visible but must not be ready. Correct, Process and refresh successfully.
- [ ] Run the wide Science export, then the 32-pupil English fixture, then the two-class fixture and a class-B-only paste (Reset before each replacement). Expect exactly the current classes; no old columns, pupils or recipients. Reset, refresh and save: no previous Word recipients. Also verify the Year 7 Science Summer term counts with its separate end-of-year exam present.
- [ ] Save/close Excel and explicitly reconnect desktop Word to the same saved workbook and `KS3_Merge_Final`. Compare recipient count and all seven fields. Merge the 32-pupil fixture and at least two classes: every name must be complete, sorted and start on its own line, with no class leakage, `0` substitutions, clipped or missing names. Long names may wrap and reports may span pages. Preserve template headings and leave bands/averages blank.
- [ ] Verify refreshed SIMS Sex/Looked After headers and reconcile one populated live export locally before issuing live reports. Time Process and refresh on the widest approximately 200-pupil export (initial targets 10s / 20s). Record timings and remaining limitations.
