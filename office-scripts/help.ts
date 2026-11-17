function main(workbook: ExcelScript.Workbook) {
  workbook.getWorksheet("Paste_SIMS").getRange("A2").setValue(
    "Reset → paste at A3 → Select Subject for Y9 Science → Process → refresh KS3_Merge_Final → check subject and term counts → save → Word. Use Select Subject again before each Y9 science run."
  );
}
