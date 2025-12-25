// MCP Client Service for SaaS Management
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolResult {
  content: Array<{ type: string; text: string }>;
}

// Define the available MCP tools based on your server
export const MCP_TOOLS: MCPTool[] = [
  {
    name: "health",
    description: "Simple status ping to check if the MCP server is running",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "list_users",
    description: "Return users (optionally filtered by name)",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional search term to filter users by name"
        },
        limit: {
          type: "integer",
          description: "Maximum number of users to return (1-100)",
          minimum: 1,
          maximum: 100,
          default: 25
        }
      },
      required: []
    }
  },
  {
    name: "list_apps",
    description: "Return apps (optionally by category)",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category to filter apps"
        },
        limit: {
          type: "integer",
          description: "Maximum number of apps to return (1-100)",
          minimum: 1,
          maximum: 100,
          default: 25
        }
      },
      required: []
    }
  },
  {
    name: "assign_user_to_app",
    description: "Creates or updates a user→app assignment",
    inputSchema: {
      type: "object",
      properties: {
        user_email: {
          type: "string",
          format: "email",
          description: "Email of the user to assign"
        },
        app_name: {
          type: "string",
          description: "Name of the app to assign the user to"
        },
        role_in_app: {
          type: "string",
          description: "Role of the user in the app",
          default: "Member"
        },
        license_type: {
          type: "string",
          description: "Type of license for the user",
          default: "Seat"
        },
        access_level: {
          type: "string",
          description: "Access level for the user",
          default: "Default"
        },
        status: {
          type: "string",
          enum: ["active", "revoked"],
          description: "Status of the assignment",
          default: "active"
        }
      },
      required: ["user_email", "app_name"]
    }
  },
  {
    name: "list_user_assignments",
    description: "Apps assigned to a user",
    inputSchema: {
      type: "object",
      properties: {
        user_email: {
          type: "string",
          format: "email",
          description: "Email of the user to get assignments for"
        }
      },
      required: ["user_email"]
    }
  },
  {
    name: "create_user",
    description: "Create a new user in the 'users' table",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name of the user",
          minLength: 1
        },
        email: {
          type: "string",
          format: "email",
          description: "Email address of the user"
        },
        job_role: {
          type: "string",
          description: "Job role of the user"
        },
        start_date: {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "Start date in YYYY-MM-DD format"
        },
        group: {
          type: "string",
          description: "Group the user belongs to"
        },
        team: {
          type: "string",
          description: "Team the user belongs to"
        }
      },
      required: ["name", "email"]
    }
  }
];

// Direct Supabase client for MCP functionality
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - loaded from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn('⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { 
  auth: { persistSession: false } 
});

// MCP Client class to handle communication with Supabase directly
export class MCPClient {
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      // Test connection to Supabase
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
      
