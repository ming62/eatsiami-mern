import Comment from "../models/Comment.js";
import { sendPushNotification } from "../lib/notification.js";
import Foodcard from "../models/Foodcard.js";

export async function getComment(req, res) {
  try {
    const { postId } = req.params;
    const topComments = await Comment.find({ postId, parentId: null })
      .sort({ createdAt: -1 })
      .populate("userId", "username profileImage");

    const replies = await Comment.find({
      postId,
      parentId: { $ne: null },
    })
      .sort({ createdAt: 1 })
      .populate("userId", "username profileImage");

    const groupedReplies = {};
    replies.forEach((reply) => {
      const topLevelParent = reply.topLevelParentId.toString();
      if (!groupedReplies[topLevelParent]) groupedReplies[topLevelParent] = [];
      groupedReplies[topLevelParent].push(reply);
    });

    const result = topComments.map((comment) => ({
      ...comment.toObject(),
      replies: groupedReplies[comment._id.toString()] || [],
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("getComment error:", error);
    res.status(500).json({ error: "Failed to get comment" });
  }
}

export async function createComment(req, res) {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    if (!postId || !content) {
      return res
        .status(400)
        .json({ error: "postId and content are required." });
    }

    const comment = await Comment.create({
      postId,
      userId,
      content,
      parentId: null,
      topLevelParentId: null,
    });

    const populated = await comment.populate("userId", "username profileImage");

    //send push notification
    const post = await Foodcard.findById(postId).populate(
      "user",
      "expoPushToken username"
    );

    if (post && post.user.id !== userId) {
      await sendPushNotification(post.user.expoPushToken, {
        title: "New Comment",
        body: `${req.user.username} commented on your food card.`,
        data: { type: "new-comment", fromUserId: userId },
      });
    }
    res.status(201).json(populated);
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
}

export async function replyComment(req, res) {
  try {
    const { postId, content } = req.body;
    const parentId = req.params.commentId;
    const userId = req.user.id;

    if (!postId || !content || !parentId) {
      return res
        .status(400)
        .json({ error: "postId and content are required." });
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment)
      return res.status(404).json({ error: "Parent comment not found" });

    const topLevelParentId =
      parentComment.topLevelParentId || parentComment._id;

    const comment = await Comment.create({
      postId,
      userId,
      content,
      parentId,
      topLevelParentId,
    });

    const populated = await comment.populate("userId", "username profileImage");

    if (parentComment.userId.id !== userId) {
      await sendPushNotification(parentComment.userId.expoPushToken, {
        title: "New Reply",
        body: `${req.user.username} replied to your comment.`,
        data: { type: "reply-comment", fromUserId: userId },
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
}
