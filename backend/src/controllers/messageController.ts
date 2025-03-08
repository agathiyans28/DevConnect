import asyncHandler from "../middleware/asyncHandler";
import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import AppError from "../utils/appError";
import { prisma } from "../config/prisma";
import { getIO } from "../config/socket";

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { chatId, content } = req.body;
    const senderId = req.user?.id!;

    if (!chatId || !content)
      return next(
        new AppError("Chat ID and message content are required", 400)
      );

    const message = await prisma.message.create({
      data: { chatId, senderId, content },
      include: { sender: { omit: { refreshToken: true, password: true } } },
    });

    const io = getIO()
    io.to(chatId).emit("receive_message", message);
    
    res.status(201).json(message);
  }
);

export const getMessages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId;

    if (!chatId) return next(new AppError("Chat ID id required", 400));

    const message = await prisma.message.findMany({
      where: { chatId },
      include: { sender: { omit: { refreshToken: true, password: true } } },
      orderBy: { createdAt: "asc" }
    });

    res.status(200).json(message);
  }
);