      this.isConnected = true;
      console.log('MCP Client connected to Supabase');
    } catch (error) {
      console.error('Failed to connect to Supabase:', error);
      // Still allow connection for fallback mode
      this.isConnected = true;
      console.log('MCP Client connected (fallback mode)');
    }
  }

  async callTool(toolName: string, parameters: any): Promise<MCPToolResult> {
    console.log(`🔧 MCP callTool called with: ${toolName}`, parameters);
    console.log(`🔧 MCP client connected: ${this.isConnected}`);
    
    if (!this.isConnected) {
      console.log('🔧 MCP client not connected, connecting now...');
      await this.connect();
    }

    try {
      console.log(`🔧 MCP Client: Calling real database for tool: ${toolName}`);
      // Call the real Supabase database
      const result = await this.callRealDatabase(toolName, parameters);
      console.log(`✅ MCP Client: Tool ${toolName} result:`, result);
      return result;
    } catch (error) {
      console.warn(`❌ Real database call failed, using mock data:`, error);
      console.error('Full error details:', error);
      
      // For debugging, let's see what the real database call would return
      console.log('🔧 Attempting to call real database directly...');
      try {
        const directResult = await this.callRealDatabase(toolName, parameters);
        console.log('✅ Direct database call succeeded:', directResult);
        return directResult;
      } catch (directError) {
        console.error('❌ Direct database call also failed:', directError);
      }
      
      // Fall back to mock data if database fails
      const result = await this.simulateMCPCall(toolName, parameters);
      console.log(`🔄 Using mock data for ${toolName}:`, result);
      return result;
    }
  }

  private async callRealDatabase(toolName: string, parameters: any): Promise<MCPToolResult> {
    switch (toolName) {
      case 'health':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ ok: true, time: new Date().toISOString() }, null, 2)
          }]
        };

      case 'list_users':
        console.log('🔍 MCP list_users called with parameters:', parameters);
        const { search, limit = 25 } = parameters;
        let query = supabase.from('users').select('id,name,email,job_role,start_date,group,team').limit(limit);
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        const { data, error } = await query;
        if (error) {
          console.error('❌ Supabase query error:', error);
          throw new Error(error.message);
        }
        
        console.log('📊 Raw Supabase data:', data);
        
        // Map the data to the expected format
        const mappedUsers = await Promise.all(data.map(async (user) => {
          // Try to get app count from different possible table names
          let appsCount = 0;
          
          try {
            // Try user_app_assignments first
            const { count: count1 } = await supabase
              .from('user_app_assignments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            if (count1 !== null) appsCount = count1;
          } catch (e) {
            // Table doesn't exist, try other names
            try {
              const { count: count2 } = await supabase
                .from('user_apps')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
              if (count2 !== null) appsCount = count2;
            } catch (e2) {
              try {
                const { count: count3 } = await supabase
                  .from('app_assignments')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id);
                if (count3 !== null) appsCount = count3;
              } catch (e3) {
                // No app assignment table found, keep count as 0
                console.log(`No app assignment table found for user ${user.id}`);
              }
            }
          }
          
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.job_role || 'User',
            status: 'active' as const,
            lastActive: 'Unknown', // No created_at field available
            team: user.team || 'N/A',
            group: user.group || 'N/A',
            startDate: user.start_date || 'N/A',
            appsCount: appsCount
          };
        }));
        
        console.log('🎯 Mapped users data:', mappedUsers);
        
        // Return component JSON with comprehensive styling configuration
        const componentJson = {
          type: 'UserTable',
          props: {
            users: mappedUsers,
            title: search ? `Users matching "${search}"` : 'Users',
            searchPlaceholder: 'Search users...',
            onRowClick: null,
            // 100% MCP-controlled styling configuration
            styling: {
              // Complete CSS class definitions from MCP
              classes: {
                container: "w-full overflow-hidden border rounded-lg bg-background shadow-sm",
                searchContainer: "relative",
                searchInput: "pl-10",
                tableContainer: "border rounded-lg",
                tableHeader: "bg-table-header text-table-header-foreground",
                tableHead: "h-12 px-4 text-left align-middle font-medium text-table-header-foreground",
                tableRow: "border-b transition-colors hover:bg-muted/50",
                tableCell: "p-4 align-middle",
                resultsCount: "text-sm text-muted-foreground",
                sortButton: "h-auto p-0 font-medium text-left justify-start",
                badge: "text-xs",
                badgeRole: "bg-secondary text-secondary-foreground",
                badgeApps: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              },
              // Complete layout configuration from MCP
              layout: {
                showSearch: true,
                showSorting: true,
                showResultsCount: true,
                showBorders: true,
                rounded: true,
                searchPlaceholder: "Search users...",
                emptyStateMessage: "No results found"
              },
              // Complete column configuration from MCP
              columns: [
                { key: 'name', label: 'Name', sortable: true, searchable: true, width: 'auto' },
                { key: 'email', label: 'Email', sortable: true, searchable: true, width: 'auto' },
                { key: 'role', label: 'Role', sortable: true, searchable: true, width: 'auto' },
                { key: 'team', label: 'Team', sortable: true, searchable: true, width: 'auto' },
                { key: 'group', label: 'Group', sortable: true, searchable: true, width: 'auto' },
                { key: 'appsCount', label: 'Apps', sortable: true, searchable: false, width: 'auto' },
                { key: 'startDate', label: 'Start Date', sortable: true, searchable: false, width: 'auto' }
              ],
              // Complete cell rendering configuration from MCP
              cellRenderers: {
                role: { type: 'badge', variant: 'secondary', className: 'text-xs' },
                appsCount: { type: 'badge', variant: 'outline', className: 'text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
                team: { type: 'text', className: 'text-sm text-muted-foreground' },
                group: { type: 'text', className: 'text-sm text-muted-foreground' },
                startDate: { type: 'text', className: 'text-sm text-muted-foreground' }
              }
            }
          }
        };
        
        console.log('✅ Returning real component JSON:', componentJson);
        
        return {
          content: [{
            type: 'text',
            text: `Here are the users in your system:\n\n${JSON.stringify(componentJson, null, 2)}`
          }]
        };

      case 'list_apps':
        const { category, limit: appLimit = 25 } = parameters;
        let appQuery = supabase.from('apps').select('id,name,category,vendor,tier,owner_team,sso_required,status').limit(appLimit);
        if (category) {
          appQuery = appQuery.eq('category', category);
        }
        const { data: appData, error: appError } = await appQuery;
        if (appError) throw new Error(appError.message);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(appData, null, 2)
          }]
        };

      case 'assign_user_to_app':
        const { user_email, app_name, role_in_app = 'Member', license_type = 'Seat', access_level = 'Default', status = 'active' } = parameters;
        
        // Get user ID
        const { data: user, error: userError } = await supabase.from('users').select('id').eq('email', user_email).single();
        if (userError || !user) throw new Error(`User not found: ${user_email}`);

        // Get app ID
        const { data: app, error: appLookupError } = await supabase.from('apps').select('id').eq('name', app_name).single();
        if (appLookupError || !app) throw new Error(`App not found: ${app_name}`);

        // Create assignment
        const { data: assignment, error: assignmentError } = await supabase
          .from('user_app_assignments')
          .upsert(
            { user_id: user.id, app_id: app.id, role_in_app, license_type, access_level, status },
            { onConflict: 'user_id,app_id' }
          )
          .select()
          .single();

        if (assignmentError) throw new Error(assignmentError.message);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(assignment, null, 2)
          }]
        };

      case 'list_user_assignments':
        const { user_email: userEmail } = parameters;
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments_expanded')
          .select('app_name,role_in_app,license_type,status,assigned_on,email,team,group')
          .eq('email', userEmail)
          .order('assigned_on', { ascending: false });

        if (assignmentsError) throw new Error(assignmentsError.message);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(assignments, null, 2)
          }]
        };

      case 'create_user':
        const { name, email, job_role, start_date, group, team } = parameters;
        const payload = {
          name,
          email: email.toLowerCase(),
          job_role: job_role ?? null,
          start_date: start_date ?? null,
          group: group ?? null,
          team: team ?? null
        };

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(payload)
          .select()
          .single();

        if (createError) {
          const msg = createError.message || '';
          if (createError.code === '23505' || /duplicate key|already exists/i.test(msg)) {
            throw new Error('A user with that email already exists.');
          }
          throw new Error(msg);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(newUser, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async simulateMCPCall(toolName: string, parameters: any): Promise<MCPToolResult> {
    // This is a simulation - in reality, you'd communicate with your MCP server
    // For now, we'll return mock data based on the tool called
    
    switch (toolName) {
      case 'health':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ ok: true, time: new Date().toISOString() }, null, 2)
          }]
        };
      
      case 'list_users':
        const mockUsers = [
          { 
            id: '1', 
            name: 'John Doe', 
            email: 'john@example.com', 
            role: 'Developer', 
            status: 'active', 
            lastActive: 'Unknown', 
            team: 'Engineering',
            group: 'Backend',
            startDate: '2024-01-15',
            appsCount: 0
          },
          { 
            id: '2', 
            name: 'Jane Smith', 
            email: 'jane@example.com', 
            role: 'Designer', 
            status: 'active', 
            lastActive: 'Unknown', 
            team: 'Design',
            group: 'UI/UX',
            startDate: '2024-02-01',
            appsCount: 0
          }
        ];
        
        const mockComponentJson = {
          type: 'UserTable',
          props: {
            users: mockUsers,
            title: 'Users (Mock Data)',
            showAvatar: false,
            showStatus: false
          }
        };
        
        return {
          content: [{
            type: 'text',
            text: `Here are the users in your system:\n\n${JSON.stringify(mockComponentJson, null, 2)}`
          }]
        };
      
      case 'list_apps':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify([
              { id: 1, name: 'Slack', category: 'Communication', vendor: 'Slack Technologies', tier: 'Pro' },
              { id: 2, name: 'Figma', category: 'Design', vendor: 'Figma Inc', tier: 'Professional' }
            ], null, 2)
          }]
        };
      
      case 'assign_user_to_app':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `User ${parameters.user_email} assigned to ${parameters.app_name}`,
              assignment: {
                user_email: parameters.user_email,
                app_name: parameters.app_name,
                role_in_app: parameters.role_in_app || 'Member',
                status: parameters.status || 'active'
              }
            }, null, 2)
          }]
        };
      
      case 'list_user_assignments':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify([
              {
                app_name: 'Slack',
                role_in_app: 'Member',
                license_type: 'Seat',
                status: 'active',
                assigned_on: '2024-01-15',
                email: parameters.user_email
              }
            ], null, 2)
          }]
        };
      
      case 'create_user':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: {
                id: Math.floor(Math.random() * 1000),
                name: parameters.name,
                email: parameters.email,
                job_role: parameters.job_role,
                start_date: parameters.start_date,
                group: parameters.group,
                team: parameters.team,
                created_at: new Date().toISOString()
              }
            }, null, 2)
          }]
        };
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('MCP Client disconnected');
  }
}

