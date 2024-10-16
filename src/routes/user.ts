import { RequestHandler, Router } from "express";
import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { authenticate } from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import createUserValidator from "../validators/createUserValidator";
import updateUserValidator from "../validators/updateUserValidator";
import getAllUsersValidator from "../validators/getAllUsersValidator";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const userController = new UserController(logger, userService);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  userController.create as RequestHandler,
);

router.patch(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  userController.update as RequestHandler,
);

router.get(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  getAllUsersValidator,
  userController.getAll as RequestHandler,
);

router.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  userController.getOne as RequestHandler,
);

router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  userController.delete as RequestHandler,
);

export default router;
