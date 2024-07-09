import {
  GOOGLE_SHEET_ACCESS_KEY_FILE_PATH,
  GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY,
  GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY_TTL,
  GOOGLE_SHEET_SCOPE,
} from "../constants";
import { google, sheets_v4 } from "googleapis";
import NodeCache from "node-cache";
import { convertArrayToJSON } from "../utils";
import { Service } from "typedi";
import { errors } from "@strapi/utils";

@Service()
export class GoogleSheetService {
  private sheetsService: sheets_v4.Sheets;
  private cacheManagerService: NodeCache;

  constructor() {
    this.sheetsService = google.sheets("v4");
    this.cacheManagerService = new NodeCache();
  }

  /**
   * @description Get access token to use google sheet api
   * @returns - token of google sheet - this token is used for authentication to use sheet api
   */
  async getAccessToken(): Promise<string> {
    try {
      // Get cache google access key
      const cacheToken: string = this.cacheManagerService.get<string>(
        GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY
      );

      if (cacheToken) {
        return cacheToken;
      }

      // Set new cache token if old cache is invalid
      const googleAuth = new google.auth.JWT({
        keyFile: GOOGLE_SHEET_ACCESS_KEY_FILE_PATH,
        key: "",
        scopes: GOOGLE_SHEET_SCOPE,
      });
      const googleJwtData = await googleAuth.getAccessToken();

      if (googleJwtData.token) {
        this.cacheManagerService.set(
          GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY,
          googleJwtData.token,
          GOOGLE_SHEET_ACCESS_TOKEN_CACHE_KEY_TTL
        );
      }

      return googleJwtData.token || "";
    } catch (error) {
      console.error(error);
      throw new errors.ApplicationError(
        "Error getting access token from Google Sheets API"
      );
    }
  }

  /**
   * @description Get sheet data from google sheet
   * @param spreadsheetId - google spreadsheet id
   * @param sheetName - sheet name
   * @returns raw sheet data
   */
  async getSheetDataByIdAndName(
    spreadsheetId: string,
    sheetName: string
  ): Promise<any[][]> {
    try {
      const response = await this.sheetsService.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1:ZZ10000`,
        access_token: await this.getAccessToken(),
      });

      return response.data?.values;
    } catch (error) {
      console.error(error);
      throw new errors.ApplicationError(
        "Error getting sheet data from Google Sheets API"
      );
    }
  }

  /**
   * @description Get sheet data from google sheet and convert to json array
   * @param spreadsheetId - google spreadsheet id
   * @param sheetName - sheet name
   * @returns sheet data in json array format
   */
  async getSheetDataAsJsonArrayByIdAndName<T>(
    spreadsheetId: string,
    sheetName: string
  ) {
    const rawSheetData: string[][] = await this.getSheetDataByIdAndName(
      spreadsheetId,
      sheetName
    );
    return convertArrayToJSON<T>(rawSheetData);
  }

  /**
   * @description Get all sheet metadata from google sheet
   * @param spreadsheetId - google spreadsheet id
   * @returns list of sheet metadata
   */
  async getAllSheetMetadata(
    spreadsheetId: string
  ): Promise<sheets_v4.Schema$Sheet[]> {
    try {
      const accessToken: string = await this.getAccessToken();
      const data = await this.sheetsService.spreadsheets.get({
        access_token: accessToken,
        spreadsheetId: spreadsheetId,
      });

      return data?.data?.sheets || [];
    } catch (error) {
      console.error(error);
      throw new errors.ApplicationError(
        "Error getting all sheet metadata from Google Sheets API"
      );
    }
  }
}
