import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 p-4 opacity-75">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      
      <div className="flex flex-col">
        <div className="bg-chat-ai-message text-chat-ai-message-foreground rounded-2xl rounded-bl-md px-4 py-3 border border-chat-message-border shadow-sm">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-chat-typing-indicator rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-chat-typing-indicator rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-chat-typing-indicator rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs text-chat-typing-indicator ml-2">Claude is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};