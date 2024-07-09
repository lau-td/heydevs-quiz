import { Language } from "../../../core/enums";
import {
  IsString,
  IsEnum,
  ValidateNested,
  IsNumber,
  IsOptional,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class SpreadsheetMetadataInputDto {
  @IsString()
  spreadsheetId: string;

  @IsString()
  sheetName: string;
}

export class QuizInputDto {
  @IsString()
  title: string;

  @IsString()
  position: string;

  @IsString()
  level: string;

  @IsString()
  tags: string;

  @IsEnum(Language)
  language: Language;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  duration?: number = 600;
}

export class CreateQuizFromGoogleSheetDto {
  @ValidateNested()
  @Type(() => SpreadsheetMetadataInputDto)
  spreadsheetMetadata: SpreadsheetMetadataInputDto;

  @ValidateNested()
  @Type(() => QuizInputDto)
  quiz: QuizInputDto;
}
