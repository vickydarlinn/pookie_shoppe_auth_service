import { Request, Response } from "express";

export class AuthController {
  register = (req: Request, res: Response) => {
    res.statusCode = 201;
    res.send();
  };
}
