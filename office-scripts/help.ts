function main(workbook: ExcelScript.Workbook) {
  const paste = workbook.getWorksheet("Paste_SIMS");
  paste.getRange("A2").setValue("Reset → paste at A3 → Process → refresh KS3_Merge_Final → check → Word.");
}
