import mongoose from 'mongoose';
import User from '../models/User.js';
import "dotenv/config";


const migratePrivacyField = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const result = await User.updateMany(
      { privacy: { $exists: false } },
      { $set: { privacy: "public" } }
    );
    
    console.log(`Updated ${result.modifiedCount} users with privacy field`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePrivacyField();