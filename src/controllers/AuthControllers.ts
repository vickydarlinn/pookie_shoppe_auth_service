import { NextFunction, Response } from "express";
import { AuthRequest, LoginUserRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import { CredentialService } from "../services/CredentialService";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class AuthController {
  // userService: UserService;
  // constructor(userService: UserService) {
  //   this.userService = userService;
  // }
  // this is Di (dependency injection)
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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
        role: Roles.CUSTOMER,
      });
      this.logger.info("New user created Successfully", { newUser });

      const payload: JwtPayload = {
        id: String(newUser.id),
        role: newUser.role,
      };
      // make accessToken
      const accessToken = this.tokenService.generateAccessToken(payload);

      // make a record of refreshToken in db
      const refreshTokenRecord =
        await this.tokenService.persistRefreshToken(newUser);

      // make refreshToken
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        tokenId: refreshTokenRecord.id,
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

  login = async (req: LoginUserRequest, res: Response, next: NextFunction) => {
    // validations
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      const { email, password } = req.body;

      this.logger.debug("New Req to login a user", {
        email,
        password,
      });

      // here you will check the password of the user
      const user = await this.userService.findByEmail(email);
      if (!user) {
        const error = createHttpError(401, "Email or password is wrong");
        next(error);
        return;
      }

      const isPasswordCorrect = await this.credentialService.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordCorrect) {
        const error = createHttpError(401, "Email or password is wrong");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        id: String(user.id),
        role: user.role,
      };
      // make accessToken
      const accessToken = this.tokenService.generateAccessToken(payload);

      // make a record of refreshToken in db
      const refreshTokenRecord =
        await this.tokenService.persistRefreshToken(user);

      // make refreshToken
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        tokenId: refreshTokenRecord.id,
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

      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  };

  self = async (req: AuthRequest, res: Response) => {
    const userData = await this.userService.findById(Number(req.auth.id));
    return res.status(200).json({
      ...userData,
      password: undefined,
    });
  };
}
