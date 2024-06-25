import { Inject, Service } from "typedi";
import { GoogleAiApiService } from "./google-ai-api.service";
import * as fs from "fs";
import { csvToJson, removeCsvBlock } from "../utils";
import { plainToInstance } from "class-transformer";
import { QuizQuestionAiGeneratedCsvDto } from "../../core/dtos";
import { QuizQuestion } from "../../core/entities";
import { Language } from "../../core/enums";

const QUESTION_SCHEMA_CSV = fs.readFileSync(
  "./src/core/dtos/quiz-question-ai-generated-schema.csv",
  "utf-8"
);

const generatePrompt = (
  language: Language,
  questionsNumber: number,
  tags: string,
  position: string,
  level: string
): string => {
  let prompt = "";

  switch (language) {
    case Language.VN:
      prompt = `Tiến hành tạo chính xác ${questionsNumber} câu hỏi và câu trả lời trắc nghiệm cho ${tags},
      dành cho ${position} với mức độ chuyên môn là ${level}, 
      - nội dung trả về là tiếng việt,  
      - chỉ file csv, không thêm bất kì nội dung nào khác:
      - không có câu trả lời nào là tất cả các ý trên đều đúng
      - đầu ra dưới dạng tệp CSV như sau ${QUESTION_SCHEMA_CSV}`;
      break;

    case Language.EN:
    default:
      prompt = `Generate exactly ${questionsNumber} multiple choice quiz questions and answers for ${tags}, 
      targeting ${position} with a ${level} level of expertise
      - returned content is in English
      - just a CSV file, don't add any other content
      - no answer is all above the following are correct.
      - output in CSV file format like this ${QUESTION_SCHEMA_CSV}`;
      break;
  }

  return prompt;
};

@Service()
export class QuizQuestionService {
  constructor() {}

  @Inject()
  private readonly aiService: GoogleAiApiService;

  async generateQuizQnAFromAiGeneratedCsv(params: {
    questionsNumber: number;
    tags: string;
    position: string;
    level: string;
    language: Language;
  }): Promise<QuizQuestion[]> {
    try {
      // Get input for AI generated content
      const { questionsNumber, tags, position, level, language } = params;
      const prompt: string = generatePrompt(
        language,
        questionsNumber,
        tags,
        position,
        level
      );

      // Get AI generated content
      const aiGenerateContent: string = await this.aiService.getConversation(
        prompt
      );

      // Convert AI generated content to JSON
      const rawCsvAiContent: string = removeCsvBlock(aiGenerateContent);
      const rawQuestionsFromCsv: QuizQuestionAiGeneratedCsvDto[] =
        plainToInstance(
          QuizQuestionAiGeneratedCsvDto,
          await csvToJson(rawCsvAiContent)
        );

      const aiQuestions: QuizQuestion[] = rawQuestionsFromCsv.map(
        ({
          score,
          question,
          answer_1,
          answer_2,
          answer_3,
          answer_4,
          correct_answer,
        }) => ({
          type: "multiple_choice",
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

      return aiQuestions;
    } catch (error) {
      throw error;
    }
  }
}
