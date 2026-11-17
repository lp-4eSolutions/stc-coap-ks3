// The script parameter is the operator's dropdown. C2 displays the choice.
// Always invalidate, even when reselecting the same subject or switching away and back.
function main(workbook: ExcelScript.Workbook, subject: "Auto" | "Biology" | "Physics" | "Chemistry" = "Auto") {
  workbook.getNamedItem("KS3_CurrentRun").getRange().clear(ExcelScript.ClearApplyTo.contents);
  workbook.getApplication().calculate(ExcelScript.CalculationType.full);
  if (!["Auto", "Biology", "Physics", "Chemistry"].includes(subject)) throw new Error("Choose a supported subject.");
  workbook.getNamedItem("KS3_SubjectSelection").getRange().setValue(subject);
  workbook.getWorksheet("Paste_SIMS").getRange("A2").setValue(
    "Selection: " + subject + ". Run Process Pupil Data, then refresh KS3_Merge_Final."
  );
  workbook.getApplication().calculate(ExcelScript.CalculationType.full);
}
