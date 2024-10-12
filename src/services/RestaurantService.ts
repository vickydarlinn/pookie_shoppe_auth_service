import { Repository } from "typeorm";
import { IRestaurant } from "../types";
import { Restaurant } from "../entity/Restaurant";

export class RestaurantService {
  constructor(private restaurantRepository: Repository<Restaurant>) {}

  async create(restaurantData: IRestaurant) {
    return await this.restaurantRepository.save(restaurantData);
  }

  async update(id: number, restaurantData: IRestaurant) {
    return await this.restaurantRepository.update(id, restaurantData);
  }

  async getAll() {
    return await this.restaurantRepository.find();
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
