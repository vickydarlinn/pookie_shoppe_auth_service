import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  restaurantId?: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface UserQueryParams {
  items: number;
  page: number;
  q: string;
  role: string;
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

export interface RestaurantQueryParams {
  q: string;
  items: number;
  page: number;
}

export interface CreateRestaurantRequest extends Request {
  body: IRestaurant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface LimitedUserData {
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}
