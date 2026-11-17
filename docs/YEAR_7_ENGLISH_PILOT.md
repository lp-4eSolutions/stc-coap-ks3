# Year 7 English pilot

This is the original pilot record. For the current source, use the [in-place upgrade and operating instructions](REMAINING_LAYOUTS.md), which supersede the original installation and readiness formula below. The fixture expectations and seven Word fields remain unchanged.

## Install in a blank school workbook

1. In desktop Excel, create and save a blank workbook for the synthetic pilot. In **Automate**, create an Office Script from [Setup Pilot](../office-scripts/setup-pilot.ts) and run it once. It creates the paste sheet, the input table and the run ID cell.
2. Create three more Office Scripts from [Process Pupil Data](../office-scripts/process-pupil-data.ts), [Reset](../office-scripts/reset.ts) and [Help](../office-scripts/help.ts). Associate them with the workbook and add their buttons to the top of `Paste_SIMS` if available on your school account. You can also run them from the Automate tab.
3. In **Data → Get Data → From Other Sources → Blank Query**, open Advanced Editor and paste [KS3_Merge_Final.pq](../power-query/KS3_Merge_Final.pq). Name the query `KS3_Merge_Final` and load it to a new worksheet as a table. Check the Excel table name in **Table Design** and set it to `KS3_Merge_Final` if needed. The first load should contain only headers.
4. Paste the following Excel formula into `Paste_SIMS!D2`. It compares the current staging ID with the loaded query records.

   ```excel
   =IF(B2="","NOT READY",IFERROR(IF(AND(COUNTIF(KS3_Merge_Final[RunID],B2)>0,COUNTIF(KS3_Merge_Final[RunID],B2)=ROWS(KS3_Merge_Final[RunID])),"READY TO REVIEW","REFRESH REQUIRED"),"REFRESH REQUIRED"))
   ```

## Run the pilot

1. Copy the full grid of the [synthetic export](../tests/year-7-english.tsv), including headings, into `Paste_SIMS!A3`. If the TSV opens as one column, open it in Excel as a tab-delimited file first. Run **Process Pupil Data** and look for **REFRESH REQUIRED**.
2. In **Queries & Connections**, refresh **KS3_Merge_Final** and wait for successful completion. Use **READY TO REVIEW** and compare the output against the expected results below. `Rows_Without_Class` is a run total repeated on each class row. Keep the merge worksheet limited to headers and current query records; put `LEN` formulas and other diagnostics on a separate worksheet.
3. Check that every output row's `RunID` matches `Paste_SIMS!B2`, then save and close the workbook. In desktop Word, open a local working copy of the supplied template. Under **Mailings → Select Recipients → Use an Existing List**, select the correct saved workbook and the `KS3_Merge_Final` worksheet/table. Check the recipient list before merging: it must contain exactly the current class records, with the complete name lists rather than `0`. Insert these fields into the corresponding blank cells while keeping the template headings as supplied.

   | Word cell | Field |
   | --- | --- |
   | Subject / class | `Subject_Class` |
   | SEND K | `SEND_K_List` |
   | EHCP | `EHCP_List` |
   | Boys | `Boys_List` |
   | Girls | `Girls_List` |
   | PP | `PP_List` |
   | LAC | `LAC_List` |

   The teacher, top quintile lists, percentage bands, averages and intervention/evaluation boxes can remain blank for this pilot.

4. In desktop Word, preview both records (`7SYN/A` and `7SYN/B`), then choose **Finish & Merge → Edit Individual Documents** for both. Check all six list fields against the expected results below: every name must appear in full, sorted, with one pupil per line inside the appropriate cell, including both Boys and Girls names in class A. Check that blank lists remain blank, no names cross between classes, and the supplied template headings are unchanged. Inspect both merged records at the intended paper size and record the page count. Multiple pages and rows continuing across pages are acceptable when all names remain visible; clipped or missing text is a failure. Close Word before resetting or changing the source. After a failed or cancelled refresh, complete a successful current refresh before merging.

## Expected results

SEND K, EHCP, Boys, Girls, PP and LAC all use the shared `NameList` helper. It sorts pupil names and joins them with a line feed (`#(lf)`), matching KS4. The line breaks shown in the table below mean one pupil per line in the merged Word cell.

