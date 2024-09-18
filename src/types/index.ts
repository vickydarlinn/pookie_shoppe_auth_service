import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface LoginData {
  email: string;
  password: string;
}
export interface LoginUserRequest extends Request {
  body: LoginData;
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    id: string;
    role: string;
  };
}
