import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
      logger.info(`User joined chat: ${chatId}`);
    });

    socket.on("send_message", (message) => {
      io.to(message.chatId).emit("receive_message", message);
      logger.info(`Message sent in chat ${message.chatId}:`, message);
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized!");
  return io;
};
