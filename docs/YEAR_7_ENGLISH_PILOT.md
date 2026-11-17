# Year 7 English pilot

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
2. In **Queries & Connections**, refresh **KS3_Merge_Final** and wait for successful completion. Use **READY TO REVIEW** and compare the output against the expected results below. `Rows_Without_Class` is a run total repeated on each class row.
3. Save the workbook. In desktop Word, open a local working copy of the supplied template. Under **Mailings → Select Recipients → Use an Existing List**, select the saved workbook and the `KS3_Merge_Final` worksheet/table. This direct query source remains provisional until the Word data-source diagnosis below is complete. Insert these fields into the corresponding blank cells while keeping the template headings as supplied.

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

## Word data-source diagnosis — desktop test pending

The operator reports that the original `KS3_Merge_Final` source returned `0` for Boys, Girls and PP even in a plain Word merge. The same headers and `7SYN/LONG` values pasted into a new `.xlsx` merged correctly in both a plain document and the KS3 CoaP template. This does not yet establish whether the difference is the query output, the workbook or Word's connection. No merge-source fix has been selected or verified.

1. Work on a local copy of the existing KS3 workbook. From the successful control `.xlsx`, copy the exact headers and complete `7SYN/LONG` row into `A1` on a new worksheet named `KS3_Word_Probe` **inside that KS3 workbook**, using **Paste Special → Values**. Keep column order, field names and embedded line feeds unchanged. Check the copied cell contents against the control, then save and close both workbooks. The probe is a diagnostic snapshot, not an operational merge source.
2. In desktop Word, explicitly reconnect a working copy of the plain merge document to the KS3 workbook's `KS3_Word_Probe` sheet. Use the same connection method and merge fields as for the successful control. Preview and finish the merge, comparing the complete text of all six name lists with the control. Repeat in a working copy of the CoaP template, preserving its headings. Record the actual source file and selected sheet/range for each test.
3. If that sheet reads correctly, reconnect to the original query output in the same workbook using the same connection method. Explicitly check the selected sheet/table/range rather than reusing a cached connection. If the query output can pass the fixture checks below directly, retain it. If it still fails while the values-only sheet passes, a dedicated values-only merge sheet is a candidate, subject to implementation and the freshness checks below.
4. If the probe also fails inside the KS3 workbook, compare Word's connections to the failing KS3 file and the successful control **before proposing a fix**. Record Excel/Word versions and bitness, exact saved file paths and file types, provider/connection method (for example OLE DB, ODBC or DDE), connection string, selected sheet/table/named range, SQL command and recipient filters. Check that both tests read the saved files and intended rows. Change one evidenced difference at a time and repeat the plain-document test before testing the template. Keep operational paths and connection details in the school's test notes.

Whichever source is chosen must pass both the [32-pupil fixture](../tests/year-7-english-32-pupils.tsv) and the [original two-class fixture](../tests/year-7-english.tsv) through Process → refresh → save → desktop Word. Check both preview and finished documents in the plain merge and the CoaP template. Compare every name in all six lists with the source, including the full last name in the longest list; counts alone do not prove that text was not truncated. For the long fixture, Excel `LEN` should report 703 characters for each of `Boys_List` and `Girls_List`, and 351 for `PP_List`, including line feeds. Expect one `7SYN/LONG` record, then two isolated records (`7SYN/A` and `7SYN/B`). Every name must appear in full, sorted, one pupil per line. Multiple pages are acceptable.

If a separate values-only merge sheet is needed, acceptance also requires these safeguards:

- Publish only after a successful query refresh, with a nonblank `RunID` matching `KS3_CurrentRun` on every source row and the expected current class count. Copy all fields and their full text; preserve the existing merge field names.
- Process and Reset must invalidate and clear the published rows before changing the source. Failed processing, failed/cancelled refresh, or failed publication must leave no merge-ready snapshot. Rebuilding a smaller run must remove surplus old rows. A readiness banner alone cannot stop Word from reading stale saved values.
- Save invalidation and successful publication to disk, and close/reconnect Word between runs so it reads the current saved source. Test the sequence LONG → two classes → class B only, plus Reset and each failure path. After invalidation, verify that Word cannot merge the previous run. After successful publication, verify the saved merge rows' run ID and exact current records. Keep this approach pending until those checks pass in desktop Office.

## Follow-up checks

- For a longer-list desktop Word check, reset the pilot and paste the [32-pupil synthetic export](../tests/year-7-english-32-pupils.tsv) at `Paste_SIMS!A3`. Expect one class (`7SYN/LONG`) and 32 pupils. The six lists should contain 4 SEND K, 4 EHCP, 16 Boys, 16 Girls, 8 PP and 2 LAC names. The input runs from Test Pupil 32 to 01, so check that the output lists are in ascending order. Process, refresh, review and save, then preview and finish the merge in desktop Word at the intended paper size. Compare every full name with the source in all six list cells, one pupil per line, including the final name in each list. Multiple pages are acceptable; no names may be clipped, truncated or missing. Record the page count and any layout issue; keep the merge field names and supplied template headings unchanged.
- Reset after a successful refresh. Check **NOT READY**, refresh to empty the query output, then stage only class B and verify that a new refresh returns one record.
- Trigger a failed run by removing the Autumn heading and its whole column. The query should show a missing Autumn column message, and the previous run must not show as ready.
- Change one valid mark to 6. The affected term's invalid count should increase by one and its assessed count should decrease by one. Remove the whole LAC column and verify the output reports **Unavailable**.
- Record the Excel/Word versions and whether the merge succeeded. These steps are the native acceptance check for the pilot.
