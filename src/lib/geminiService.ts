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
      const prompt = `You are a helpful customer support assistant for a WhatsApp Business service. 
      
Context: You are responding to a customer via WhatsApp. Be friendly, professional, and concise.

Customer phone: ${userPhone}
Customer message: "${userMessage}"

Please respond as a helpful support agent. Keep responses:
- Short and concise (1-2 sentences max)
- Friendly and professional
- Helpful and actionable
- Appropriate for WhatsApp messaging

If the customer is asking about:
- Technical issues: Provide basic troubleshooting steps
- General inquiries: Give helpful information
- Complaints: Be empathetic and offer solutions
- Greetings: Respond warmly and ask how you can help

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

      const prompt = `You are a helpful customer support assistant for a WhatsApp Business service.

Customer phone: ${userPhone}
Conversation history:
${historyContext}

Latest customer message: "${userMessage}"

Based on the conversation context, provide a helpful, professional response. Keep it:
- Short and conversational (1-2 sentences)
- Contextually relevant to the conversation
- Professional but friendly
- Actionable when possible

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
