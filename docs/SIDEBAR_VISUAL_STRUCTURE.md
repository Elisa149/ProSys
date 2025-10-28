# Sidebar Visual Structure

## Complete Sidebar Layout

```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Super Admin] ◄── Role Badge       │
├─────────────────────────────────────┤
│                                     │
│  📋 Dashboard                       │ ◄── Shared (All Roles)
│                                     │
│  ─────────────────────────────      │ ◄── Divider (Super Admin only)
│                                     │
│  ADMINISTRATION                     │ ◄── Section Header (Super Admin)
│                                     │
│  🏢 All Organizations               │ ◄── Super Admin Only
│      Manage all organizations       │
│                                     │
│  👥 All Users                       │ ◄── Super Admin Only
│      System-wide user management    │
│                                     │
│  ⚙️  System Settings                │ ◄── Super Admin Only
│      System configuration           │
│                                     │
│  🔐 Roles & Permissions             │ ◄── Super Admin Only
│      Manage system roles            │
│                                     │
│  📊 System Reports                  │ ◄── Super Admin Only
│      Cross-organization reports     │
│                                     │
│  🏢 Organization Settings           │ ◄── Org Admin + Super Admin
│      Manage organization            │
│                                     │
│  👤 User Management                 │ ◄── Org Admin + Super Admin
│      Manage team members            │
│                                     │
│  🏠 Property Assignments            │ ◄── Org Admin + Super Admin
│      Assign staff to properties     │
│                                     │
│  ─────────────────────────────      │ ◄── Divider
│                                     │
│  🏘️  Properties                     │ ◄── Main Operations
│      All properties / Assigned      │
│                                     │
│  📈 Properties Overview             │
│      Analytics & insights           │
│                                     │
│  🏢 All Spaces                      │
│      Rentable units                 │
│                                     │
│  👨‍👩‍👧‍👦 Tenants                        │
│      Tenant management              │
│                                     │
│  🧾 Rent Management                 │
│      Create & track rent            │
│                                     │
│  💰 Payments                        │
│      All payments / Assigned        │
│                                     │
│  ─────────────────────────────      │ ◄── Divider
│                                     │
│  REPORTS                            │ ◄── Section Header
│                                     │
│  📊 Financial Analytics             │
│      Reports & insights             │
│                                     │
├─────────────────────────────────────┤ ◄── Bottom Divider
│                                     │
│  👤 Profile                         │ ◄── Secondary Nav (All Roles)
│                                     │
└─────────────────────────────────────┘
```

---

## Role-Specific Views

### 1. 🔴 Super Admin View

```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Super Admin]                      │
├─────────────────────────────────────┤
│  📋 Dashboard                       │ ◄── 1
│  ─────────────────────────────      │
│  ADMINISTRATION                     │
│  🏢 All Organizations               │ ◄── 2
│  👥 All Users                       │ ◄── 3
│  ⚙️  System Settings                │ ◄── 4
│  🔐 Roles & Permissions             │ ◄── 5
│  📊 System Reports                  │ ◄── 6
│  🏢 Organization Settings           │ ◄── 7
│  👤 User Management                 │ ◄── 8
│  🏠 Property Assignments            │ ◄── 9
│  ─────────────────────────────      │
│  🏘️  Properties                     │ ◄── 10
│  📈 Properties Overview             │ ◄── 11
│  🏢 All Spaces                      │ ◄── 12
│  👨‍👩‍👧‍👦 Tenants                        │ ◄── 13
│  🧾 Rent Management                 │ ◄── 14
│  💰 Payments                        │ ◄── 15
│  ─────────────────────────────      │
│  REPORTS                            │
│  📊 Financial Analytics             │ ◄── 16
├─────────────────────────────────────┤
│  👤 Profile                         │ ◄── 17
└─────────────────────────────────────┘
Total: 17 items + Profile
```

### 2. 🟠 Organization Admin View

