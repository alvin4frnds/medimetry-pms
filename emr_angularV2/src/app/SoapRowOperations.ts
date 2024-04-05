export interface SoapRowOperations {
  addNewRow(isUpdate, position, isBlankRow, event);
  deleteRow(position);
  showTermsSuggestions(term, position);
  selectSuggestion(suggestion, position, event, isDiagnosisFromChips);
  deleteSection();
  refillCurrentItem(position, object, event);

  addNextRow();
  sendFocusToNextElement(position);
}
