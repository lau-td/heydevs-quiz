import { Exclude, Expose, Type } from "class-transformer";
import { Base } from "./base.entity";
import { QuizQuestionAnswer } from "./quiz-question-answer.entity";
import { Quiz } from "./quiz.entity";

@Exclude()
export class QuizQuestion extends Base {
  @Expose()
  content: string;

  @Expose()
  score: number;

  @Expose()
  type: "multiple_choice" | "true_or_false" | "open_question";

  @Expose()
  @Type(() => Quiz)
  quiz?: Quiz;

  @Expose()
  quizId?: number;

  @Expose()
  @Type(() => QuizQuestionAnswer)
  answers?: QuizQuestionAnswer[];
}
