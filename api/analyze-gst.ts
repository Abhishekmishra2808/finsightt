import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAnalyzeGst } from "../server/handlers/analyzeGst";
import { checkRateLimit, getClientIp } from "../server/lib/rateLimit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req.headers);
  const rateError = checkRateLimit(`gst:${ip}`, 20, 15 * 60 * 1000);
  if (rateError) {
    return res.status(429).json({
      error: "Too many requests from this IP, please try again after 15 minutes",
    });
  }

  try {
    const result = await handleAnalyzeGst(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error("GST proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
