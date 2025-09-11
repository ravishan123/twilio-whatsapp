import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { MessageStore } from "@/lib/messageStore";
import { SendMessageRequest, SendMessageResponse } from "@/types/message";

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, message" },
        { status: 400 }
      );
    }

    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      return NextResponse.json(
        { success: false, error: "Twilio credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Twilio client with runtime environment variables
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send message via Twilio
    console.log("Attempting to send message:", {
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
      body: message,
    });

    const twilioMessage = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
      body: message,
    });

    console.log("Message sent via Twilio:", twilioMessage.sid);

    // Store the outgoing message
    const storedMessage = MessageStore.addMessage({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
      body: message,
      direction: "outgoing",
    });

    console.log("Stored outgoing message:", storedMessage);

    const response: SendMessageResponse = {
      success: true,
      messageSid: twilioMessage.sid,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error sending message:", error);

    const response: SendMessageResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
