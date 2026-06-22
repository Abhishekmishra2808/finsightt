import { createGeminiClient } from "../lib/gemini";

interface AnalyzeGstBody {
  prompt?: string;
  responseSchema?: unknown;
}

export async function handleAnalyzeGst(body: AnalyzeGstBody) {
  const { prompt, responseSchema } = body;
  if (!prompt) {
    return { status: 400, data: { error: "Prompt is required" } };
  }

  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  if (!response.text) {
    return { status: 500, data: { error: "Failed to generate content" } };
  }

  return { status: 200, data: JSON.parse(response.text) };
}
