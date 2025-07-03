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

const getFoodCards = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const foodcards = await FoodCard.find({
    user: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: sevenDaysAgo },
  });

  return foodcards.sort((a, b) => a.createdAt - b.createdAt);
};

export async function getAIReport(req, res) {
  try {
    const { userId } = req.body;
    console.log("Received userId:", userId);

    const foodcards = await getFoodCards(userId);
    console.log(`Found ${foodcards.length} foodcards in past 7 days.`);

    if (foodcards.length === 0) {
      return res.json({ aiReport: "No food cards found for the past 7 days." });
    }

    const genAI = new GoogleGenAI(API_KEY);
    console.log("GoogleGenAI instance created.");

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: "You are a helpful nutritionist. Based on the following food cards, provide a report on the user's eating habits, nutritional balance, and suggestions for improvement.",
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
