import mongoose from 'mongoose';
import Foodcard from '../models/Foodcard.js';
import 'dotenv/config';

const migrateExistingFoodcards = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const foodcardsWithoutLocation = await Foodcard.find({
            $or: [
                { location: { $exists: false } },
                { location: null },
                { location: "" }
            ]
        });

        console.log(`Found ${foodcardsWithoutLocation.length} foodcards without location`);

        for (const foodcard of foodcardsWithoutLocation) {
            await Foodcard.findByIdAndUpdate(
                foodcard._id,
                { location: "PGP" }, // Default value
                { new: true }
            );
        }

        console.log('Migration completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateExistingFoodcards();