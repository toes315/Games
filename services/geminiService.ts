import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const generateCommentary = async (eventDescription: string, intensity: number): Promise<string> => {
  if (!genAI) return "API Key missing. Enjoy the fight!";

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an intense, hype-man video game announcer for a stickman fighting game. 
      The current game event is: "${eventDescription}".
      Intensity level (1-10): ${intensity}.
      
      Generate a SINGLE, short, punchy sentence of commentary. 
      If intensity is high, use caps or exclamation marks. 
      Be funny or savage.
      Do not use quotes.
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Unbelievable moves!";
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return "";
  }
};