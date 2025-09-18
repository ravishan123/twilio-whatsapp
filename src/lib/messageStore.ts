import { Message } from "@/types/message";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for messages (for POC purposes)
// Use globalThis to persist across Next.js hot reloads in development
declare global {
  var __messageStore: Message[] | undefined;
  var __activeChats: Set<string> | undefined;
}

const getMessages = (): Message[] => {
  if (globalThis.__messageStore === undefined) {
    globalThis.__messageStore = [];
  }
  return globalThis.__messageStore;
};

const getActiveChats = (): Set<string> => {
  if (globalThis.__activeChats === undefined) {
    globalThis.__activeChats = new Set();
  }
  return globalThis.__activeChats;
};

export interface ChatPreview {
  phoneNumber: string;
  lastMessage: Message;
  unreadCount: number;
  totalMessages: number;
}

export class MessageStore {
  static addMessage(messageData: Omit<Message, "id" | "timestamp">): Message {
    const messages = getMessages();
    const message: Message = {
      id: uuidv4(),
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);

    // Update active chats
    const activeChats = getActiveChats();
    if (message.from.startsWith("whatsapp:")) {
      activeChats.add(message.from);
    }
    if (message.to.startsWith("whatsapp:")) {
      activeChats.add(message.to);
    }

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

  static getActiveChats(): string[] {
    return Array.from(getActiveChats());
  }

  static getChatPreviews(): ChatPreview[] {
    const messages = getMessages();
    const previews: Map<string, ChatPreview> = new Map();

    // Process messages to build chat previews
    messages.forEach((message) => {
      const phoneNumber =
        message.direction === "incoming" ? message.from : message.to;

      if (!previews.has(phoneNumber)) {
        previews.set(phoneNumber, {
          phoneNumber,
          lastMessage: message,
          unreadCount: message.direction === "incoming" ? 1 : 0,
          totalMessages: 1,
        });
      } else {
        const preview = previews.get(phoneNumber)!;
        if (
          new Date(message.timestamp) > new Date(preview.lastMessage.timestamp)
        ) {
          preview.lastMessage = message;
        }
        preview.unreadCount += message.direction === "incoming" ? 1 : 0;
        preview.totalMessages += 1;
      }
    });

    return Array.from(previews.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.timestamp).getTime() -
        new Date(a.lastMessage.timestamp).getTime()
    );
  }

  static clearMessages(): void {
    globalThis.__messageStore = [];
    globalThis.__activeChats = new Set();
  }

  static getMessageCount(): number {
    return getMessages().length;
  }
}
