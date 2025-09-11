import { Message } from "@/types/message";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isOutgoing = message.direction === "outgoing";
  const phoneNumber = message.from.replace("whatsapp:", "");
  const initials = isOutgoing ? "ME" : phoneNumber.slice(-2);

  return (
    <div
      className={`flex mb-3 gap-3 ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      {!isOutgoing && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col ${
          isOutgoing ? "items-end" : "items-start"
        } max-w-xs lg:max-w-md`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isOutgoing ? "You" : phoneNumber}
          </span>
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
            })}
          </Badge>
        </div>

        <Card
          className={`px-3 py-2 ${
            isOutgoing
              ? "bg-primary text-primary-foreground ml-4"
              : "bg-muted mr-4"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.body}</p>
        </Card>
      </div>

      {isOutgoing && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
