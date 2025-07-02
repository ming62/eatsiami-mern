import mongoose from 'mongoose';
import Foodcard from '../models/Foodcard.js'; 
import 'dotenv/config';

const migrateTags = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const foodcardsWithoutTags = await Foodcard.find({
      $or: [
        { tags: { $exists: false } },
        { tags: null },
        { tags: { $size: 0 } },
      ],
    });

    console.log(` Found ${foodcardsWithoutTags.length} foodcards without tags.`);

    for (const foodcard of foodcardsWithoutTags) {
      await Foodcard.findByIdAndUpdate(
        foodcard._id,
        { tags: ['breakfast'] },
        { new: true }
      );
    }

    console.log(' Migration completed: Default tag "breakfast" added.');
    process.exit(0);
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  }
};

migrateTags();
