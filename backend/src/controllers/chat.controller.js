import { generateStreamToken, streamClient } from "../lib/stream.js";
import Foodcard from "../models/Foodcard.js";
import User from "../models/User.js";
import { sendPushNotification } from "../lib/notification.js";

export async function getStreamToken(req, res) {
  try {
    console.log("userid: ", req.user.id);
    const token = generateStreamToken(req.user._id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function shareFoodcard(req, res) {
  try {
    const { foodcardId, recipientId } = req.body;
    const userId = req.user._id;

    console.log("Share request:", { foodcardId, recipientId, userId });

    if (!foodcardId || !recipientId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const foodcard = await Foodcard.findById(foodcardId).populate(
      "user",
      "username profileImage privacy"
    );

    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    if (foodcard.user.privacy === "private") {
      return res.status(403).json({ message: "Cannot share private foodcard" });
    }

    const channelId = [userId.toString(), recipientId].sort().join("-");
    console.log("Channel ID:", channelId);

    const channel = streamClient.channel("messaging", channelId, {
      members: [userId.toString(), recipientId],
      created_by_id: userId.toString(),
    });

    await channel.create();

    const message = {
      text: `${req.user.username} shared a foodcard with you!`,
      user_id: userId.toString(),
      attachments: [
        {
          type: "foodcard",
          title: foodcard.title,
          text: foodcard.caption,
          image_url: foodcard.image,
          author_name: foodcard.user.username,
          author_icon: foodcard.user.profileImage,
          fields: [
            { title: "Rating", value: `${foodcard.rating}/5 ⭐`, short: true },
            { title: "Location", value: foodcard.location, short: true },
            { title: "Tag", value: foodcard.tag, short: true },
          ],
          actions: [
            {
              name: "view_foodcard",
              text: "View Details",
              type: "button",
              value: foodcardId,
            },
          ],
        },
      ],
    };

    await channel.sendMessage(message);

    console.log("Message sent successfully");
    res.status(200).json({ message: "Foodcard shared successfully" });
  } catch (error) {
    console.log("Error in shareFoodcard controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendNotif(req, res) {
  try {
    console.log("✅ [Webhook Triggered] Incoming event:", req.body?.type);

    const { type, message } = req.body;

    if (type !== "message.new") {
      console.log("ℹ️ [Webhook Ignored] Type is not 'message.new':", type);
      return res.sendStatus(200);
    }

    const senderId = message.user.id;
    const channelMembers = message.channel?.members ?? [];

    console.log("👤 Sender ID:", senderId);
    console.log(
      "👥 Channel Members:",
      channelMembers.map((m) => m.user?.id)
    );

    // Ensure channel has at least 2 members
    if (channelMembers.length < 2) {
      console.warn("⚠️ Not enough members in channel to notify");
      return res
        .status(400)
        .json({ message: "Not enough members in channel to notify" });
    }

    // Find recipient by excluding the sender
    const recipientId = channelMembers.find((m) => m.user.id !== senderId)?.user
      .id;

    if (!recipientId) {
      console.warn("❌ Recipient not found in channel members");
      return res
        .status(404)
        .json({ message: "Recipient not found in channel members" });
    }

    console.log("🎯 Recipient ID:", recipientId);

    // Find the recipient's push token from db
    const recipient = await User.findById(recipientId).select(
      "expoPushToken username profileImage bio friends createdAt"
    );

    if (!recipient) {
      console.warn("❌ Recipient not found in DB");
      return res.status(404).json({ message: "Recipient not found in DB" });
    }

    console.log("📱 Found Recipient:", recipient.username);
    console.log("🔐 Expo Push Token:", recipient.expoPushToken);

    if (!recipient.expoPushToken) {
      console.warn("❌ Expo push token not found for recipient");
      return res
        .status(404)
        .json({ message: "Expo push token not found for recipient" });
    }

    // Send the push notification
    const payload = {
      title: `New message from ${message.user.name}`,
      body: message.text,
      data: { type: "chat-message", chatId: message.channel_id },
    };

    console.log("📤 Sending push notification with payload:", payload);

    await sendPushNotification(recipient.expoPushToken, payload);

    console.log("✅ Push notification sent successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("❗ Error in sendNotif controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
