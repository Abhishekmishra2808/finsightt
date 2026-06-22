export default function handler(_req: any, res: any) {
  return res.status(200).json({
    status: "ok",
    key: process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING",
    key_first_char: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY[0] : "NONE",
  });
}
