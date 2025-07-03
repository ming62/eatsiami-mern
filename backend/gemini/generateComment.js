import { GoogleGenAI } from '@google/genai';
import "dotenv/config";


const API_KEY = process.env.GEMINI_API_KEY; 
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
 
    process.exit(1);
}

async function main() {

const genAI = new GoogleGenAI(API_KEY);
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();