"use client";

import { useState, useEffect, useCallback } from "react";
import { Message, SendMessageRequest } from "@/types/message";
import ChatContainer from "@/components/ChatContainer";
import MessageInput from "@/components/MessageInput";
import SetupGuide from "@/components/SetupGuide";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  RefreshCw,
  Phone,
  Wifi,
  AlertCircle,
  X,
  Bot,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetPhoneNumber, setTargetPhoneNumber] = useState(
    "whatsapp:+94728268717"
  );
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch messages from the API
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to connect to server");
    }
  }, []);

  // Send a message
  const handleSendMessage = async (messageText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: SendMessageRequest = {
        to: targetPhoneNumber,
        message: messageText,
      };

      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      // Refresh messages after sending
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI suggestion for response
  const generateAISuggestion = async () => {
    if (!targetPhoneNumber.trim()) return;

    setIsGeneratingAI(true);
    setError(null);

    try {
      const lastMessage = messages
        .filter(
          (msg) =>
            msg.from === targetPhoneNumber && msg.direction === "incoming"
        )
        .slice(-1)[0];

      if (!lastMessage) {
        setError("No incoming messages to respond to");
        return;
      }

      const response = await fetch("/api/ai-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: lastMessage.body,
          phoneNumber: targetPhoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAiSuggestion(data.reply);
      } else {
        setError(data.error || "Failed to generate AI suggestion");
      }
    } catch (err) {
      console.error("Error generating AI suggestion:", err);
      setError("Failed to generate AI suggestion");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">WhatsApp Business</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected via Twilio
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {messages.length} messages
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Support
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAISuggestion}
                disabled={isGeneratingAI || !targetPhoneNumber.trim()}
              >
                <Sparkles
                  className={`h-4 w-4 mr-2 ${
                    isGeneratingAI ? "animate-spin" : ""
                  }`}
                />
                AI Suggest
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMessages}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          <Separator className="mt-4" />

          <div className="flex items-center gap-3 pt-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={targetPhoneNumber}
              onChange={(e) => setTargetPhoneNumber(e.target.value)}
              placeholder="whatsapp:+1234567890"
              className="flex-1 text-sm"
            />
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              Auto-refresh: 3s
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* AI Suggestion Display */}
      {aiSuggestion && (
        <div className="mx-4 mb-2">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Bot className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    AI Suggestion:
                  </div>
                  <div className="text-sm text-blue-700 mb-2">
                    {aiSuggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleSendMessage(aiSuggestion);
                        setAiSuggestion("");
                      }}
                      className="text-xs h-7"
                    >
                      Send This
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAiSuggestion("")}
                      className="text-xs h-7"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer messages={messages} isLoading={isLoading} />
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || !targetPhoneNumber.trim()}
        />
      </div>

      {/* Setup Guide */}
      <SetupGuide />
    </main>
  );
}
