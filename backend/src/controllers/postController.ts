import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// ✅ Create a Post
export const createPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, content } = req.body;

    if (!userId || !content) {
      return next(new AppError("User ID and content are required", 400));
    }

    const post = await prisma.post.create({
      data: { userId, content },
    });

    res.status(201).json({ success: true, data: post });
  }
);

// ✅ Get All Posts
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany({ include: { user: { omit: { refreshToken: true, password: true,   } } } });
  res.json({ success: true, data: posts });
});

// ✅ Get a Post by ID
export const getPostById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!post) return next(new AppError("Post not found", 404));

    res.json({ success: true, data: post });
  }
);

// ✅ Update a Post
export const updatePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id!

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return next(new AppError("Post not found", 404));
    if (post.userId !== userId) return next(new AppError("Unauthorized", 403));

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content },
    });

    res.json({ success: true, data: updatedPost });
  }
);

// ✅ Delete a Post
export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const userId = req.user?.id!

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return next(new AppError("Post not found", 404));
    if (post.userId !== userId) return next(new AppError("Unauthorized", 403));

    await prisma.post.delete({ where: { id } });

    res.json({ success: true, message: "Post deleted successfully" });
  }
);

// ✅ Get All Posts by a User
export const getUserPosts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const posts = await prisma.post.findMany({
      where: { userId: id },
    });

    res.json({ success: true, data: posts });
  }
);
