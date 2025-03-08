import asyncHandler from "../middleware/asyncHandler";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../config/prisma";

export const uploadProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError("Please upload a file", 400));
    }

    const result = await cloudinary.uploader
      .upload_stream({ folder: "profile_pictures" }, async (error, result) => {
        if (error)
          return next(
            new AppError(
              `Cloudinary upload failed ${JSON.stringify(error)}`,
              500
            )
          );

        // Update the user profile picture in DB
        const userId = req.user?.id; // Ensure user is authenticated
        if (!userId) return next(new AppError("Unauthorized", 401));

        await prisma.user.update({
          where: { id: userId },
          data: { profilePicture: result?.secure_url },
        });

        res.json({ url: result?.secure_url });
      })
      .end(req.file.buffer);
  }
);

// ✅ Upload Post Images
export const uploadPostImage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const result = cloudinary.uploader
      .upload_stream({ folder: "post_images" }, async (error, result) => {
        if (error) return next(new AppError("Cloudinary upload failed", 500));

        // Save the image URL in the Post record
        const userId = req.user?.id;
        if (!userId) return next(new AppError("Unauthorized", 401));

        const newPost = await prisma.post.create({
          data: {
            userId,
            imageUrl: result?.secure_url,
            content: req.body.content,
          },
        });

        res.json({ postId: newPost.id, url: result?.secure_url });

        res.json({ url: result?.secure_url });
      })
      .end(req.file.buffer);
  }
);
