import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";

// ✅ Add a Comment
export const addComment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { postId, content } = req.body;
    const userId = req.user?.id!;

    if (!postId || !content) {
      return next(new AppError("Post ID and content are required", 400));
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    const comment = await prisma.comment.create({
      data: { userId, postId, content },
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  }
);

// ✅ Get Comments for a Post
export const getCommentsByPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      comments,
    });
  }
);

// ✅ Delete a Comment
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return next(new AppError("Comment not found", 404));
    }

    if (comment.userId !== userId) {
      return next(new AppError("Unauthorized to delete this comment", 403));
    }

    await prisma.comment.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  }
);
