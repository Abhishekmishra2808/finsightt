import { Router } from "express";
import { balanceSheetLimiter } from "../middleware/rateLimit";
import { createGeminiClient } from "../lib/gemini";

const router = Router();

router.post("/analyze-documents", balanceSheetLimiter, async (req, res) => {
  try {
    const { parts, prompt, responseSchema } = req.body;
    if (!parts || !prompt) return res.status(400).json({ error: "Parts and prompt are required" });

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

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: "Failed to generate content" });
    }
  } catch (error: any) {
    console.error("Analysis proxy error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
