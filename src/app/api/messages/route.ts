import { NextRequest, NextResponse } from "next/server";
import { MessageStore } from "@/lib/messageStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    let messages;

    if (phoneNumber) {
      // Get messages for a specific phone number
      messages = MessageStore.getMessagesByPhoneNumber(phoneNumber);
    } else {
      // Get all messages
      messages = MessageStore.getAllMessages();
    }

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        messages: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

// Optional: Add a DELETE endpoint to clear messages (useful for development)
export async function DELETE() {
  try {
    MessageStore.clearMessages();

    return NextResponse.json({
      success: true,
      message: "All messages cleared",
    });
  } catch (error) {
    console.error("Error clearing messages:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
