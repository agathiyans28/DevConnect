import express from "express";
import {
  getPostLikes,
  likePost,
  unlikePost,
} from "../controllers/likeController";
const router = express.Router();

router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);
router.get("/:id/likes", getPostLikes);

export default router;
