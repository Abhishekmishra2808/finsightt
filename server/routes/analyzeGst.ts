import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimit";
import { createGeminiClient } from "../lib/gemini";

const router = Router();

router.post("/analyze-gst", generalLimiter, async (req, res) => {
  try {
    const { prompt, responseSchema } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

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

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: "Failed to generate content" });
    }
  } catch (error: any) {
    console.error("GST proxy error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
