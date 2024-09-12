import { Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";

export class AuthController {
  // userService: UserService;
  // constructor(userService: UserService) {
  //   this.userService = userService;
  // }
  // this is Di (dependency injection)
  constructor(private userService: UserService) {}

  register = async (req: RegisterUserRequest, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    await this.userService.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(201).json();
  };
}
