import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { RefreshToken } from "../../src/entity/RefreshToken";
import jwt from "jsonwebtoken";
import { Config } from "../../src/config";
import { response } from "express";

describe("POST /auth/refresh", () => {
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

  it("should return 401 if no refresh token is provided", async () => {
    // Act
    const response = await request(app).post("/auth/refresh").send();

    // Assert
    expect(response.statusCode).toBe(401);
  });

  it("should return 200 and new tokens if refresh token is valid", async () => {
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
      .post("/auth/refresh")
      .set("Cookie", [
        `accessToken=${accessToken};refreshToken=${refreshToken}`,
      ])
      .send();
    // Assert
    console.log(response.body);

    expect(response.statusCode).toBe(200);
  });
  // it("should return 401 if refresh token is invalid", async () => {
  //   // Arrange
  //   const invalidToken = "invalid-refresh-token";

  //   // Act
  //   const response = await request(app)
  //     .post("/auth/refresh")
  //     .set("Cookie", [`refreshToken=${invalidToken}`])
  //     .send();

  //   // Assert
  //   expect(response.statusCode).toBe(401);
  // });

  // it("should return 403 if refresh token is expired", async () => {
  //   // Arrange
  //   const expiredToken = jwks.token({
  //     id: "1",
  //     exp: Math.floor(Date.now() / 1000) - 3600, // set token to be expired
  //   });

  //   // Act
  //   const response = await request(app)
  //     .post("/auth/refresh")
  //     .set("Cookie", [`refreshToken=${expiredToken}`])
  //     .send();

  //   // Assert
  //   expect(response.statusCode).toBe(403);
  // });

  // it("should return 404 if refresh token is not found in the database", async () => {
  //   // Arrange
  //   const notInDatabaseToken = jwks.token({ id: "999" }); // token with non-existing user id

  //   // Act
  //   const response = await request(app)
  //     .post("/auth/refresh")
  //     .set("Cookie", [`refreshToken=${notInDatabaseToken}`])
  //     .send();

  //   // Assert
  //   expect(response.statusCode).toBe(404);
  // });

  // it("should revoke old refresh token after generating a new one", async () => {
  //   // Simulate a refresh token revocation test here
  // });

  // Additional tests for simultaneous requests, proper HTTP headers, etc.
});
