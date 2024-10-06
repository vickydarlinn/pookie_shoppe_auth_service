import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { Restaurant } from "../../src/entity/Restaurant";
import { createRestaurant } from "../utils";

describe("POST /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should persist the user in the database", async () => {
      // Create restaurant first
      const restaurant = await createRestaurant(
        connection.getRepository(Restaurant),
      );

      const adminToken = jwks.token({
        id: "1",
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "password",
        tenantId: restaurant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("should create a manager user", async () => {
      // Create restaurant
      const restaurant = await createRestaurant(
        connection.getRepository(Restaurant),
      );

      const adminToken = jwks.token({
        id: "1",
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "password",
        tenantId: restaurant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it("should return 403 if non admin user tries to create a user", async () => {
      // Create tenant first
      const tenant = await createRestaurant(
        connection.getRepository(Restaurant),
      );

      const nonAdminToken = jwks.token({
        id: "1",
        role: Roles.MANAGER,
      });

      const userData = {
        firstName: "vicky",
        lastName: "sangwan",
        email: "uttapalsangwan@gmail.com",
        password: "password",
        tenantId: tenant.id,
      };

      // Add token to cookie
      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${nonAdminToken}`])
        .send(userData);

      expect(response.statusCode).toBe(403);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });
  });
});
