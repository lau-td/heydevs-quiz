import Container from "typedi";
import { QuizQuestionService } from "../../../../common/services";
import { QuizQuestion } from "../../../../core/entities";

const quizQuestionService: QuizQuestionService =
  Container.get(QuizQuestionService);

export default {
  async beforeCreate(event) {
    const { data /*where, select, populate*/ } = event.params;

    // Get input for AI generated content
    const {
      questions_number: questionsNumber,
      tags,
      position,
      level,
      language,
    } = data;

    // Generate AI generated content and format it
    const aiQuestions: QuizQuestion[] =
      await quizQuestionService.generateQuizQnAFromAiGeneratedCsv({
        questionsNumber,
        tags,
        position,
        level,
        language,
      });

    // Create quiz questions
    const questionEntities: QuizQuestion[] = await Promise.all(
      aiQuestions.map(async (aiQuestion) => {
        const answers = await Promise.all(
          aiQuestion.answers.map((answer) =>
            strapi.services[
              "api::quiz-question-answer.quiz-question-answer"
            ].create({
              data: answer,
            })
          )
        );

        const questionData = {
          ...aiQuestion,
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

    event.params.data = {
      ...event.params.data,
      questions: {
        connect: questionEntities.map((question) => ({ id: question.id })),
      },
    };
  },
};
