import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { CreateRestaurantRequest } from "../types";
import { Logger } from "winston";
import { RestaurantService } from "../services/RestaurantService";

export class RestaurantController {
  constructor(
    private logger: Logger,
    private restaurantService: RestaurantService,
  ) {}
  create = async (
    req: CreateRestaurantRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      const { name, address } = req.body;
      this.logger.debug("Request for creating a restaurant", req.body);

      const restaurant = await this.restaurantService.create({ name, address });
      this.logger.info("Tenant has been created", { id: restaurant.id });

      res.status(201).json({ id: restaurant.id });
    } catch (error) {
      next(error);
    }
  };
}
