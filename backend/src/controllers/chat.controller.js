import { generateStreamToken, streamClient } from "../lib/stream.js";
import Foodcard from "../models/Foodcard.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user.id || req.user._id;  // Handle both formats
    console.log("userid: ", userId);
    const token = generateStreamToken(userId);
    
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function shareFoodcard(req, res) {
  try {
    const { foodcardId, recipientId } = req.body;
    const userId = (req.user.id || req.user._id).toString(); 

    console.log("Share request:", { foodcardId, recipientId, userId });

    if (!foodcardId || !recipientId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const foodcard = await Foodcard.findById(foodcardId)
      .populate("user", "username profileImage privacy");

    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    if (foodcard.user.privacy === "private") {
      return res.status(403).json({ message: "Cannot share private foodcard" });
    }


    const channelId = [userId.toString(), recipientId].sort().join("-");
    console.log("Channel ID:", channelId);

    const channel = streamClient.channel('messaging', channelId, {
      members: [userId.toString(), recipientId],
      created_by_id: userId.toString(),
    });

    await channel.create();
    
    const message = {
      text: `${req.user.username} shared a foodcard with you!`,
      user_id: userId,
      attachments: [{
        type: 'foodcard',
        title: foodcard.title,
        text: foodcard.caption,
        image_url: foodcard.image,
        author_name: foodcard.user.username,
        author_icon: foodcard.user.profileImage,
        fields: [
          { title: 'Rating', value: `${foodcard.rating}/5 ⭐`, short: true },
          { title: 'Location', value: foodcard.location, short: true },
          { title: 'Tag', value: foodcard.tag, short: true }
        ],
        actions: [
          {
            name: 'view_foodcard',
            text: 'View Details',
            type: 'button',
            value: foodcardId.toString()  // Ensure foodcardId is a string
          }
        ]
      }]
    };

    await channel.sendMessage(message);
    console.log("Message sent:", message);
    
    console.log("Message sent successfully");
    res.status(200).json({ message: "Foodcard shared successfully" });
  } catch (error) {
    console.log("Error in shareFoodcard controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}