const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function toGeminiContents(parts: unknown[], prompt: string) {
  const geminiParts: Array<Record<string, unknown>> = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") continue;

    if ("inlineData" in part) {
      geminiParts.push({ inlineData: (part as { inlineData: { data: string; mimeType: string } }).inlineData });
      continue;
    }

    if ("text" in part) {
      geminiParts.push({ text: String((part as { text: string }).text) });
    }
  }

  geminiParts.push({ text: prompt });
  return [{ role: "user", parts: geminiParts }];
}

function parseGeminiError(errorText: string): string {
  try {
    const parsed = JSON.parse(errorText);
    return parsed?.error?.message || errorText;
  } catch {
    return errorText;
  }
}

async function callGemini(model: string, body: Record<string, unknown>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseGeminiError(errorText) || `Gemini API request failed (${response.status})`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini API returned no content");
  }

  return text;
}

export async function analyzeDocuments(body: {
  parts?: unknown[];
  prompt?: string;
  responseSchema?: unknown;
}) {
  const { parts, prompt, responseSchema } = body;
  if (!parts || !prompt) {
    return { status: 400, data: { error: "Parts and prompt are required" } };
  }

  const text = await callGemini("gemini-3.5-flash", {
    contents: toGeminiContents(parts, prompt),
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  return { status: 200, data: JSON.parse(text) };
}

export async function analyzeGst(body: { prompt?: string; responseSchema?: unknown }) {
  const { prompt, responseSchema } = body;
  if (!prompt) {
    return { status: 400, data: { error: "Prompt is required" } };
  }

  const text = await callGemini("gemini-3.5-flash", {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  return { status: 200, data: JSON.parse(text) };
}
