import mongoose from "mongoose";
import Foodcard from "../models/Foodcard.js";
import "dotenv/config";

const migrateTags = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const foodcardsWithoutTag = await Foodcard.find({
      $or: [
        { tag: { $exists: false } },
        { tag: null },
        { tag: "" }
      ]
    });

    console.log(`Found ${foodcardsWithoutTag.length} foodcards without tags.`);

    for (const foodcard of foodcardsWithoutTag) {
      await Foodcard.findByIdAndUpdate(
        foodcard._id,
        { tag: "breakfast" },
        { new: true }
      );
    }

    console.log('Migration completed: Default tag "breakfast" added.');
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateTags();
