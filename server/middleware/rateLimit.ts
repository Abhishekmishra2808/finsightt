import rateLimit from "express-rate-limit";

export const balanceSheetLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 1,
  message: { error: "Balance sheet analysis is limited to 1 request every 2 minutes. Please try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
