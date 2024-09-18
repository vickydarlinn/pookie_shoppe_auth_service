import { expressjwt as expressJwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
import { AuthCookie } from "../types";

// Extract the token from the request

const extractTokenFromRequest = (req: Request): string | undefined => {
  return (req.cookies as AuthCookie)?.accessToken ?? undefined;
};
// Create and export the middleware
export const authenticate = expressJwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken: extractTokenFromRequest,
});
