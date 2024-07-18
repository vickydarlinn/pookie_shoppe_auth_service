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
  it("should return valid response", async () => {
    const userData = {
      name: "vicky",
      email: "vickysangwan@gmail.com",
      password: "secretPass",
    };
    const response = await request(app).post("/auth/register").send(userData);
    expect(response.header["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
});
