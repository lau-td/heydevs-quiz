import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { plainToInstance } from "class-transformer";
import { QuizResponseDto } from "../../../common/dtos";

export default factories.createCoreController(
  "api::quiz-take.quiz-take",
  ({ strapi }) => ({
    getQuizByQuizTakeId: async (ctx) => {
      const { id: quizTakeId } = ctx.params;

      if (!quizTakeId) {
        throw new errors.ApplicationError(
          "Quiz take id is required. Please try again."
        );
      }

      const quizData = await strapi.services[
        "api::quiz-take.quiz-take"
      ].getQuizByQuizTakeId(quizTakeId);

      return {
        data: plainToInstance(QuizResponseDto, quizData),
        message: "OK",
        error: null,
      };
    },

    submitResult: async (ctx) => {
      const { id: quizTakeId } = ctx.params;
      const { quizId, data } = ctx.request.body;

      if (!quizTakeId || !quizId) {
        throw new errors.ApplicationError(
          "Quiz take id or quiz id is required. Please try again."
        );
      }

      const result = await strapi.services[
        "api::quiz-take.quiz-take"
      ].submitResult(quizId, quizTakeId, data);

      return {
        data: result,
        message: "OK",
        error: null,
      };
    },

    verifyPassCode: async (ctx) => {
      const { passCode } = ctx.request.body;
      const { id: quizTakeId } = ctx.params;

      if (!quizTakeId || !passCode) {
        throw new errors.ApplicationError(
          "Quiz take id or pass code is required. Please try again."
        );
      }

      const result = await strapi.services[
        "api::quiz-take.quiz-take"
      ].verifyPassCode(quizTakeId, passCode);

      return {
        data: {
          status: result?.status,
          message: result?.message,
        },
        message: "OK",
        error: null,
      };
    },

    startQuizTake: async (ctx) => {
      const { passCode } = ctx.request.body;
      const { id: quizTakeId } = ctx.params;

      if (!quizTakeId || !passCode) {
        throw new errors.ApplicationError(
          "Quiz take id or pass code is required. Please try again."
        );
      }

      const result = await strapi.services[
        "api::quiz-take.quiz-take"
      ].startQuizTake(quizTakeId, passCode);

      return {
        data: result,
        message: "OK",
        error: null,
      };
    },
  })
);
