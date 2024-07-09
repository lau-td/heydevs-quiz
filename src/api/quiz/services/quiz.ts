import { factories } from "@strapi/strapi";
import { Quiz, QuizQuestion } from "../../../core/entities";
import { errors } from "@strapi/utils";
import { plainToInstance } from "class-transformer";
import Container from "typedi";
import { GoogleSheetService } from "../../../common/services/google-sheet.service";
import { QuizQuestionAiGeneratedCsvDto } from "../../../core/dtos";
import { CreateQuizFromGoogleSheetDto } from "../dtos";
const { NotFoundError } = errors;

const googleSheetService: GoogleSheetService =
  Container.get(GoogleSheetService);

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

  async createQuizFromGoogleSheet(dto: CreateQuizFromGoogleSheetDto) {
    try {
      const { spreadsheetId, sheetName } = dto.spreadsheetMetadata;

      // Get data from google sheet
      const rawQuestionsFromCsv: QuizQuestionAiGeneratedCsvDto[] =
        await googleSheetService.getSheetDataAsJsonArrayByIdAndName<QuizQuestionAiGeneratedCsvDto>(
          spreadsheetId,
          sheetName
        );

      // Transform raw questions data from Google Sheet into QuizQuestion objects
      const quizQuestions: QuizQuestion[] = rawQuestionsFromCsv.map(
        ({
          score,
          question,
          answer_1,
          answer_2,
          answer_3,
          answer_4,
          type,
          correct_answer,
        }) => ({
          type,
          score: parseInt(score.toString()),
          content: question,
          answers: [answer_1, answer_2, answer_3, answer_4]
            .filter((answer) => !!answer)
            .map((answer, index) => ({
              correct: correct_answer.includes(`answer_${index + 1}`),
              content: answer,
            })),
        })
      );

      // Create quiz questions
      const questionEntities: QuizQuestion[] = await Promise.all(
        quizQuestions.map(async (quizQuestion) => {
          const answers = await Promise.all(
            quizQuestion.answers.map((answer) =>
              strapi.services[
                "api::quiz-question-answer.quiz-question-answer"
              ].create({
                data: answer,
              })
            )
          );

          const questionData = {
            ...quizQuestion,
            answers: {
              connect: answers.map((answer) => ({ id: answer.id })),
            },
          };

          const question = await strapi.services[
            "api::quiz-question.quiz-question"
          ].create({
            data: questionData,
          });

          return question;
        })
      );

      // Calculate quiz total score, check for open questions, and get total number of questions
      const quizTotalScore: number = quizQuestions.reduce(
        (acc, question) => acc + question.score,
        0
      );
      const isIncludeOpenQuestions: boolean = quizQuestions.some(
        (question) => question.type === "open_question"
      );
      const questionsNumber: number = quizQuestions.length;

      // Connect quiz questions to quiz
      const quizData = {
        ...dto.quiz,
        is_manual_content: true,
        total_score: quizTotalScore,
        include_open_questions: isIncludeOpenQuestions,
        questions_number: questionsNumber,
        questions: {
          connect: questionEntities.map((question) => ({ id: question.id })),
        },
      };

      // Create the quiz
      const createdQuiz = await strapi.services["api::quiz.quiz"].create({
        data: quizData,
      });

      return createdQuiz;
    } catch (error) {
      console.log(error);
      throw new errors.ApplicationError(error);
    }
  },
}));
