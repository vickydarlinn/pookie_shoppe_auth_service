import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Restaurant } from "../../src/entity/Restaurant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("patch /restaurants/:id", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;
  let restaurant: Restaurant;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();

    adminToken = jwks.token({
      sub: "1",
      role: Roles.ADMIN,
    });

    const restaurantRepository = connection.getRepository(Restaurant);
    restaurant = restaurantRepository.create({
      name: "Initial Restaurant",
      address: "Initial Address",
    });
    await restaurantRepository.save(restaurant);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe("Given valid restaurant ID and fields", () => {
    it("should return a 200 status code", async () => {
      const updatedData = {
        name: "Updated Restaurant Name",
        address: "Updated Address",
      };

      const response = await request(app)
        .patch(`/restaurants/${restaurant.id}`)
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(updatedData);

      expect(response.statusCode).toBe(200);
    });

    it("should update the restaurant in the database", async () => {
      const updatedData = {
        name: "Updated Restaurant Name",
        address: "Updated Address",
      };

      await request(app)
        .patch(`/restaurants/${restaurant.id}`)
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(updatedData);

      const restaurantRepository = connection.getRepository(Restaurant);
      const updatedRestaurant = await restaurantRepository.findOneBy({
        id: restaurant.id,
      });

      expect(updatedRestaurant?.name).toBe(updatedData.name);
      expect(updatedRestaurant?.address).toBe(updatedData.address);
    });

    it("should return 401 if user is not authenticated", async () => {
      const updatedData = {
        name: "Updated Restaurant Name",
        address: "Updated Address",
      };

      const response = await request(app)
        .patch(`/restaurants/${restaurant.id}`)
        .send(updatedData);

      expect(response.statusCode).toBe(401);

      const restaurantRepository = connection.getRepository(Restaurant);
      const unchangedRestaurant = await restaurantRepository.findOneBy({
        id: restaurant.id,
      });

      expect(unchangedRestaurant?.name).toBe(restaurant.name);
      expect(unchangedRestaurant?.address).toBe(restaurant.address);
    });

    it("should return 403 if user is not an admin", async () => {
      const managerToken = jwks.token({
        sub: "1",
        role: Roles.MANAGER,
      });

      const updatedData = {
        name: "Updated Restaurant Name",
        address: "Updated Address",
      };

      const response = await request(app)
        .patch(`/restaurants/${restaurant.id}`)
        .set("Cookie", [`accessToken=${managerToken}`])
        .send(updatedData);

      expect(response.statusCode).toBe(403);

      const restaurantRepository = connection.getRepository(Restaurant);
      const unchangedRestaurant = await restaurantRepository.findOneBy({
        id: restaurant.id,
      });

      expect(unchangedRestaurant?.name).toBe(restaurant.name);
      expect(unchangedRestaurant?.address).toBe(restaurant.address);
    });

    it("should return 404 if restaurant does not exist", async () => {
      const nonExistentId = 999;
      const updatedData = {
        name: "Updated Restaurant Name",
        address: "Updated Address",
      };

      const response = await request(app)
        .patch(`/restaurants/${nonExistentId}`)
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(updatedData);

      expect(response.statusCode).toBe(404);
    });
  });
});
