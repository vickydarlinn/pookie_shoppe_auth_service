import { Repository } from "typeorm";
import { IRestaurant } from "../types";
import { Restaurant } from "../entity/Restaurant";

export class RestaurantService {
  constructor(private restaurantRepository: Repository<Restaurant>) {}

  async create(tenantData: IRestaurant) {
    return await this.restaurantRepository.save(tenantData);
  }

  async update(id: number, tenantData: IRestaurant) {
    return await this.restaurantRepository.update(id, tenantData);
  }

  async getAll() {
    return await this.restaurantRepository.find();
  }

  async getById(tenantId: number) {
    return await this.restaurantRepository.findOne({ where: { id: tenantId } });
  }

  async deleteById(tenantId: number) {
    return await this.restaurantRepository.delete(tenantId);
  }
}
