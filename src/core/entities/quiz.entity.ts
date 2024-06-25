import { Exclude, Expose, Type } from "class-transformer";
import { Base } from "./base.entity";
import { QuizQuestion } from "./quiz-question.entity";
import { CandidateLevel } from "../enums";

@Exclude()
export class Quiz extends Base {
  @Expose()
  title: string;

  @Expose()
  position: string;

  @Expose()
  level: CandidateLevel;

  @Expose()
  tags: string;

  @Expose()
  duration: number;

  @Expose()
  total_score: number;

  @Expose()
  questions_number: number;

  @Expose()
  summary: string;

  @Expose()
  @Type(() => QuizQuestion)
  questions?: QuizQuestion[];
}
