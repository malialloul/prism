# Query Builder Pro - Developer Guide

## Quick Start

### Import & Use
```typescript
import QueryBuilderPro from './QueryBuilder/QueryBuilderPro';

<QueryBuilderPro connectedDatabase={{ id: 1, name: 'my_db' }} />
```

### Props
```typescript
interface QueryBuilderProps {
  connectedDatabase: { id: string | number; name: string } | null;
}
```

## Component Structure

### Main Features Implemented

✅ **Table Management**
- Add tables from database schema
- Remove tables from canvas
- Drag tables to reposition
- View column information

✅ **Field Selection**
- Click columns to select
- Visual feedback (blue highlight)
- Appears in Results tab
- Supports sort and distinct

✅ **Table Connections**
- Drag column to column to connect
- Confirmation dialog
- Visual connection lines with arrows
- Remove connections

✅ **Right Sidebar Panels**
- **Results Tab**: Selected columns + connections
- **Filters Tab**: (Ready for filter implementation)
- **Details Tab**: Query summary statistics

✅ **Sorting & Distinct**
- ASC/DESC buttons
- DISTINCT toggle
- Visual button states

✅ **Save API**
- Dialog to create API
- Integrates with SaveApiDialog component
- Passes query config to backend

## File Organization

```
QueryBuilder/
├── QueryBuilderPro.tsx          # Main component
├── QueryBuilder.styles.ts        # Styled components
├── QueryBuilder.types.ts         # TypeScript interfaces
├── components/
│   └── SaveApiDialog.tsx        # API save dialog
└── hooks/
    └── useFullSchema.ts         # Schema fetching hook
```

## State Management

### Key State Variables

```typescript
// Tables and positions
const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([]);
const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({});

// Connections
const [tableConnections, setTableConnections] = useState<TableConnection[]>([]);

// Selected output
const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);

// Filters
const [visualFilters, setVisualFilters] = useState<VisualFilter[]>([]);

// Dialog states
const [saveDialogOpen, setSaveDialogOpen] = useState(false);
const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
const [connectDialogOpen, setConnectDialogOpen] = useState(false);
```

## Key Functions

### Adding Tables
```typescript
const handleAddTable = (table: any) => {
  // Creates new table card on canvas
  // Initializes position
  // Updates state
}
```

### Removing Tables
```typescript
const handleRemoveTable = (tableId: string) => {
  // Removes table from selectedTables
  // Removes associated positions
  // Removes associated connections
  // Removes associated fields
}
```

### Table Connections
```typescript
const handleConnectionDragStart = (...) => {
  // Initiates column drag from source table
}

const handleConnectionDrop = (...) => {
  // Completes column drag to target table
  // Opens confirmation dialog
}

const handleConfirmConnection = () => {
  // Creates connection between tables
  // Draws connection line
}
```

### Field Selection
```typescript
const handleSelectField = (field: SelectedField) => {
  // Marks column for output
  // Adds to selectedFields array
}

const toggleFieldSort = (tableId, columnName, order) => {
  // Sets sort direction for column
}

const toggleFieldDistinct = (tableId, columnName) => {
  // Toggles distinct flag for column
}
```

### Save API
```typescript
const handleSaveApi = async (apiName, description) => {
  // Creates QueryConfig from state
  // Calls SaveApiDialog callback
  // Sends to backend
}
```

## Styling Guide

### Using Styled Components

```typescript
import {
  Header,
  Title,
  SaveButton,
  Canvas,
  TableCard,
  FieldItem,
  EmptyStateMessage,
} from './QueryBuilder.styles';
```

### Key Styles

| Component | Purpose | Key Properties |
|-----------|---------|-----------------|
| Header | Top bar | flex, justify-between, padding |
| Canvas | SVG area | flex: 1, background-color, overflow |
| TableCard | Table blocks | draggable, shadow, border-radius |
| FieldItem | Column rows | flex, gap, transition, cursor |
| EmptyStateMessage | No tables state | centered, large text |

### Customization

```typescript
// Override styles via sx prop
<TableCard sx={{ boxShadow: '0 8px 16px rgba(0,0,0,0.12)' }}>
  {/* content */}
</TableCard>
```

## Data Flow Diagram

