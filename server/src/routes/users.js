import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// All user management routes require authentication AND admin role
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", userController.getAll);
router.post("/", userController.create);
router.patch("/:id/role", userController.updateRole);
router.patch("/:id/password", userController.resetPassword);
router.delete("/:id", userController.delete);

export default router;