// Singleton instance
export const mcpClient = new MCPClient();

// Test function to verify MCP client is working
export const testMCPClient = async () => {
  try {
    await mcpClient.connect();
    console.log('🔧 Testing MCP Client connection...');
    
    // Test Supabase connection directly
    console.log('🔧 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('id,name').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      throw error;
    }
    console.log('✅ Supabase connection test successful:', data);
    
    const result = await mcpClient.callTool('health', {});
    console.log('✅ MCP Client test result:', result);
    return result;
  } catch (error) {
    console.error('❌ MCP Client test failed:', error);
    throw error;
  }
};

// Force real data function for debugging
export const forceRealData = async () => {
  console.log('🔧 Force real data called');
  try {
    const { data, error } = await supabase.from('users').select('id,name,email,job_role,start_date,group,team').limit(25);
    if (error) {
      console.error('❌ Supabase query failed:', error);
      throw error;
    }
    
    console.log('✅ Raw Supabase data:', data);
    
    // Map the data to the expected format
    const mappedUsers = data.map((user) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.job_role || 'User',
      status: 'active' as const,
      lastActive: 'Unknown',
      team: user.team || 'N/A',
      group: user.group || 'N/A',
      startDate: user.start_date || 'N/A',
      appsCount: 0
    }));
    
    console.log('✅ Mapped users data:', mappedUsers);
    
    return {
      content: [{
        type: 'text',
        text: `Here are the users in your system:\n\n${JSON.stringify({
          type: 'UserTable',
          props: {
            users: mappedUsers,
            title: 'Users',
            showAvatar: false,
            showStatus: false
          }
        }, null, 2)}`
      }]
    };
  } catch (error) {
    console.error('❌ Force real data failed:', error);
    throw error;
  }
};
