import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleHealth } from "../server/handlers/health";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const result = handleHealth();
  return res.status(result.status).json(result.data);
}
