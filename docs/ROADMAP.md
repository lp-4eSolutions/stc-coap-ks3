# One-week build and acceptance plan

## Build sequence

| Day | Deliverable | Check |
| --- | --- | --- |
| 1 | Get a synthetic Year 7 English run from A3 through Power Query into desktop Word. Reuse the KS4 screen layout and table-handling pattern. Start with confirmed Word fields. | Two different teaching classes appear as two correctly isolated merge records. Review the supplied Word layout at the intended paper size. |
| 2 | Add all observed export layouts, including Year 8 Science and the three Year 9 Science runs. | Run the seven supplied layouts and check each class roster. Run Biology, Physics and Chemistry on a single synthetic Year 9 file with different marks for each. Check the Year 7 Science aliases when a sample is available. |
| 3 | Complete Process, Reset, Help, readiness and validation. Bind agreed Word fields and record their names in a compact manifest. | Retry after a bad header, reset after a populated run and process a narrower/smaller paste after a larger one. Old records cannot be mistaken for the current run. |
| 4 | Operator trial on the school's actual Excel and desktop Word setup. | Verify shared buttons and refresh permissions, hand-check a populated run when real term marks are available, time the run and inspect the longest report page. Use a populated synthetic run if marks have yet to be entered. |
| 5 | Fix trial findings and hand over the workbook, Word template and one-page operating instructions. | Repeat paste → process → refresh → save → merge on the release copy. Record the client, timings, test data type and any remaining operational limitations. |

## Acceptance checks

- **Header binding.** Test changed column order, the known term-header variants and one genuinely missing or ambiguous required header. For Year 9 Science, give the three subjects different marks and verify that every run changes the subject and results together. For DT, verify the intended teaching and rotation groups using the operator's report.
- **Quintile results.** For a synthetic class with marks 1, 2, 2, 5 and blank, expect four assessed pupils and Q1–Q5 counts of 1, 2, 0, 0, 1. Add a class with every result blank and a case with an invalid value such as 6. Include a valid quintile stored as text. Check that optional blank flags and blank-class diagnostics survive refresh.
- **Run isolation.** Follow a large valid run with a smaller one, change the Science subject, reset, and cancel or fail a refresh after a successful one. Verify that the operator sees when a new source is staged and when its merge rows are current.
- **Desktop Word.** Compare the record count with the Excel class count. Check all mapped fields, the supplied labels and the manual teacher field. Merge a 32-pupil synthetic class with long names and check that its report fits on one page on the intended paper size. Check for empty or split pages when merging multiple records.
- **Performance.** Initial targets are 10 seconds for Process and 20 seconds for refresh for a roughly 200-pupil export. Time the two steps separately on the widest layout in the operator's Excel client, including a first run and repeated runs. Record observed times and diagnose the slower step if targets are missed.
- **Live source check.** When SIMS has term data, reconcile one export against the marksheet by hand. If the tool is installed before data entry, record the live result check as pending and do it before issuing the first reports based on live term marks.

## Delivery order

1. Review this documentation PR and develop the first end-to-end workbook slice.
2. Add the remaining bindings and regression fixtures in a focused implementation PR. Keep Power Query and script text in Git and install the reviewed version into the school workbook.
3. Complete the Word field manifest and record native Office acceptance before releasing the operational files.
