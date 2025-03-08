import express from "express";
import { createPost, deletePost, getAllPosts, getPostById, getUserPosts, updatePost } from "../controllers/postController";
import { likePost } from "../controllers/likeController";
import likeRoutes from "./likeRoutes";

const router = express.Router()

router.post("/", createPost)
router.get("/", getAllPosts)
router.get("/:id", getPostById)
router.put("/:id", updatePost)
router.delete("/:id", deletePost)
router.get("/users/:id", getUserPosts)

router.use(likeRoutes)


export default router
