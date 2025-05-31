import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {

    try {
        // Getting token from the request header 
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        // Verifying the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Finding the user by ID from the decoded token
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        req.user = user; // Attaching user to the request object
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Token is not valid" });
    }

};

// const protectRoute = async(req, res,next) => {
//     try{
//         //get token
//         const token = req.header("Authorization").replace("Beareer ", "");

//         if (!token) return res.status(401).json({message: "No authentication token, access denied"});

//         //verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         //find user
//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user) return res.status(401).json({message: "Token is not valid"});

//         req.user = user;
//         next();

//     } catch (error) {
//         res.status(401).json({message: "Token is not valid"});

//     }
// };

export default protectRoute;