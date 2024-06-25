/**
 * test-take controller
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { plainToInstance } from "class-transformer";
import { TestTake } from "../../../core/entities";

export default factories.createCoreController(
  "api::test-take.test-take",
  ({ strapi }) => ({
    async findOneCustom(ctx) {
      const { id: testTakeId } = ctx.params;

      if (!testTakeId) {
        throw new errors.ApplicationError(
          "Test take id is required. Please try again."
        );
      }

      const testTakeData = await strapi.services[
        "api::test-take.test-take"
      ].findOneCustom(testTakeId);

      return {
        data: plainToInstance(TestTake, testTakeData),
        message: "OK",
        error: null,
      };
    },

    startQuizTake: async (ctx) => {
      const { id: testTakeId } = ctx.params;

      if (!testTakeId) {
        throw new errors.ApplicationError(
          "Test take id or pass code is required. Please try again."
        );
      }

      const result = await strapi.services[
        "api::test-take.test-take"
      ].startTestTake(testTakeId);

      return {
        data: result,
        message: "OK",
        error: null,
      };
    },

    submitResult: async (ctx) => {
      const { id: testTakeId } = ctx.params;
      const { testId, result } = ctx.request.body;

      if (!testTakeId || !testId) {
        throw new errors.ApplicationError(
          "Test take id or test id is required. Please try again."
        );
      }

      const results = await strapi.services[
        "api::test-take.test-take"
      ].submitResult(testId, testTakeId, result);

      return {
        data: results,
        message: "OK",
        error: null,
      };
    },
  })
);
