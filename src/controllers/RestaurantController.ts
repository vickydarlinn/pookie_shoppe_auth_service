import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import { CreateRestaurantRequest } from "../types";
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
      this.logger.info("Tenant has been created", { id: restaurant.id });

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
      const tenantId = req.params.id;

      const isRestaurantExist = await this.restaurantService.getById(
        Number(tenantId),
      );
      if (!isRestaurantExist) {
        const err = createHttpError(404, "Restaurant does not exit");
        this.logger.error("Restaurant does not exit", { id: tenantId });
        return next(err);
      }

      await this.restaurantService.update(Number(tenantId), {
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
      const tenants = await this.restaurantService.getAll();

      this.logger.info("All tenant have been fetched");
      res.json(tenants);
    } catch (err) {
      next(err);
    }
  };
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const tenant = await this.restaurantService.getById(Number(tenantId));

      if (!tenant) {
        next(createHttpError(404, "Tenant does not exist."));
        return;
      }

      this.logger.info("Tenant has been fetched");
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.params.id;
      const deletedRestaurant = await this.restaurantService.deleteById(
        Number(tenantId),
      );
      if (!deletedRestaurant) {
        return next(createHttpError(400, "Invalid url param."));
      }
      this.logger.info("Tenant has been deleted", {
        id: Number(tenantId),
      });
      res.json({ id: Number(tenantId) });
    } catch (error) {
      next(error);
    }
  };
}
