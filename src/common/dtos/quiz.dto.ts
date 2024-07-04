import { Exclude, Expose, Type } from "class-transformer";
import { CandidateLevel } from "../../core/enums";

@Exclude()
export class QuizResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  summary: string;

  @Expose()
  total_score: number;

  @Expose()
  tags: string;

  @Expose()
  questions_number: number;

  @Expose()
  position: string;

  @Expose()
  level: CandidateLevel;

  @Expose()
  duration: number;

  @Expose()
  @Type(() => QuizQuestionResponseDto)
  questions: QuizQuestionResponseDto[];
}

@Exclude()
export class QuizQuestionResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  score: number;

  @Expose()
  @Type(() => QuizQuestionAnswerDto)
  answers: QuizQuestionAnswerDto[];

  @Expose()
  type: "multiple_choice" | "true_or_false" | "open_question";
}

@Exclude()
export class QuizQuestionAnswerDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Exclude()
  correct: boolean;
}
