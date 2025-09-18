"use client";

import { ChatPreview } from "@/lib/messageStore";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Phone } from "lucide-react";

interface ChatListProps {
  chats: ChatPreview[];
  selectedChat?: string;
  onSelectChat: (phoneNumber: string) => void;
}

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
}: ChatListProps) {
  return (
    <Card className="w-80 border-r border-t-0 border-l-0 border-b-0 rounded-none">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Active Chats
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.phoneNumber}
              onClick={() => onSelectChat(chat.phoneNumber)}
              className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                selectedChat === chat.phoneNumber ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {chat.phoneNumber.replace("whatsapp:", "")}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(
                        new Date(chat.lastMessage.timestamp),
                        {
                          addSuffix: true,
                        }
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {chat.lastMessage.body}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {chat.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {chat.unreadCount} new
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {chat.totalMessages} messages
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No active chats</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
