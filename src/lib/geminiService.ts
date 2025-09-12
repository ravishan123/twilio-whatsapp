import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: unknown;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateSupportResponse(
    userMessage: string,
    userPhone: string
  ): Promise<string> {
    try {
      const prompt = `You are an intelligent AI assistant named "Assistant" working for a WhatsApp Business service. You're knowledgeable, helpful, and personable.

User phone: ${userPhone}
User message: "${userMessage}"

Instructions:
- Answer ANY question directly and accurately (general knowledge, facts, support, etc.)
- Be conversational and friendly, like a knowledgeable friend
- Keep responses concise but informative (1-2 sentences)
- Show personality while remaining professional
- If you don't know something, admit it honestly
- Act as an intelligent AI agent, not just a support bot
- Don't mention company names unless specifically asked

Response:`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (this.model as any).generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Ensure response isn't too long for WhatsApp
      if (text.length > 1600) {
        return text.substring(0, 1600) + "...";
      }

      return text.trim();
    } catch (error) {
      console.error("Error generating Gemini response:", error);
      // AI agent fallback response
      return "Hi there! I'm an AI assistant here to help you. I'm experiencing a brief technical issue, but I'm back online now. How can I assist you today?";
    }
  }

  async generateContextualResponse(
    userMessage: string,
    userPhone: string,
    conversationHistory: Array<{
      message: string;
      direction: "incoming" | "outgoing";
    }>
  ): Promise<string> {
    try {
      const historyContext = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map(
          (msg) =>
            `${msg.direction === "incoming" ? "Customer" : "Support"}: ${
              msg.message
            }`
        )
        .join("\n");

      const prompt = `You are an intelligent AI assistant named "Assistant" for a WhatsApp Business service. You're knowledgeable, helpful, and have a friendly personality.

User phone: ${userPhone}
Conversation history:
${historyContext}

Latest user message: "${userMessage}"

Instructions:
- Answer ANY question directly and accurately (general knowledge, facts, support, etc.)
- Use the conversation context to provide relevant, personalized responses
- Be conversational and engaging, like talking to a smart friend
- Keep responses concise but helpful (1-2 sentences)
- Show personality while staying professional
- If you don't know something, be honest about it
- Act as an intelligent AI agent with expertise across many topics
- Don't mention company names unless specifically asked

Response:`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (this.model as any).generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text.length > 1600) {
        return text.substring(0, 1600) + "...";
      }

      return text.trim();
    } catch (error) {
      console.error("Error generating contextual response:", error);
      return "Hi! I'm your AI assistant. I had a brief connection issue but I'm back now. How can I help you today?";
    }
  }
}
