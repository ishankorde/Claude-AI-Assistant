# MCP Component Integration Guide

This chat application now supports rendering components based on JSON definitions from your MCP server. The component definitions are passed from the MCP server and rendered dynamically in the chat interface.

## How It Works

1. **MCP Server Response**: Your MCP server should return JSON component definitions in the response
2. **Component Detection**: The chat app automatically detects JSON component definitions in responses
3. **Dynamic Rendering**: Components are rendered using the generic `ComponentRenderer`

## Supported Component Types

### UserTable Component
```json
{
  "type": "UserTable",
  "props": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "Admin",
        "status": "active",
        "lastActive": "2 hours ago",
        "avatar": "https://example.com/avatar.jpg"
      }
    ],
    "title": "Users",
    "showAvatar": true,
    "showStatus": true
  }
}
```

### Card Component
```json
{
  "type": "Card",
  "props": {
    "title": "User Summary"
  },
  "children": [
    {
      "type": "Text",
      "props": {
        "content": "This is a card with text content"
      }
    }
  ]
}
```

### Text Component
```json
{
  "type": "Text",
  "props": {
    "content": "Simple text content",
    "className": "text-lg font-bold"
  }
}
```

## MCP Server Integration

Your MCP server should return responses that include JSON component definitions. For example:

```
Here are the users in your system:

{
  "type": "UserTable",
  "props": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "Admin",
        "status": "active",
        "lastActive": "2 hours ago"
      }
    ],
    "title": "Users"
  }
}
```

## Testing

1. Visit `http://localhost:8082`
2. Click "Test User Table" button or type "Show me all users"
3. You should see a professional table rendered in the chat with sample data

**Note**: Currently using sample data for testing. In production, your MCP server should return real user data in the component JSON format.

## Adding New Component Types

To add new component types:

1. Add the component to `ComponentRenderer.tsx`
2. Update the `ComponentDefinition` interface if needed
3. Your MCP server can then return JSON for the new component type

## Benefits

- **Decoupled**: Component logic is in the MCP server, not embedded in chat app
- **Flexible**: Easy to add new component types
- **Reusable**: Same component definitions work across different chat applications
- **Maintainable**: Component updates only need to happen in the MCP server
