import { Exclude, Expose } from "class-transformer";

@Exclude()
export class QuizQuestionAiGeneratedCsvDto {
  @Expose()
  no: number;

  @Expose()
  question: string;

  @Expose()
  score: number;

  @Expose()
  answer_1: string;

  @Expose()
  answer_2: string;

  @Expose()
  answer_3: string;

  @Expose()
  answer_4: string;

  @Expose()
  correct_answer: "answer_1" | "answer_2" | "answer_3" | "answer_4";
}
