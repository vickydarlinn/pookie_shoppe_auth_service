import { DataSource } from "typeorm";
import app from "../../src/app";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
// import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

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
});
