import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { Quiz, QuizQuestion } from "../../../core/entities";
import { plainToInstance } from "class-transformer";
import { QuizTake } from "../../../core/entities/quiz-take.entity";

export default factories.createCoreService(
  "api::quiz-take.quiz-take",
  ({ strapi }) => ({
    async findOneCustom(id: number): Promise<QuizTake> {
      const entry: any = await strapi.db
        .query("api::quiz-take.quiz-take")
        .findOne({
          where: { id },
          populate: ["quiz", "createdBy"],
        });

      if (!entry) {
        throw new errors.NotFoundError(
          "Quiz take not found. Please try again."
        );
      }

      return plainToInstance(QuizTake, entry);
    },

    // Verify quiz take by pass code
    async verifyPassCode(quizTakeId: number, passCode: string) {
      try {
        const quizTake = await strapi.entityService.findOne(
          "api::quiz-take.quiz-take",
          quizTakeId,
          {
            populate: ["quiz"],
          }
        );

        if (!quizTake) {
          throw new errors.NotFoundError("Quiz take not found");
        }

        if (quizTake.finished_at) {
          throw new errors.ApplicationError("Quiz take is already finished");
        }

        if (quizTake.passCode !== passCode) {
          throw new errors.ApplicationError("Pass code is incorrect");
        }

        return {
          status: true,
          message: "Pass code is correct",
        };
      } catch (error) {
        throw new errors.ApplicationError(
          error?.message || "Something went wrong"
        );
      }
    },

    // Start quiz take
    async startQuizTake(quizTakeId: number, passCode: string) {
      try {
        const quizTake = await strapi.entityService.findOne(
          "api::quiz-take.quiz-take",
          quizTakeId,
          { populate: ["quiz"] }
        );

        if (!quizTake) {
          throw new errors.NotFoundError("Quiz take not found");
        }

        if (quizTake.passCode !== passCode) {
          throw new errors.ApplicationError("Pass code is incorrect");
        }

        if (quizTake.finished_at) {
          throw new errors.ApplicationError("Quiz take is already finished");
        }

        if (quizTake.started_at) {
          const quizDuration: number = quizTake?.quiz?.duration; // in seconds
          const quizTakeStartTime: Date = new Date(quizTake?.started_at);
          const quizEndTime: Date = new Date(
            quizTakeStartTime.getTime() + 1000 * quizDuration
          );

          if (new Date() > quizEndTime) {
            throw new errors.ApplicationError("Quiz take is already finished");
          }

          return plainToInstance(QuizTake, quizTake);
        }

        await strapi.entityService.update(
          "api::quiz-take.quiz-take",
          quizTakeId,
          {
            data: {
              started_at: new Date(),
            },
          }
        );

        return this.findOneCustom(quizTakeId);
      } catch (error) {
        throw new errors.ApplicationError(
          error?.message || "Something went wrong"
        );
      }
    },

    // Get quiz by quiz take id
    async getQuizByQuizTakeId(quizTakeId: number) {
      try {
        const quizTake: QuizTake = await this.findOneCustom(quizTakeId);
        const quizId: number = quizTake?.quiz?.id;

        return strapi.services["api::quiz.quiz"].findOneCustom(quizId);
      } catch (error) {
        throw new errors.NotFoundError(
          error?.message || "Something went wrong"
        );
      }
    },

    async submitResult(
      quizId: number,
      quizTakeId: number,
      data: {
        questionId: number;
        answerId: number;
        answerText: string;
      }[]
    ) {
      try {
        const [quiz, quizTake]: [Quiz, QuizTake] = await Promise.all([
          strapi.services["api::quiz.quiz"].findOneCustom(quizId),
          this.findOneCustom(quizTakeId),
        ]);

        // Check if quiz and quiz take exists
        if (!quiz || !quizTake) {
          throw new errors.NotFoundError("Quiz or quiz take not found");
        }

        // Check if quiz and quiz take is going together
        if (quiz.id !== quizTake.quiz.id) {
          throw new errors.ApplicationError(
            "Quiz and quiz take does not match"
          );
        }

        // Check quiz take is started
        if (!quizTake.started_at) {
          throw new errors.ApplicationError("Quiz take is not started");
        }

        // Check if quiz take is finished
        if (quizTake.finished_at) {
          throw new errors.ApplicationError("Quiz take is already finished");
        }

        const questionIdAndAnswerIdMap: Record<number, number> =
          quiz.questions.reduce(
            (
              questionIdAndAnswerIdMap: Record<number, number>,
              question: QuizQuestion
            ) => {
              question.answers.forEach((answer) => {
                if (answer.correct) {
                  questionIdAndAnswerIdMap[question.id] = answer.id;
                }
              });
              return questionIdAndAnswerIdMap;
            },
            {} as Record<number, number>
          );

        // Check correct answers and score of quiz take
        quizTake.score = 0;
        for (const { questionId, answerId } of data) {
          const question: QuizQuestion = quiz.questions.find(
            (question) => question.id === questionId
          );
          if (question && questionIdAndAnswerIdMap[questionId] === answerId) {
            quizTake.score += question.score;
          }
        }

        // Update take question answer
        await Promise.all(
          data.map(({ questionId, answerId, answerText }) =>
            strapi.entityService.create(
              "api::take-question-answer.take-question-answer",
              answerId
                ? {
                    data: {
                      take: { id: quizTakeId },
                      question: { id: questionId },
                      answer: { id: answerId },
                    },
                  }
                : {
                    data: {
                      take: { id: quizTakeId },
                      question: { id: questionId },
                      content: answerText,
                    },
                  }
            )
          )
        );

        // Update quiz take
        await strapi.entityService.update(
          "api::quiz-take.quiz-take",
          quizTakeId,
          {
            data: {
              finished_at: new Date(),
              score: quizTake.score,
            },
          }
        );

        const updatedQuizTake = await strapi.entityService.findOne(
          "api::quiz-take.quiz-take",
          quizTakeId
        );

        return updatedQuizTake;
      } catch (error) {
        throw error;
      }
    },
  })
);
