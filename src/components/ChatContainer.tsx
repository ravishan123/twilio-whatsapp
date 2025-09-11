"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import ChatBubble from "./ChatBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatContainer({
  messages,
  isLoading = false,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className="flex-1 border-x-0 border-t-0 rounded-none">
      <ScrollArea className="h-full">
        <div className="p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No messages yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Start a conversation by sending a message! Your WhatsApp
                    integration is ready.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Sending...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}
