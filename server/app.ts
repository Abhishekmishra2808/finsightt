import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./routes/index";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.set("trust proxy", 1);
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use("/api", apiRoutes);

  return app;
}
