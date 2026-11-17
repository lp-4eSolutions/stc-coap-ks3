// Run in the existing pilot workbook; keep SIMS_Raw and the loaded query/table in place.
function main(workbook: ExcelScript.Workbook) {
  const paste = workbook.getWorksheet("Paste_SIMS");
  if (!paste || !workbook.getTable("SIMS_Raw") || !workbook.getNamedItem("KS3_CurrentRun")) {
    throw new Error("The Year 7 English pilot must be installed first.");
  }
  workbook.getNamedItem("KS3_CurrentRun").getRange().clear(ExcelScript.ClearApplyTo.contents);
  paste.getRange("D2").setValue("NOT READY");
  let control = workbook.getWorksheet("KS3_Control");
  if (control && !workbook.getNamedItem("KS3_StagedSelection")) {
    throw new Error("KS3_Control is already used by another sheet. Resolve the name before upgrading.");
  }
  if (!control) control = workbook.addWorksheet("KS3_Control");
  const names = ["KS3_SubjectSelection", "KS3_StagedSelection", "KS3_StagedSubject", "KS3_StagedYear"];
  const ranges = [paste.getRange("C2"), control.getRange("B1"), control.getRange("B2"), control.getRange("B3")];
  names.forEach((name, i) => {
    const existing = workbook.getNamedItem(name);
    if (existing) existing.delete();
    workbook.addNamedItem(name, ranges[i]);
    ranges[i].clear(ExcelScript.ClearApplyTo.contents);
  });
  control.getRange("A1:A3").setValues([["Staged selection"], ["Staged subject"], ["Staged year"]]);
  paste.getRange("C1").setValue("Select Subject (Automate)");
  paste.getRange("C2").setValue("Auto");
  paste.getRange("D1").setValue("Current output check");
  // Compare every loaded record, including subject/selection. Invalid marks block readiness.
  const output = workbook.getTable("KS3_Merge_Final");
  const hasCurrentSchema = output && output.getColumnByName("SelectionToken");
  if (hasCurrentSchema) {
    // BEGIN READINESS FORMULA
    paste.getRange("D2").setFormula('=IF(KS3_CurrentRun="","NOT READY",IF(KS3_SubjectSelection<>KS3_StagedSelection,"PROCESS REQUIRED",IFERROR(IF(AND(COUNTIF(KS3_Merge_Final[RunID],KS3_CurrentRun)>0,COUNTIF(KS3_Merge_Final[RunID],KS3_CurrentRun)=ROWS(KS3_Merge_Final[RunID]),COUNTIF(KS3_Merge_Final[SelectionToken],KS3_SubjectSelection)=ROWS(KS3_Merge_Final[RunID]),COUNTIF(KS3_Merge_Final[Subject],KS3_StagedSubject)=ROWS(KS3_Merge_Final[RunID]),COUNTIF(KS3_Merge_Final[Year_Group],KS3_StagedYear)=ROWS(KS3_Merge_Final[RunID])),IF(SUM(KS3_Merge_Final[Autumn_Invalid],KS3_Merge_Final[Spring_Invalid],KS3_Merge_Final[Summer_Invalid])>0,"CHECK INVALID MARKS","READY TO REVIEW: Year "&KS3_StagedYear&" "&KS3_StagedSubject&" / "&ROWS(KS3_Merge_Final[RunID])&" class(es)"),"REFRESH REQUIRED"),"REFRESH REQUIRED")))');
    // END READINESS FORMULA
  }
  paste.getRange("A2").setValue(hasCurrentSchema
    ? "Upgraded. Paste at A3. Select Subject for Year 9 Science, then Process and refresh."
    : "Controls installed. Replace the query, refresh it to empty, then run Upgrade Pilot again to enable readiness.");
  workbook.getApplication().setCalculationMode(ExcelScript.CalculationMode.automatic);
  workbook.getApplication().calculate(ExcelScript.CalculationType.full);
  control.setVisibility(ExcelScript.SheetVisibility.hidden);
}
