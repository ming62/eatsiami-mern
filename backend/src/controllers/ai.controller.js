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
You are a professional nutritionist. Your task is to generate a **nutrition analysis report in HTML format**, based solely on the user's meal logs ("food cards").

Each food card includes:
- Title of the meal
- Tag (e.g., breakfast, lunch, dinner, snack)
- Caption (meal description)
- Date consumed

Important instructions:
- **DO NOT** include or generate any image or <img> tags.
- Use only the **text** information provided.
- Only generate the **HTML content** (either a full HTML page or fragment), with **inline CSS styles** for clean, mobile-friendly rendering.
- Do **NOT** include any explanations or markdown. Just the HTML.

Your HTML report must include the following sections:

<h2>1. Summary of Meals</h2>
- Total number of meals.
- Number of meals per category (e.g., breakfast, lunch, etc.).

<h2>2. Nutrition Analysis</h2>
- Balance of meal timing across days.
- Variety and nutritional value of meals.
- Notable trends in eating habits.

<h2>3. Suggestions for Improvement</h2>
- Suggestions for improving meal timing, balance, and variety.
- Be specific and practical.

Style guidelines:
- Use modern fonts (e.g., Arial, sans-serif).
- Soft background color for container.
- Rounded corners and padding.
- Use <div>, <h2>, <ul>, <li>, and <p> for layout and readability.
- Avoid long paragraphs. Keep it skimmable.

Keep your tone informative, encouraging, and professional. Be concise but thorough. Do not invent any data — analyze based only on the provided meal logs.

Begin your HTML report below:
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

    let cleanedResult = result.text.trim();

    if (cleanedResult.startsWith("```html")) {
      cleanedResult = cleanedResult.replace(/^```html/, "").trim();
    }
    if (cleanedResult.endsWith("```")) {
      cleanedResult = cleanedResult.replace(/```$/, "").trim();
    }

    console.log("AI Report received.");
    res.json({ aiReport: cleanedResult });
  } catch (err) {
    console.error("Error generating AI report:", err);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
}
