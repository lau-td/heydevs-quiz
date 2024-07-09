import Container from "typedi";
import { QuizQuestionService } from "../../../../common/services";
import { QuizQuestion } from "../../../../core/entities";
import { Language } from "../../../../core/enums";

const quizQuestionService: QuizQuestionService =
  Container.get(QuizQuestionService);

const createQuizQuestionsByAi = async (params: {
  questionsNumber: number;
  tags: string;
  position: string;
  level: string;
  language: Language;
  includeOpenQuestions: boolean;
}): Promise<QuizQuestion[]> => {
  const {
    questionsNumber,
    tags,
    position,
    level,
    language,
    includeOpenQuestions,
  } = params;

  // Generate AI generated content and format it
  const aiQuestions: QuizQuestion[] =
    await quizQuestionService.generateQuizQnAFromAiGeneratedCsv({
      questionsNumber,
      tags,
      position,
      level,
      language,
      includeOpenQuestions: !!includeOpenQuestions,
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

  return questionEntities;
};

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
      include_open_questions: includeOpenQuestions,
      is_manual_content: isManualContent,
    } = data;

    if (!isManualContent) {
      const questionEntities = await createQuizQuestionsByAi({
        questionsNumber,
        tags,
        position,
        level,
        language,
        includeOpenQuestions,
      });

      // Connect quiz questions to quiz
      event.params.data = {
        ...event.params.data,
        questions: {
          connect: questionEntities.map((question) => ({ id: question.id })),
        },
      };
    }
  },
};
