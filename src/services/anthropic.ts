import Anthropic from '@anthropic-ai/sdk';
import { MCP_TOOLS, mcpClient, MCPToolResult } from './mcp';

let anthropicClient: Anthropic | null = null;

export const initializeAnthropicClient = (apiKey: string) => {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes - use server-side in production
  });
  
  // Initialize MCP client
  mcpClient.connect();
};

export const isAnthropicConfigured = () => {
  return anthropicClient !== null;
};

// Convert MCP tools to Anthropic tools format
const convertMCPToolsToAnthropic = () => {
  const tools = MCP_TOOLS.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema
  }));
  console.log('Converted tools for Anthropic:', tools);
  return tools;
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
      system: 'You are a helpful assistant with access to SaaS management tools. When users ask about users, apps, or assignments, use the appropriate tools to get real data from the database. CRITICAL: When you receive tool results that contain component JSON (like UserTable), you MUST return the exact JSON component data in your response. Do not summarize or rewrite the data - return the component JSON exactly as provided by the tool.',
      messages: messages,
      tools: convertMCPToolsToAnthropic()
    });

    console.log('Claude response:', response);
    console.log('Response content type:', response.content[0].type);
    console.log('Stop reason:', response.stop_reason);
    console.log('Content array length:', response.content.length);
    console.log('All content types:', response.content.map(c => c.type));

    // Handle tool use responses - check both content type and stop reason
    if (response.content[0].type === 'tool_use' || response.stop_reason === 'tool_use') {
      // Find the tool_use content item (might not be the first one)
      const toolUseContent = response.content.find(c => c.type === 'tool_use');
      if (!toolUseContent) {
        console.error('Tool use stop reason but no tool_use content found');
        return 'Error: Tool use requested but no tool content found';
      }
      
      const toolUse = toolUseContent;
      const toolName = toolUse.name;
      const toolInput = toolUse.input;

      try {
        // Call the MCP tool
        const toolResult = await mcpClient.callTool(toolName, toolInput);
        
        // Send the tool result back to Claude in the correct format
        const toolResultMessage = {
          role: 'user' as const,
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: toolResult.content[0].text
            }
          ]
        };

        // Check if the tool result contains component JSON
        const toolResultText = toolResult.content[0].text;
        console.log('🔍 Tool result text:', toolResultText.substring(0, 200) + '...');
        
        // Look for component JSON in the tool result
        const componentMatch = toolResultText.match(/\{[\s\S]*"type"[\s\S]*\}/);
        if (componentMatch) {
          console.log('✅ Found component JSON in tool result, returning directly');
          return toolResultText;
        }
        
        const finalResponse = await anthropicClient.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4000,
          temperature: 0.7,
          messages: [
            ...messages,
            { role: 'assistant' as const, content: response.content },
            toolResultMessage
          ],
          tools: convertMCPToolsToAnthropic()
        });

        if (finalResponse.content[0].type === 'text') {
          return finalResponse.content[0].text;
        } else {
          // If Claude wants to use another tool, handle it recursively
          return await handleToolUse(finalResponse, messages);
        }
      } catch (toolError) {
        console.error(`Error executing tool ${toolName}:`, toolError);
        return `Error executing ${toolName}: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;
      }
    } else if (response.content[0].type === 'text') {
      console.log('Claude returned text response, not using tools');
      return response.content[0].text;
    } else {
      console.log('Unexpected response type:', response.content[0].type);
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

// Helper function to handle recursive tool use
async function handleToolUse(response: any, conversationHistory: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  if (response.content[0].type === 'tool_use' || response.stop_reason === 'tool_use') {
    // Find the tool_use content item
    const toolUseContent = response.content.find((c: any) => c.type === 'tool_use');
    if (!toolUseContent) {
      console.error('Tool use stop reason but no tool_use content found');
      return 'Error: Tool use requested but no tool content found';
    }
    
    const toolUse = toolUseContent;
    const toolName = toolUse.name;
    const toolInput = toolUse.input;

    try {
      const toolResult = await mcpClient.callTool(toolName, toolInput);
      
      const toolResultMessage = {
        role: 'user' as const,
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: toolResult.content[0].text
          }
        ]
      };

      const finalResponse = await anthropicClient!.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          ...conversationHistory,
          { role: 'assistant' as const, content: response.content },
          toolResultMessage
        ],
        tools: convertMCPToolsToAnthropic()
      });

      if (finalResponse.content[0].type === 'text') {
        return finalResponse.content[0].text;
      } else {
        return await handleToolUse(finalResponse, conversationHistory);
      }
    } catch (toolError) {
      console.error(`Error executing tool ${toolName}:`, toolError);
      return `Error executing ${toolName}: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;
    }
  } else if (response.content[0].type === 'text') {
    return response.content[0].text;
  } else {
    throw new Error('Unexpected response format from Claude API');
  }
}