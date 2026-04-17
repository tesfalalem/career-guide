import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCkx2rDQpGj7C3ZcZfDaI91fgdFRPGqrwU";
const genAI = new GoogleGenerativeAI(apiKey);
// Updated to use a model ID available in 2026
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function testGeneration() {
  try {
    const prompt = 'Create a learning roadmap for "Frontend Developer". Return valid JSON.';
    console.log("Sending prompt to gemini-2.5-flash...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response length:", text.length); 
    console.log("Response Preview:", text.substring(0, 100));
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

testGeneration();