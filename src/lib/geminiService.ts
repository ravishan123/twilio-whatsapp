import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

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
      const prompt = `You are a helpful AI assistant for a WhatsApp Business service. You can answer any questions and provide support.

Customer phone: ${userPhone}
Customer message: "${userMessage}"

Instructions:
- Answer ANY question directly and accurately (general knowledge, facts, support, etc.)
- For general questions: Provide informative, accurate answers
- For support questions: Offer helpful assistance
- Keep responses short and concise (1-2 sentences max)
- Be friendly and professional
- If you don't know something, say so honestly

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Ensure response isn't too long for WhatsApp
      if (text.length > 1600) {
        return text.substring(0, 1600) + "...";
      }

      return text.trim();
    } catch (error) {
      console.error("Error generating Gemini response:", error);
      // Fallback response
      return "Thanks for your message! Our support team has received your inquiry and will assist you shortly. Is there anything specific I can help you with right now?";
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

      const prompt = `You are a helpful AI assistant for a WhatsApp Business service. You can answer any questions and provide support.

Customer phone: ${userPhone}
Conversation history:
${historyContext}

Latest customer message: "${userMessage}"

Instructions:
- Answer ANY question directly and accurately (general knowledge, facts, help, etc.)
- For support questions, offer assistance
- For factual questions, provide accurate information
- Keep responses short and conversational (1-2 sentences)
- Be professional but friendly
- If you don't know something, say so honestly

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text.length > 1600) {
        return text.substring(0, 1600) + "...";
      }

      return text.trim();
    } catch (error) {
      console.error("Error generating contextual response:", error);
      return "I understand your concern. Let me help you with that right away! Could you provide a bit more detail?";
    }
  }
}
