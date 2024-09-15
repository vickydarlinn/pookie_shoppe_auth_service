import fs from "fs";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    const privateKey = fs.readFileSync(
      path.join(__dirname, "../../certs/private.pem"),
    );

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256", // RS256 algorithm
      expiresIn: "1h", // Token expires in 1 hour
      issuer: "auth-service",
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
    });
    return refreshToken;
  }

  async persistRefreshToken(newUser: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)
    const refreshTokenRecord = await this.refreshTokenRepository.save({
      user: newUser,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return refreshTokenRecord;
  }
}
