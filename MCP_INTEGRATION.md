# MCP Integration with Claude Chat

This chat application now includes integration with your MCP (Model Context Protocol) server for SaaS management.

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start-with-mcp.sh
```

### Option 2: Manual startup
```bash
cd <project-directory>
npm run dev
```

**Note**: The chat app now connects directly to your Supabase database, so no separate MCP server is needed!

## 🔧 Available MCP Tools

Your chat app now has access to these SaaS management tools:

### 1. **Health Check**
- **Tool**: `health`
- **Description**: Check if the MCP server is running
- **Example**: "Check server status"

### 2. **User Management**
- **Tool**: `list_users`
- **Description**: List users with optional search
- **Parameters**: 
  - `search` (optional): Filter by name
  - `limit` (optional): Max results (1-100, default: 25)
- **Example**: "Show me all users" or "Find users named John"

### 3. **App Management**
- **Tool**: `list_apps`
- **Description**: List applications by category
- **Parameters**:
  - `category` (optional): Filter by category
  - `limit` (optional): Max results (1-100, default: 25)
- **Example**: "Show me all apps" or "List communication apps"

### 4. **User Assignment**
- **Tool**: `assign_user_to_app`
- **Description**: Assign users to applications
- **Parameters**:
  - `user_email` (required): User's email
  - `app_name` (required): App name
  - `role_in_app` (optional): Role (default: "Member")
  - `license_type` (optional): License type (default: "Seat")
  - `access_level` (optional): Access level (default: "Default")
  - `status` (optional): "active" or "revoked" (default: "active")
- **Example**: "Assign john@example.com to Slack"

### 5. **User Assignments**
- **Tool**: `list_user_assignments`
- **Description**: Get apps assigned to a user
- **Parameters**:
  - `user_email` (required): User's email
- **Example**: "Show me what apps john@example.com has access to"

### 6. **Create User**
- **Tool**: `create_user`
- **Description**: Create a new user
- **Parameters**:
  - `name` (required): Full name
  - `email` (required): Email address
  - `job_role` (optional): Job role
  - `start_date` (optional): Start date (YYYY-MM-DD)
  - `group` (optional): Group name
  - `team` (optional): Team name
- **Example**: "Create a new user named Jane Doe with email jane@example.com"

## 💬 Example Conversations

### User Management
```
You: "Show me all users"
Claude: [Lists all users from your database]

You: "Find users in the Engineering team"
Claude: [Searches and filters users by team]

You: "Create a new user named Alice Smith with email alice@example.com for the Marketing team"
Claude: [Creates the user with specified details]
```

### App Management
```
You: "What apps do we have?"
Claude: [Lists all available applications]

You: "Show me communication apps"
Claude: [Filters apps by communication category]

You: "Assign john@example.com to Slack with admin role"
Claude: [Creates the assignment with specified role]
```

### Assignment Management
```
You: "What apps does john@example.com have access to?"
Claude: [Shows all app assignments for that user]

You: "Revoke john@example.com's access to Figma"
Claude: [Updates the assignment status to revoked]
```

## 🔧 Technical Details

### Direct Supabase Integration
- The chat app connects directly to your Supabase database
- Uses the same credentials as your MCP server
- Tools are automatically available to Claude through the Anthropic API
- Claude can chain multiple tool calls for complex operations

### Error Handling
- Network errors are handled gracefully
- Invalid parameters are caught and reported
- Tool execution errors are shown to the user

### Security
- API keys are stored locally in the browser
- MCP server communication is handled securely
- All database operations go through your Supabase setup

## 🐛 Troubleshooting

### Database Connection Issues
1. Check if your Supabase URL and service role key are correct
2. Ensure all dependencies are installed: `npm install`
3. Check browser console for errors

### Tools Not Working
1. Check browser console for errors
2. Ensure your Anthropic API key is valid
3. Verify Supabase database is accessible

### Database Schema Issues
1. Verify your Supabase database has the required tables: `users`, `apps`, `user_app_assignments`
2. Check if your Supabase project is active
3. Ensure the database schema matches the expected structure

## 📝 Notes

- The implementation now connects directly to your Supabase database
- No separate MCP server is needed
- All tool calls are logged in the browser console for debugging
- Database operations use the same credentials as your MCP server
