export interface ValidationErrorsForScreen {
  isDuplicateScreenId: boolean;
  missingFields: string[];
}

export interface ConfigValidationErrors {
  [place_id: string]: ValidationErrorsForScreen[];
}
