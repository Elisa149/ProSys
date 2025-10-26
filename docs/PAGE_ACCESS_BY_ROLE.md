# 📊 Page Access by User Role

## 🔐 Role-Based Page Access Matrix

This document shows which pages are accessible to each of the 4 user roles in the Property Management System.

---

## 👥 **The 4 User Roles**

1. **Super Administrator** - Full system access
2. **Organization Administrator** - Full organization access
3. **Property Manager** - Manages assigned properties
4. **Financial Viewer** - Read-only financial access

---

## 📄 **Page Access Matrix**

| Page | Super Admin | Org Admin | Property Manager | Financial Viewer |
|------|-------------|-----------|------------------|------------------|
| **Authentication** |
| Login Page | ✅ | ✅ | ✅ | ✅ |
| Register Page | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** |
| Dashboard | ✅ All orgs | ✅ Own org | ✅ Assigned | ✅ Own org |
| **Properties** |
| Properties List | ✅ All | ✅ All org | ✅ Assigned only | ✅ View only (basic) |
| Properties Overview | ✅ All | ✅ All org | ✅ Assigned only | ✅ View only |
| Create Property | ✅ | ✅ | ✅ | ❌ |
| Edit Property | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| Delete Property | ✅ | ✅ | ❌ | ❌ |
| Property Details | ✅ All | ✅ All org | ✅ Assigned only | ✅ View only |
| **Spaces & Tenants** |
| All Spaces | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| Space Assignment | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| Tenants Page | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| Add/Edit Tenant | ✅ | ✅ | ✅ Assigned | ❌ |
| **Rent Management** |
| Rent Page | ✅ All | ✅ All org | ✅ Assigned only | ✅ View only |
| Create Rent Record | ✅ | ✅ | ✅ Assigned | ❌ |
| Edit Rent Record | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| **Payments** |
| Payments Page | ✅ All | ✅ All org | ✅ Assigned only | ✅ View only |
| Record Payment | ✅ | ✅ | ✅ Assigned | ❌ |
| Edit Payment | ✅ All | ✅ All org | ✅ Assigned only | ❌ |
| Delete Payment | ✅ | ✅ | ❌ | ❌ |
| Payment Receipt | ✅ | ✅ | ✅ | ✅ View only |
| **User Management** |
| User Management | ✅ | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ |
| Approve Users | ✅ | ✅ | ❌ | ❌ |
| **Admin Pages** |
| Admin Dashboard | ✅ | ✅ | ❌ | ❌ |
| Organization Settings | ✅ | ✅ | ❌ | ❌ |
| Property Assignments | ✅ | ✅ | ❌ | ❌ |
| Analytics Page | ✅ All orgs | ✅ Own org | ✅ Assigned | ✅ Own org |
| **Profile** |
| Profile Page | ✅ | ✅ | ✅ | ✅ |
| Firebase Example | ✅ | ✅ | ✅ | ✅ |

---

## 🔍 **Detailed Role Breakdown**

### **1. 🔑 Super Administrator**

**Email**: `superadmin@propertytest.com`  
**Password**: `SuperAdmin123!`

#### **Can Access:**
```
✅ ALL Pages
✅ ALL Organizations
✅ ALL Properties
✅ ALL Data
```

#### **Navigation Menu:**
- Dashboard (all organizations)
- Properties (create, edit, delete - all)
- Properties Overview (all)
- All Spaces (all)
- Tenants (all)
- Rent Management (all)
- Payments (all)
- User Management (all organizations)
- Admin Dashboard
- Organization Settings
- Property Assignments
- Analytics (all organizations)
- Profile

#### **Special Abilities:**
- Create/delete organizations
- Manage users across all organizations
- Access all financial data
- System configuration

---

### **2. 🏢 Organization Administrator**

**Email**: `admin@propertytest.com`  
**Password**: `TestAdmin123!`

#### **Can Access:**
```
✅ ALL pages within their organization
✅ ALL properties in their organization
✅ ALL users in their organization
✅ ALL financial data in their organization
❌ Cannot access other organizations
```

