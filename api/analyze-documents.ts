import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAnalyzeDocuments } from "../server/handlers/analyzeDocuments";
import { checkRateLimit, getClientIp } from "../server/lib/rateLimit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req.headers);
  const rateError = checkRateLimit(`balance-sheet:${ip}`, 1, 2 * 60 * 1000);
  if (rateError) {
    return res.status(429).json({
      error: "Balance sheet analysis is limited to 1 request every 2 minutes. Please try again shortly.",
    });
  }

  try {
    const result = await handleAnalyzeDocuments(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error("Analysis proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
