import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";

export interface AuthRequest extends Request {
  user?: { id: string, username: string };
}

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "") as string;

  if (!token) return next(new AppError("Token required", 401));

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: string, username: string };
    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch (error) {
    next(new AppError(`Auth Error: ${error}`, 401));
  }
};