```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Organization Administrator]       │
├─────────────────────────────────────┤
│  📋 Dashboard                       │ ◄── 1
│  ─────────────────────────────      │
│  ADMINISTRATION                     │
│  🏢 Organization Settings           │ ◄── 2
│  👤 User Management                 │ ◄── 3
│  🏠 Property Assignments            │ ◄── 4
│  ─────────────────────────────      │
│  🏘️  Properties                     │ ◄── 5
│  📈 Properties Overview             │ ◄── 6
│  🏢 All Spaces                      │ ◄── 7
│  👨‍👩‍👧‍👦 Tenants                        │ ◄── 8
│  🧾 Rent Management                 │ ◄── 9
│  💰 Payments                        │ ◄── 10
│  ─────────────────────────────      │
│  REPORTS                            │
│  📊 Financial Analytics             │ ◄── 11
├─────────────────────────────────────┤
│  👤 Profile                         │ ◄── 12
└─────────────────────────────────────┘
Total: 12 items + Profile
```

### 3. 🟡 Property Manager View

```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Property Manager]                 │
├─────────────────────────────────────┤
│  📋 Dashboard                       │ ◄── 1
│  🏘️  Properties (Assigned)          │ ◄── 2
│  📈 Properties Overview             │ ◄── 3
│  🏢 All Spaces                      │ ◄── 4
│  👨‍👩‍👧‍👦 Tenants                        │ ◄── 5
│  🧾 Rent Management                 │ ◄── 6
│  💰 Payments (Assigned)             │ ◄── 7
├─────────────────────────────────────┤
│  👤 Profile                         │ ◄── 8
└─────────────────────────────────────┘
Total: 8 items + Profile
(No section headers - all in main section)
```

### 4. 🟢 Financial Viewer View

```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Financial Viewer]                 │
├─────────────────────────────────────┤
│  📋 Dashboard                       │ ◄── 1
│  ─────────────────────────────      │
│  REPORTS                            │
│  📊 Financial Analytics             │ ◄── 2
│  🏘️  Properties (View only)         │ ◄── 3
│  💰 Payments (View only)            │ ◄── 4
├─────────────────────────────────────┤
│  👤 Profile                         │ ◄── 5
└─────────────────────────────────────┘
Total: 5 items + Profile
```

---

## Visual States

### Active State (Currently Selected Page)
```
┌─────────────────────────────────────┐
│  ████████████████████████████       │ ◄── Primary Color Background
│  █ 📋 Dashboard                █    │ ◄── White Text
│  ████████████████████████████       │
└─────────────────────────────────────┘
```

### Hover State
```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │ ◄── Light Primary Color
│  ░ 🏘️  Properties             ░    │ ◄── White Text
│  ░   All properties            ░    │ ◄── Lighter subtitle
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
└─────────────────────────────────────┘
```

### Normal State
```
┌─────────────────────────────────────┐
│  🏘️  Properties                     │ ◄── Default Text Color
│     All properties                  │ ◄── Secondary Text Color
└─────────────────────────────────────┘
```

### Section Header
```
┌─────────────────────────────────────┐
│  ADMINISTRATION                     │ ◄── Uppercase, Small Font
│                                     │     Gray Color, Bold
└─────────────────────────────────────┘
```

---

## Interactive Elements

### Role Badge
```
┌──────────────────────┐
│  [Super Admin]       │ ◄── Chip with outlined border
└──────────────────────┘     Primary color, small size
```

### Menu Item Structure
```
┌─────────────────────────────────────┐
│  Icon  Primary Text                 │
│        Secondary Text (subtitle)    │
└─────────────────────────────────────┘
     ▲          ▲              ▲
     │          │              │
   Icon    Main Label      Description
```

### Divider
```
─────────────────────────────
```

---

## Responsive Behavior

### Desktop View (Full Width)
```
┌─────────────────────────────────────┐
│  🏢 PropertyPro                     │
│  [Role Badge]                       │
│  ───────────────────────────────    │
│  Full menu items with icons         │
│  and two-line text                  │
└─────────────────────────────────────┘
Width: 280px (default)
```

