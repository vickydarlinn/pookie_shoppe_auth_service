import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?: number;
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
  auth: IPayload;
}

export type IPayload = {
  id: string;
  role: string;
  tokenId?: number;
};

export interface IRestaurant {
  name: string;
  address: string;
}

export interface CreateRestaurantRequest extends Request {
  body: IRestaurant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}
