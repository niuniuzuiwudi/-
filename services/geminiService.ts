import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodLabel = async (base64Image: string): Promise<NutritionData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this image. If it is a food packaging label or ingredient list, extract the nutritional information. 
            If it is NOT a food label, set 'isFoodLabel' to false and provide a generic product name describing what you see.
            
            IMPORTANT: Return all text fields (productName, ingredients, healthSummary, pros, cons) in Simplified Chinese (简体中文).

            Return the data in JSON format with the following fields:
            - isFoodLabel: boolean
            - productName: string (guess the product name from the package in Chinese)
            - calories: number (per serving, if available, estimate if not)
            - protein: number (grams)
            - carbs: number (grams)
            - fat: number (grams)
            - ingredients: array of strings (list main ingredients in Chinese)
            - healthSummary: string (1-2 sentences summarizing if this is healthy in Chinese)
            - pros: array of strings (short positive points in Chinese, e.g. "高蛋白")
            - cons: array of strings (short negative points in Chinese, e.g. "高糖")
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFoodLabel: { type: Type.BOOLEAN },
            productName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            healthSummary: { type: Type.STRING },
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            cons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["isFoodLabel", "productName", "calories", "healthSummary"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText) as NutritionData;
    return data;

  } catch (error) {
    console.error("Error analyzing food label:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};