// scripts/upsertAllUsers.js
import mongoose from "mongoose";
import User from "../models/User.js";
import "dotenv/config";
import { upsertStreamUser } from "../lib/stream.js";

const run = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);

    for (const user of users) {
      const streamUser = {
        id: user._id.toString(),
        name: user.username,
        image: user.profileImage,
      };

      try {
        await upsertStreamUser(streamUser);
        console.log(`✅ Upserted user: ${user.username}`);
      } catch (err) {
        console.error(`❌ Failed to upsert ${user.username}:`, err.message);
      }
    }

    console.log("🎉 All users processed");
  } catch (err) {
    console.error("🚨 Script failed:", err);
  } finally {
    mongoose.disconnect();
  }
};

run();
