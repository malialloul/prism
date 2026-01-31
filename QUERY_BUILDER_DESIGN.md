# Professional Visual Query Builder UI - Design Documentation

## Overview

A modern, drag-and-drop visual query builder that enables non-technical users to generate APIs without writing SQL. This component combines an intuitive canvas-based interface with a powerful right-sidebar panel for managing query configuration.

## 📐 Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  Visual Query Builder    [Add Table] [Save as API]          │
├─────────────────────────────────────────┬───────────────────┤
│                                          │                   │
│                                          │  RIGHT PANEL      │
│          MAIN CANVAS AREA                │  (380px)          │
│         (SVG, 1400x800px)                │                   │
│                                          │  [📋][🔍][📊]    │
│     ┌─────────────────────────────────┐  │                   │
│     │   Table 1       Table 2          │  │  Results Tab     │
│     │   ┌─────────────────────────────┐  │  ─────────────    │
│     │   │ ID     FK                   │  │  Selected Cols   │
│     │   │ Name   └──────┐             │  │  Connections     │
│     │   │ Email         │             │  │                   │
│     │   └────────────────┼─────────────┘  │  Filters Tab     │
│     │                    │                │  ─────────────    │
│     │   ┌──────────────────┐              │  Filter Rules    │
│     │   │ Table 3           │              │                   │
│     │   │ ID      User_ID   │              │  Details Tab     │
│     │   │ Status  (FK) ────┘              │  ─────────────    │
│     │   │ Amount                         │  Summary Stats   │
│     │   └──────────────────┘              │                   │
│     └─────────────────────────────────┘  │                   │
│                                          │                   │
└──────────────────────────────────────────┴───────────────────┘
```

## 🎨 Visual Components

### Table Card Design

```
┌─────────────────────────────────┐
│ ☰ Users          ✕              │  ← Drag to move, click ✕ to remove
├─────────────────────────────────┤
│ 🔵 id              (int)         │  ← Blue dot = connection point
│ 🔵 name            (varchar)     │     Click to select field
│ 🔵 email           (varchar)     │     Drag to connect tables
│ 🔵 created_at      (datetime)    │
│ 🔵 updated_at      (datetime)    │
│ 🔵 status          (varchar)     │
│ 🔵 phone           (varchar)     │
│ +2 more fields                   │  ← Shows count of hidden fields
└─────────────────────────────────┘
```

### Connection Visualization

**Visual Elements:**
- **Blue arrows** connect tables
- **Line direction** shows source → target relationship
- **Column matching** labeled where they connect
- **Arrow markers** indicate direction of relationship

**Example:**
```
users.id ─────────→ orders.user_id
```

### Right Sidebar Tabs

#### Tab 1: 📋 Results (Selected Columns & Connections)

Shows:
- ✅ List of selected columns with remove buttons
- 🔼 ASC/DESC sort buttons
- ✓ DISTINCT toggle
- 🔗 Table connections with relationship details
- Remove buttons for connections

#### Tab 2: 🔍 Filters (Conditions)

Shows:
- ➕ Add filter button
- 📋 List of applied filters with operations
- Values or ranges being filtered
- Remove button for each filter

#### Tab 3: 📊 Details (Query Summary)

Shows:
- 📊 Count of tables
- 📊 Count of selected columns
- 📊 Count of filters
- 📊 Plain-language summary of what's being queried

## ✨ Key Features

### 1. **Table Blocks**
- Display database tables as draggable card components
- Show all columns with their data types
- Indicate relationships visually with arrows
- Show table icons and clear hierarchy

**Non-Technical Labels:**
- "Combine tables" instead of "JOIN"
- "Match where columns are equal" instead of "ON foreign key"

### 2. **Visual Relationships**
- Drag column dots from one table to another to connect
- Visual confirmation dialog: "Combine Tables"
- Shows which columns are being matched
- Maintains connection lines on canvas
- Allow removing connections

**No SQL Jargon:**
- Uses "Combine tables" instead of "Join"
- Uses "Match columns" instead of "ON condition"
- Uses "Connect" instead of "Foreign Key"

### 3. **Field Selection**
- Click on column names to select them
- Selected columns highlight in blue (#e3f2fd)
- Selected columns appear in Results tab
- Drag column names between tables to connect

**Visual Feedback:**
- Hover effect on columns
- Highlighted background when selected
- Connection point indicator (colored dot)

### 4. **Sorting & Distinct**
- ↑ ASC button: Sort ascending
- ↓ DESC button: Sort descending
- ✓ DISTINCT button: Only unique values
- Buttons toggle between active/inactive states
- Visual toggle with color change

### 5. **Filters (Expandable)**
- Add filters via filters panel
- Support operators: equals, contains, greater, less, etc.
- Filter values displayed in human-readable format
- Visual filter cards with remove buttons
- Example: "Status equals pending"

### 6. **Responsive & Modern**
- **Desktop Layout**: Canvas + right sidebar
- **Styling**: Material-UI + styled-components
- **Colors**: Blue (#2196F3), Orange for filters, White cards
- **Typography**: Clean sans-serif, size hierarchy
- **Spacing**: Consistent 8px grid
- **Shadows**: Subtle elevation effects

### 7. **Tooltips & Guidance**
- Hover tooltips on all interactive elements
- Action hints: "Drag to move", "Click to select"
- Empty state messages with clear CTA
- Step-by-step visual guidance
- Plain-language explanations

**Examples:**
- "Drag: Connect tables | Click: Select field"
- "Drag to move table" on table cards
- "Only unique values" for DISTINCT
- "Sort ascending" for ASC button

## 🎯 User Workflow

### Step 1: Add Tables
```
User clicks "Add Table" → Selects database tables → 
Tables appear on canvas as draggable cards
```

### Step 2: Select Columns
```
User clicks column names → Selected columns highlight →
Columns appear in Results tab
```

### Step 3: Combine Tables (Optional)
```
User drags column from Table A to Table B → 
Dialog confirms connection → Connection line drawn
```

### Step 4: Add Filters (Optional)
```
User clicks "Add" in Filters tab → Selects column and condition →
Filter appears in Results with remove option
```

### Step 5: Sort & Distinct (Optional)
```
User clicks sort/distinct buttons on columns →
Buttons highlight to show active state
```

### Step 6: Save as API
```
User clicks "Save as API" → Enters API name/description →
API endpoint created from visual query
```

## 📊 Data Structure (State Management)

```typescript
// Selected tables on canvas
selectedTables: SelectedTable[] = [
  { id: "users", name: "users", columns: [...] },
  { id: "orders", name: "orders", columns: [...] }
]

