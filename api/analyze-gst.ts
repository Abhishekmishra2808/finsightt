import { analyzeGst } from "./_shared/gemini";
import { checkRateLimit, getClientIp } from "./_shared/rateLimit";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req.headers);
  if (checkRateLimit(`gst:${ip}`, 20, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: "Too many requests from this IP, please try again after 15 minutes",
    });
  }

  try {
    const result = await analyzeGst(req.body);
    return res.status(result.status).json(result.data);
  } catch (error: any) {
    console.error("GST proxy error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
