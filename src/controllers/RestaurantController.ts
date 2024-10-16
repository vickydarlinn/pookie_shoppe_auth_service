import { NextFunction, Response, Request } from "express";
import { matchedData, validationResult } from "express-validator";
import { CreateRestaurantRequest, RestaurantQueryParams } from "../types";
import { Logger } from "winston";
import { RestaurantService } from "../services/RestaurantService";
import createHttpError from "http-errors";

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
      this.logger.info("restaurant has been created", { id: restaurant.id });

      res.status(201).json({ id: restaurant.id });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: CreateRestaurantRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { name, address } = req.body;
      const restaurantId = req.params.id;

      const isRestaurantExist = await this.restaurantService.getById(
        Number(restaurantId),
      );

      if (!isRestaurantExist) {
        const err = createHttpError(404, "Restaurant does not exit");
        this.logger.error("Restaurant does not exit", { id: restaurantId });
        return next(err);
      }

      await this.restaurantService.update(Number(restaurantId), {
        name,
        address,
      });
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = matchedData(req, { onlyValidData: true });

      const restaurants = await this.restaurantService.getAll(
        validatedQuery as RestaurantQueryParams,
      );

      this.logger.info("All restaurants have been fetched");
      res.json(restaurants);
    } catch (err) {
      next(err);
    }
  };
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const restaurantId = req.params.id;

    if (isNaN(Number(restaurantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const restaurant = await this.restaurantService.getById(
        Number(restaurantId),
      );

      if (!restaurant) {
        next(createHttpError(404, "restaurant does not exist."));
        return;
      }

      this.logger.info("restaurant has been fetched");
      res.json(restaurant);
    } catch (err) {
      next(err);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = req.params.id;
      const deletedRestaurant = await this.restaurantService.deleteById(
        Number(restaurantId),
      );
      if (!deletedRestaurant.affected) {
        return next(createHttpError(400, "Invalid url param."));
      }
      this.logger.info("restaurant has been deleted", {
        id: Number(restaurantId),
      });
      res.json({ id: Number(restaurantId) });
    } catch (error) {
      next(error);
    }
  };
}