// Table positions for rendering
tablePositions: Record<string, {x: number, y: number}> = {
  "users": {x: 50, y: 50},
  "orders": {x: 330, y: 50}
}

// Table connections
tableConnections: TableConnection[] = [
  {
    sourceTableId: "users",
    targetTableId: "orders",
    sourceColumn: "id",
    targetColumn: "user_id"
  }
]

// Selected result columns
selectedFields: SelectedField[] = [
  { tableId: "users", columnName: "id", sortOrder: "asc" },
  { tableId: "orders", columnName: "amount", distinct: true }
]

// Filter conditions
visualFilters: VisualFilter[] = [
  {
    tableId: "orders",
    columnName: "status",
    operator: "equals",
    value: "pending"
  }
]
```

## 🎨 Color Scheme

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary Blue | Blue | #2196F3 | Active elements, connections, buttons |
| Light Blue | Light Blue | #e3f2fd | Selected columns background |
| Neutral Gray | Gray | #f5f5f5 | Field items, backgrounds |
| Dark Text | Dark | #1a1a1a | Headings, main text |
| Light Text | Light | #999 | Descriptions, hints |
| Card Background | White | #fff | Table cards, panels |
| Border | Light Gray | #e0e0e0 | Card borders, dividers |
| Filter Background | Light Orange | #fff3e0 | Filter cards |

## 🚀 Interactive Features

### Drag & Drop
- **Table Cards**: Drag to reposition on canvas
- **Connection Points**: Drag columns to connect tables
- **Connection Confirmation**: Dialog appears to confirm relationship

### Click Interactions
- **Column Names**: Click to select for output
- **Sort Buttons**: Click to toggle sort direction
- **Distinct Button**: Click to toggle uniqueness
- **Remove Buttons**: Click to delete selections
- **Tabs**: Click to switch between panel views

### Hover Effects
- Field items lighten background
- Cards show shadow elevation
- Buttons change appearance

## 📱 Responsive Design

- **Desktop (1920px+)**: Full layout with canvas + right panel
- **Tablet (1200px+)**: Canvas scaled, right panel visible
- **Mobile**: Would require alternative layout (vertical stack or modal)

## 🔧 Technical Implementation

### Components Used
- Material-UI: Buttons, Dialogs, Tabs, Paper, Typography, etc.
- Styled Components: Custom styled elements
- SVG Canvas: For table positions and connection lines
- React Hooks: State management (useState, useRef)
- TanStack Query: Schema data fetching

### Key Files
- `QueryBuilderPro.tsx`: Main component (729 lines)
- `QueryBuilder.styles.ts`: Styled components
- `QueryBuilder.types.ts`: TypeScript interfaces
- `SaveApiDialog.tsx`: API creation dialog
- `useFullSchema.ts`: Schema data hook

### Integration Points
- Backend: `/databases/:id/schema/full` endpoint
- Schema Service: Fetches table and column metadata
- Save API Dialog: Handles API creation

## 💡 Design Principles

1. **Non-Technical Language**: No SQL terminology
2. **Visual First**: Everything shown graphically
3. **Clear Feedback**: Buttons, highlights, tooltips
4. **Intuitive Actions**: Drag-drop natural workflow
5. **Organized Panels**: Logical grouping of features
6. **Modern Aesthetics**: Clean, minimalist design
7. **Accessibility**: Clear labels, high contrast

## 🎓 User Guidance Examples

### Empty State
```
👋 Start building your query

Click "Add Table" to select database tables

[Add Your First Table Button]
```

### Tooltips
- "Drag to move table"
- "Drag: Connect tables | Click: Select field"
- "Sort ascending"
- "Only unique values"
- "Add a condition to narrow down results"

### Hints
- "All tables are already added"
- "Click column names on tables to select what to show"
- "Drag column names between tables to connect them"
- "Filters help show only the data you want"

## 📈 Future Enhancements

- **Aggregations**: Sum, Count, Average, Min, Max visual blocks
- **Grouping**: Visual grouping indicators
- **Subqueries**: Nested visual queries
- **Live Preview**: Real-time data preview
- **API Testing**: Built-in API tester
- **Query Export**: SQL preview and export
- **Undo/Redo**: Operation history
- **Sharing**: Shareable query templates
