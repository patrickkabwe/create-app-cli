import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "./auth.controllers";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.delete("/logout", logoutController);

export { router as authRouter };
