
import { GoogleGenAI, Type } from "@google/genai";
import { Hint, PolishedResult } from "../types";

export const getGraduationHints = async (who: string): Promise<Hint[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    あなたは小学校の先生です。下級生が卒業する "${who || '6年生'}" さんに感謝の手紙を書こうとしています。
    小学校の「登校班」「クラブ」「委員会」「掃除」「行事」などでの具体的で優しいエピソードを3つ考えてください。
    全て「ひらがな」と「カタカナ」を多めにして、低学年でも読めるようにしてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: '思い出の内容' },
              emoji: { type: Type.STRING, description: '内容に合う絵文字' },
            },
            required: ['text', 'emoji'],
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const polishLetter = async (longText: string, shortText: string): Promise<PolishedResult | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    以下の文章は小学生が卒業生に書いたものです。
    1. 「つうじょう版」をより温かい表現に直してください。
    2. 「たんしゅく版」をさらに短く、カードに書きやすい素敵な表現に直してください。
    
    元文章1 (つうじょう版): "${longText}"
    元文章2 (たんしゅく版): "${shortText}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            long: { type: Type.STRING },
            short: { type: Type.STRING },
          },
          required: ['long', 'short'],
        }
      }
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
