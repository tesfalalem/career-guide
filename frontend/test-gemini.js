import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCkx2rDQpGj7C3ZcZfDaI91fgdFRPGqrwU";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGeneration() {
  try {
    const prompt = 'Create a learning roadmap for "Frontend Developer". Return valid JSON.';
    console.log("Sending prompt...");
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