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
3. Save the workbook. In desktop Word, open a local working copy of the supplied template. Under **Mailings → Select Recipients → Use an Existing List**, select the saved workbook and the `KS3_Merge_Final` worksheet/table. Insert these fields into the corresponding blank cells while keeping the template headings as supplied.

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

4. In desktop Word, preview both records (`7SYN/A` and `7SYN/B`), then choose **Finish & Merge → Edit Individual Documents** for both. Check all six list fields against the expected results below: names must be sorted, with one pupil per line inside the appropriate cell, including both Boys and Girls names in class A. Check that blank lists remain blank, no names cross between classes, and the supplied template headings are unchanged. Inspect both merged records at the intended paper size and record the page count, any clipped names, split rows or page overflow. Close Word before resetting or changing the source. After a failed or cancelled refresh, complete a successful current refresh before merging.

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

## Follow-up checks

- For a longer-list desktop Word check, extend a local copy of the synthetic export to a 32-pupil class with long names and multiple pupils in each of SEND K, EHCP, Boys, Girls, PP and LAC. Keep the source names out of order so the sorted output can be checked. Process, refresh, review and save, then preview and merge in desktop Word at the intended paper size. Confirm one pupil per line in all six list cells and check that the report fits on one page with no clipped names, split rows or page overflow. Record the page count and any overflow or layout issue for correction before release; keep the merge field names and supplied template headings unchanged.
- Reset after a successful refresh. Check **NOT READY**, refresh to empty the query output, then stage only class B and verify that a new refresh returns one record.
- Trigger a failed run by removing the Autumn heading and its whole column. The query should show a missing Autumn column message, and the previous run must not show as ready.
- Change one valid mark to 6. The affected term's invalid count should increase by one and its assessed count should decrease by one. Remove the whole LAC column and verify the output reports **Unavailable**.
- Record the Excel/Word versions and whether the merge succeeded. These steps are the native acceptance check for the pilot.
