import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./routes/index";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.set("trust proxy", 1);

  const allowedOrigins = process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim().replace(/\/+$/, ""))
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow health checks / server-to-server (no Origin header)
        if (!origin) return callback(null, true);
        // If unset, allow all origins (set ALLOWED_ORIGIN in production)
        if (allowedOrigins.length === 0) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked origin: ${origin}`));
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/api", apiRoutes);

  return app;
}
