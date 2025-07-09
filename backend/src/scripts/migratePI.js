import mongoose from "mongoose";
import "dotenv/config";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js"; // adjust if needed

// Check if a string is a valid image URL (HTTP(S) and ends with common image extensions)
const isValidImageUrl = (url) => {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url);
};

const migrateProfileImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({
      profileImage: { $exists: true, $ne: null, $ne: "" },
    });

    console.log(`🔍 Found ${users.length} users with profileImage.`);

    for (const user of users) {
      const { profileImage } = user;

      if (isValidImageUrl(profileImage)) {
        console.log(`⏭️  Skipping user ${user.username}: Valid image URL.`);
        continue;
      }

      try {
        const uploadRes = await cloudinary.uploader.upload(profileImage, {
          folder: "user_profiles",
        });

        await User.findByIdAndUpdate(user._id, {
          profileImage: uploadRes.secure_url,
        });

        console.log(`✅ Uploaded and updated image for user ${user._id}`);
      } catch (uploadErr) {
        console.error(
          `❌ Failed for user ${user.username}: ${uploadErr.message}`
        );
      }
    }

    console.log("🎉 Migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("🔥 Migration failed:", err);
    process.exit(1);
  }
};

migrateProfileImages();
