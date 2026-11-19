# KS3 Class on a Page release 1 specification

## Confirmed requirements

| Area | Requirement |
| --- | --- |
| Platform | A separate KS3 Excel workbook, Power Query, Office Scripts and desktop Word mail merge. |
| Operator screen | Follow the KS4 layout with the `Paste_SIMS` sheet, A3 paste point, Help, Process Pupil Data, Reset and clear status feedback. |
| Run scope | One year group and one subject per run. Produce one report record per teaching class for the selected subject. |
| Attainment | Prior attainment uses baseline quintile groups 1–5, with 1 highest. The term result columns feeding the percentage sections contain marks out of 100. Preserve the source headings and bind the correct subject, year and term. |
| Science, Years 7 and 8 | One Science report run per year group. Both supplied exports have one Science results column per term. |
| Science, Year 9 | One SIMS export contains Biology, Physics and Chemistry. Process that same export in three separate runs, one per subject, with its own term bindings and report records. |
| Sex and teacher | `Sex` has been added to all relevant SIMS marksheets. The class teacher completes the teacher field on the issued Word document. |
| LAC | A blank value in the `Looked After` column means No. The Art marksheet now includes `Looked After`. |
| Word layout | Use the updated template supplied on 19 November 2026. The five top named groups are prior-attainment quintiles. Each term's percentage bands run from high to low, left to right: `100% – 81%`, `80% – 61%`, `60% – 41%`, `40% – 21%`, `20% – 0%`. Confirm the band-cell contents and average definitions before binding those fields. |

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
- Validate prior-attainment quintiles as integers from 1 to 5. Validate term percentage marks on the 0–100 scale, including equivalent numeric text after trimming. A blank term mark is unassessed; a genuine zero is assessed. Flag out-of-range values or unexpected text for correction. Use the actual percentage for the selected subject and term when building the percentage bands, independently of prior-attainment quintile. Confirm decimal boundary handling before binding the band fields.
- Use the same-year term field. Keep the separate end-of-year exam and prior-year quintile available as distinct inputs where present. Their use in reporting depends on an agreed field definition.
- Use the pupil names supplied by SIMS for approved name lists. Use stable identifiers for duplicate diagnostics where available. Keep distinct pupils who share the same name and avoid joining different subjects' exports for release 1.
- Keep SEND K and EHCP distinct. Use the supplied `Sex` values for the Boys and Girls groups and surface blanks or unexpected values as unclassified. For LAC, treat a blank cell in a present `Looked After` column as No. If the column is missing, report LAC as unavailable. Handle blank or missing PP without a refresh error and preserve it as unknown until the PP convention is confirmed.
- Use a single publication row per teaching class in the current subject run. Keep the profile fields and term metrics separate so confirming a Word field changes only its mapping. Keep test evidence and public examples synthetic.

## Decisions to confirm during the pilot

| Decision | Working position |
| --- | --- |
| Five named quintile lists at the top | Confirmed source is Prior Attainment Quintile, including the observed Science spelling alias `Prior Attainment Qiuntine`. List pupils in baseline groups Q1–Q5, one pupil per line. |
| Percentage-band cells | Confirmed source is the corresponding term's percentage mark out of 100. Use the updated descending band order. Confirm whether each cell contains pupil names or pupil counts, and how decimal marks at band boundaries should be handled. |
| Class average and year average | Proposed definition is mean percentage for that term. Confirm before binding. Include valid zero marks and exclude unassessed blanks. Weight the year figure by pupil and confirm the intended subject cohort; a partial export cannot stand in for the full cohort. |
| Flag codes | Check the populated LAC codes and the PP flag convention against the standard SIMS export. |
| Intervention and evaluation boxes | Use teacher entry for the initial release unless there is an agreed automated field definition. |

The existing implementation and synthetic fixtures treat term results as quintiles 1–5. Revise their term calculations and expected results for the confirmed percentage inputs. Existing import, subject-selection, class-profile and Word-list checks remain relevant. Resolve the outstanding field definitions before binding and releasing the first live report.
