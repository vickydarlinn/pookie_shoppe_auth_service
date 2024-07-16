import { config } from "dotenv";

config();

const { PORT, NODE_ENV, LOG_LEVEL } = process.env;

export const Config = {
  PORT,
  NODE_ENV,
  LOG_LEVEL,
};
