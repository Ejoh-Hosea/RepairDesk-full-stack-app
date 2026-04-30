import { Router } from "express";
import { reportsController } from "../controllers/reportsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/monthly", reportsController.getMonthly);

export default router;
