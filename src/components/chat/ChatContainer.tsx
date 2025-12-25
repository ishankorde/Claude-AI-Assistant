import { useState, useRef, useEffect, useCallback } from "react";
import { Message, ChatState } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { ErrorMessage } from "./ErrorMessage";
import { ApiKeySetup } from "./ApiKeySetup";
import { sendMessageToClaude, initializeAnthropicClient, isAnthropicConfigured } from "@/services/anthropic";
import { testMCPClient } from "@/services/mcp";
import { useToast } from "@/hooks/use-toast";
import { parseMCPResponse } from "@/utils/responseParser";

export const ChatContainer = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Always call all hooks before any conditional returns
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Check if API key is already configured
    setIsConfigured(isAnthropicConfigured());
  }, []);

  useEffect(() => {
    if (isConfigured) {
      scrollToBottom();
    }
  }, [chatState.messages, chatState.isLoading, scrollToBottom, isConfigured]);

  const handleApiKeySet = useCallback(async (apiKey: string) => {
    try {
      initializeAnthropicClient(apiKey);
      setIsConfigured(true);
      
      // Test MCP client (don't let this block the API key setup)
      try {
        await testMCPClient();
        console.log('MCP Client test successful');
      } catch (error) {
        console.error('MCP Client test failed:', error);
        // Don't throw - just log the error and continue
      }
      
      toast({
        title: "API Key Configured",
        description: "You can now start chatting with Claude!",
      });
    } catch (error) {
      console.error('Error configuring API key:', error);
      toast({
        title: "Error",
        description: "Failed to configure API key. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw so the form knows it failed
    }
  }, [toast]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Prepare conversation history for Claude
      const conversationHistory = chatState.messages.map(msg => {
        let content: string;
        
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else {
          // For structured content, only include text parts, skip components
          const textParts = msg.content
            .filter(item => item.type === 'text')
            .map(item => item.data as string);
          content = textParts.join(' ');
        }
        
        return {
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: content || 'Component rendered' // Fallback for component-only messages
        };
      });

      console.log('🔧 Sending to Claude with conversation history:', conversationHistory);
      
      const response = await sendMessageToClaude(content, conversationHistory);
      
      console.log('🔧 Claude response received:', response.substring(0, 200) + '...');
      
      // Parse the response to detect MCP components and format accordingly
      const parsedContent = parseMCPResponse(response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: parsedContent,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [chatState.messages, toast]);

  const handleClearChat = useCallback(() => {
    setChatState({
      messages: [],
      isLoading: false,
      error: null,
    });
    
    toast({
      title: "Chat cleared",
      description: "Conversation history has been cleared.",
    });
  }, [toast]);

  const handleRetry = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null,
    }));
    
    // Retry the last user message if it exists
    const lastUserMessage = [...chatState.messages].reverse().find(msg => msg.sender === 'user');
    if (lastUserMessage && typeof lastUserMessage.content === 'string') {
      handleSendMessage(lastUserMessage.content);
    }
  }, [chatState.messages, handleSendMessage]);

  // Conditional rendering after all hooks are called
  if (!isConfigured) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }


  return (
    <div className="flex flex-col h-screen bg-chat-background">
      <ChatHeader 
        onClearChat={handleClearChat} 
        messageCount={chatState.messages.length}
      />
      
      <div className="flex-1 overflow-y-auto">
        {chatState.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Claude Chat</h2>
              <p className="text-muted-foreground mb-4">
                Start a conversation with Claude 3.5 Haiku. Ask questions, get help with coding, writing, analysis, and more.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-medium text-primary mb-2">🔧 SaaS Management Tools Available</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Claude can help you manage your SaaS applications and users:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• List and search users</li>
                  <li>• Manage app assignments</li>
                  <li>• Create new users</li>
                  <li>• View user permissions</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Try: "Show me all users" or "Assign john@example.com to Slack"
                </p>
                <button
                  onClick={() => handleSendMessage("Show me all users")}
                  className="mt-3 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
                >
                  Test User Table
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {chatState.isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatState.error && (
        <ErrorMessage error={chatState.error} onRetry={handleRetry} />
      )}
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={chatState.isLoading}
      />
    </div>
  );
};