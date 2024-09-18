import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
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
    it("should return the 200 status code", async () => {
      const accessToken = jwks.token({
        id: "1",
      });
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(200);
    });
    it("should return 401 status code for unauthorized", async () => {
      // Arrange
      // Act
      const response = await request(app).get("/auth/self");
      // Assert
      expect(response.statusCode).toBe(401);
    });
    it("should return user data", async () => {
      // Arrange
      // Register user
      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "rakesh@mern.space",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      // Generate token
      const accessToken = jwks.token({
        id: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // Assert
      expect(response.body.id).toBe(data.id);
    });
  });
});
