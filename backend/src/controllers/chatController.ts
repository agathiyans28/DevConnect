import asyncHandler from "../middleware/asyncHandler";
import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import AppError from "../utils/appError";
import { prisma } from "../config/prisma";

export const createOrFetchChat = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const loggedInUserId = req.user?.id!;

    if (!userId) return next(new AppError("User ID is required", 400));

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return next(new AppError("User not found", 404));

    let chat = await prisma.chat.findFirst({
      where: {
        users: { every: { id: { in: [loggedInUserId, userId] } } },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: { users: { connect: [{ id: loggedInUserId }, { id: userId }] } },
      });
    }

    res.status(200).json(chat);
  }
);

export const getUserChats = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    if (!userId) return next(new AppError("User ID is required", 400));

    const chats = await prisma.chat.findMany({
      where: { users: { some: { id: userId } } },
      include: { users: { omit: { refreshToken: true, password: true } }, messages: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(chats);
  }
);
