function main(workbook: ExcelScript.Workbook) {
  workbook.getWorksheet("Paste_SIMS").getRange("A2").setValue(
    "Reset → paste at A3 → choose C2 (Auto, or Biology/Physics/Chemistry for Y9 Science) → Process → refresh KS3_Merge_Final → check subject and term counts → save → Word. Switching back in C2 can recognise unchanged staged output; Process always starts a new run."
  );
}
