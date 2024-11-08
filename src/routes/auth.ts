import { RequestHandler, Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { AppDataSource } from "../config/data-source";

import logger from "../config/logger";

import registerValidator from "../validators/registerValidator";
import loginValidator from "../validators/loginValidator";

import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";

import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { CredentialService } from "../services/CredentialService";
import { authenticate } from "../middlewares/authenticate";
import { validateRefreshToken } from "../middlewares/validateRefreshToken";
import { parseRefreshToken } from "../middlewares/parseRefreshToken";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
);

router.post(
  "/register",
  registerValidator,
  authController.register as RequestHandler,
);

router.post("/login", loginValidator, authController.login as RequestHandler);

router.get(
  "/self",
  authenticate as RequestHandler,
  authController.self as unknown as RequestHandler,
);

router.post(
  "/refresh",
  validateRefreshToken as RequestHandler,
  authController.refresh as unknown as RequestHandler,
);

router.post(
  "/logout",
  authenticate as RequestHandler,
  parseRefreshToken as RequestHandler,
  authController.logout as unknown as RequestHandler,
);

export default router;
