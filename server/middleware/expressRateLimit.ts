import type { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../lib/rateLimit";

export function expressRateLimit(keyPrefix: string, max: number, windowMs: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const rateError = checkRateLimit(`${keyPrefix}:${ip}`, max, windowMs);
    if (rateError) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}
