/**
 * test-take service
 */

import { factories } from "@strapi/strapi";
import { plainToInstance } from "class-transformer";
import { errors } from "@strapi/utils";
import { Test, TestTake } from "../../../core/entities";

export default factories.createCoreService(
  "api::test-take.test-take",
  ({ strapi }) => ({
    async findOneCustom(id: number): Promise<TestTake> {
      const entry: any = await strapi.db
        .query("api::test-take.test-take")
        .findOne({
          where: { id },
          populate: ["test", "createdBy", "test.content_file"],
        });

      if (!entry) {
        throw new errors.NotFoundError(
          "Test take not found. Please try again."
        );
      }

      return plainToInstance(TestTake, entry);
    },

    async startTestTake(testTakeId: number) {
      try {
        const testTake = await strapi.entityService.findOne(
          "api::test-take.test-take",
          testTakeId,
          { populate: ["test"] }
        );

        if (!testTake) {
          throw new errors.NotFoundError("Test take not found");
        }

        if (testTake.finished_at) {
          throw new errors.ApplicationError("Test take is already finished");
        }

        if (testTake.started_at) {
          const testDuration: number = testTake?.test?.duration; // in seconds
          const testTakeStartTime: Date = new Date(testTake?.started_at);
          const testEndTime: Date = new Date(
            testTakeStartTime.getTime() + 1000 * testDuration
          );

          if (new Date() > testEndTime) {
            throw new errors.ApplicationError("Test take is already finished");
          }

          return plainToInstance(TestTake, testTake);
        }

        await strapi.entityService.update(
          "api::test-take.test-take",
          testTakeId,
          {
            data: {
              started_at: new Date(),
            },
          }
        );

        return this.findOneCustom(testTakeId);
      } catch (error) {
        throw new errors.ApplicationError(
          error?.message || "Something went wrong"
        );
      }
    },

    async submitResult(testId: number, testTakeId: number, result: string) {
      try {
        const [test, testTake]: [any, TestTake] = await Promise.all([
          strapi.entityService.findOne("api::test.test", testId),
          this.findOneCustom(testTakeId),
        ]);

        // Check if test and test take exists
        if (!test || !testTake) {
          throw new errors.NotFoundError("Test or test take not found");
        }

        // Check if test and test take is going together
        if (test.id !== testTake.test.id) {
          throw new errors.ApplicationError(
            "Test and test take does not match"
          );
        }

        // Check test take is started
        if (!testTake.started_at) {
          throw new errors.ApplicationError("Test take is not started");
        }

        // Check if test take is finished
        if (testTake.finished_at) {
          throw new errors.ApplicationError("Test take is already finished");
        }

        // Update test take
        await strapi.entityService.update(
          "api::test-take.test-take",
          testTakeId,
          {
            data: {
              result,
              finished_at: new Date(),
            },
          }
        );

        const updatedTestTake = await strapi.entityService.findOne(
          "api::test-take.test-take",
          testTakeId
        );

        return updatedTestTake;
      } catch (error) {
        throw error;
      }
    },
  })
);
