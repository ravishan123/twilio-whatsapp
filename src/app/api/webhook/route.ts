import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { MessageStore } from "@/lib/messageStore";
import { TwilioWebhookData } from "@/types/message";
import { GeminiService } from "@/lib/geminiService";

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: TwilioWebhookData = {
      MessageSid: formData.get("MessageSid") as string,
      From: formData.get("From") as string,
      To: formData.get("To") as string,
      Body: formData.get("Body") as string,
      NumMedia: formData.get("NumMedia") as string,
      MediaUrl0: formData.get("MediaUrl0") as string,
      MediaContentType0: formData.get("MediaContentType0") as string,
    };

    console.log("Received WhatsApp message:", data);

    // Store the incoming message
    const message = MessageStore.addMessage({
      from: data.From,
      to: data.To,
      body: data.Body || "",
      direction: "incoming",
    });

    console.log("Stored message:", message);

    // Create TwiML response with AI-powered reply
    const twiml = new MessagingResponse();

    try {
      // Get conversation history for context
      const conversationHistory = MessageStore.getMessagesByPhoneNumber(
        data.From
      )
        .slice(-6) // Get last 6 messages for context
        .map((msg) => ({
          message: msg.body,
          direction: msg.direction,
        }));

      // Generate AI response using Gemini
      const geminiService = new GeminiService();
      const aiReply = await geminiService.generateContextualResponse(
        data.Body,
        data.From,
        conversationHistory
      );

      console.log("Generated AI reply:", aiReply);

      twiml.message(aiReply);

      // Store the AI-generated reply
      MessageStore.addMessage({
        from: data.To,
        to: data.From,
        body: aiReply,
        direction: "outgoing",
      });
    } catch (error) {
      console.error("Error generating AI response:", error);

      // Fallback to basic response if AI fails
      const fallbackReply =
        "Hello! Thanks for reaching out. Our support team is here to help you. How can we assist you today?";
      twiml.message(fallbackReply);

      MessageStore.addMessage({
        from: data.To,
        to: data.From,
        body: fallbackReply,
        direction: "outgoing",
      });
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
