import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getNotification,
  getMyFriends,
  getOutgoingFriendReqs,
  sendFriendRequest,
  searchFriends,
  deleteFriendRequest,
  deleteFriend,
  sendJioRequest,
  getOutgoingJioReqs,
  acceptJioRequest,
  rejectJioRequest,
  getUserById,
  updateUserProfile,
  updateUserPrivacy,
  savePushToken,
} from "../controllers/user.controller.js";
const router = express.Router();

//apply to all routes
router.use(protectRoute);

router.get("/friends", getMyFriends);
router.delete("/deleteFriend/:id", deleteFriend);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend-request/:id/delete", deleteFriendRequest);

router.get("/notification", getNotification);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/outgoing-jio-requests", getOutgoingJioReqs);

router.get("/search", searchFriends);
router.get("/:id", getUserById);

router.post("/jio-request/:id", sendJioRequest);
router.put("/jio-request/:id/accept", acceptJioRequest);
router.put("/jio-request/:id/reject", rejectJioRequest);

router.put("/update/:id", updateUserProfile);

router.put("/privacy", updateUserPrivacy);

router.push("/save-push-token", savePushToken);

export default router;
