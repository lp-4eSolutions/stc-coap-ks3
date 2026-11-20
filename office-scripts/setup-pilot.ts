function main(workbook: ExcelScript.Workbook) {
  if (
    workbook.getWorksheet("Paste_SIMS") || workbook.getWorksheet("Data_SIMS") ||
    workbook.getWorksheet("KS3_Control") || workbook.getWorksheet("KS3_Merge_Final") || workbook.getTable("SIMS_Raw") ||
    workbook.getNamedItem("KS3_CurrentRun")
  ) {
    throw new Error("The pilot is already set up or a required name is in use. Start in a blank workbook.");
  }

  const paste = workbook.addWorksheet("Paste_SIMS");
  const raw = workbook.addWorksheet("Data_SIMS");
  const control = workbook.addWorksheet("KS3_Control");
  const initialRange = raw.getRange("A1:B2");
  initialRange.setValues([["Surname Forename", "Class"], ["", ""]]);
  raw.addTable(initialRange, true).setName("SIMS_Raw");
  workbook.addNamedItem("KS3_CurrentRun", paste.getRange("B2"));
  workbook.addNamedItem("KS3_SubjectSelection", paste.getRange("C2"));
  workbook.addNamedItem("KS3_StagedSelection", control.getRange("B1"));
  workbook.addNamedItem("KS3_StagedSubject", control.getRange("B2"));
  workbook.addNamedItem("KS3_StagedYear", control.getRange("B3"));
  paste.getRange("C2").setValue("Auto");
  const validation = paste.getRange("C2").getDataValidation();
  validation.clear();
  validation.setRule({ list: { inCellDropDown: true, source: "Auto,Biology,Physics,Chemistry" } });
  validation.setIgnoreBlanks(false);
  validation.setErrorAlert({
    showAlert: true, style: ExcelScript.DataValidationAlertStyle.stop,
    title: "Choose a subject", message: "Choose Auto, Biology, Physics or Chemistry from C2."
  });

  paste.getRange("A1").setValue("KS3 Class on a Page");
  paste.getRange("C1").setValue("Subject (choose in C2)");
  paste.getRange("A2").setValue("Paste the SIMS export into A3, then run Process Pupil Data.");
  paste.getRange("A3").setValue("Paste SIMS export here");
  paste.getRange("A1:D1").getFormat().getFill().setColor("#17365D");
  paste.getRange("A1:D1").getFormat().getFont().setColor("#FFFFFF");
  paste.getRange("A1:D1").getFormat().getFont().setBold(true);
  paste.getRange("A:A").getFormat().setColumnWidth(340);
  paste.getRange("B:D").getFormat().setColumnWidth(155);
  paste.getFreezePanes().freezeRows(2);
  paste.activate();
  control.setVisibility(ExcelScript.SheetVisibility.hidden);
  raw.setVisibility(ExcelScript.SheetVisibility.hidden);
}
