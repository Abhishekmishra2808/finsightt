import { createGeminiClient } from "../lib/gemini";

interface AnalyzeDocumentsBody {
  parts?: unknown[];
  prompt?: string;
  responseSchema?: unknown;
}

export async function handleAnalyzeDocuments(body: AnalyzeDocumentsBody) {
  const { parts, prompt, responseSchema } = body;
  if (!parts || !prompt) {
    return { status: 400, data: { error: "Parts and prompt are required" } };
  }

  const contents = [...parts, { text: prompt }];
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  if (!response.text) {
    return { status: 500, data: { error: "Failed to generate content" } };
  }

  return { status: 200, data: JSON.parse(response.text) };
}
