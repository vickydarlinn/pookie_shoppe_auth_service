import app from "../../src/app";
import request from "supertest";

describe("POST /auth/register", () => {
  it("should return 201 status code", async () => {
    const userData = {
      name: "vicky",
      email: "vickysangwan@gmail.com",
      password: "secretPass",
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
  });
});
