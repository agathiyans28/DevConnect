import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";

// ✅ GET /api/notifications - Get all notifications for a user
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Get user ID from auth middleware

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: notifications });
  }
);

// ✅ POST /api/notifications/mark-as-read - Mark notifications as read
export const markNotificationsAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res
      .status(200)
      .json({ success: true, message: "Notifications marked as read" });
  }
);
