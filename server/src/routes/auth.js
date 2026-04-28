import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

// Registration endpoint — protect this in production (or remove after seeding)
router.post("/register", authController.register);

export default router;
