import { Repository } from "typeorm";
import { IRestaurant, RestaurantQueryParams } from "../types";
import { Restaurant } from "../entity/Restaurant";

export class RestaurantService {
  constructor(private restaurantRepository: Repository<Restaurant>) {}

  async create(restaurantData: IRestaurant) {
    return await this.restaurantRepository.save(restaurantData);
  }

  async update(id: number, restaurantData: IRestaurant) {
    return await this.restaurantRepository.update(id, restaurantData);
  }

  async getAll({ q, page = 1, items = 5 }: RestaurantQueryParams) {
    const queryBuilder = this.restaurantRepository
      .createQueryBuilder("restaurant")
      .orderBy("restaurant.createdAt", "DESC");

    // Apply search filter if 'q' is provided
    if (q) {
      queryBuilder.andWhere(
        "restaurant.name ILIKE :q OR restaurant.address ILIKE :q",
        { q: `%${q}%` },
      );
    }
    // Apply pagination
    queryBuilder.skip((page - 1) * items).take(items);

    // Execute query and return paginated results
    const [restaurants, total] = await queryBuilder.getManyAndCount();
    return {
      data: restaurants,
      total,
      page,
      items,
    };
  }

  async getById(restaurantId: number) {
    return await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });
  }

  async deleteById(restaurantId: number) {
    return await this.restaurantRepository.delete(restaurantId);
  }
}
