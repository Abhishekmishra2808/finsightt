import { GoogleGenAI } from "@google/genai";

export function createGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
