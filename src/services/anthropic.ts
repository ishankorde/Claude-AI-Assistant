import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export const initializeAnthropicClient = (apiKey: string) => {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes - use server-side in production
  });
};

export const isAnthropicConfigured = () => {
  return anthropicClient !== null;
};

export const sendMessageToClaude = async (message: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []) => {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized. Please configure your API key first.');
  }

  try {
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    const response = await anthropicClient.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: messages
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    } else {
      throw new Error('Unexpected response format from Claude API');
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key') || error.message.includes('authentication')) {
        throw new Error('Invalid API key. Please check your Anthropic API key and try again.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
    }
    
    throw new Error('Failed to get response from Claude. Please try again.');
  }
};