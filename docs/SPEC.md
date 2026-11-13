# KS3 Class on a Page release 1 specification

## Confirmed requirements

| Area | Requirement |
| --- | --- |
| Platform | A separate KS3 Excel workbook, Power Query, Office Scripts and desktop Word mail merge. |
| Operator screen | Follow the KS4 layout with the `Paste_SIMS` sheet, A3 paste point, Help, Process Pupil Data, Reset and clear status feedback. |
| Run scope | One year group and one subject per run. Produce one report record per teaching class for the selected subject. |
| Attainment | Current-year Autumn, Spring and Summer results are quintiles from 1 to 5, with 1 highest. Several current SIMS headings mention percentages or exams. Preserve the source headings and bind them to the correct term. |
| Science, Years 7 and 8 | One Science report run per year group. The Year 8 export shows one Science results column per term. Check the exact Year 7 aliases when its export is available. |
| Science, Year 9 | One SIMS export contains Biology, Physics and Chemistry. Process that same export in three separate runs, one per subject, with its own term bindings and report records. |
| Sex and teacher | The standard SIMS marksheets will include `Sex`. The class teacher completes the teacher field on the issued Word document. |
| LAC | Add the LAC column to the Art marksheet. The meaning of a blank LAC value awaits confirmation. |
| Word layout | Use the supplied template. Preserve its headings, including the percentage-band labels. Agree what the band and average cells represent before binding them to live merge fields. |

## Workbook design

1. Paste a single SIMS marksheet with headers into `Paste_SIMS!A3`. Select the subject explicitly for Year 9 Science. The status banner identifies the current action and selected run.
2. **Process Pupil Data** stages the input in the existing `SIMS_Raw` table. Read the populated paste rectangle in bulk, resize the table in place, write once and clear the old footprint as needed. Keep the paste available for correction if staging fails. **Reset** clears staged input, invalidates the run and returns the screen to its initial state. **Help** explains the next steps.
3. Refresh the single loaded `KS3_Merge_Final` query. Power Query resolves the year, subject and term bindings from a small alias map, projects the required columns, and groups valid rows by teaching `Class`. Connection-only helpers can support the final query. Use class codes from the teaching-class field, including for rotation subjects. Where a row has pupil data and a missing class, show a review warning with the count.
4. Check the run ID, selected subject, class count and status before opening Word. Carry the current run ID and selection into the query result so a previous result can be recognised after a failed or cancelled refresh. Reset, a new run and a changed selection invalidate readiness for the previous result. Keep the single selected-query refresh as the initial operator workflow. Validate this workflow on the operator's Excel client.
5. Save the current verified source and merge in desktop Word. Use a short, fixed field list and verify the connection and field order with the real template on the operator's machine.

## Input and output behaviour

- Resolve Year 9 Science marks by selected subject and term. A missing or ambiguous required header produces a clear validation message and prevents a ready output. Header aliases cover observed spacing, spelling and duplicate suffix variations.
- A valid mark is an integer from 1 to 5, including the equivalent text form after trimming. A blank is unassessed. Flag out-of-range values or unexpected text for correction. Count only valid marks in the relevant class, subject and term. Keep the assessed count alongside the five counts so a genuinely unassessed term can be recognised.
- Use the same-year term field. Keep the separate end-of-year exam and prior-year quintile available as distinct inputs where present. Their use in reporting depends on an agreed field definition.
- Use the pupil names supplied by SIMS for approved name lists. Use stable identifiers for duplicate diagnostics where available. Keep distinct pupils who share the same name and avoid joining different subjects' exports for release 1.
- Keep SEND K and EHCP distinct. Use the supplied `Sex` values for the Boys and Girls groups and surface blanks or unexpected values as unclassified. Handle a missing or blank PP/LAC value without a refresh error. Until the SIMS flag convention is confirmed, distinguish an unknown value from a confirmed negative.
- Use a single publication row per teaching class in the current subject run. Keep the profile fields and term metrics separate so confirming a Word field changes only its mapping. Keep test evidence and public examples synthetic.

## Decisions to confirm during the pilot

| Decision | Working position |
| --- | --- |
| Five named quintile lists at the top | Candidate source is Prior Attainment Quintile. Confirm before binding those fields. |
| Percentage-band cells | Ask what the original labels are intended to describe and what goes in each cell. Calculate Q1–Q5 counts in Excel for verification. Leave these Word cells unbound until the intended mapping is confirmed. |
| Class average and year average | Confirm what they should measure with quintile inputs. If a mean quintile is wanted, use valid pupil results and weight the year figure by pupil, with the intended subject cohort confirmed. A partial export cannot stand in for the full cohort. |
| LAC and PP flags | Verify the meaning of blank and the explicit positive/negative codes using the standard export. |
| Intervention and evaluation boxes | Use teacher entry for the initial release unless there is an agreed automated field definition. |

These decisions allow development of the import, validation, class profile, internal quintile counts and initial Word pilot with confirmed fields. Resolve any fields required for the first live report before binding and releasing that report.
