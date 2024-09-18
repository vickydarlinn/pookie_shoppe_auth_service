import { expressjwt as expressJwt } from "express-jwt";
import { Request } from "express";
import { Config } from "../config";
import { AuthCookie } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { JwtPayload } from "jsonwebtoken";
import { IPayload } from "../types";
import logger from "../config/logger";

// Extract the token from the request
const extractTokenFromRequest = (req: Request): string | undefined => {
  return (req.cookies as AuthCookie)?.refreshToken ?? undefined;
};

const isRevokedCallback = async (
  req: Request,
  token: JwtPayload | undefined,
) => {
  try {
    if (!token || typeof token.payload !== "object") {
      // If there's no token or the payload isn't an object, it's revoked or invalid
      return true;
    }

    const payload = token.payload as IPayload; // Safely cast the payload to IPayload
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const refreshToken = await refreshTokenRepository.findOne({
      where: {
        id: Number(payload.id),
        user: { id: Number(payload.id) }, // Assuming the RefreshToken entity has a relation with a user entity
      },
    });

    // If the token does not exist in the database, it's revoked
    return refreshToken === null;
  } catch (error) {
    logger.error("Error while getting the refresh token", {
      id: (token?.payload as IPayload)?.id, // Log the ID if available
    });
  }

  // If something goes wrong, treat the token as revoked
  return true;
};

// Create and export the middleware
export const validateRefreshToken = expressJwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken: extractTokenFromRequest,
  isRevoked: isRevokedCallback,
});
