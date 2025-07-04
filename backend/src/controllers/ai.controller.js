import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import mongoose from "mongoose";
import FoodCard from "../models/Foodcard.js";
import axios from "axios";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

const getFoodCards = async (userId, days) => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const foodcards = await FoodCard.find({
    user: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: daysAgo },
  });

  return foodcards.sort((a, b) => a.createdAt - b.createdAt);
};

export async function getAIReport(req, res) {
  try {
    const { userId, days } = req.body;
    console.log("Received userId:", userId);
    console.log("Received days:", days);

    const foodcards = await getFoodCards(userId, days);
    console.log(`Found ${foodcards.length} foodcards in past ${days} days.`);

    if (foodcards.length === 0) {
      return res.json({
        aiReport: `No food cards found for the past ${days} days.`,
      });
    }

    const genAI = new GoogleGenAI(API_KEY);
    console.log("GoogleGenAI instance created.");

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `
You are a professional nutritionist. Your task is to analyze a user's eating habits based on a list of food cards. Each food card includes an image, title, tag (such as 'breakfast', 'lunch', 'dinner', 'snack', 'supper', or 'other'), caption (a description of the meal), and the date it was consumed.

Your response must include the following:

1. **Summary of Meals**:
   - Total number of meals.
   - Number of meals for each category (breakfast, lunch, dinner, snack, supper, other).

2. **Analysis**:
   - Comment on the overall balance of meal timing (e.g., are breakfasts frequently skipped? too many late-night suppers?).
   - Evaluate variety and nutritional balance across the meals.
   - Mention any trends (e.g., frequent repetition of certain foods, lack of vegetables, too many high-calorie snacks, etc.).

3. **Suggestions for Improvement**:
   - Recommend ways to improve the user's eating habits based on the data.
   - Focus on meal timing, portion balance, food diversity, and nutritional content.

Keep your tone informative, encouraging, and professional. Be concise but thorough in your analysis. Do not make up any data — rely only on the provided food cards.

Begin your report below:
        `.trim(),
          },
        ],
      },
    ];

    for (const foodcard of foodcards) {
      const { image, title, tag, caption, createdAt } = foodcard;

      console.log("Foodcard data:");
      console.log("  Title:", title);
      console.log("  Tag:", tag);
      console.log("  Caption:", caption);
      console.log("  Created At:", new Date(createdAt).toISOString());
      console.log(
        "  Image (first 50 chars):",
        typeof image === "string" ? image.slice(0, 50) : "(not a string)"
      );

      const response = await axios.get(image, { responseType: "arraybuffer" });
      const base64ImageData = Buffer.from(response.data).toString("base64");
      const mimeType = response.headers["content-type"] || "image/jpeg";

      console.log(`Processing foodcard: "${title}" | Tag: ${tag}`);

      contents[0].parts.push({
        inlineData: {
          mimeType,
          data: base64ImageData,
        },
      });

      contents[0].parts.push({
        text: `Title: ${title}\nTag: ${tag}\nCaption: ${caption}\nCreated At: ${new Date(
          createdAt
        ).toDateString()}`,
      });
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log("AI Report received.");
    res.json({ aiReport: result.text });
  } catch (err) {
    console.error("Error generating AI report:", err);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
}
