function main(workbook: ExcelScript.Workbook) {
  const paste = workbook.getWorksheet("Paste_SIMS");
  const table = workbook.getTable("SIMS_Raw");
  const currentRun = workbook.getNamedItem("KS3_CurrentRun").getRange();
  const status = paste.getRange("A2");

  currentRun.clear(ExcelScript.ClearApplyTo.contents);
  status.setValue("Processing Year 7 English…");

  try {
    const used = paste.getUsedRange(true);
    const rowCount = used ? used.getRowIndex() + used.getRowCount() - 2 : 0;
    const columnCount = used ? used.getColumnIndex() + used.getColumnCount() : 0;

    if (rowCount < 2) {
      throw new Error("Paste the export headers and pupil rows into A3.");
    }

    // The status and buttons can extend farther right than a narrow input.
    const input = paste.getRangeByIndexes(2, 0, rowCount, columnCount);
    const values = input.getValues();
    const headers = values[0].map(cell => String(cell).trim());
    while (headers.length > 0 && headers[headers.length - 1] === "") {
      headers.pop();
    }
    const seen = new Set<string>();
    for (const header of headers) {
      const key = header.toLowerCase();
      if (key === "" || seen.has(key)) {
        throw new Error("The paste contains a missing or repeated column heading.");
      }
      seen.add(key);
    }
    if (!seen.has("surname forename") || !seen.has("class")) {
      throw new Error("The export needs Surname Forename and Class headings.");
    }

    const body = values.slice(1);
    if (body.some(row => row.slice(headers.length).some(cell => String(cell).trim() !== ""))) {
      throw new Error("The paste contains data beyond the last heading. Reset and paste the whole export again.");
    }

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

    status.setValue("Staged. Refresh KS3_Merge_Final, then review the output.");
    currentRun.setValue("KS3-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
  } catch (error) {
    status.setValue("Processing stopped. Check the script message.");
    throw error;
  }
}
