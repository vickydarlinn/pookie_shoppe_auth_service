import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
  // userService: UserService;
  // constructor(userService: UserService) {
  //   this.userService = userService;
  // }
  // this is Di (dependency injection)
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  register = async (
    req: RegisterUserRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      this.logger.debug("New Req to register a user", {
        firstName,
        lastName,
        email,
        password,
      });
      const newUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info("New user created Successfully", { newUser });
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };
}
