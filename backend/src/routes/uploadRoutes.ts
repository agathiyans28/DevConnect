import express from "express";
import {
  uploadProfilePicture,
  uploadPostImage,
} from "../controllers/uploadController";
import upload from "../middleware/upload";

const router = express.Router();

router.post("/profile", upload.single("image"), uploadProfilePicture);
router.post("/post", upload.single("image"), uploadPostImage);

export default router;
