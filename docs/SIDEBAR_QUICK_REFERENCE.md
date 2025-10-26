# Sidebar Navigation Quick Reference

## Visual Guide: What Each Role Sees

---

## 🔴 Super Admin
**Role Badge:** "Super Admin"

### 📋 MAIN SECTION
- ✅ Dashboard
- ✅ Properties (All properties)
- ✅ Properties Overview (Analytics & insights)
- ✅ All Spaces (Rentable units)
- ✅ Tenants (Tenant management)
- ✅ Rent Management (Create & track rent)
- ✅ Payments (All payments)

### 🔧 ADMINISTRATION SECTION
- ✅ All Organizations (Manage all organizations)
- ✅ All Users (System-wide user management)
- ✅ System Settings (System configuration)
- ✅ Roles & Permissions (Manage system roles)
- ✅ System Reports (Cross-organization reports)
- ✅ Organization Settings (Manage organization)
- ✅ User Management (Manage team members)
- ✅ Property Assignments (Assign staff to properties)

### 📊 REPORTS SECTION
- ✅ Financial Analytics (Reports & insights)

### 👤 PROFILE
- ✅ Profile (User profile settings)

**Total Items: 17 + Profile**

---

## 🟠 Organization Admin
**Role Badge:** "Organization Administrator"

### 📋 MAIN SECTION
- ✅ Dashboard
- ✅ Properties (All properties)
- ✅ Properties Overview (Analytics & insights)
- ✅ All Spaces (Rentable units)
- ✅ Tenants (Tenant management)
- ✅ Rent Management (Create & track rent)
- ✅ Payments (All payments)

### 🔧 ADMINISTRATION SECTION
- ✅ Organization Settings (Manage organization)
- ✅ User Management (Manage team members)
- ✅ Property Assignments (Assign staff to properties)

### 📊 REPORTS SECTION
- ✅ Financial Analytics (Reports & insights)

### 👤 PROFILE
- ✅ Profile (User profile settings)

**Total Items: 12 + Profile**

**🚫 Cannot See:** All Organizations, All Users, System Settings, Roles & Permissions, System Reports

---

## 🟡 Property Manager
**Role Badge:** "Property Manager"

### 📋 MAIN SECTION
- ✅ Dashboard
- ✅ Properties (Assigned properties)
- ✅ Properties Overview (Analytics & insights)
- ✅ All Spaces (Rentable units)
- ✅ Tenants (Tenant management)
- ✅ Rent Management (Create & track rent)
- ✅ Payments (Assigned properties)

### 👤 PROFILE
- ✅ Profile (User profile settings)

**Total Items: 8 + Profile**

**🚫 Cannot See:** Any admin sections, Financial Analytics, System-wide management

---

## 🟢 Financial Viewer
**Role Badge:** "Financial Viewer"

### 📋 MAIN SECTION
- ✅ Dashboard

### 📊 REPORTS SECTION
- ✅ Financial Analytics (Reports & insights)
- ✅ Properties (View only)
- ✅ Payments (View only)

### 👤 PROFILE
- ✅ Profile (User profile settings)

**Total Items: 5 + Profile**

**🚫 Cannot See:** Any admin sections, Rent Management, Tenants, All Spaces, Property management features

---

## Permission Indicators

### 📍 Subtitle Meanings

| Subtitle | Meaning |
|----------|---------|
| "All properties" | Can see all organization properties |
| "Assigned properties" | Can only see assigned properties |
| "All payments" | Can see all organization payments |
| "View only" | Read-only access, no editing |
| "Analytics & insights" | Can view reports and analytics |
| "Manage team members" | Can add/edit/remove users |
| "System-wide user management" | Can manage users across all organizations |

---

## Quick Access Matrix

