import { DataSource, Repository } from "typeorm";
import { Restaurant } from "../../src/entity/Restaurant";

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const createRestaurant = async (repository: Repository<Restaurant>) => {
  const restaurant = await repository.save({
    name: "Test restaurant",
    address: "Test address",
  });
  return restaurant;
};
