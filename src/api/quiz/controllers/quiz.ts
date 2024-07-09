import { factories } from "@strapi/strapi";
import { plainToInstance } from "class-transformer";
import { QuizResponseDto } from "../../../common/dtos";
import { CreateQuizFromGoogleSheetDto } from "../dtos";
import { validate } from "class-validator";

export default factories.createCoreController(
  "api::quiz.quiz",
  ({ strapi }) => ({
    async findAndGetFull(ctx) {
      return strapi.services["api::quiz.quiz"].findAndGetFull(ctx.query);
    },

    async findOne(ctx) {
      const entry = await strapi.services["api::quiz.quiz"].findOneCustom(
        ctx.params.id
      );
      return {
        data: plainToInstance(QuizResponseDto, entry),
        message: "OK",
        error: null,
      };
    },

    async createQuizFromGoogleSheet(ctx) {
      const params = plainToInstance(
        CreateQuizFromGoogleSheetDto,
        ctx.request.body
      );
      const errors = await validate(params);

      if (errors.length > 0) {
        return ctx.badRequest("Validation failed", errors);
      }

      const entry = await strapi.services[
        "api::quiz.quiz"
      ].createQuizFromGoogleSheet(params);

      return {
        data: plainToInstance(QuizResponseDto, entry),
        message: "OK",
        error: null,
      };
    },
  })
);
