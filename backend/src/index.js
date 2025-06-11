import express from 'express';
import "dotenv/config";
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import foodcardsRoutes from './routes/foodcardsRoutes.js';
import { connectDB } from './lib/db.js';
import job  from './lib/cron.js';

const app = express();
const PORT = process.env.PORT || 3000;

// job.start(); // for cron job 
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); 


//ROUTER
app.use("/api/auth", authRoutes); // login, register
app.use("/api/foodcards", foodcardsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    connectDB().catch(err => {
        console.error('Database connection failed:', err);
    });
    console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    // Don't log the secret for security
});
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

