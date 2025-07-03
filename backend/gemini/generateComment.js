import { GoogleGenerativeAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent("Explain how AI works in a few words");

  const response = await result.response;
  const text = response.text();

  console.log(text);
}

main();
