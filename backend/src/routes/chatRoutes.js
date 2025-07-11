import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  shareFoodcard,
  sendNotif,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/share-foodcard", protectRoute, shareFoodcard);
router.post("/stream-webhook", sendNotif);

export default router;
