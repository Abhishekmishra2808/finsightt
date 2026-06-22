import { Router } from "express";
import { expressRateLimit } from "../middleware/expressRateLimit";
import { handleAnalyzeDocuments } from "../handlers/analyzeDocuments";

const router = Router();

router.post(
  "/analyze-documents",
  expressRateLimit(
    "balance-sheet",
    1,
    2 * 60 * 1000,
    "Balance sheet analysis is limited to 1 request every 2 minutes. Please try again shortly."
  ),
  async (req, res) => {
    try {
      const result = await handleAnalyzeDocuments(req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("Analysis proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default router;
