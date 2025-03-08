import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";
import asyncHandler from "../middleware/asyncHandler";
import AppError from "../utils/appError";

// ✅ 1. Get all users
export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          skills: true,

          followers: true,
          following: true,
        },
      });
      res.json(users);
    } catch (error) {
      next(new AppError("Error fetching users", 500));
    }
  }
);

// ✅ 2. Get user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        skills: true,
        followers: true,
        following: true,
      },
    });

    if (!user) return next(new AppError("User not found", 404));

    res.json(user);
  } catch (error) {
    next(new AppError("Error fetching users", 500));
  }
};

// ✅ 3. Update user profile (Protected Route)
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!; // Get user ID from JWT
    const { username, bio, skills, profilePicture } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, bio, skills, profilePicture },
    });

    res.json(updatedUser);
  } catch (error) {
    next(new AppError("Error updating profile", 500));
  }
};

// ✅ 4. Delete user account (Protected Route)
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(new AppError("Error deleting user", 500));
  }
};

// ✅ 5. Follow a user (Protected Route)
export const followUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const { userId } = req.body as { userId: string };

    if (!userId) return next(new AppError("FollowingId required", 400));

    if (id === userId)
      return next(new AppError("You cannot follow yourself", 400));

    await prisma.follower.upsert({
      where: {
        followerId_followingId: {
          followerId: id,
          followingId: userId,
        },
      },
      create: { followerId: id, followingId: userId },
      update: {},
    });

    // 🔔 Create a notification
    await prisma.notification.create({
      data: {
        userId,
        type: "follow",
        message: `${req.user?.username} started following you`,
      },
    });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    next(new AppError("Error following user", 500));
  }
};

// ✅ 6. Unfollow a user (Protected Route)
export const unfollowUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const { userId } = req.body as { userId: string };

    if (!userId) return next(new AppError("FollowingId required", 400));

    await prisma.follower.deleteMany({
      where: { followerId: id, followingId: userId },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    next(new AppError("Error unfollowing user", 500));
  }
};

// ✅ 7. Get Followers
export const getFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body as { userId: string };

    if (!userId) return next(new AppError("FollowingId required", 400));

    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, username: true } } },
    });

    res.json(followers.map((f) => f.follower));
  } catch (error) {
    next(new AppError("Error fetching followers", 500));
  }
};

// ✅ 8. Get Following
export const getFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body as { userId: string };

    if (!userId) return next(new AppError("FollowerId required", 400));

    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, username: true } } },
    });

    res.json(following.map((f) => f.following));
  } catch (error) {
    next(new AppError("Error fetching following users", 500));
  }
};
