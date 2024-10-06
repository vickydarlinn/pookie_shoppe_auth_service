import { RequestHandler, Router } from "express";
import { RestaurantController } from "../controllers/RestaurantController";
import restaurantValidator from "../validators/restaurantValidator";
import logger from "../config/logger";
import { RestaurantService } from "../services/RestaurantService";
import { Restaurant } from "../entity/Restaurant";
import { AppDataSource } from "../config/data-source";
import { authenticate } from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = Router();

const restaurantRepository = AppDataSource.getRepository(Restaurant);
const restaurantService = new RestaurantService(restaurantRepository);

const restaurantController = new RestaurantController(
  logger,
  restaurantService,
);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  restaurantValidator,
  restaurantController.create as RequestHandler,
);

export default router;
