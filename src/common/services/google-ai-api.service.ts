import axios from "axios";
import { Service } from "typedi";

const GOOGLE_AI_API_KEY = "AIzaSyDcgPMuxYSoiLE6gi8f2M_R2vatYkDyfyg";
const GOOGLE_AI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

@Service()
export class GoogleAiApiService {
  constructor() {}

  async getConversation(prompt: string) {
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
      },
    };

    try {
      const response = await axios.post(
        `${GOOGLE_AI_URL}?key=${GOOGLE_AI_API_KEY}`,
        requestData
      );

      return response?.data.candidates[0].content?.parts[0].text;
    } catch (error) {
      throw error;
    }
  }
}
