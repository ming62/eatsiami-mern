import express from "express";
import User from "../models/User.js"; 
import jwt from "jsonwebtoken";

const router = express.Router();
const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {
            expiresIn: "15d" 
        }
    )
};

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters long" });
        }

        // check if email and username already exists
        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const existingUsername = await User.findOne({ username: username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already in use" });
        }	

        // get random profiel profileImage
        const profileImage = `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${username}`;

        // creates a new user
        const user = new User({
            username: username,
            email: email,
            password: password, 
            profileImage: profileImage, 
        });        
        
        await user.save();

        const token = generateToken(user._id); // user._id is from mongoDB

        res.status(201).json({
            token,
            user: {
                id: user._id, 
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id); // user._id is from mongoDB
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;