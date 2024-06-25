import { factories } from "@strapi/strapi";
import { plainToInstance } from "class-transformer";
import { QuizResponseDto } from "../../../common/dtos";

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
  })
);
