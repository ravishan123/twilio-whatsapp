import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for messages (for POC purposes)
let messages: Message[] = [];

export class MessageStore {
  static addMessage(messageData: Omit<Message, "id" | "timestamp">): Message {
    const message: Message = {
      id: uuidv4(),
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    return message;
  }

  static getAllMessages(): Message[] {
    return messages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  static getMessagesByPhoneNumber(phoneNumber: string): Message[] {
    return messages
      .filter((msg) => msg.from === phoneNumber || msg.to === phoneNumber)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }

  static clearMessages(): void {
    messages = [];
  }

  static getMessageCount(): number {
    return messages.length;
  }
}
