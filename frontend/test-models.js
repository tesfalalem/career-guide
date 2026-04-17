import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCkx2rDQpGj7C3ZcZfDaI91fgdFRPGqrwU";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
    // Wait, listModels isn't on the model instance...
    // The SDK exposes listModels differently depending on version. 
    // But let's try a safe bet: 'gemini-pro' (1.0 pro) which is definitely available.
    
    console.log("Trying gemini-pro...");
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-pro!");
  } catch (error) {
    console.error("gemini-pro failed:", error);
  }

  try {
    const flash = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    console.log("Trying gemini-1.5-flash-latest...");
    const result = await flash.generateContent("Hello");
    console.log("Success with gemini-1.5-flash-latest!");
  } catch (error) {
    console.error("gemini-1.5-flash-latest failed:", error);
  }
}

listModels();