import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { MessageStore } from "@/lib/messageStore";
import { TwilioWebhookData } from "@/types/message";

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

    // Create TwiML response with auto-reply
    const twiml = new MessagingResponse();

    // Auto-reply to the incoming message
    const reply = `Thanks for your message: "${data.Body}". This is an automated response from our WhatsApp chat app!`;
    twiml.message(reply);

    // Store the outgoing auto-reply message
    MessageStore.addMessage({
      from: data.To,
      to: data.From,
      body: reply,
      direction: "outgoing",
    });

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
