import { MessageContent, ComponentDefinition } from "@/types/chat";

// Function to parse MCP response and detect component JSON
export const parseMCPResponse = (response: string): MessageContent[] => {
  console.log('🔍 parseMCPResponse called with:', response.substring(0, 200) + '...');
  const content: MessageContent[] = [];
  
  // Try to parse JSON component from MCP response first
  try {
    // Look for JSON component definitions in the response
    const jsonMatch = response.match(/\{[\s\S]*"type"[\s\S]*\}/);
    if (jsonMatch) {
      console.log('🎯 Found JSON component in response:', jsonMatch[0]);
      const componentJson = JSON.parse(jsonMatch[0]);
      if (componentJson.type) {
        console.log('✅ Parsed component JSON:', componentJson);
        content.push({
          type: 'component',
          data: componentJson
        });
        return content;
      }
    }
  } catch (error) {
    // JSON parsing failed, continue with text parsing
  }
  
  // Check if the response contains user data patterns and try to extract it
  const userPatterns = [
    /(?:user|users|member|members).*?(?:list|found|showing)/i,
    /(?:here are|here's|found).*?(?:user|users)/i,
    /(?:email|name|role|status).*?(?:@|\.com)/i
  ];
  
  const hasUserData = userPatterns.some(pattern => pattern.test(response));
  
  if (hasUserData) {
    // Try to extract user data from the response and create component JSON
    const users = extractUsersFromText(response);
    
    if (users.length > 0) {
      // Add text content before the table
      const textBeforeTable = response.split(/\n\s*\n/)[0] || "Here are the users:";
      if (textBeforeTable.trim()) {
        content.push({
          type: 'text',
          data: textBeforeTable.trim()
        });
      }
      
      // Create component JSON for the user table
      const userTableComponent: ComponentDefinition = {
        type: 'UserTable',
        props: {
          users,
          title: "Users",
          showAvatar: true,
          showStatus: true
        }
      };
      
      content.push({
        type: 'component',
        data: userTableComponent
      });
      
      return content;
    }
  }
  
  // If no component data found, return as plain text
  return [{
    type: 'text',
    data: response
  }];
};

// Function to extract user data from text
const extractUsersFromText = (text: string): User[] => {
  const users: User[] = [];
  
  // Common patterns for user data
  const patterns = [
    // Pattern 1: Name - Email (Role) [Status]
    /([A-Za-z\s]+)\s*-\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s*\(([^)]+)\)\s*\[?([^\]]*)\]?/g,
    // Pattern 2: Name, Email, Role, Status
    /([A-Za-z\s]+),\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),\s*([^,]+),\s*([^\n]+)/g,
    // Pattern 3: Email format with name
    /([A-Za-z\s]+)\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, name, email, role, status] = match;
      
      if (name && email) {
        users.push({
          id: `user-${users.length + 1}`,
          name: name.trim(),
          email: email.trim(),
          role: role?.trim() || 'User',
          status: normalizeStatus(status?.trim() || 'active'),
          lastActive: 'Recently'
        });
      }
    }
  });
  
  // If no structured data found, try to extract from simple lists
  if (users.length === 0) {
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      emailMatches.forEach((email, index) => {
        users.push({
          id: `user-${index + 1}`,
          name: `User ${index + 1}`,
          email,
          role: 'User',
          status: 'active',
          lastActive: 'Recently'
        });
      });
    }
  }
  
  return users;
};

// Normalize status values
const normalizeStatus = (status: string): 'active' | 'inactive' | 'pending' => {
  const normalized = status.toLowerCase();
  if (normalized.includes('active') || normalized.includes('online')) {
    return 'active';
  } else if (normalized.includes('inactive') || normalized.includes('offline')) {
    return 'inactive';
  } else if (normalized.includes('pending') || normalized.includes('waiting')) {
    return 'pending';
  }
  return 'active';
};

// Function to create sample user data for testing
export const createSampleUsers = (): User[] => {
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'active',
      lastActive: '1 day ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Moderator',
      status: 'inactive',
      lastActive: '1 week ago'
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'User',
      status: 'pending',
      lastActive: 'Never'
    }
  ];
};
