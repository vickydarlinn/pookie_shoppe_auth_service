import "reflect-metadata";
import express from "express";
import authRouter from "./routes/auth";
import restaurantRouter from "./routes/restaurant";
import userRouter from "./routes/user";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Config } from "./config";
import { globalErrorHandler } from "./routes/globalErrorHandler";

const app = express();
const ALLOWED_DOMAINS = [
  Config.CLIENT_UI_DOMAIN,
  Config.ADMIN_UI_DOMAIN,
  "http://localhost:5174",
];
app.use(
  cors({
    origin: ALLOWED_DOMAINS as string[],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/auth", authRouter);
app.use("/restaurants", restaurantRouter);
app.use("/users", userRouter);

app.get("/test", (req, res, next) => {
  try {
    throw new Error("my testing error");
  } catch (error) {
    next(error);
  }
});

app.use(globalErrorHandler);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//   let message = "Internal server error";
//   const statusCode = err.statusCode || err.status || 500;

//   if (statusCode === 400) {
//     message = err.message;
//   }
//   logger.error(err.message);

//   res.status(statusCode).json({
//     errors: [
//       {
//         type: err.name,
//         msg: message,
//         path: req.path,
//         method: req.method,
//         location: "server",
//       },
//     ],
//   });
// });
export default app;
