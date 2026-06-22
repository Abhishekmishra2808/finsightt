import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    key: process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING",
    key_first_char: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY[0] : "NONE",
  });
});

export default router;
