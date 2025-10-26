# Sidebar Navigation Implementation

## Overview
This document explains how the sidebar navigation has been implemented to match the role-based access control defined in `PAGE_ACCESS_BY_ROLE.md`.

## Implementation File
**Location:** `src/components/Layout/Sidebar.jsx`

## Key Features

### 1. **Role-Based Navigation**
The sidebar dynamically displays menu items based on the user's role and permissions:

- **Super Admin**: Full system access including all organizations, system settings, and cross-organization reports
- **Organization Admin**: Organization management, user management, and property assignments
- **Property Manager**: Property management, tenant management, rent, and payments for assigned properties
- **Financial Viewer**: Read-only access to financial reports, properties, and payments

### 2. **Section Grouping**
Navigation items are organized into three logical sections:

#### **Main Section**
- Dashboard (all users)
- Properties (Property Managers, Org Admins, Super Admins)
- Properties Overview (Property Managers, Org Admins, Super Admins)
- All Spaces (Property Managers, Org Admins, Super Admins)
- Tenants (Property Managers, Org Admins, Super Admins)
- Rent Management (Property Managers, Org Admins, Super Admins)
- Payments (Property Managers, Financial Viewers, Org Admins, Super Admins)

#### **Administration Section**
- All Organizations (Super Admin only)
- All Users (Super Admin only)
- System Settings (Super Admin only)
- Roles & Permissions (Super Admin only)
- System Reports (Super Admin only)
- Organization Settings (Org Admin, Super Admin)
- User Management (Org Admin, Super Admin)
- Property Assignments (Org Admin, Super Admin)

#### **Reports Section**
- Financial Analytics (Financial Viewers, Org Admins, Super Admins)

### 3. **Visual Indicators**
- **Subtitles**: Each menu item includes a descriptive subtitle
- **Section Headers**: "ADMINISTRATION" and "REPORTS" headers separate different functional areas
- **Role Badge**: User's role is displayed at the top of the sidebar
- **Active State**: Currently selected page is highlighted
- **Hover Effects**: Interactive feedback on menu items

### 4. **Permission Checks**
The sidebar uses the AuthContext's permission helper functions:

```javascript
hasRole('role_name')              // Check if user has specific role
hasPermission('permission:action:scope')  // Check single permission
hasAnyPermission(['perm1', 'perm2'])     // Check if user has any of the permissions
isAdmin()                         // Check if user is org_admin or super_admin
```

## Navigation Items by Role

### Super Admin Sees:
1. Dashboard
2. All Organizations *(admin section)*
3. All Users *(admin section)*
4. System Settings *(admin section)*
5. Roles & Permissions *(admin section)*
6. System Reports *(admin section)*
7. Organization Settings *(admin section)*
8. User Management *(admin section)*
9. Property Assignments *(admin section)*
10. Properties
11. Properties Overview
12. All Spaces
13. Tenants
14. Rent Management
15. Payments
16. Financial Analytics *(reports section)*
17. Profile *(secondary navigation)*

### Organization Admin Sees:
1. Dashboard
2. Organization Settings *(admin section)*
3. User Management *(admin section)*
4. Property Assignments *(admin section)*
5. Properties
6. Properties Overview
7. All Spaces
8. Tenants
9. Rent Management
10. Payments
11. Financial Analytics *(reports section)*
12. Profile *(secondary navigation)*

### Property Manager Sees:
1. Dashboard
2. Properties (Assigned)
3. Properties Overview
4. All Spaces
5. Tenants
6. Rent Management
7. Payments (Assigned)
8. Profile *(secondary navigation)*

### Financial Viewer Sees:
1. Dashboard
2. Financial Analytics *(reports section)*
3. Properties (View only) *(reports section)*
4. Payments (View only) *(reports section)*
5. Profile *(secondary navigation)*

## Code Structure

### Main Function: `getAllNavigationItems()`
This function builds the navigation array based on user's role and permissions:

```javascript
const getAllNavigationItems = (
  userRole,           // User's role object
  hasPermission,      // Permission check function
  hasAnyPermission,   // Multiple permission check function
  hasRole,            // Role check function
  isAdmin,            // Admin check function
  userPermissions     // Array of user's permissions
) => {
  // Returns array of navigation items
}
```

### Navigation Item Structure:
```javascript
{
  text: 'Page Name',          // Display text
  icon: <IconComponent />,     // MUI icon
  path: '/app/route/path',     // Router path
  subtitle: 'Description',     // Optional subtitle
  show: true,                  // Whether to show (filtered later)
  section: 'main'              // Section grouping: 'main', 'admin', or 'reports'
}
```

## Permission Mapping

### Properties Access
- Full access: `properties:read:organization`
- Assigned only: `properties:read:assigned`

### Payments Access
- Full access: `payments:read:organization`
- Assigned only: `payments:read:assigned`

### Tenants Access
- Full access: `tenants:read:organization`
- Assigned only: `tenants:read:assigned`

### Rent Management
- Create rent: `payments:create:organization` or `payments:create:assigned`
- View properties: `properties:read:assigned`

### Reports Access
- Financial analytics: `reports:read:organization`

### User Management
- Organization users: `users:read:organization`

## Styling Features

### Active State
```javascript
'&.Mui-selected': {
  backgroundColor: 'primary.main',
  color: 'white',
}
```

### Hover Effect
```javascript
'&:hover': {
  backgroundColor: 'primary.light',
  color: 'white',
}
```

### Section Headers
```javascript
textTransform: 'uppercase',
fontSize: '0.7rem',
letterSpacing: 1,
fontWeight: 600,
```

## Future Enhancements

1. **Badge Notifications**: Add notification badges for pending approvals, overdue payments, etc.
2. **Collapsible Sections**: Allow users to collapse/expand sections
3. **Search**: Add search functionality for large navigation menus
4. **Keyboard Navigation**: Implement keyboard shortcuts for menu navigation
5. **Favorites**: Allow users to pin favorite pages to the top
6. **Recent Pages**: Show recently visited pages

## Testing Checklist

- [ ] Super Admin sees all 17 navigation items
- [ ] Org Admin sees 12 navigation items (no system-wide admin pages)
- [ ] Property Manager sees 8 navigation items (no admin section)
- [ ] Financial Viewer sees 5 navigation items (read-only access)
- [ ] Section headers appear correctly for admin and reports sections
- [ ] Active page is highlighted correctly
- [ ] Hover effects work on all menu items
- [ ] Subtitles display correctly under menu items
- [ ] Role badge displays user's role correctly
- [ ] Navigation works correctly (routes to correct pages)
- [ ] Sidebar is scrollable when content overflows

## Related Files

- `src/contexts/AuthContext.jsx` - Authentication and permission logic
- `src/App.jsx` - Route definitions
- `src/components/Layout/Layout.jsx` - Layout wrapper with sidebar
- `docs/PAGE_ACCESS_BY_ROLE.md` - Complete page access specifications
- `docs/ROLES_AND_PERMISSIONS.md` - Detailed role and permission definitions

## Support

For questions or issues with the sidebar implementation, please refer to:
1. Role definitions in `ROLES_AND_PERMISSIONS.md`
2. Page access rules in `PAGE_ACCESS_BY_ROLE.md`
3. Permission helper functions in `AuthContext.jsx`



