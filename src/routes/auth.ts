import { RequestHandler, Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

router.post("/register", authController.register as RequestHandler);

export default router;
