import { NextResponse } from "next/server";
import { MessageStore } from "@/lib/messageStore";

export async function GET() {
  try {
    const previews = MessageStore.getChatPreviews();

    return NextResponse.json({
      success: true,
      previews,
    });
  } catch (error) {
    console.error("Error fetching chat previews:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        previews: [],
      },
      { status: 500 }
    );
  }
}
