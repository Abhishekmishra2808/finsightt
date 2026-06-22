import { Router } from "express";
import healthRoutes from "./health";
import analyzeDocumentsRoutes from "./analyzeDocuments";
import analyzeGstRoutes from "./analyzeGst";

const router = Router();

router.use(healthRoutes);
router.use(analyzeDocumentsRoutes);
router.use(analyzeGstRoutes);

export default router;
