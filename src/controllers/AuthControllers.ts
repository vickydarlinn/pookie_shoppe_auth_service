import fs from "fs";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";

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
    // validations
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
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

      // make accessToken and refreshToken
      // make accessToken
      const privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );

      const payload: JwtPayload = {
        id: String(newUser.id),
      };
      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256", // RS256 algorithm
        expiresIn: "1h", // Token expires in 1 hour
        issuer: "auth-service",
      });

      // make a record of refreshToken in db
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)

      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const refreshTokenRecord = await refreshTokenRepository.save({
        user: newUser,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      // make refreshToken
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
        jwtid: String(refreshTokenRecord.id),
      });

      // set cookies
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true,
      });

      res.status(201).json({ id: newUser.id });
    } catch (error) {
      next(error);
    }
  };
}
