import { calculateDiscount } from "./src/utils";
import app from "./src/app";
import request from "supertest";

describe("app", () => {
  it("should calc the discount", () => {
    const discount = calculateDiscount(100, 10);
    expect(discount).toBe(10);
  });

  it("should return statusCode 200", async () => {
    const resp = await request(app).get("/").send();
    expect(resp.statusCode).toBe(200);
  });
});
