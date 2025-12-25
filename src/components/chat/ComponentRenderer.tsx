import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

// Component definition interface that matches MCP server JSON
export interface ComponentDefinition {
  type: string;
  props: Record<string, any>;
  children?: ComponentDefinition[];
}

// Generic component renderer for MCP JSON
export const ComponentRenderer = ({ component }: { component: ComponentDefinition }) => {
  console.log('🔧 ComponentRenderer received component:', component);
  
  const renderComponent = (comp: ComponentDefinition): React.ReactNode => {
    switch (comp.type) {
      case 'UserTable':
        return <UserTableComponent {...comp.props} />;
      case 'Card':
        return <CardComponent {...comp.props} children={comp.children} />;
      case 'Text':
        return <TextComponent {...comp.props} />;
      default:
        console.warn(`Unknown component type: ${comp.type}`);
        return <div className="text-muted-foreground">Unknown component: {comp.type}</div>;
    }
  };

  return <>{renderComponent(component)}</>;
};

// UserTable component with 100% MCP-controlled styling
const UserTableComponent = ({ 
  users = [], 
  title = "Users",
  searchPlaceholder = "Search users...",
  onRowClick,
  styling = {
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
    layout: {
      showSearch: true,
      showSorting: true,
      showResultsCount: true,
      showBorders: true,
      rounded: true,
      searchPlaceholder: "Search users...",
      emptyStateMessage: "No results found"
    },
    columns: [
      { key: 'name', label: 'Name', sortable: true, searchable: true, width: 'auto' },
      { key: 'email', label: 'Email', sortable: true, searchable: true, width: 'auto' },
      { key: 'role', label: 'Role', sortable: true, searchable: true, width: 'auto' },
      { key: 'team', label: 'Team', sortable: true, searchable: true, width: 'auto' },
      { key: 'group', label: 'Group', sortable: true, searchable: true, width: 'auto' },
      { key: 'appsCount', label: 'Apps', sortable: true, searchable: false, width: 'auto' },
      { key: 'startDate', label: 'Start Date', sortable: true, searchable: false, width: 'auto' }
    ],
    cellRenderers: {
      role: { type: 'badge', variant: 'secondary', className: 'text-xs' },
      appsCount: { type: 'badge', variant: 'outline', className: 'text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      team: { type: 'text', className: 'text-sm text-muted-foreground' },
      group: { type: 'text', className: 'text-sm text-muted-foreground' },
      startDate: { type: 'text', className: 'text-sm text-muted-foreground' }
    }
  }
}: {
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    team?: string;
    group?: string;
    startDate?: string;
    appsCount?: number;
  }>;
  title?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: any) => void;
  styling?: {
    classes: {
      container: string;
      searchContainer: string;
      searchInput: string;
      tableContainer: string;
      tableHeader: string;
      tableHead: string;
      tableRow: string;
      tableCell: string;
      resultsCount: string;
      sortButton: string;
      badge: string;
      badgeRole: string;
      badgeApps: string;
    };
    layout: {
      showSearch: boolean;
      showSorting: boolean;
      showResultsCount: boolean;
      showBorders: boolean;
      rounded: boolean;
      searchPlaceholder: string;
      emptyStateMessage: string;
    };
    columns: Array<{
      key: string;
      label: string;
      sortable: boolean;
      searchable: boolean;
      width: string;
    }>;
    cellRenderers: {
      [key: string]: {
        type: string;
        variant?: string;
        className: string;
      };
    };
  };
}) => {
  console.log('🎯 UserTableComponent received data:', { users, title, styling });
  console.log('🎯 First user data:', users[0]);
  
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Use MCP-provided columns and configuration
  const columns = styling.columns;

  const filteredAndSortedData = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = users.filter(row => {
        return columns.some(col => {
          if (col.searchable === false) return false;
          const value = row[col.key as keyof typeof row];
          return value && String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [users, search, sortColumn, sortDirection]);

  const handleSort = (column: any) => {
    if (!column.sortable) return;
    
    const columnKey = column.key as string;
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: any) => {
    if (!column.sortable) return null;
    
    const columnKey = column.key as string;
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const renderCellContent = (column: any, row: any) => {
    const value = row[column.key as keyof typeof row];
    const renderer = styling.cellRenderers[column.key];
    
    if (!renderer) {
      return String(value || '');
    }
    
    switch (renderer.type) {
      case 'badge':
        return (
          <Badge variant={renderer.variant as any} className={renderer.className}>
            {value || 'N/A'}
          </Badge>
        );
      case 'text':
        return (
          <span className={renderer.className}>
            {value || 'N/A'}
          </span>
        );
      default:
        return String(value || '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search - conditionally rendered based on MCP config */}
      {styling.layout.showSearch && (
        <div className={styling.classes.searchContainer}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={styling.layout.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styling.classes.searchInput}
          />
        </div>
      )}

      {/* Table - 100% MCP-controlled classes */}
      <div className={styling.classes.tableContainer}>
        <Table>
          <TableHeader className={styling.classes.tableHeader}>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={styling.classes.tableHead}>
                  {styling.layout.showSorting && column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className={styling.classes.sortButton}
                    >
                      {column.label}
                      {getSortIcon(column)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className={cn("text-center py-8", styling.classes.resultsCount)}>
                  {styling.layout.emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <TableRow 
                  key={row.id || index}
                  className={cn(
                    styling.classes.tableRow,
                    onRowClick ? 'cursor-pointer' : ''
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={styling.classes.tableCell}>
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count - conditionally rendered based on MCP config */}
      {styling.layout.showResultsCount && (
        <div className={styling.classes.resultsCount}>
          Showing {filteredAndSortedData.length} of {users.length} results
        </div>
      )}
    </div>
  );
};

// Card component for other content
const CardComponent = ({ 
  title, 
  children,
  className = ""
}: {
  title?: string;
  children?: ComponentDefinition[];
  className?: string;
}) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children?.map((child, index) => (
          <ComponentRenderer key={index} component={child} />
        ))}
      </CardContent>
    </Card>
  );
};

// Text component for simple text content
const TextComponent = ({ 
  content = "", 
  className = "" 
}: {
  content?: string;
  className?: string;
}) => {
  return <div className={className}>{content}</div>;
};
