export const GOOGLE_SHEET_ACCESS_KEY_FILE_PATH =
  "./google-sheet-service-account.json";
export const GOOGLE_SHEET_SCOPE =
  "https://www.googleapis.com/auth/spreadsheets";
export enum VALUE_INPUT_OPTIONS {
  USER_ENTERED = "USER_ENTERED",
  INPUT_VALUE_OPTION_UNSPECIFIED = "INPUT_VALUE_OPTION_UNSPECIFIED",
  RAW = "RAW",
}
export const GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY = "google-sheet-access-token";
export const GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY_TTL = (55 / 60) * 60 * 60;
export const TIMESTAMP_FORMAT = "MM/DD/YYYY HH:mm:ss";
export const enum SEVERITY {
  EMERGENCY = "EMERGENCY",
  ALERT = "ALERT",
  CRITICAL = "CRITICAL",
  ERROR = "ERROR",
  WARNING = "WARNING",
  NOTICE = "NOTICE",
  INFO = "INFO",
}
