import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import JioRequest from "../models/JioRequest.js";
import cloudinary from "../lib/cloudinary.js";

export async function getUserById(req, res) {
  try {
    const { id: userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId)
      .select("username profileImage bio friends createdAt")
      .populate("friends", "username profileImage bio");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.privacy === "private" && userId !== currentUserId) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser.friends.includes(userId)) {
        return res.status(403).json({
          message: "This user's profile is private and only visible to friends",
        });
      }
    }

    const isFriend = user.friends.some(
      (f) => f._id.toString() === currentUserId || userId === currentUserId
    );

    if (!isFriend) {
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt,
      });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      friends: user.friends.map((friend) => ({
        _id: friend._id,
        username: friend.username,
        profileImage: friend.profileImage,
        bio: friend.bio,
      })),
    });
  } catch (error) {
    console.error("Error in getUserById controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "username profileImage"); //get the data we need

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourselfs
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getNotification(req, res) {
  try {
    const myId = req.user.id;
    const pendingFriendReqs = await FriendRequest.find({
      recipient: myId,
      status: "pending",
    })
      .populate("sender", "username profileImage")
      .sort({ createdAt: -1 });

    const pendingJioReqs = await JioRequest.find({
      recipient: myId,
      status: "pending",
    })
      .populate("sender", "username profileImage")
      .sort({ createdAt: -1 });

    const acceptedFriendReqs = await FriendRequest.find({
      sender: myId,
      status: "accepted",
    })
      .populate("recipient", "username profileImage")
      .sort({ updatedAt: -1 });

    const acceptedJioReqs = await JioRequest.find({
      sender: myId,
      status: "accepted",
    })
      .populate("recipient", "username profileImage")
      .sort({ updatedAt: -1 });

    const rejectedJioReqs = await JioRequest.find({
      sender: myId,
      status: "rejected",
    })
      .populate("recipient", "username profileImage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      pendingFriendReqs,
      pendingJioReqs,
      acceptedFriendReqs,
      acceptedJioReqs,
      rejectedJioReqs,
    });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "username profileImage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function searchFriends(req, res) {
  try {
    const { username } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Search for users whose username contains the search term
    const friends = await User.find({
      username: { $regex: username, $options: "i" }, //case-insensitive and partial match
      _id: { $ne: req.user.id }, // Exclude the current user from results
    })
      .select("username profileImage")
      .skip(skip)
      .limit(limit); //allow load more friends

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error in searchUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteFriend(req, res) {
  try {
    const myId = req.user.id;
    const { id: friendId } = req.params;

    // prevent delete yourselfs
    if (myId === friendId) {
      return res.status(400).json({ message: "You can't delete yourself" });
    }

    const currentUser = await User.findById(myId);
    if (!currentUser.friends.includes(friendId)) {
      return res.status(400).json({ message: "This user is not your friend." });
    }

    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId },
    });

    //delete friend request between them so that they can add each other in the future
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: friendId },
        { sender: friendId, recipient: myId },
      ],
    });

    res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.error("Error in deleting friend", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this request" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request deleted" });
  } catch (error) {
    console.log("Error in deletetFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendJioRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourselfs
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't jio yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    const currentUser = await User.findById(myId);
    if (
      !currentUser.friends.includes(recipientId) ||
      !recipient.friends.includes(myId)
    ) {
      return res.status(400).json({ message: "User is not your friend yet!" });
    }

    // check if a req already exists
    const existingRequest = await JioRequest.findOne({
      status: "pending",
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A jio request already exists between you and this user",
      });
    }

    const jioRequest = await JioRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(jioRequest);
  } catch (error) {
    console.error("Error in sendJioRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptJioRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const jioRequest = await JioRequest.findById(requestId);

    if (!jioRequest) {
      return res.status(404).json({ message: "Jio request not found" });
    }

    // Verify the current user is the recipient
    if (jioRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    jioRequest.status = "accepted";
    await jioRequest.save();

    res.status(200).json({ message: "Jio request accepted" });
  } catch (error) {
    console.log("Error in acceptJioRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function rejectJioRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const jioRequest = await JioRequest.findById(requestId);

    if (!jioRequest) {
      return res.status(404).json({ message: "Jio request not found" });
    }

    // Verify the current user is the recipient
    if (jioRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this request" });
    }

    jioRequest.status = "rejected";
    await jioRequest.save();

    res.status(200).json({ message: "Jiorequest rejected" });
  } catch (error) {
    console.log("Error in rejectJioRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingJioReqs(req, res) {
  try {
    const outgoingRequests = await JioRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "username profileImage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingJioReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateUserProfile(req, res) {
  const { username, bio, profileImage } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exist" });
      }
      user.username = username;
    }

    let imageUrl;
    if (profileImage) {
      const uploadResponse = await cloudinary.uploader.upload(profileImage);
      imageUrl = uploadResponse.secure_url;
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (imageUrl !== undefined) user.profileImage = imageUrl;

    const updatedUser = await user.save();
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateUserPrivacy(req, res) {
  try {
    const { privacy } = req.body;

    if (!privacy || !["public", "private"].includes(privacy)) {
      return res.status(400).json({ message: "Invalid privacy setting" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { privacy },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Privacy settings updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
