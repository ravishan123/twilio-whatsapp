import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/geminiService";
import { MessageStore } from "@/lib/messageStore";

export async function POST(request: NextRequest) {
  try {
    const { userMessage, phoneNumber } = await request.json();

    if (!userMessage || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Missing userMessage or phoneNumber" },
        { status: 400 }
      );
    }

    // Get conversation history for context
    const conversationHistory = MessageStore.getMessagesByPhoneNumber(
      phoneNumber
    )
      .slice(-6) // Get last 6 messages for context
      .map((msg) => ({
        message: msg.body,
        direction: msg.direction,
      }));

    // Generate AI response
    const geminiService = new GeminiService();
    const aiReply = await geminiService.generateContextualResponse(
      userMessage,
      phoneNumber,
      conversationHistory
    );

    return NextResponse.json({
      success: true,
      reply: aiReply,
      context: `Generated response based on ${conversationHistory.length} previous messages`,
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI response",
        reply:
          "I apologize, but I'm having trouble generating a response right now. Please try again or contact our support team directly.",
      },
      { status: 500 }
    );
  }
}
