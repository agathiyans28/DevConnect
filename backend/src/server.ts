import express, { Response, Request, NextFunction } from "express";
import http from "http";
import userRoutes from "./routes/userRoutes";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
import { protect } from "./middleware/authMiddleware";
import AppError from "./utils/appError";
import errorHandler from "./middleware/errorHandler";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import { initializeSocket } from "./config/socket";
import notificationRoutes from "./routes/notificationRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import { searchAll } from "./controllers/searchController";
var cors = require("cors");
var cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);

initializeSocket(server).listen(8081);

app.use(express.json());
app.use(cookieParser()); // Enables reading cookies
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", protect, userRoutes);
app.use("/api/posts", protect, postRoutes);
app.use("/api/comments", protect, commentRoutes);
app.use("/api/chat", protect, chatRoutes);
app.use("/api/message", protect, messageRoutes);
app.use("/api/notifications", protect, notificationRoutes);
app.use("/api/upload", protect, uploadRoutes);
app.get("/api/search", protect, searchAll);

// Handle unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);

// Gracefully close Prisma on process exit
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected");
  // server.close();
});
