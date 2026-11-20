# Word fields — supplied 19 November 2026 template

Use the school's updated Word template and the saved workbook's existing `KS3_Merge_Final` source. This manifest maps the confirmed headings/positions in [SPEC.md](SPEC.md); it does not reproduce or store the school template. Preserve its labels, ordering and layout. Insert fields in the corresponding existing cells. Verify the actual document locally before release.

| Existing profile cell | Existing field (unchanged) |
| --- | --- |
| Subject / class | `Subject_Class` |
| SEND K | `SEND_K_List` |
| EHCP | `EHCP_List` |
| Boys | `Boys_List` |
| Girls | `Girls_List` |
| PP | `PP_List` |
| LAC | `LAC_List` |

Top prior-attainment cells, Q1 to Q5 (Q1 highest):

| Q1 | Q2 | Q3 | Q4 | Q5 |
| --- | --- | --- | --- | --- |
| `Prior_Q1_List` | `Prior_Q2_List` | `Prior_Q3_List` | `Prior_Q4_List` | `Prior_Q5_List` |

Percentage-band cells, **left to right in the supplied descending order**:

| Term | 100% – 81% | 80% – 61% | 60% – 41% | 40% – 21% | 20% – 0% |
| --- | --- | --- | --- | --- | --- |
| Autumn | `Autumn_Band_81_100_List` | `Autumn_Band_61_80_List` | `Autumn_Band_41_60_List` | `Autumn_Band_21_40_List` | `Autumn_Band_0_20_List` |
| Spring | `Spring_Band_81_100_List` | `Spring_Band_61_80_List` | `Spring_Band_41_60_List` | `Spring_Band_21_40_List` | `Spring_Band_0_20_List` |
| Summer | `Summer_Band_81_100_List` | `Summer_Band_61_80_List` | `Summer_Band_41_60_List` | `Summer_Band_21_40_List` | `Summer_Band_0_20_List` |

| Term | Class average cell | Year average cell |
| --- | --- | --- |
| Autumn | `Autumn_Class_Average` | `Autumn_Year_Average` |
| Spring | `Spring_Class_Average` | `Spring_Year_Average` |
| Summer | `Summer_Class_Average` | `Summer_Year_Average` |

All 20 new name lists are sorted and joined with a line feed: one pupil starts on each line. Long names can wrap. Distinct pupils with the same name are retained. An empty list is empty text. Prior lists use only baseline `Prior Attainment Quintile` or its Science spelling alias `Prior Attainment Qiuntine`; the fifteen term lists use actual term percentages independently. Do not bind a term band to a prior list or to a count diagnostic.

The six means are numeric percentage points on a 0–100 scale, with full calculation precision; for example **50.4** means **50.4%**, not 0.504. Display all six class/year averages with **exactly two decimal places and a percent sign**, as confirmed on 20 November 2026. Use Word numeric picture `\# "0.00%"`, for example `{ MERGEFIELD Autumn_Class_Average \# "0.00%" }`. This formats 50.4 as **50.40%**, 4 as **4.00%**, and 516/13 as **39.69%**, while retaining full calculation precision in Excel. Edit the existing Word field code rather than typing replacement field braces; retain any existing `\* MERGEFORMAT` switch. Word's numeric picture includes `%` as a display character; see [Microsoft field-format guidance](https://support.microsoft.com/en-us/word/format-field-results). Do not scale the number again or apply Excel's ordinary percentage format. Keep the percent sign inside the numeric picture, rather than as standalone text after the field. Null means are blank Excel cells and must remain completely blank in Word. A genuine zero must display as **0.00%**. Native English acceptance on 20 November 2026 confirmed nonzero two-decimal formatting, blank means without stray percent signs, and genuine **0.00%** means in the completed normal/32-pupil merges; see [TEST_EVIDENCE.md](TEST_EVIDENCE.md). Remaining layout and operational acceptance is still pending.

A year mean uses all valid marks from named pupils in the supplied subject/year export, weighted by pupil, including a named pupil whose teaching class is missing. Such a pupil enters no class record/list and is exposed by `Rows_Without_Class`; reconcile that roster warning. A partial export's year mean represents that supplied cohort, not an assumed whole year. Invalid and unassessed marks do not enter means or bands.

The [machine manifest](../config/word-fields.json) records the same 33 fields, including 26 additions. Keep diagnostics (`*_Assessed`, `*_Invalid`, `*_Year_Assessed`, `*_Year_Invalid`, band counts, prior diagnostics, `Reporting_Version`) for Excel review. The old term `*_Q1`–`*_Q5` counts are retired; they are not percentage-band fields. Teacher, intervention and evaluation boxes remain manual.
