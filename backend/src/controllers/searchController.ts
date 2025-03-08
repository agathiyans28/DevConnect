import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";
import { prisma } from "../config/prisma";

/**
 * @desc    Search for users, posts, and tags based on query
 * @route   GET /api/search?query=xyz
 * @access  Public
 */
export const searchAll = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query as { query?: string };

    if (!query || query.trim() === "") {
      return next(new AppError("Query parameter is required", 400));
    }

    // Search for Users (by username and bio)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, bio: true, profilePicture: true },
    });

    // Search for Posts (by content)
    const posts = await prisma.post.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
      },
      select: { id: true, content: true, userId: true, createdAt: true },
    });

    res.status(200).json({ users, posts });
  }
);
