import { RequestHandler, Router } from "express";
import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { authenticate } from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const userController = new UserController(logger, userService);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  userController.create as RequestHandler,
);

export default router;