### Mobile View (Drawer)
```
☰ ← Hamburger Menu Opens:

┌──────────────────┐
│  🏢 PropertyPro  │
│  [Role Badge]    │
│  ──────────────  │
│  Overlay drawer  │
│  Full items      │
└──────────────────┘
Overlay on content
```

---

## Color Scheme

### Primary Actions
- **Active Background**: `primary.main` (Blue)
- **Active Text**: White
- **Active Icon**: White

### Hover States
- **Hover Background**: `primary.light` (Light Blue)
- **Hover Text**: White
- **Hover Icon**: White

### Normal State
- **Background**: Transparent
- **Text**: `text.primary` (Dark Gray/Black)
- **Icon**: `inherit`
- **Subtitle**: `text.secondary` (Gray)

### Section Headers
- **Text**: `text.secondary` (Gray)
- **Font Weight**: 600 (Semi-bold)
- **Font Size**: 0.7rem
- **Text Transform**: Uppercase
- **Letter Spacing**: 1px

---

## Spacing

```
Toolbar (Logo + Badge):
  Padding: 16px
  Gap: 8px

Menu Items:
  Horizontal Margin: 8px (mx: 1)
  Border Radius: 4px (rounded corners)
  
Section Headers:
  Top Padding: 16px (pt: 2)
  Bottom Padding: 8px (pb: 1)
  Horizontal Padding: 16px (px: 2)

Dividers:
  Vertical Padding: 8px (py: 1)
  Horizontal Margin: 16px (mx: 2)

Secondary Navigation:
  Bottom Padding: 16px (pb: 2)
```

---

## Accessibility Features

1. **Keyboard Navigation**: Tab through menu items
2. **ARIA Labels**: Proper labeling for screen readers
3. **Focus Indicators**: Visible focus states
4. **Semantic HTML**: Proper use of nav, list elements
5. **Color Contrast**: WCAG AA compliant
6. **Icon Labels**: Text accompanies all icons

---

## Technical Implementation

### Component Hierarchy
```
<Sidebar>
  ├── <Toolbar>
  │   ├── Logo + Title
  │   └── Role Badge
  ├── <Divider>
  ├── <List> (Main Navigation)
  │   └── Sections (Main, Admin, Reports)
  │       ├── Section Header (optional)
  │       ├── Menu Items
  │       └── Divider (between sections)
  ├── <Divider>
  └── <List> (Secondary Navigation)
      └── Profile Menu Item
```

### Render Logic
```javascript
1. Check user role and permissions
2. Build navigation items array
3. Group items by section
4. Render sections in order:
   - Main section (no header)
   - Admin section (with header)
   - Reports section (with header)
5. Add dividers between sections
6. Render secondary navigation
```

---

## Best Practices

1. **Always show Dashboard** - Available to all users
2. **Profile in secondary nav** - Consistent location
3. **Section headers for admin/reports** - Clear organization
4. **Descriptive subtitles** - Help users understand purpose
5. **Consistent icons** - Easy visual scanning
6. **Scrollable content** - Handle long menus gracefully
7. **Active state clarity** - Users know current location

---

## Future Enhancements

### Collapsible Sections
```
┌─────────────────────────────────────┐
│  ADMINISTRATION          [▼]        │ ◄── Click to collapse
│  🏢 Organization Settings           │
│  👤 User Management                 │
└─────────────────────────────────────┘

After collapse:
┌─────────────────────────────────────┐
│  ADMINISTRATION          [▶]        │ ◄── Click to expand
└─────────────────────────────────────┘
```

### Notification Badges
```
┌─────────────────────────────────────┐
│  💰 Payments                    [3] │ ◄── Badge with count
│     All payments                    │
└─────────────────────────────────────┘
```

### Search Bar
```
┌─────────────────────────────────────┐
│  [🔍 Search menu...]                │ ◄── Quick search
├─────────────────────────────────────┤
│  📋 Dashboard                       │
└─────────────────────────────────────┘
```

---

**Created:** October 24, 2025  
**Version:** 1.0  
**Status:** ✅ Current Implementation





