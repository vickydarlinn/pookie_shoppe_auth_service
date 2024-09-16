import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { RefreshToken } from "../../src/entity/RefreshToken";
import bcrypt from "bcrypt";
import { Roles } from "../../src/constants";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe("given all fields", () => {
    it("should return 200 status code", async () => {
      // Arrange
      const userData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
        firstName: "vicky",
        lastName: "sangwan",
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      const loginData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };

      //   Act
      const response = await request(app).post("/auth/login").send(loginData);
      //   Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return valid json response", async () => {
      // Arrange
      const loginData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/login").send(loginData);
      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });
    it("should return user id", async () => {
      // Arrange
      const userData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
        firstName: "vicky",
        lastName: "sangwan",
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      const loginData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/login").send(loginData);
      // Assert
      expect(response.body.id).toBeDefined();
    });
    it("should return the access token and refresh token in cookie", async () => {
      // Arrange
      const userData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
        firstName: "vicky",
        lastName: "sangwan",
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      const loginData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/login").send(loginData);

      // Assert
      let cookies = response.headers["set-cookie"] as string | string[];

      // If set-cookie is a string, wrap it in an array
      if (!Array.isArray(cookies)) {
        cookies = [cookies];
      }

      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.includes("accessToken"),
      );
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.includes("refreshToken"),
      );

      // Assert that both cookies exist
      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
    });
    it("should store the refresh token in database and associate it with the user", async () => {
      // Arrange
      const userData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
        firstName: "vicky",
        lastName: "sangwan",
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      const loginData = {
        email: " uttapalsangwan@gmail.com ",
        password: "secret",
      };
      //   Act
      const response = await request(app).post("/auth/login").send(loginData);

      //  Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);

      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });
  describe("fields are missing", () => {
    it("should return 400 status code if email is missing", async () => {
      // Arrange
      const userData = {
        email: "",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/login").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if password is missing", async () => {
      // Arrange
      const userData = {
        email: "abc@gmail.com",
        password: "",
      };
      //Act
      const response = await request(app).post("/auth/login").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });
  describe("fields are not in proper format", () => {
    it("should trim the email field", async () => {
      // Arrange
      const userData = {
        email: "uttapalsangwan@gmail.com",
        password: "secret",
        firstName: "vicky",
        lastName: "sangwan",
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      const loginData = {
        email: " uttapalsangwan@gmail.com ",
        password: "secret",
      };
      //Act
      await request(app).post("/auth/login").send(loginData);
      // Asset

      const users = await userRepository.find();
      const user = users[0];
      expect(user.email).toBe("uttapalsangwan@gmail.com");
    });
  });
});
