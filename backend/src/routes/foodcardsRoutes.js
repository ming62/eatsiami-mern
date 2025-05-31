import express from 'express';
import cloudinary from "../lib/cloudinary.js";
import Foodcard from '../models/Foodcard.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// POST route to create a new food card
router.post("/", protectRoute, async (req, res) => {
   
    try {     
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const uploadResponse = await cloudinary.uploader.uploade(image);
        const imageUrl = uploadResponse.secure_url;

        const newFoodcard = new Foodcard({
            title : title,
            caption : caption,
            rating : rating,
            image: imageUrl,
            user: req.user._id, //req.user is set by protectRoute middleware
        });

        await newFoodcard.save();

        res.status(201).json(newFoodcard);

    } catch (error) {
        console.log("Error creating Foodcard", error);
        res.status(500).json({ message: error.message });
    }
});

// pagination: as user scrolls down, more foodcards are fetched
router.get("/", protectRoute, async (req, res) => {
    
    try {
        const page = req.query.page || 1; 
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;


        const foodcards = await Foodcard.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage"); // Populate user field in foodcard with username and profileImage

        const totalFoodcards = await Foodcard.countDocuments();

        res.send({
            foodcards,
            currentPage : page,
            totalFoodcards : totalFoodcards,
            totalPages : Math.ceil(totalFoodcards / limit)
        });

    } catch (error) {
        console.log("Error in get all Foodcard route", error);
        res.status(500).json({ message: "Internal server error" });
    }

});

// deleting a food card by ID
router.delete("/:id", protectRoute, async (req, res) => {

    try {
        const foodcard = await Foodcard.findById(req.params.id);
        if (!foodcard) {
            return res.status(404).json({ message: "Foodcard not found" });
        }

        // Check if the user is the owner of the food card
        if (foodcard.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this food card" });
        }
        

        // example url https://res.cloudinary.com/dz1qj3k2f/image/upload/v1709999999/ for cloudinary image
        
        // delete image from cloudinary
        if (foodcard.image && foodcard.image.includes("cloudinary")) {
            try {             
                const publicId = foodcard.image.split("/").pop().split(".")[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error deleting image from cloudinary", error);
                return res.status(500).json({ message: "Error deleting image from cloudinary" });
            }
        }

        await foodcard.deleteOne();
        res.status(200).json({ message: "Foodcard deleted successfully" });

    } catch (error) {
        console.log("Error finding Foodcard", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// fetching food card by userID 
router.get("/user", protectRoute, async (req, res) => {
    try {
        const foodcards = await Foodcard.find({ user: req.user._id })
        .sort({ createdAt: -1 });
        res.json(foodcards);
    }  catch (error) {
        console.log("Error fetching food cards by user", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// router.post("/", protectRoute, async (req, res) => {
//     try {
//         const { title, caption, rating, image } = req.body;

//         if (!image || !title || !caption || !rating) {
//           return res.status(400).json({message: "Please provide all fields"});
//         }
      
//         const uploadResponse = await cloudinary.uploader.upload(image);
//         const imageUrl = uploadResponse.secure_url

//         const newFoodcard = new Foodcard ({
//             title, 
//             caption, 
//             rating, 
//             image: imageUrl,
//             user: req.user._id,
//         })

//         await newFoodcard.save()

//         res.status(201).json(newFoodcard)

//     } catch (error) {
//         console.log("Error creating Foodcard", error);
//         res.status(500).json({message: error.message});
//     }
// } )

// router.get("/", protectRoute, async (req, res) => {
//     try {

//        const page = req.query.page || 1;
//        const limit = req.query.limit || 5;
//        const skip = (page - 1) * limit;

//        const foodcards = await Foodcard.find()
//        .sort({createdAt: -1})
//        .skip(skip)
//        .limit(limit)
//        .populate("user", "username profileImage");

//        const totalFoodcards = await Book.countDocuments();

//        res.send({
//         foodcards, 
//     currentPage: page, 
//     totalFoodcards, 
//     totalPages: Math.ceil(totalFoodcards / limit),
//     });
//     } catch (error) {
//         console.log("Error in get all Foodcard route", error);
//         res.status(500).json({message: "Internal server error"});
//     }
// } )

export default router;