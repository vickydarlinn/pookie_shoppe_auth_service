import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Restaurant } from "../../src/entity/Restaurant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /restaurants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();

    adminToken = jwks.token({
      id: "1",
      role: Roles.ADMIN,
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe("Given all fields", () => {
    it("should return a 201 status code", async () => {
      const restaurantData = {
        name: "Restaurant name",
        address: "Restaurant address",
      };
      const response = await request(app)
        .post("/restaurants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(restaurantData);

      expect(response.statusCode).toBe(201);
    });

    it("should create a restaurant in the database", async () => {
      const restaurantData = {
        name: "Restaurant name",
        address: "Restaurant address",
      };

      await request(app)
        .post("/restaurants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(restaurantData);

      const restaurantRepository = connection.getRepository(Restaurant);
      const restaurants = await restaurantRepository.find();
      expect(restaurants).toHaveLength(1);
      expect(restaurants[0].name).toBe(restaurantData.name);
      expect(restaurants[0].address).toBe(restaurantData.address);
    });

    it("should return 401 if user is not authenticated", async () => {
      const restaurantData = {
        name: "Restaurant name",
        address: "Restaurant address",
      };

      const response = await request(app)
        .post("/restaurants")
        .send(restaurantData);
      expect(response.statusCode).toBe(401);

      const restaurantRepository = connection.getRepository(Restaurant);

      const restaurants = await restaurantRepository.find();

      expect(restaurants).toHaveLength(0);
    });

    it("should return 403 if user is not an admin", async () => {
      const managerToken = jwks.token({
        id: "1",
        role: Roles.MANAGER,
      });

      const restaurantData = {
        name: "Restaurant name",
        address: "Restaurant address",
      };

      const response = await request(app)
        .post("/restaurants")
        .set("Cookie", [`accessToken=${managerToken}`])
        .send(restaurantData);
      expect(response.statusCode).toBe(403);
      const restaurantRepository = connection.getRepository(Restaurant);
      const restaurants = await restaurantRepository.find();
      expect(restaurants).toHaveLength(0);
    });
  });
});
