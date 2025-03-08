import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

/**
 * Generate Access Token (Short-lived)
 */
export const generateAccessToken = (userId: string, username: string): string => {
  return jwt.sign({ userId, username }, ACCESS_SECRET, { expiresIn: "1d" });
};

/**
 * Generate Refresh Token (Long-lived)
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
};
