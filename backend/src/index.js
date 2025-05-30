import express from 'express';
import "dotenv/config";
import authRoutes from './routes/authRoutes.js';
import foodcardsRoutes from './routes/foodcardsRoutes.js';
import { connectDB } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies


//ROUTER
app.use("/api/auth", authRoutes); // login, register
app.use("/api/foodcards", foodcardsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB().catch(err => {
        console.error('Database connection failed:', err);
    });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

