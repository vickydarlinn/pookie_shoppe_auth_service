import { RequestHandler, Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import registerValidator from "../validators/registerValidator";

import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";

import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getMongoRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
  "/register",
  registerValidator,
  authController.register as RequestHandler,
);

export default router;
