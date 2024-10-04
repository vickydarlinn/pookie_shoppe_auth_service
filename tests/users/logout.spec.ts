import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { Config } from "../../src/config";
import jwt from "jsonwebtoken";

describe("POST /auth/logout", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();
  });

  afterEach(() => {
    jwks.stop();
  });
  afterAll(async () => {
    await connection.destroy();
  });
  describe("given all fields", () => {
    it("should return 401 if no token is provided during logout", async () => {
      // Act
      const response = await request(app).post("/auth/logout").send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
    it("should return 200 on success logout", async () => {
      // Arrange
      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      // Create and save a user
      const user = await userRepository.save({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password",
        role: Roles.CUSTOMER, // Include the role here
      });
      // Generate and save a refresh token
      const refreshTokenRecord = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
      // Use jsonwebtoken to sign the refresh token with HS256
      const refreshToken = jwt.sign(
        {
          id: String(user.id), // user ID
          role: user.role, // user role
          tokenId: refreshTokenRecord.id, // ID of the refresh token
        },
        Config.REFRESH_TOKEN_SECRET!, // Your refresh token secret key
        { algorithm: "HS256", expiresIn: "1d" }, // Use HS256 and set expiry
      );

      // Generate an access token for the test
      const accessToken = jwks.token({
        id: String(user.id),
        role: user.role,
      });

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken};refreshToken=${refreshToken}`,
        ])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should remove cookies on success logout", async () => {
      // Arrange
      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);

      // Create and save a user
      const user = await userRepository.save({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password",
        role: Roles.CUSTOMER,
      });

      // Generate and save a refresh token
      const refreshTokenRecord = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });

      // Use jsonwebtoken to sign the refresh token with HS256
      const refreshToken = jwt.sign(
        {
          id: String(user.id),
          role: user.role,
          tokenId: refreshTokenRecord.id,
        },
        Config.REFRESH_TOKEN_SECRET!,
        { algorithm: "HS256", expiresIn: "1d" },
      );

      // Generate an access token for the test
      const accessToken = jwks.token({
        id: String(user.id),
        role: user.role,
      });

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken};refreshToken=${refreshToken}`,
        ])
        .send();

      // Assert
      // Check that the accessToken cookie is cleared
      const cookieHeader = response.headers["set-cookie"];
      const cookies: string[] = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];

      expect(cookies).toBeDefined();
      const clearedAccessToken = cookies.find((cookie: string) =>
        cookie.includes("accessToken=;"),
      );
      expect(clearedAccessToken).toBeDefined();

      // Check that the refreshToken cookie is cleared
      const clearedRefreshToken = cookies.find((cookie: string) =>
        cookie.includes("refreshToken=;"),
      );
      expect(clearedRefreshToken).toBeDefined();
    });

    it("should remove the refresh token from the db on success logout", async () => {
      // Arrange
      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      // Create and save a user
      await userRepository.save({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password",
        role: Roles.CUSTOMER, // Include the role here
      });
      const tokens = await refreshTokenRepository.find();

      await request(app)
        .post("/auth/logout")
        .set(
          "Cookie",
          `accessToken=accesstokenwillcomehere;refreshToken=refreshtokencomehere`,
        )
        .send();
      // Assert
      expect(tokens.length).toBe(0);
    });
  });
});