```
Schema API
    ↓
useFullSchema Hook
    ↓
tables[] state
    ↓
[Add Table] Dialog → selectedTables[]
    ↓
Canvas Rendering (SVG)
    ↓
User Interactions
    ├── Click Column → selectedFields[]
    ├── Drag Column → tableConnections[]
    ├── Sort/Distinct → selectedFields updated
    └── Add Filter → visualFilters[]
    ↓
Right Sidebar
    ├── Results Tab: Display selectedFields + connections
    ├── Filters Tab: Display visualFilters
    └── Details Tab: Show summary
    ↓
[Save as API]
    ↓
SaveApiDialog
    ↓
Backend API Endpoint Created
```

## Connection Flow

```
User drags column A → column B
         ↓
handleConnectionDragStart fires
  - Sets dataTransfer data
  - Stores source info
         ↓
handleConnectionDrop fires
  - Gets target info
  - Opens connectDialogOpen
         ↓
User confirms in dialog
         ↓
handleConfirmConnection fires
  - Creates TableConnection object
  - Adds to tableConnections[]
  - drawConnectionLines() renders arrow
```

## SVG Rendering

### Connection Lines
```typescript
const drawConnectionLines = () => {
  return tableConnections.map((conn) => (
    <line
      x1={fromPos.x + 180}
      y1={fromPos.y + 100}
      x2={toPos.x}
      y2={toPos.y + 100}
      stroke="#2196F3"
      strokeWidth="3"
      markerEnd="url(#arrowhead)"
    />
  ));
};
```

### Table Cards in SVG
```typescript
<foreignObject x={pos.x} y={pos.y} width="240" height="380">
  <TableCard draggable>
    {/* React content rendered inside SVG */}
  </TableCard>
</foreignObject>
```

## Extending the Component

### Adding Filter Dialog
```typescript
// 1. Create FilterDialog component
// 2. Add state: const [filterDialogOpen, setFilterDialogOpen] = useState(false);
// 3. Implement handleAddFilter function
// 4. Render Dialog component
// 5. Handle submission to add filter to visualFilters[]
```

### Adding Aggregations
```typescript
// 1. Add aggregation state
// 2. Add aggregation buttons to field items
// 3. Create visual aggregation elements
// 4. Add to query config when saving
```

### Adding Live Preview
```typescript
// 1. Create useQueryPreview hook
// 2. Call backend with current query config
// 3. Display results in preview panel
// 4. Update on state changes (debounced)
```

## Testing Checklist

- [ ] Can add multiple tables
- [ ] Can drag tables to reposition
- [ ] Can select columns (highlight appears)
- [ ] Can connect tables (drag column to column)
- [ ] Connection dialog appears
- [ ] Connection line draws after confirm
- [ ] Can toggle sort on columns
- [ ] Can toggle distinct on columns
- [ ] Can remove connections
- [ ] Can remove tables
- [ ] Can remove columns from selection
- [ ] Right sidebar shows correct information
- [ ] Empty state displays when no tables
- [ ] Save API button works
- [ ] Dialog integrations work

## Common Issues & Solutions

### Connection Not Appearing
- Check `tablePositions` has entries for both tables
- Verify `connectionInitiatedRef` is being used correctly
- Check SVG has defs with markerEnd

### Fields Not Highlighting
- Ensure `selectedFields` includes exact tableId match
- Check the `find()` logic uses both `tableId` and `columnName`

### Drag Not Working
- Verify `draggable` prop is on the element
- Check `onDragStart` and `onDrop` handlers
- Ensure `e.preventDefault()` is called

### Performance Issues
- Memoize TableCard components if many tables
- Consider virtual scrolling for large column lists
- Debounce sorting/filtering operations

## API Integration

### Query Config Structure
```typescript
interface QueryConfig {
  tables: Array<{ name: string; alias: string }>;
  tableConnections?: TableConnection[];
  selectedFields: SelectedField[];
  filters: FilterCondition[];
  grouping: GroupingRule[];
  having: FilterCondition[];
  apiName?: string;
  description?: string;
}
```

### Backend Endpoint
```
POST /apis
Body: QueryConfig
Response: { id, endpoint, name, created }
```

## Resources

- Material-UI Components: https://mui.com/
- Styled Components: https://styled-components.com/
- React Hooks: https://react.dev/
- SVG Reference: https://developer.mozilla.org/en-US/docs/Web/SVG

## Next Steps

1. Implement filter dialog and backend integration
2. Add aggregation visual elements
3. Add subquery builder
4. Implement live preview
5. Add query export/SQL preview
6. Create shareable query templates
