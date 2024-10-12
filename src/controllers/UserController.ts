import { NextFunction, Response, Request } from "express";
import { Logger } from "winston";

import { UserService } from "../services/UserService";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
  ) {}

  create = async (
    req: CreateUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password, restaurantId, role } =
      req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        restaurantId,
      });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: UpdateUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, role } = req.body;
    const userId = req.params.id;

    const isUserExist = await this.userService.findById(Number(userId));
    if (!isUserExist) {
      this.logger.error("User does not exist while updating", { userId });
      next(createHttpError(404, "Invalid url param."));
      return;
    }

    this.logger.debug("Request for updating a user", req.body);

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      this.logger.info("User has been updated", { id: userId });

      res.json({ id: Number(userId) });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAll();

      this.logger.info("All users have been fetched");
      res.json(users);
    } catch (err) {
      next(err);
    }
  };
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const user = await this.userService.findById(Number(userId));

      if (!user) {
        this.logger.error("User does not exist while fetching specific", {
          userId,
        });
        next(createHttpError(404, "User does not exist"));
        return;
      }

      this.logger.info("User has been fetched", { id: user.id });
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    try {
      const deletedUser = await this.userService.deleteById(Number(userId));
      if (!deletedUser) {
        this.logger.error("User does not exist while deleting", { userId });
        next(createHttpError(404, "Invalid url param."));
        return;
      }
      this.logger.info("User has been deleted", {
        id: Number(userId),
      });
      res.json({ id: Number(userId) });
    } catch (err) {
      next(err);
    }
  };
}
