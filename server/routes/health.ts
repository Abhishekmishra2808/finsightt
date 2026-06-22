import { Router } from "express";
import { handleHealth } from "../handlers/health";

const router = Router();

router.get("/health", (_req, res) => {
  const result = handleHealth();
  res.status(result.status).json(result.data);
});

export default router;
