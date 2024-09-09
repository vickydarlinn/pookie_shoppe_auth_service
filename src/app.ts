import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/auth", authRouter);

app.get("/test", (req, res, next) => {
  try {
    throw new Error("my testing error");
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  let message = "Internal server error";
  const statusCode = err.statusCode || 500;

  if (statusCode === 400) {
    message = err.message;
  }
  logger.error(err.message);

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: message,
        path: req.path,
        method: req.method,
        location: "server",
      },
    ],
  });
});
export default app;