| Page | Super Admin | Org Admin | Prop Manager | Financial Viewer |
|------|:-----------:|:---------:|:------------:|:----------------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Properties** | ✅ (All) | ✅ (All) | ✅ (Assigned) | ✅ (View) |
| **Properties Overview** | ✅ | ✅ | ✅ | ❌ |
| **All Spaces** | ✅ | ✅ | ✅ | ❌ |
| **Tenants** | ✅ | ✅ | ✅ | ❌ |
| **Rent Management** | ✅ | ✅ | ✅ | ❌ |
| **Payments** | ✅ (All) | ✅ (All) | ✅ (Assigned) | ✅ (View) |
| **Financial Analytics** | ✅ | ✅ | ❌ | ✅ |
| **All Organizations** | ✅ | ❌ | ❌ | ❌ |
| **All Users** | ✅ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |
| **Roles & Permissions** | ✅ | ❌ | ❌ | ❌ |
| **System Reports** | ✅ | ❌ | ❌ | ❌ |
| **Organization Settings** | ✅ | ✅ | ❌ | ❌ |
| **User Management** | ✅ | ✅ | ❌ | ❌ |
| **Property Assignments** | ✅ | ✅ | ❌ | ❌ |
| **Profile** | ✅ | ✅ | ✅ | ✅ |

---

## Legend

- ✅ **Full Access**: Can view and edit
- ✅ **(All)**: Can access all organization data
- ✅ **(Assigned)**: Can only access assigned properties
- ✅ **(View)**: Read-only access
- ❌ **No Access**: Cannot see or access

---

## Section Colors (Visual Cue)

When viewing the sidebar:
- **No header** = Main functional pages
- **"ADMINISTRATION" header** = Admin-only features
- **"REPORTS" header** = Reporting and analytics

---

## Testing Users

You can test the sidebar with these test accounts:

```
Super Admin:
  Email: superadmin@propertytest.com
  Password: SuperAdmin123!

Organization Admin:
  Email: admin@propertytest.com
  Password: TestAdmin123!

Property Manager:
  Email: manager@propertytest.com
  Password: Manager123!

Financial Viewer:
  Email: finance@propertytest.com
  Password: Finance123!
```

---

## Common Scenarios

### Scenario 1: New Property Manager Joins
**What they see:**
- Dashboard (landing page)
- Only assigned properties in Properties list
- Only payments for their assigned properties
- Cannot access admin features
- Cannot see financial analytics

### Scenario 2: Financial Viewer Reviews Reports
**What they see:**
- Dashboard (basic overview)
- Financial Analytics (main workspace)
- Properties and Payments in "view only" mode
- No admin access
- No tenant or rent management

### Scenario 3: Org Admin Manages Team
**What they see:**
- Full property management capabilities
- Administration section for team and org management
- Cannot access system-wide admin features (reserved for Super Admin)
- Can assign properties to managers

### Scenario 4: Super Admin Manages System
**What they see:**
- Everything
- Special system-wide admin pages
- Can manage multiple organizations
- Can configure system roles and permissions

---

## Troubleshooting

### "I don't see a menu item I should have access to"
1. Check your role badge at the top of the sidebar
2. Verify your role in Profile → Account Settings
3. Contact your organization admin to verify permissions
4. Try logging out and back in

### "The sidebar looks different than expected"
1. Clear browser cache
2. Refresh the page (Ctrl+R or Cmd+R)
3. Check if you're logged in with the correct account
4. Verify server is running latest code

### "Menu items are showing but pages give permission errors"
1. This indicates a mismatch between frontend and backend permissions
2. Contact system administrator
3. Check Firebase security rules
4. Verify user document in Firestore has correct `roleId` and `permissions`

---

## Related Documentation

- 📖 [PAGE_ACCESS_BY_ROLE.md](./PAGE_ACCESS_BY_ROLE.md) - Detailed page access specifications
- 📖 [SIDEBAR_IMPLEMENTATION.md](./SIDEBAR_IMPLEMENTATION.md) - Technical implementation details
- 📖 [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md) - Complete role definitions

