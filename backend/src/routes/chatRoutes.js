import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getStreamToken, shareFoodcard } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/share-foodcard", protectRoute, shareFoodcard);

export default router;