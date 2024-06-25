import { Exclude, Expose, Type } from "class-transformer";
import { Base } from "./base.entity";
import { QuizQuestion } from "./quiz-question.entity";

@Exclude()
export class QuizQuestionAnswer extends Base {
  @Expose()
  content: string;

  @Expose()
  correct: boolean;

  @Expose()
  @Type(() => QuizQuestion)
  question?: QuizQuestion;

  @Expose()
  questionId?: number;
}