#### **Navigation Menu:**
- Dashboard (own organization)
- Properties (create, edit, delete - own org)
- Properties Overview (own org)
- All Spaces (own org)
- Tenants (own org)
- Rent Management (own org)
- Payments (own org)
- User Management (own org)
- Admin Dashboard
- Organization Settings
- Property Assignments
- Analytics (own org)
- Profile

#### **Special Abilities:**
- Create/edit/delete properties in their org
- Invite users and assign roles
- Approve/reject user access requests
- Assign properties to managers
- View all financial reports
- Configure organization settings

---

### **3. 🏠 Property Manager**

**Email**: `manager@propertytest.com`  
**Password**: `Manager123!`

#### **Can Access:**
```
✅ Assigned properties ONLY
✅ Tenants for assigned properties
✅ Payments for assigned properties
✅ Rent records for assigned properties
❌ Cannot create new properties
❌ Cannot access unassigned properties
❌ Cannot manage users
❌ No admin pages
```

#### **Navigation Menu:**
- Dashboard (assigned properties only)
- Properties (assigned only - can edit)
- Properties Overview (assigned only)
- All Spaces (assigned only)
- Tenants (assigned only)
- Rent Management (assigned only)
- Payments (assigned only)
- Profile

#### **Capabilities:**
- View/edit assigned properties
- Add/edit tenants for assigned properties
- Record payments for assigned properties
- Manage rent agreements
- Handle maintenance requests
- Generate property reports

#### **Restrictions:**
- ❌ Cannot create new properties
- ❌ Cannot delete properties
- ❌ Cannot see unassigned properties
- ❌ Cannot access user management
- ❌ Cannot access admin pages
- ❌ Cannot assign roles

---

### **4. 📊 Financial Viewer**

**Email**: `finance@propertytest.com`  
**Password**: `Finance123!`

#### **Can Access:**
```
✅ Financial data (READ-ONLY)
✅ Payment reports and analytics
✅ Basic property information (view only)
❌ Cannot edit anything
❌ Cannot create/delete anything
❌ Cannot manage tenants
❌ Cannot record payments
```

#### **Navigation Menu:**
- Dashboard (organization overview - read only)
- Properties Overview (basic info - read only)
- Payments (view only)
- Analytics (view only)
- Profile

#### **Capabilities:**
- View all payment records
- View financial reports
- Export payment data
- View collection rates
- View property basic info
- Access analytics dashboard

#### **Restrictions:**
- ❌ Cannot edit properties
- ❌ Cannot manage tenants
- ❌ Cannot record/edit/delete payments (VIEW ONLY)
- ❌ Cannot create rent records
- ❌ Cannot access detailed property management
- ❌ Cannot access user management
- ❌ Cannot access admin pages

---

## 🛣️ **Route Paths & Access Control**

### **Public Routes (No Authentication Required):**
```
/login                  - Login page
/register               - Registration page
/                       - Redirects to login
```

### **Protected Routes (Authentication Required):**
```
/app/dashboard          - All roles
/app/profile            - All roles
/app/firebase-example   - All roles (demo page)
```

### **Property Management Routes:**
```
/app/properties         - All roles (permissions vary)
/app/properties/new     - Super Admin, Org Admin, Property Manager
/app/properties/:id     - Based on access level
/app/properties/:id/spaces - Super Admin, Org Admin, Property Manager
/app/properties-overview - All roles (data filtered by role)
/app/spaces             - Super Admin, Org Admin, Property Manager
```

### **Tenant & Rent Routes:**
```
/app/tenants            - Super Admin, Org Admin, Property Manager
/app/rent               - All roles (Property Manager: assigned only)
```

### **Payment Routes:**
```
/app/payments           - All roles (Financial Viewer: read-only)
```

### **Admin Routes (Protected by RoleGuard):**
```
/app/users              - Super Admin, Org Admin ONLY
/app/admin              - Super Admin, Org Admin ONLY
/app/admin/dashboard    - Super Admin, Org Admin ONLY
/app/admin/settings     - Super Admin, Org Admin ONLY
/app/admin/assignments  - Super Admin, Org Admin ONLY
/app/admin/analytics    - Super Admin, Org Admin, Property Manager, Financial Viewer
```

