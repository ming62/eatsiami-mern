import { GoogleGenerativeAI } from '@google/generative-ai';


const API_KEY = process.env.GEMINI_API_KEY; 
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
 
    process.exit(1);
}

async function run() {
    
    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Write a short, positive comment about a delicious meal.";

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
    } catch (error) {
        console.error("Error generating content:", error);
        
        if (error.status) {
            console.error("HTTP Status:", error.status);
        }
        if (error.message) {
            console.error("Error message from API:", error.message);
        }
    }
}

run();