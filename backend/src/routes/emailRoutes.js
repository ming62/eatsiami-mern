import express from "express";
import { requestPasswordReset, verifyResetCode, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;