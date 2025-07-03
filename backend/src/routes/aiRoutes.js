import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getAIReport } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate-report", protectRoute, getAIReport);

export default router;