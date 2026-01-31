# Query Builder Pro - UI Specifications & Mockups

## 📐 Layout Specifications

### Viewport Dimensions
- **Canvas Area**: 1400px width × 800px height
- **Right Sidebar**: 380px fixed width
- **Header Height**: 80px
- **Total Viewport**: 1780px minimum width

### Breakpoints
```typescript
Desktop: 1920px+    → Full layout visible
Tablet: 1200px      → Right panel may need scroll
Mobile: < 1200px    → Layout stacks vertically
```

## 🎨 Component Specifications

### 1. Header Component

**Dimensions**: Full width × 80px
**Layout**: Flexbox, space-between alignment

```
┌────────────────────────────────────────────────────────────┐
│ Visual Query Builder                  [Add Table] [Save]   │
│ 🔗 Connect tables • 🔍 Add filters • 📊 Aggregate • 💾 API │
└────────────────────────────────────────────────────────────┘
```

**Styles**:
- Background: White (#fff)
- Border-bottom: 1px solid #e0e0e0
- Padding: 20px 24px
- Shadow: 0 1px 4px rgba(0,0,0,0.08)

**Elements**:
- Title: 20px, weight 600, color #1a1a1a
- Subtitle: 0.85rem, color #666
- Buttons: See Button Specifications

---

### 2. Table Card Component

**Dimensions**: 240px width × 380px height (max)
**Interaction**: Draggable, hoverable

```
┌─────────────────────────────────┐
│ ☰ Users          ✕              │ ← Header (26px)
├─────────────────────────────────┤
│ 🔵 id              (int)         │ ← Field Items
│ 🔵 name            (varchar)     │   (40px each)
│ 🔵 email           (varchar)     │
│ 🔵 created_at      (datetime)    │
│ 🔵 updated_at      (datetime)    │
│ 🔵 status          (varchar)     │
│ 🔵 phone           (varchar)     │
│ +2 more fields                   │ ← Footer
└─────────────────────────────────┘
```

**Styles**:
- Background: White
- Border: 1px solid #e0e0e0
- Border-radius: 8px
- Padding: 16px
- Box-shadow: 0 4px 12px rgba(0,0,0,0.15) on hover
- Cursor: grab (active: grabbing)

**Subcomponents**:
- **Header Row**: 
  - Drag Icon: 1.2rem, color #999
  - Title: 14px, weight 600, flex: 1
  - Close Button: 32px square, color #d32f2f
  
- **Field Items**:
  - Display: flex, gap 8px, padding 8px
  - Background: #f5f5f5 (normal), #e3f2fd (selected)
  - Border: 1px solid #ddd (normal), 1px solid #2196F3 (selected)
  - Border-radius: 4px
  - Hover: background #e8e8e8
  
- **Connection Dot**:
  - Size: 8px × 8px
  - Border-radius: 50%
  - Color: #999 (normal), #2196F3 (selected)
  - Background: colored circle

- **Column Info**:
  - Name: 0.9rem, weight 500
  - Type: 0.75rem, color #999
  - Cursor: grab (for drag to connect)

---

### 3. Right Sidebar Panels

**Dimensions**: 380px width × Variable height
**Layout**: Header + Tabs + Content + Scrollable

#### Sidebar Structure
```
┌────────────────────────────────┐
│ [📋 Results] [🔍 Filters]     │ ← Tab buttons
├────────────────────────────────┤
│                                │
│  Tab Content Area              │
│  (scrollable, max-height)      │
│                                │
└────────────────────────────────┘
```

**Styles**:
- Background: White
- Border-left: 1px solid #e0e0e0
- Box-shadow: -2px 0 8px rgba(0,0,0,0.08)
- Display: flex, flex-direction: column

---

## 🎯 Right Sidebar Tabs

### Tab 1: Results (📋)

**Content Layout**: Scrollable column list + Connection list

```
╔════════════════════════════════╗
║ Selected Columns               ║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ id                     ✕     ││
║ │ from users             ││
║ │ [↑ASC] [↓DESC] [✓DISTINCT] ││
║ └──────────────────────────────┘║
║ ┌──────────────────────────────┐║
║ │ name                   ✕     ││
║ │ from users             ││
║ │ [↑ASC] [↓DESC] [✓DISTINCT] ││
║ └──────────────────────────────┘║
╟────────────────────────────────╢
║ Table Connections              ║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ users → orders               ││
║ │ id = user_id                 ││
║ │ [Remove]                     ││
║ └──────────────────────────────┘║
╚════════════════════════════════╝
```

**Styles**:
- Section Title: 0.95rem, weight 600, margin-bottom 1.5rem
- Column Card: Paper, background #f5f5f5, padding 1.5rem, margin-bottom 1rem
- Button Row: flex, gap 0.5rem, flex-wrap wrap
- Sort/Distinct Buttons:
  - Size: small
  - Variant: outlined (inactive) / contained (active)
  - Text: uppercase, fontSize 0.8rem

---

### Tab 2: Filters (🔍)

**Content Layout**: Add button + Filter list

```
╔════════════════════════════════╗
║ Filter Results    [+ Add]      ║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ status = pending      ✕      ││
║ │ Include only orders  ││
║ │ with status pending  ││
║ └──────────────────────────────┘║
║ ┌──────────────────────────────┐║
║ │ created_at > 2024   ✕      ││
║ │ After date Jan 1,2024  ││
║ └──────────────────────────────┘║
╟────────────────────────────────╢
║ ℹ️ Filters help show only the  ║
║ data you want. Example:         ║
║ "Show orders where status =    ║
║ pending"                       ║
╚════════════════════════════════╝
```

**Styles**:
- Header: flex, justify-between, align-center
- Add Button: outlined variant, small size
- Filter Cards: Paper, background #fff3e0 (orange tint), padding 1.5rem
- Filter Info: Typography variant caption, color #999
- Empty State: Alert severity info

---

### Tab 3: Details (📊)

**Content Layout**: Query summary statistics

```
╔════════════════════════════════╗
║ Query Summary                  ║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ Tables: 3                    ││
║ │ [users] [orders] [payments] ││
║ └──────────────────────────────┘║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ Columns: 5                   ││
║ │ [id] [name] [email] ...      ││
║ └──────────────────────────────┘║
╟────────────────────────────────╢
║ ┌──────────────────────────────┐║
║ │ Filters: 2 conditions        ││
║ │ applied to narrow results    ││
║ └──────────────────────────────┘║
╚════════════════════════════════╝
```

**Styles**:
- Summary Cards: Paper, background #f5f5f5, padding 1.5rem
- Label: Typography caption, color #999
- Chips: Used for showing tables/columns
- Message: Typography body2, color #666

---

## 🔘 Button Specifications

### Primary Buttons

**Add Table, Save as API**
```
┌─────────────────────────┐
│ ➕ Add Table           │
└─────────────────────────┘
```
- Background: #2196F3
- Color: White
- Padding: 8px 16px
- Border-radius: 4px
- Hover: #1976d2
- Weight: 500
- Text-transform: none

**Save as API** (Disabled state):
- Background: #ccc
- Cursor: not-allowed
- Condition: selectedTables.length === 0

---

### Secondary Buttons

**Sort, Distinct, Remove**
```
[↑ ASC]  [↓ DESC]  [✓ DISTINCT]
```
- Variant: outlined (inactive) / contained (active)
- Size: small
- Padding: adjusts based on size
- Text: uppercase, 0.8rem
- Border: 1px solid depending on state
- Hover: background lightens

---

### Icon Buttons

**Close, Remove, Drag**
```
✕    🗑️    ☰
```
- Size: small to medium
- Color: default (#999) / error (#d32f2f)
- Background: transparent
- Hover: slightly darker

---

## 📋 Dialog Specifications

### Add Table Dialog

**Dimensions**: 500px max-width, full-width on mobile

```
┌──────────────────────────────────────┐
│ Add Table to Query            ✕      │
├──────────────────────────────────────┤
│                                      │
│ ┌────────────────────────────────────┐│
│ │ users                          │16 columns  ││
│ └────────────────────────────────────┘│
│ ┌────────────────────────────────────┐│
│ │ orders                         │ 12 columns ││
│ └────────────────────────────────────┘│
│ ┌────────────────────────────────────┐│
│ │ payments                       │  8 columns ││
│ └────────────────────────────────────┘│
│                                      │
└──────────────────────────────────────┘
```

**Content**:
- List of available tables
- Each button shows table name + column count
- Click to add table to canvas

---

### Combine Tables Dialog

**Dimensions**: 500px max-width

```
┌──────────────────────────────────────┐
│ Combine Tables                  ✕    │
├──────────────────────────────────────┤
│ ℹ️ When columns are equal, rows from │
│    both tables will be combined       │
│                                      │
│ ┌────────────────────────────────────┐│
│ │ From Table                         ││
│ │ users → id                         ││
│ └────────────────────────────────────┘│
│                                      │
│ ┌────────────────────────────────────┐│
│ │ To Table                           ││
│ │ orders → user_id                   ││
│ └────────────────────────────────────┘│
│                                      │
│ [Cancel]            [Combine Tables] │
└──────────────────────────────────────┘
```

---

### Save API Dialog

(Handled by SaveApiDialog component)

```
Enter API Name and Description
- API Name: "Get Active Orders"
- Description: "Retrieve pending orders from past 30 days"
[Cancel] [Save]
```

---

## 🎨 Color Palette

### Primary Colors
```
Primary Blue: #2196F3
  - Buttons, active states, connections
  
Dark Blue: #1976D2
  - Button hover state
```

### Neutral Colors
```
White: #fff
  - Cards, backgrounds, text color

Off-White: #fafafa
  - Canvas background, alternate sections

Light Gray: #f5f5f5
  - Field items, summaries, muted backgrounds

Medium Gray: #e0e0e0
  - Borders, dividers

Dark Text: #1a1a1a
  - Headings, main content

Light Text: #999
  - Descriptions, hints, secondary text

Very Light Text: #666
  - Tertiary text, subtle information
```

### Accent Colors
```
Light Blue: #e3f2fd
  - Selected columns background

Light Orange: #fff3e0
  - Filter card background

Error Red: #d32f2f
  - Remove/delete buttons

Success Green: #4caf50
  - (For future: success states)
```

---

## 📏 Spacing & Typography

### Spacing (8px grid)
```
xs: 4px   (0.5rem)
sm: 8px   (1rem)
md: 16px  (2rem)
lg: 24px  (3rem)
xl: 32px  (4rem)
```

### Typography
```
H1 Title (Header):
  - Size: 20px
  - Weight: 600
  - Line-height: 1.2

Subtitle:
  - Size: 0.85rem (13-14px)
  - Weight: 400
  - Color: #666

Body Text:
  - Size: 14-16px
  - Weight: 400
  - Line-height: 1.5

Caption:
  - Size: 12px (0.75rem)
  - Weight: 400
  - Color: #999

Button Text:
  - Size: 14px
  - Weight: 500
  - Text-transform: none
```

---

## 🎭 Interaction States

### Hover States
```
Table Card:
  - Box-shadow increases
  - Border color unchanged

Field Item:
  - Background: #e8e8e8
  - Cursor: grab

Button (outlined):
  - Background: light gray
  - Text: darker color

Button (contained):
  - Brightness increase
  - Shadow increase
```

### Active States
```
Column Selection:
  - Background: #e3f2fd
  - Border: 1px solid #2196F3
  - Dot color: #2196F3

Sort Button (Active):
  - Variant: contained
  - Background: #2196F3
  - Color: White

Distinct Button (Active):
  - Variant: contained
  - Background: #2196F3
  - Color: White

Dragging:
  - Cursor: grabbing
  - Opacity: 0.8 (optional)
```

### Disabled States
```
Add Table when no DB selected:
  - Background: #ccc
  - Color: #999
  - Cursor: not-allowed
  - Opacity: 0.5
```

---

## 🎥 Animation & Transitions

### Transitions
```
All elements: transition: all 0.2s ease;

Specific:
- Box-shadow: 0.15s ease
- Color changes: 0.2s ease
- Opacity: 0.2s ease
```

### Hover Effects
- Card elevation increase (0.2s)
- Button background change (0.2s)
- Text color change (0.2s)

### No Heavy Animations
- Keep performance focused
- Use CSS transitions, not JavaScript animations
- Avoid page reflows

---

## 📱 Responsive Behavior

### Tablet (1200-1920px)
- Canvas scales down proportionally
- Right panel remains 380px (may need horizontal scroll)
- Tables become smaller
- Same layout, reduced size

### Mobile (< 1200px)
- Stack vertically
- Canvas full width, reduced height
- Right panel below canvas
- Table cards smaller (180px width)
- Single column for everything

---

## 🔍 Accessibility

### Color Contrast
- All text: WCAG AA compliant (4.5:1 ratio minimum)
- Button text on background: 7:1 contrast

### Font Sizes
- Minimum 12px for any text
- 14px for body content
- 16px for interactive elements on mobile

### Touch Targets
- Minimum 44px × 44px for buttons
- Adequate spacing between draggable elements
- Clear focus indicators

### Labels & Tooltips
- Every interactive element has hover tooltip
- Clear, descriptive button text
- ARIA labels where needed

---

## 🖼️ Screenshot Mockup Text

This document provides the visual specifications for implementing:

1. **Professional Layout**: Header + Canvas + Sidebar
2. **Intuitive Cards**: Table blocks with visual hierarchy
3. **Clear Interactions**: Drag-drop with confirmation
4. **Organized Panels**: Tabbed interface for different features
5. **Modern Styling**: Material-UI components with custom branding
6. **Responsive Design**: Scales from mobile to desktop
7. **User Guidance**: Tooltips and empty states throughout

The QueryBuilderPro component implements all of these specifications.
