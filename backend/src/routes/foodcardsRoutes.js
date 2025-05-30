import express from 'express';
import cloudinary from "../lib/cloudinary.js";
import Foodcard from '../models/Foodcard.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();


router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
          return res.status(400).json({message: "Please provide all fields"});
        }
      
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url

        const newFoodcard = new Foodcard ({
            title, 
            caption, 
            rating, 
            image: imageUrl,
            user: req.user._id,
        })

        await newFoodcard.save()

        res.status(201).json(newFoodcard)

    } catch (error) {
        console.log("Error creating Foodcard", error);
        res.status(500).json({message: error.message});
    }
} )

router.get("/", protectRoute, async (req, res) => {
    try {

       const page = req.query.page || 1;
       const limit = req.query.limit || 5;
       const skip = (page - 1) * limit;

       const foodcards = await Foodcard.find()
       .sort({createdAt: -1})
       .skip(skip)
       .limit(limit)
       .populate("user", "username profileImage");

       const totalFoodcards = await Book.countDocuments();

       res.send({
        foodcards, 
    currentPage: page, 
    totalFoodcards, 
    totalPages: Math.ceil(totalFoodcards / limit),
    });
    } catch (error) {
        console.log("Error in get all Foodcard route", error);
        res.status(500).json({message: "Internal server error"});
    }
} )

export default router;