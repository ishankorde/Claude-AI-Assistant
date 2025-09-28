import { Button } from "@/components/ui/button";
import { Trash2, Bot } from "lucide-react";

interface ChatHeaderProps {
  onClearChat: () => void;
  messageCount: number;
}

export const ChatHeader = ({ onClearChat, messageCount }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-chat-header border-b border-chat-message-border shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Chat with Claude Sonnet</h1>
          <p className="text-sm text-muted-foreground">
            {messageCount > 0 ? `${messageCount} messages` : "Start a conversation"}
          </p>
        </div>
      </div>
      
      {messageCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearChat}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Clear chat history"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};