---

## 🔒 **Permission Mapping**

### **Super Admin Permissions:**
```javascript
[
  'properties:create:organization',
  'properties:read:all',
  'properties:update:all',
  'properties:delete:all',
  'tenants:create:organization',
  'tenants:read:all',
  'tenants:update:all',
  'payments:create:organization',
  'payments:read:all',
  'payments:update:all',
  'users:create:organization',
  'users:read:all',
  'users:update:all',
  'reports:read:all',
  'organizations:create',
  'organizations:read:all',
  'organizations:update:all'
]
```

### **Org Admin Permissions:**
```javascript
[
  'properties:create:organization',
  'properties:read:organization',
  'properties:update:organization',
  'properties:delete:organization',
  'tenants:create:organization',
  'tenants:read:organization',
  'tenants:update:organization',
  'payments:create:organization',
  'payments:read:organization',
  'users:create:organization',
  'users:read:organization',
  'users:update:organization',
  'reports:read:organization'
]
```

### **Property Manager Permissions:**
```javascript
[
  'properties:create:organization',
  'properties:read:assigned',
  'properties:update:assigned',
  'tenants:create:assigned',
  'tenants:read:assigned',
  'tenants:update:assigned',
  'payments:create:assigned',
  'payments:read:assigned',
  'reports:read:assigned',
  'maintenance:create:assigned',
  'maintenance:update:assigned'
]
```

### **Financial Viewer Permissions:**
```javascript
[
  'payments:read:organization',
  'reports:read:organization',
  'properties:read:organization'  // Limited to basic info
]
```

---

## 📱 **Sidebar Navigation by Role**

### **Super Admin Sidebar:**
```
📊 Dashboard
🏠 Properties
📋 Properties Overview
🏢 All Spaces
👥 Tenants
💰 Rent Management
💳 Payments
👤 User Management
🔧 Admin Dashboard
⚙️ Organization Settings
📌 Property Assignments
📈 Analytics
👤 Profile
```

### **Org Admin Sidebar:**
```
📊 Dashboard
🏠 Properties
📋 Properties Overview
🏢 All Spaces
👥 Tenants
💰 Rent Management
💳 Payments
👤 User Management
🔧 Admin Dashboard
⚙️ Organization Settings
📌 Property Assignments
📈 Analytics
👤 Profile
```

### **Property Manager Sidebar:**
```
📊 Dashboard
🏠 Properties (assigned only)
📋 Properties Overview (assigned only)
🏢 All Spaces (assigned only)
👥 Tenants (assigned only)
💰 Rent Management
💳 Payments (assigned only)
👤 Profile
```

### **Financial Viewer Sidebar:**
```
📊 Dashboard
📋 Properties Overview (view only)
💳 Payments (view only)
📈 Analytics
👤 Profile
```

---

## 🧪 **Testing Access Control**

### **Test 1: Super Admin**
```
1. Login: superadmin@propertytest.com
2. Should see ALL navigation items
3. Can access ALL pages
4. Can see ALL properties across ALL organizations
```

### **Test 2: Org Admin**
```
1. Login: admin@propertytest.com
2. Should see admin pages
3. Can access user management
4. Can only see properties in their organization
5. Cannot see other organizations' data
```

### **Test 3: Property Manager**
```
1. Login: manager@propertytest.com
2. Should NOT see admin pages
3. Should NOT see user management
4. Can only see assigned properties
5. Cannot see unassigned properties
6. Can edit assigned properties
```

### **Test 4: Financial Viewer**
```
1. Login: finance@propertytest.com
2. Should see minimal navigation
3. All pages are READ-ONLY
4. Cannot edit/create/delete anything
5. Can view financial reports
6. Cannot manage properties or tenants
```

---

## 📚 **Related Documentation**

- `docs/RBAC_SYSTEM_DESIGN.md` - Complete RBAC system design
- `docs/TEST_ACCOUNTS_CREDENTIALS.md` - Test account credentials
- `docs/ROLE_BASED_AUTH_FLOW.md` - Authentication flow with role checking

---

**This matrix ensures proper role-based access control throughout the Property Management System!** 🔒✅


