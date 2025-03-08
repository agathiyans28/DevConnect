import { Response, Request, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../config/generateToken";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";

const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (
  username: string,
  email: string,
  password: string
) => {
  return await prisma.user.create({
    data: { username, email, password },
  });
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);

      const existingUser = await getUserByEmail(validatedData.email);
      if (existingUser) return next(new AppError("Email already exists", 400));

      const { username, email, password } = validatedData;

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser(username, email, hashedPassword);

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      next(new AppError(`Register Error: ${error}`, 500));
    }
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = loginSchema.parse(req.body);

    try {
      const user = await getUserByEmail(validatedData.email);
      if (!user) return next(new AppError(`Invalid email or password!`, 401));

      const isMatched = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isMatched)
        return next(new AppError(`Invalid email or password!`, 401));

      const accessToken = generateAccessToken(user.id, user.username);
      const refreshToken = generateRefreshToken(user.id);

      // Save refresh token in DB
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Send refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.json({
        accessToken,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      next(new AppError(`Login Error: ${error}`, 500));
    }
  }
);

/**
 * Refresh Token
 */

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken as string;
      if (!token) return next(new AppError("Token required", 401));

      const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: string };

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          refreshToken: token,
        },
      });

      if (!user) return next(new AppError("User not found", 404));

      const accessToken = generateAccessToken(user.id, user.username);
      res.json({ accessToken });
    } catch (error) {
      next(new AppError(`Refresh Access Token Error: ${error}`, 500));
    }
  }
);

/**
 * Logout User
 */
export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken");

      await prisma.user.updateMany({
        where: { refreshToken: req.cookies.refreshToken },
        data: { refreshToken: null },
      });

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(new AppError(`Logout Error: ${error}`, 500));
    }
  }
);

/**
 * Get Authenticated User
 */
export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.user!;

    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: { id: true, username: true, email: true },
      });

      if (!user) return next(new AppError("User not found", 404));

      res.json(user);
    } catch (error) {
      next(new AppError(`Error: ${error}`, 500));
    }
  }
);
