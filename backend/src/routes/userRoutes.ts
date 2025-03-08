import express from "express";
import {
  deleteUser,
  followUser,
  getAllUsers,
  getFollowers,
  getFollowing,
  getUserById,
  unfollowUser,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/:id/follow", followUser);
router.post("/:id/unfollow", unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

export default router;
