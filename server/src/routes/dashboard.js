import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", dashboardController.getStats);
router.get("/trends", dashboardController.getTrends);
router.get("/activity", dashboardController.getActivity);

export default router;
