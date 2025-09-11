import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for messages (for POC purposes)
// Use globalThis to persist across Next.js hot reloads in development
declare global {
  var __messageStore: Message[] | undefined;
}

const getMessages = (): Message[] => {
  if (globalThis.__messageStore === undefined) {
    globalThis.__messageStore = [];
  }
  return globalThis.__messageStore;
};

export class MessageStore {
  static addMessage(messageData: Omit<Message, "id" | "timestamp">): Message {
    const messages = getMessages();
    const message: Message = {
      id: uuidv4(),
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    console.log(`Stored message. Total messages: ${messages.length}`);
    return message;
  }

  static getAllMessages(): Message[] {
    const messages = getMessages();
    return messages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  static getMessagesByPhoneNumber(phoneNumber: string): Message[] {
    const messages = getMessages();
    return messages
      .filter((msg) => msg.from === phoneNumber || msg.to === phoneNumber)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }

  static clearMessages(): void {
    globalThis.__messageStore = [];
  }

  static getMessageCount(): number {
    return getMessages().length;
  }
}