| Check | 7SYN/A | 7SYN/B |
| --- | --- | --- |
| Pupil count | 5 | 2 |
| Autumn assessed | 4 | 2 |
| Autumn Q1–Q5 | 1, 2, 0, 0, 1 | 0, 0, 0, 2, 0 |
| Spring assessed | 0 | 2 |
| Summer Q1–Q5 | 0, 0, 1, 0, 1 | 0, 2, 0, 0, 0 |
| SEND K | Test Pupil 01 | Test Pupil 06 |
| EHCP | Test Pupil 02 | blank |
| Boys | Test Pupil 01<br>Test Pupil 04 | Test Pupil 07 |
| Girls | Test Pupil 02<br>Test Pupil 03 | Test Pupil 06 |
| PP | Test Pupil 01 | Test Pupil 06 |
| LAC | Test Pupil 02 | blank |

Expect one row without a class, one unclassified sex and three unknown PP values in class A, and zero unknown LAC values for either class. Test Pupil 08 appears in neither record. The end-of-year exam values do not enter Summer counts.

## Word repeat check — run locally in desktop Office

The operator initially saw `0` for Boys, Girls and PP, then reported that all relevant fields merged correctly from the original KS3 workbook after removing the diagnostic row. Inspection of the supplied synthetic workbooks found identical saved name strings, including newlines, and equivalent cell types and wrapping. Both Word connections used ACE OLE DB 12.0 with `HDR=YES;IMEX=1`. The initial failure preceded the diagnostic row, so its original cause is unconfirmed. Retain the direct query output; a separate values-only merge sheet is not currently justified.

Run this sequence on the operator's machine. Code checks and file inspection do not verify desktop Excel refresh or Word's ACE reader.

| Stage | Source | Expected Word recipients |
| --- | --- | --- |
| 1 | [32-pupil fixture](../tests/year-7-english-32-pupils.tsv) | Exactly one: `7SYN/LONG`, 32 pupils |
| 2 | [Original two-class fixture](../tests/year-7-english.tsv) | Exactly two: `7SYN/A` (5 pupils), `7SYN/B` (2 pupils); no LONG record |
| 3 | 32-pupil fixture again | Exactly one: `7SYN/LONG`; no A or B records |
| 4 | Reset, then successfully refresh and save | No previous class records; a no-recipient message is acceptable |

For stages 1–3, close Word, run Reset, paste the fixture, Process, and successfully refresh the query. Verify **READY TO REVIEW**, the expected class count and a new `RunID` matching `Paste_SIMS!B2` on every output row. Save and close Excel, then explicitly reconnect Word to that saved workbook and the correct merge worksheet. In **Edit Recipient List**, check the exact recipients and full text of all six name lists before previewing and finishing the merge in the CoaP template. Every name must appear in full, sorted, starting on its own line; long names may wrap and reports may span multiple pages. Blank lists must stay blank. Check the final name in each list, not just the pupil count.

The long fixture expects 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP and 2 LAC names. Its Boys and Girls strings are 703 characters each and PP is 351, including line feeds. If using Excel `LEN` to check these values, place those formulas on a separate diagnostics worksheet.

Reset clears input and invalidates the run ID; it does not immediately remove previously loaded query rows. Stage 4 therefore requires a successful refresh with the cleared run ID, followed by saving and reconnecting Word. After any failed or cancelled Process/refresh, do not merge the old output. The readiness formula is an operator check, not a restriction enforced by Word.

Record pass/fail for each stage, the run IDs and Excel/Word versions locally. The repeat sequence remains pending until the operator completes it. If `0` or truncated names recur, stop at that stage and retain the synthetic saved workbook and its Word source details for comparison before changing the query or adding another merge source.

## Follow-up checks

- For a longer-list desktop Word check, reset the pilot and paste the [32-pupil synthetic export](../tests/year-7-english-32-pupils.tsv) at `Paste_SIMS!A3`. Expect one class (`7SYN/LONG`) and 32 pupils. The six lists should contain 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP and 2 LAC names. The input runs from Test Pupil 32 to 01, so check that the output lists are in ascending order. Process, refresh, review and save, then preview and finish the merge in desktop Word at the intended paper size. Compare every full name with the source in all six list cells, one pupil per line, including the final name in each list. Multiple pages are acceptable; no names may be clipped, truncated or missing. Record the page count and any layout issue; keep the merge field names and supplied template headings unchanged.
- Reset after a successful refresh. Check **NOT READY**, refresh to empty the query output, then stage only class B and verify that a new refresh returns one record.
- Trigger a failed run by removing the Autumn heading and its whole column. The query should show a missing Autumn column message, and the previous run must not show as ready.
- Change one valid mark to 6. The affected term's invalid count should increase by one and its assessed count should decrease by one. Remove the whole LAC column and verify the output reports **Unavailable**.
- Record the Excel/Word versions and whether the merge succeeded. These steps are the native acceptance check for the pilot.
