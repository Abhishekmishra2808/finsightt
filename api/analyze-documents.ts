import { analyzeDocuments } from "./_shared/gemini";
import { checkRateLimit, getClientIp } from "./_shared/rateLimit";

export const config = {
  maxDuration: 60,
};

const MAX_BODY_BYTES = 4.5 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({
      error: "Request too large. Compress your image or use a smaller file (Vercel limit ~4.5 MB).",
    });
  }

  const ip = getClientIp(req.headers);
  if (checkRateLimit(`balance-sheet:${ip}`, 1, 2 * 60 * 1000)) {
    return res.status(429).json({
      error: "Balance sheet analysis is limited to 1 request every 2 minutes. Please try again shortly.",
    });
  }

  try {
    const result = await analyzeDocuments(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error("Analysis proxy error:", error);
    const message = error.message || "Internal server error";
    const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("aborted");
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout
        ? "Analysis timed out. Vercel Hobby plan allows 10s max — upgrade to Pro or run locally with npm run dev."
        : message,
    });
  }
}
