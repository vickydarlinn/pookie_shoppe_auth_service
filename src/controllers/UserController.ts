import { NextFunction, Response } from "express";
import { Logger } from "winston";

import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { validationResult } from "express-validator";

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

    const { firstName, lastName, email, password, tenantId, role } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  };
}
