import { Router } from "express";
import { expressRateLimit } from "../middleware/expressRateLimit";
import { handleAnalyzeGst } from "../handlers/analyzeGst";

const router = Router();

router.post(
  "/analyze-gst",
  expressRateLimit(
    "gst",
    20,
    15 * 60 * 1000,
    "Too many requests from this IP, please try again after 15 minutes"
  ),
  async (req, res) => {
    try {
      const result = await handleAnalyzeGst(req.body);
      res.status(result.status).json(result.data);
    } catch (error: any) {
      console.error("GST proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
);

export default router;
