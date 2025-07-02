import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getComment, createComment, replyComment } from "../controllers/comment.controller.js";


const router = express.Router();

router.get("/:foodCardId", protectRoute, getComment);
router.post("/", protectRoute, createComment);
router.post("/:commentId/reply", protectRoute, replyComment);

export default router;