import express from "express";
import {
  addComment,
  deleteComment,
  getCommentsByPost,
} from "../controllers/commentController";
const router = express.Router();

router.post("/", addComment);
router.get("/:postId", getCommentsByPost);
router.delete("/:id", deleteComment);

export default router;