import { analyzeDocuments } from "./_shared/gemini";
import { checkRateLimit, getClientIp } from "./_shared/rateLimit";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
