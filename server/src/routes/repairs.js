import { Router } from "express";
import { repairController } from "../controllers/repairController.js";
import { authenticate } from "../middleware/auth.js";
import {
  validate,
  createRepairRules,
  updateRepairRules,
} from "../middleware/validate.js";

const router = Router();

// All repair routes require authentication
router.use(authenticate);

router.get("/", repairController.getAll);
router.get("/:id", repairController.getById);
router.post("/", validate(createRepairRules), repairController.create);
router.put("/:id", validate(updateRepairRules), repairController.update);
router.delete("/:id", repairController.delete);

export default router;
