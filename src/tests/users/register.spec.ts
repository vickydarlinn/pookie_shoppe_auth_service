import app from "../../app";
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
});
