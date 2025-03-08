import express from "express";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/", getNotifications);
router.post("/mark-as-read", markNotificationsAsRead);

export default router;
