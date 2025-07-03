import Foodcard from "../models/Foodcard.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export async function getAllFoodcards(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select("privacy");
    const userFriends = currentUser.friends || [];

    const publicUsers = await User.find({ privacy: "public" }).distinct("_id");


    // private friends users
    const privateUsers = await User.find({
      privacy: "private",
      _id: { $in: userFriends },
    }).distinct("_id");

    const visibleUsers = [...publicUsers, ...privateUsers, currentUserId];

    const query = {
      user: { $in: visibleUsers },
    };

    const foodcards = await Foodcard.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage privacy");

    const totalFoodcards = await Foodcard.countDocuments(query);

    res.send({
      foodcards,
      currentPage: page,
      totalFoodcards,
      totalPages: Math.ceil(totalFoodcards / limit),
    });
  } catch (error) {
    console.log("Error in get all Foodcard route", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFoodcardsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      targetUser.privacy === "private" &&
      userId !== currentUserId.toString()
    ) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser.friends.includes(userId)) {
        return res
          .status(403)
          .json({
            message: "You do not have permission to view this user's foodcards",
          });
      }
    }

    const foodcards = await Foodcard.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    res.json(foodcards);
  } catch (error) {
    console.log("Error in get foodcards by user ID route", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFoodcardbyId(req, res) {
  try {
    const foodcardId = req.params.id;
    const userId = req.user._id;

    const foodcard = await Foodcard.findById(foodcardId).populate(
      "user",
      "username profileImage privacy"
    );

    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    const owner = foodcard.user;
    if (
      owner.privacy === "private" &&
      owner._id.toString() !== userId.toString()
    ) {
      const currentUser = await User.findById(userId);
      if (!currentUser.friends.includes(owner._id)) {
        return res
          .status(403)
          .json({
            message: "You do not have permission to view this foodcard",
          });
      }
    }

    const currentUser = await User.findById(userId);
    const isSaved = currentUser.savedFoodcards.includes(foodcardId);

    return res.status(200).json({
      ...foodcard.toObject(),
      isSaved,
    });
  } catch (error) {
    console.log("Error fetching food card by ID", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createFoodcard(req, res) {
  try {
    const { title, tag, caption, rating, image, location } = req.body;

    if (!image || !title || !caption || !rating || !location || !tag) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newFoodcard = new Foodcard({
      title: title,
      tag: tag,
      caption: caption,
      rating: rating,
      location: location,
      image: imageUrl,
      user: req.user._id,
    });

    await newFoodcard.save();

    res.status(201).json(newFoodcard);
  } catch (error) {
    console.log("Error creating Foodcard", error);
    res.status(500).json({ message: error.message });
  }
}

export async function deleteFoodcard(req, res) {
  try {
    const foodcard = await Foodcard.findById(req.params.id);
    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    if (foodcard.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this food card" });
    }

    if (foodcard.image && foodcard.image.includes("cloudinary")) {
      try {
        const publicId = foodcard.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
        return res
          .status(500)
          .json({ message: "Error deleting image from cloudinary" });
      }
    }

    await foodcard.deleteOne();
    res.status(200).json({ message: "Foodcard deleted successfully" });
  } catch (error) {
    console.log("Error finding Foodcard", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCurrentUserFoodcards(req, res) {
  try {
    const foodcards = await Foodcard.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(foodcards);
  } catch (error) {
    console.log("Error fetching food cards by user", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function saveFoodcard(req, res) {
  try {
    const foodcardId = req.params.id;
    const userId = req.user._id;

    const foodcard = await Foodcard.findById(foodcardId);
    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    const user = await User.findById(userId);
    if (user.savedFoodcards.includes(foodcardId)) {
      return res.status(200).json({ message: "Foodcard already saved" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $push: { savedFoodcards: foodcardId } },
      { new: true }
    );

    res.status(200).json({ message: "Foodcard saved successfully" });
  } catch (error) {
    console.log("Error saving food card", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function unsaveFoodcard(req, res) {
  try {
    const foodcardId = req.params.id;
    const userId = req.user._id;

    const foodcard = await Foodcard.findById(foodcardId);
    if (!foodcard) {
      return res.status(404).json({ message: "Foodcard not found" });
    }

    const user = await User.findById(userId);
    if (!user.savedFoodcards.includes(foodcardId)) {
      return res.status(400).json({ message: "Foodcard not saved" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedFoodcards: foodcardId } },
      { new: true }
    );

    res.status(200).json({ message: "Foodcard unsaved successfully" });
  } catch (error) {
    console.log("Error unsaving food card", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSavedFoodcards(req, res) {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedFoodcards",
      populate: {
        path: "user",
        select: "username profileImage",
      },
    });

    res.status(200).json(user.savedFoodcards);
  } catch (error) {
    console.error("Error fetching saved food cards", error);
    res.status(500).json({ message: "Internal server error" });
  }
}