const apiKey = "AIzaSyCkx2rDQpGj7C3ZcZfDaI91fgdFRPGqrwU";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
       console.error("API Error:", data.error);
    } else {
       console.log("Available Models:", data.models?.map(m => m.name));
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

listModels();