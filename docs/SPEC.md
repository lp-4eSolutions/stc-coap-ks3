# KS3 Class on a Page release 1 specification

## Confirmed requirements

| Area | Requirement |
| --- | --- |
| Platform | A separate KS3 Excel workbook, Power Query, Office Scripts and desktop Word mail merge. |
| Operator screen | Follow the KS4 layout with the `Paste_SIMS` sheet, A3 paste point, Help, Process Pupil Data, Reset and clear status feedback. |
| Run scope | One year group and one subject per run. Produce one report record per teaching class for the selected subject. |
| Attainment | Prior attainment uses baseline quintile groups 1–5, with 1 highest. The term result columns feeding the percentage sections contain whole-number marks from 0 to 100. Preserve the source headings and bind the correct subject, year and term. |
| Science, Years 7 and 8 | One Science report run per year group. Both supplied exports have one Science results column per term. |
| Science, Year 9 | One SIMS export contains Biology, Physics and Chemistry. Process that same export in three separate runs, one per subject, with its own term bindings and report records. |
| Sex and teacher | `Sex` has been added to all relevant SIMS marksheets. The class teacher completes the teacher field on the issued Word document. |
| LAC | A blank value in the `Looked After` column means No. The Art marksheet now includes `Looked After`. |
| Word layout | Use the updated template supplied on 19 November 2026. The five top named groups are prior-attainment quintiles. Each term's percentage bands run from high to low, left to right: `100% – 81%`, `80% – 61%`, `60% – 41%`, `40% – 21%`, `20% – 0%`. Put sorted pupil names in each prior-attainment and percentage-band cell, one pupil per line. Class and year averages are mean percentage marks for the relevant term. |

### Science term headers

| Term | Year 7 | Year 8 |
| --- | --- | --- |
| Autumn | `SC Exam Y7 (%) Au Year 7 Autumn` | `SC Exam Y8 (%)~2 Year 8 Autumn` |
| Spring | `SC Exam Y7 (%) Sp Year 7 Spring` | `SC Exam Y8 (%)~3 Year 8 Spring` |
| Summer | `SC Exam Y7 (%) Su Year 7 Summer` | `SC Exam Y8 (%)~4 Year 8 Summer` |

Bind the Summer result to the term column. In Year 7, keep `SC End of Year Exam% Year 7 Summer`, `Prior Attainment Qiunti E Year 7 Summer` and `SC End of Year Quintile Year 7` distinct. The baseline quintile column in both exports is headed `Prior Attainment Qiuntine`.

## Workbook design

1. Paste a single SIMS marksheet with headers into `Paste_SIMS!A3`. Choose the subject in the `Paste_SIMS!C2` data-validation dropdown (`Auto`, `Biology`, `Physics`, `Chemistry`); Year 9 Science requires an explicit science choice. The status banner identifies the current action and selected run.
2. **Process Pupil Data** stages the input in the existing `SIMS_Raw` table. Read the populated paste rectangle in bulk, resize the table in place, write once and clear the old footprint as needed. Keep the paste available for correction if staging fails. **Reset** clears staged input, invalidates the run and returns the screen to its initial state. **Help** explains the next steps.
3. Refresh the single loaded `KS3_Merge_Final` query. Power Query resolves the year, subject and term bindings from a small alias map, projects the required columns, and groups valid rows by teaching `Class`. Connection-only helpers can support the final query. Use class codes from the teaching-class field, including for rotation subjects. Where a row has pupil data and a missing class, show a review warning with the count.
4. Check the run ID, selected subject, class count and status before opening Word. Carry the current run ID and selection into the query result so a previous result can be recognised after a failed or cancelled refresh. Reset and a new Process invalidate the previous run ID before staging. A C2 choice different from the staged selection rejects the current output; returning to the original choice can recognise its valid output when the staged data and run ID are unchanged. Keep the single selected-query refresh as the initial operator workflow. Validate this workflow on the operator's Excel client.
5. Save the current verified source and merge in desktop Word. Use a short, fixed field list and verify the connection and field order with the real template on the operator's machine.

## Input and output behaviour

- Resolve Year 9 Science marks by selected subject and term. A missing or ambiguous required header produces a clear validation message and prevents a ready output. Header aliases cover observed spacing, spelling and duplicate suffix variations.
- Validate prior-attainment quintiles as integers from 1 to 5. Validate term percentage marks as whole numbers from 0 to 100, including equivalent numeric text after trimming. A blank term mark is unassessed; a genuine zero is assessed. Flag out-of-range values or unexpected text for correction. Use the actual percentage for the selected subject and term when building the percentage bands, independently of prior-attainment quintile. Fractional marks and values outside 0–100 are invalid. The inclusive percentage bands are 81–100, 61–80, 41–60, 21–40 and 0–20, displayed in that order.
- Use the same-year term field. Keep the separate end-of-year exam and prior-year quintile available as distinct inputs where present. Their use in reporting depends on an agreed field definition.
- Use the pupil names supplied by SIMS for approved name lists. Use stable identifiers for duplicate diagnostics where available. Keep distinct pupils who share the same name and avoid joining different subjects' exports for release 1.
- Keep SEND K and EHCP distinct. Use the supplied `Sex` values for the Boys and Girls groups and surface blanks or unexpected values as unclassified. For LAC, treat a blank cell in a present `Looked After` column as No. If the column is missing, report LAC as unavailable. Handle blank or missing PP without a refresh error and preserve it as unknown until the PP convention is confirmed.
- Use a single publication row per teaching class in the current subject run. Produce five prior-attainment name lists and five percentage-band name lists for each term, with sorted names and one pupil per line. Preserve distinct pupils who share a name. Keep assessed/invalid diagnostics available and keep public test evidence synthetic.
- Calculate each class average from its valid percentage marks for that term. Calculate the year average across valid pupil marks in the supplied subject/year cohort, weighted by pupil. Include genuine zero marks and exclude unassessed blanks and invalid marks. Leave an average blank when there are no valid marks. The year figure represents the subject/year cohort supplied in the export; check that it is the intended cohort before live reporting.

## Field definitions and remaining pilot checks

| Area | Definition or remaining check |
| --- | --- |
| Five named quintile lists at the top | Confirmed source is Prior Attainment Quintile, including the observed Science spelling alias `Prior Attainment Qiuntine`. List pupils in baseline groups Q1–Q5, one pupil per line. |
| Percentage-band cells | Confirmed source is the corresponding term's whole-number percentage mark out of 100. Each cell contains sorted pupil names, one pupil per line. Use the updated descending band order and inclusive boundaries. |
| Class average and year average | Confirmed definition is mean percentage for that term, including valid zero marks and excluding unassessed blanks and invalid marks. Weight the year figure by pupil across the supplied subject/year cohort and check that the export covers the intended cohort before live reporting. |
| Flag codes | Check the populated LAC codes and the PP flag convention against the standard SIMS export. |
| Intervention and evaluation boxes | Use teacher entry for the initial release unless there is an agreed automated field definition. |

The reporting definitions above were confirmed on 19 November 2026. The existing implementation and synthetic fixtures still treat term results as quintiles 1–5; revise their calculations, name-list fields, averages and expected results for the confirmed percentage inputs. Existing import, subject-selection, class-profile and Word-list evidence covers those parts of the workflow. Complete native acceptance of the new percentage and prior-attainment fields before release.
