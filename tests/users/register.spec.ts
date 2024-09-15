import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
// import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    // we will clear the whole db so that it will not effect other tests
    // await truncateTables(connection);

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe("given all fields", () => {
    it("should return 201 status code", async () => {
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      const response = await request(app).post("/auth/register").send(userData);
      // Assert application/json utf-8
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should persist the user in the database", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
    it("should return user id", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      // const response = await request(app).post("/auth/register").send(userData);
      const response = await request(app).post("/auth/register").send(userData);
      // Assert
      expect(response.body.id).toBeDefined();
    });

    it("should assign customer role", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      // Act
      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
    it("should store hashed pass in db", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      //Act
      await request(app).post("/auth/register").send(userData);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });
    it("this should return 400 status code if email is already exist", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      //Assert
      expect(response.statusCode).toBe(400);
      expect(users.length).toBe(1);
    });
    it("should return the access token and refresh token in cookie", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

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
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

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
        firstName: "vicky",
        lastName: "sangwan",
        email: "",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if firstName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if lastName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "",
        email: "uttapalsangwan@gmail.com",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it("should return 400 status code if password is missing", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "abc@gmail.com",
        password: "",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
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
        firstName: "vicky",
        lastName: "sangwan",
        email: " uttapalsangwan@gmail.com ",
        password: "secret",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      // Asset
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];
      expect(user.email).toBe("uttapalsangwan@gmail.com");
    });
    it("should return 400 status code if pass length is less than 6", async () => {
      // Arrange
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "small",
      };
      //Act
      const response = await request(app).post("/auth/register").send(userData);
      // Asset
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });
});
