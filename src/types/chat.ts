// MCP Component definition interface
export interface ComponentDefinition {
  type: string;
  props: Record<string, any>;
  children?: ComponentDefinition[];
}

export interface MessageContent {
  type: 'text' | 'component';
  data: string | ComponentDefinition;
}

export interface Message {
  id: string;
  content: string | MessageContent[];
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}