export function handleHealth() {
  return {
    status: 200,
    data: {
      status: "ok",
      key: process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING",
      key_first_char: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY[0] : "NONE",
    },
  };
}
