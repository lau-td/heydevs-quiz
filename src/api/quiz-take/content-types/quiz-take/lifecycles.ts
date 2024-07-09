import { QuizQuestion, QuizQuestionAnswer } from "../../../../core/entities";
import { QuizTake } from "../../../../core/entities/quiz-take.entity";

export default {
  async beforeCreate(event) {
    // Generate pass code 6 digits
    const passCode = Math.floor(100000 + Math.random() * 900000);
    event.params.data.passCode = passCode;
  },

  async afterCreate(event) {
    const { result } = event;

    // Update url
    const url = `${process.env.FRONT_END_URL}/quiz-takes/${result.id}`;
    await strapi.entityService.update("api::quiz-take.quiz-take", result.id, {
      data: {
        url,
      },
    });
  },

  async afterUpdate(event) {
    const {
      result: { id: quizTakeId },
    } = event;

    const quizTake: QuizTake = await strapi.services[
      "api::quiz-take.quiz-take"
    ].findOneCustom(quizTakeId);

    const quizQuestions = await strapi.entityService.findMany(
      "api::quiz-question.quiz-question",
      {
        filters: {
          quiz: {
            id: {
              $eq: quizTake?.quiz?.id,
            },
          },
        },
        populate: ["answers"],
      }
    );

    const takeQuestionAnswers = await strapi.entityService.findMany(
      "api::take-question-answer.take-question-answer",
      {
        filters: {
          take: {
            id: {
              $eq: quizTakeId,
            },
          },
        },
        populate: {
          question: true,
          answer: true,
        },
      }
    );

    const questionIdAndCorrectAnswerContentMap: Record<string, string> =
      quizQuestions.reduce((acc, question) => {
        acc[question.id] = question.answers.find(
          (answer) => answer.correct
        )?.content;
        return acc;
      }, {} as Record<string, string>);

    const questionNumber: number = quizTake.quiz?.questions_number || 0;
    const correctAnswerNumber: number = quizTake?.score || 0;
    const quizTakeDetails = takeQuestionAnswers.map(
      ({ question, answer, content }) => {
        return {
          type: question.type,
          questionContent: question.content,
          answerContent: answer?.content || content || "",
          correct: answer?.correct || "",
          correctAnswerContent:
            questionIdAndCorrectAnswerContentMap[question.id],
        };
      }
    );

    const candidateName: string = quizTake?.candidate_name || "";
    const createdByEmail: string = quizTake?.createdBy?.email || "";

    if (
      quizTake.finished_at &&
      !quizTake.email_sent &&
      candidateName &&
      createdByEmail &&
      questionNumber
    ) {
      const emailSubject = `Quiz Result: ${quizTake?.quiz?.title} - ${candidateName}`;
      const emailContent = `Dear ${createdByEmail},
          We would like to inform you about the result of the quiz titled "${
            quizTake?.quiz?.title
          }" taken by ${candidateName}.
          
          - Number of Questions: ${questionNumber}
          - Correct Answers: ${correctAnswerNumber}
          - Details: 
          ${quizTakeDetails
            .map(
              (detail, index) => `
            ${index}: ${detail.questionContent}

            ${
              detail.type === "multiple_choice"
                ? `=> ${detail.answerContent} ${detail.correct ? "✅" : "❌"}
            ${
              !detail.correct
                ? `=> Correct Answer: ${detail.correctAnswerContent} ✅`
                : ""
            }`
                : `
            => Answer: ${detail.answerContent}
              `
            }
            `
            )
            .join("")}
          
          Thank you for using our quiz system.
          
          Best regards,
          Your Quiz Team`;

      await strapi.plugins["email"].services.email.send({
        to: createdByEmail,
        from: process.env.EMAIL_DEFAULT_FROM || "no-reply@heydevs.io",
        subject: emailSubject,
        text: emailContent,
      });

      await strapi.entityService.update(
        "api::quiz-take.quiz-take",
        quizTakeId,
        {
          data: {
            email_sent: true,
          },
        }
      );
    }
  },
};
