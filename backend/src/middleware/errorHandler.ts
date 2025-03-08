import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import logger from "../utils/logger";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err); // Pass to Express default error handler if response was already sent
  }

  let { statusCode, message } = err as AppError;

  if (!statusCode) statusCode = 500;

  logger.error(`[${req.method}] ${req.url} - ${message}`);

  res.status(statusCode).json({
    succes: false,
    message,
    stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
  });
};

export default errorHandler;
