import { Exclude, Expose, Type } from "class-transformer";
import { Base } from "./base.entity";
import { Quiz } from "./quiz.entity";

@Exclude()
export class QuizTake extends Base {
  @Expose()
  candidate_name: string;

  @Expose()
  candidate_email: string;

  @Expose()
  started_at?: Date;

  @Expose()
  finished_at?: Date;

  @Expose()
  email_sent?: boolean;

  @Expose()
  score?: number;

  @Expose()
  @Type(() => Quiz)
  quiz?: Quiz;

  @Expose()
  quizId?: number;

  @Expose()
  createdBy?: any;
}
