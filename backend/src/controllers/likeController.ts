import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";

// ✅ Like a Post
export const likePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: postId } = req.params;
    const userId = req.user?.id!; // Assuming user ID is extracted from auth middleware

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return next(new AppError("Post not found", 404));

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { userId, postId } },
    });

    if (existingLike)
      return next(new AppError("You have already liked this post", 400));

    // Create like
    await prisma.like.create({ data: { userId, postId } });

    res.status(201).json({ success: true, message: "Post liked successfully" });
  }
);

// ✅ Unlike a Post
export const unlikePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id: postId } = req.params;
    const userId = req.user?.id!;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return next(new AppError("Post not found", 404));

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: { postId_userId: { userId, postId } },
    });

    if (!existingLike)
      return next(new AppError("You haven't liked this post", 400));

    // Delete like
    await prisma.like.delete({ where: { postId_userId: { userId, postId } } });

    res
      .status(200)
      .json({ success: true, message: "Post unliked successfully" });
  }
);

// ✅ Get all Users who Liked a Post
export const getPostLikes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return next(new AppError("Post not found", 404));

    // Get all users who liked the post
    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, username: true, profilePicture: true } },
      },
    });

    res.status(200).json({ success: true, likes });
  }
);
