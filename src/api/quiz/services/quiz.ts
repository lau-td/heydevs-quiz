import { factories } from "@strapi/strapi";
import { Quiz, QuizQuestion } from "../../../core/entities";
import { errors } from "@strapi/utils";
import { plainToInstance } from "class-transformer";
const { NotFoundError } = errors;

export default factories.createCoreService("api::quiz.quiz", ({ strapi }) => ({
  async findAndGetFull(params) {
    const entry = await strapi.entityService.findMany("api::quiz.quiz", {
      populate: {
        questions: {
          populate: { answers: true },
        },
      },
    });

    return entry;
  },

  async findOneCustom(id: number): Promise<Quiz> {
    const entry: any = await strapi.db.query("api::quiz.quiz").findOne({
      where: { id },
      populate: {
        questions: {
          populate: { answers: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundError("Quiz not found. Please try again.");
    }

    // Shuffle questions and answers
    entry.questions = entry.questions
      .sort(() => Math.random() - 0.5)
      .map((question: QuizQuestion) => ({
        ...question,
        answers: question.answers.sort(() => Math.random() - 0.5),
      }));

    return plainToInstance(Quiz, entry);
  },
}));
