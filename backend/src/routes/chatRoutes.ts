import express from "express";
import { createOrFetchChat, getUserChats } from "../controllers/chatController";

const router = express.Router();

router.post("/", createOrFetchChat);
router.get("/:userId", getUserChats);

export default router;
