function main(workbook: ExcelScript.Workbook) {
  const paste = workbook.getWorksheet("Paste_SIMS");
  const currentRun = workbook.getNamedItem("KS3_CurrentRun").getRange();
  const table = workbook.getTable("SIMS_Raw");
  const status = paste.getRange("A2");

  currentRun.clear(ExcelScript.ClearApplyTo.contents);
  status.setValue("Resetting…");
  const used = paste.getUsedRange(true);
  if (used) {
    const rowCount = used.getRowIndex() + used.getRowCount() - 2;
    if (rowCount > 0) {
      const columnCount = used.getColumnIndex() + used.getColumnCount();
      paste.getRangeByIndexes(2, 0, rowCount, columnCount).clear(ExcelScript.ClearApplyTo.contents);
    }
  }

  const raw = table.getWorksheet();
  const previous = raw.getUsedRange(true);
  const rows = previous ? previous.getRowIndex() + previous.getRowCount() : 0;
  const columns = previous ? previous.getColumnIndex() + previous.getColumnCount() : 0;
  const initialRange = raw.getRange("A1:B2");
  table.resize(initialRange);
  initialRange.setValues([["Surname Forename", "Class"], ["", ""]]);
  if (rows > 2) {
    raw.getRangeByIndexes(2, 0, rows - 2, columns).clear(ExcelScript.ClearApplyTo.contents);
  }
  if (columns > 2) {
    raw.getRangeByIndexes(0, 2, 2, columns - 2).clear(ExcelScript.ClearApplyTo.contents);
  }

  paste.getRange("A3").setValue("Paste SIMS export here");
  status.setValue("Paste the SIMS export into A3, then run Process Pupil Data.");
}
