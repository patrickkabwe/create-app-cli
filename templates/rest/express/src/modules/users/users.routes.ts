import { Router } from "express";
import { getUsersController } from "./users.controllers";

const router = Router();

router.get("/", getUsersController);

export { router as usersRouter };
