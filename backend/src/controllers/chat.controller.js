import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    console.log("userid: ", req.user.id)
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function shareFoodcard(req, res) {
  try {
    const { foodcardId, recipeintId } = req.body;
    const userId = req.user.id;

    const foodcard = await Foodcard.findById(foodcardId).populate("user", "username profileImage");

    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    const channelId = [user.id, friendId].sort().join("-");
    const message = {
      text: `${req.user.username} shared a foodcard with you!`,
      user_id: userId.toString(),
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
            value: foodcardId
          }
        ]
      }]
    };

    const channel = streamClient.channel('messaging', channelId);
    await channel.sendMessage(message);
    res.status(200).json({ message: "Foodcard shared successfully" });
  } catch (error) {
    console.log("Error in shareFoodcard controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}