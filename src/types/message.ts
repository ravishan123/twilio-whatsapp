export interface Message {
  id: string;
  from: string;
  to: string;
  body: string;
  direction: "incoming" | "outgoing";
  timestamp: string;
}

export interface SendMessageRequest {
  to: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export interface TwilioWebhookData {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}
