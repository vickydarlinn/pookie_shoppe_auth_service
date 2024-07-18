import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register);

export default router;
