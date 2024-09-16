import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    const PORT = Config.PORT;
    app.listen(PORT, () => {
      logger.info(`Listening on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message, () => {
        process.exit(1);
      });
    }
  }
};

void startServer();
