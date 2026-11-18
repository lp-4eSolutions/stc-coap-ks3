// Standalone Office Script. Generated aliases come from config/layouts.json.
type Binding = [string, boolean, string[]];
interface Layout { id: string; year: number; subjects: { subject: string; terms: string[][] }[] }
// BEGIN GENERATED BINDINGS
const profile: Binding[] = [
  [
    "Pupil",
    true,
    [
      "Surname Forename"
    ]
  ],
  [
    "Class",
    true,
    [
      "Class"
    ]
  ],
  [
    "SEN",
    false,
    [
      "SEN Status"
    ]
  ],
  [
    "Sex",
    false,
    [
      "Sex"
    ]
  ],
  [
    "PP",
    false,
    [
      "Pupil Premium Indicator"
    ]
  ],
  [
    "LAC",
    false,
    [
      "Looked After"
    ]
  ]
];
const layouts: Layout[] = [
  {
    "id": "year-7-art",
    "year": 7,
    "subjects": [
      {
        "subject": "Art",
        "terms": [
          [
            "Art Attainment Yr7 (%) Year 7 Autumn"
          ],
          [
            "AR AttainmentY7 (%) Sp Year 7 Spring"
          ],
          [
            "AR Attainment Y7(%) Su Year 7 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-7-english",
    "year": 7,
    "subjects": [
      {
        "subject": "English",
        "terms": [
          [
            "EN Attainment Y7 (%) Year 7 Autumn"
          ],
          [
            "EN Attainment Y7 (%)~2 Year 7 Spring",
            "EN Attainment Y7 (%) Year 7 Spring"
          ],
          [
            "EN Attainment Y7 (%)Su Year 7 Summer",
            "EN Attainment Y7 (%) Year 7 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-7-science",
    "year": 7,
    "subjects": [
      {
        "subject": "Science",
        "terms": [
          [
            "SC Exam Y7 (%) Au Year 7 Autumn"
          ],
          [
            "SC Exam Y7 (%) Sp Year 7 Spring"
          ],
          [
            "SC Exam Y7 (%) Su Year 7 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-8-french",
    "year": 8,
    "subjects": [
      {
        "subject": "French",
        "terms": [
          [
            "FR Attainment Y8 (%) Au Year 8 Autumn"
          ],
          [
            "FR Attainment Y8 (%) Sp Year 8 Spring"
          ],
          [
            "FR AttainmentY8 (%) Su Year 8 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-8-maths",
    "year": 8,
    "subjects": [
      {
        "subject": "Maths",
        "terms": [
          [
            "MA Attainment Y8 (%)Au Year 8 Autumn"
          ],
          [
            "MA Attainment Y8(%)Sp Year 8 Spring"
          ],
          [
            "MA AttainmentY8 (%)Su Year 8 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-8-science",
    "year": 8,
    "subjects": [
      {
        "subject": "Science",
        "terms": [
          [
            "SC Exam Y8 (%)~2 Year 8 Autumn"
          ],
          [
            "SC Exam Y8 (%)~3 Year 8 Spring"
          ],
          [
            "SC Exam Y8 (%)~4 Year 8 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-9-dt",
    "year": 9,
    "subjects": [
      {
        "subject": "DT",
        "terms": [
          [
            "TECH Attainment Y9 (%)~3 Year 9 Autumn"
          ],
          [
            "TECH Attainment Y9 (%)~2 Year 9 Spring"
          ],
          [
            "TECH Attainment Y9 (%) Year 9 Summer"
          ]
        ]
      }
    ]
  },
  {
    "id": "year-9-science",
    "year": 9,
    "subjects": [
      {
        "subject": "Biology",
        "terms": [
          [
            "BI Attainment Y9 (%) Year 9 Autumn"
          ],
          [
            "BI Attainment Y9 (%) Sp Year 9 Spring"
          ],
          [
            "BI Attainment Y9 (%)~3 Year 9 Summer"
          ]
        ]
      },
      {
        "subject": "Physics",
        "terms": [
          [
            "PH Attainment Y9 (%) Year 9 Autumn"
          ],
          [
            "PH Attainment Y9 (%) Sp Year 9 Spring"
          ],
          [
            "PH Attainment Y9 (%)~3 Year 9 Summer"
          ]
        ]
      },
      {
        "subject": "Chemistry",
        "terms": [
          [
            "CH Attainment Y9 (%) Year 9 Autumn"
          ],
          [
            "CH Attainment Y9 (%) Sp Year 9 Spring"
          ],
          [
            "CH Attainment Y9 (%)~3 Year 9 Summer"
          ]
        ]
      }
    ]
  }
];
// END GENERATED BINDINGS

function clean(value: string | number | boolean): string {
  return String(value).replace(/\u00a0/g, " ").trim();
}
function key(value: string): string {
  return clean(value).toUpperCase().replace(/[ \t]/g, "");
}
function resolveRun(headers: string[], selection: string): { year: number; subject: string } {
  const keys = headers.map(header => key(header));
  if (keys.some(k => k === "") || new Set(keys).size !== keys.length) {
    throw new Error("The paste contains a missing or repeated column heading.");
  }
  const candidates = layouts.filter(layout => layout.subjects.some(subject =>
    subject.terms.some(aliases => aliases.some(alias => keys.includes(key(alias))))));
  if (candidates.length !== 1) {
    throw new Error(candidates.length === 0
      ? "No supported year/subject headers found. Check the full header row."
      : "Ambiguous year/subject headers: paste one SIMS layout only.");
  }
  const layout = candidates[0];
  const subject = layout.subjects.length === 1 ? layout.subjects[0]
    : layout.subjects.find(s => s.subject === selection);
  if (!subject) throw new Error("Year 9 Science: choose Biology, Physics or Chemistry in C2.");
  const bindings: Binding[] = profile.concat(subject.terms.map((aliases, i): Binding =>
    [["Autumn", "Spring", "Summer"][i], true, aliases]));
  for (const [name, required, aliases] of bindings) {
    const matches = keys.filter(k => aliases.some(alias => key(alias) === k));
    if (matches.length > 1) throw new Error("Multiple columns match " + name + ".");
    if (required && matches.length === 0) throw new Error("Missing " + name + " column for Year " + layout.year + " " + subject.subject + ".");
  }
  return { year: layout.year, subject: subject.subject };
}

function main(workbook: ExcelScript.Workbook) {
  const paste = workbook.getWorksheet("Paste_SIMS");
  const table = workbook.getTable("SIMS_Raw");
  const currentRun = workbook.getNamedItem("KS3_CurrentRun").getRange();
  const status = paste.getRange("A2");
  // Invalidate before reading, validating or attempting writes. A failure cannot reuse old output.
  currentRun.clear(ExcelScript.ClearApplyTo.contents);
  workbook.getApplication().calculate(ExcelScript.CalculationType.full);
  status.setValue("Processing…");

  try {
    const selection = String(workbook.getNamedItem("KS3_SubjectSelection").getRange().getValue());
    if (!["Auto", "Biology", "Physics", "Chemistry"].includes(selection)) {
      throw new Error("Choose Auto, Biology, Physics or Chemistry from the C2 dropdown.");
    }
    const used = paste.getUsedRange(true);
    const rowCount = used ? used.getRowIndex() + used.getRowCount() - 2 : 0;
    const columnCount = used ? used.getColumnIndex() + used.getColumnCount() : 0;
    if (rowCount < 2) throw new Error("Paste the export headers and pupil rows into A3.");
    const values = paste.getRangeByIndexes(2, 0, rowCount, columnCount).getValues();
    const headers = values[0].map(cell => clean(cell));
    while (headers.length > 0 && headers[headers.length - 1] === "") headers.pop();
    const run = resolveRun(headers, selection);
    const body = values.slice(1);
    if (body.some(row => row.slice(headers.length).some(cell => clean(cell) !== ""))) {
      throw new Error("Data extends beyond the last heading. Reset and paste the whole export again.");
    }
    // Ignore blank trailing rows; shrink both dimensions of the same input table.
    while (body.length > 0 && body[body.length - 1].every(cell => clean(cell) === "")) body.pop();
    if (body.length === 0) throw new Error("Paste pupil rows below the headings.");
    // Range.setValues interprets leading formula characters. Store them as source text.
    const staged = [headers, ...body.map(row => row.slice(0, headers.length))].map(row =>
      row.map(cell => typeof cell === "string" && /^[=+\-@']/.test(cell) ? "'" + cell : cell)
    );
    const raw = table.getWorksheet();
    const old = raw.getUsedRange(true);
    const oldRows = old ? old.getRowIndex() + old.getRowCount() : 0;
    const oldColumns = old ? old.getColumnIndex() + old.getColumnCount() : 0;
    const target = raw.getRangeByIndexes(0, 0, staged.length, headers.length);
    table.resize(target);
    target.setValues(staged);
    if (oldRows > staged.length) {
      raw.getRangeByIndexes(staged.length, 0, oldRows - staged.length, oldColumns)
        .clear(ExcelScript.ClearApplyTo.contents);
    }
    if (oldColumns > headers.length) {
      raw.getRangeByIndexes(0, headers.length, Math.min(staged.length, oldRows), oldColumns - headers.length)
        .clear(ExcelScript.ClearApplyTo.contents);
    }
    workbook.getNamedItem("KS3_StagedSelection").getRange().setValue(selection);
    workbook.getNamedItem("KS3_StagedSubject").getRange().setValue(run.subject);
    workbook.getNamedItem("KS3_StagedYear").getRange().setValue(run.year);
    status.setValue("Staged Year " + run.year + " " + run.subject + ". Refresh KS3_Merge_Final and check the marks.");
    currentRun.setValue("KS3-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
    workbook.getApplication().calculate(ExcelScript.CalculationType.full);
  } catch (error) {
    currentRun.clear(ExcelScript.ClearApplyTo.contents);
    status.setValue("Processing stopped. " + String(error));
    workbook.getApplication().calculate(ExcelScript.CalculationType.full);
    throw error;
  }
}
