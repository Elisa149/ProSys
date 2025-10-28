# 🧪 TEST ACCOUNTS - Development Only

> **⚠️ IMPORTANT: These are TEST accounts for development ONLY.**
> Never use in production. All credentials should be changed before deployment.

---

## 🔐 Test Account Credentials

### 🎖️ Super Administrator

**Email:** `superadmin@propertytest.com`  
**Password:** `Superadmin@123!`  
**Role:** Super Administrator

**Access:**
- Full system access across ALL organizations
- Create/manage all organizations
- Manage users across all organizations
- Access ALL properties (all organizations)
- View ALL financial data
- System configuration and settings
- Global reports and analytics

**Navigation Items:** 17 + Profile

---

### 🏢 Organization Administrator

**Email:** `admin@propertytest.com`  
**Password:** `Admin@123!`  
**Role:** Organization Administrator

**Access:**
- Full access within their organization
- Create/edit/delete organization properties
- Manage all tenants in organization
- View all organization financial data
- Invite staff and assign roles
- Access organization reports
- Configure organization settings
- Assign properties to staff

**Navigation Items:** 12 + Profile

---

### 🏠 Property Manager

**Email:** `manager@propertytest.com`  
**Password:** `Manager@123!`  
**Role:** Property Manager

**Access:**
- Manage assigned properties only
- Edit assigned properties (details, status, maintenance)
- Add/edit tenants for assigned properties
- Record and track payments for assigned properties
- Handle maintenance requests
- Manage space assignments
- Generate property reports

**Limitations:**
- ❌ Cannot create new properties (org admin only)
- ❌ Cannot access unassigned properties
- ❌ Cannot manage users or assign roles

**Navigation Items:** 8 + Profile

---

### 📊 Financial Viewer

**Email:** `finance@propertytest.com`  
**Password:** `Finance@123!`  
**Role:** Financial Viewer

**Access:**
- View all financial data (payments, reports)
- View basic property information
- Access financial analytics and reports
- View payment history and trends
- Export financial reports

**Limitations:**
- ❌ Cannot edit properties
- ❌ Cannot manage tenants
- ❌ Cannot record payments (view only)
- ❌ Cannot manage users

**Navigation Items:** 5 + Profile

---

## 🚀 Quick Start

### 1. Create Test Accounts in Firebase

Create these users in Firebase Authentication Console:
- Email/Password authentication enabled
- Each user needs a corresponding document in Firestore `users` collection

### 2. Firestore User Documents

Each user document should have:
```javascript
{
  email: "superadmin@propertytest.com",
  roleId: "super_admin",
  organizationId: "org-id",
  status: "active",
  permissions: [...] // Based on role
}
```

### 3. Testing Workflow

1. Start development server: `yarn dev`
2. Navigate to: `http://localhost:5173`
3. Login with any test account above
4. Verify expected navigation items appear
5. Test role-based access controls

---

## 📊 Role Comparison

| Feature | Super Admin | Org Admin | Property Manager | Financial Viewer |
|---------|-------------|-----------|------------------|------------------|
| Create Properties | ✅ All Orgs | ✅ Own Org | ❌ | ❌ |
| Edit Properties | ✅ All | ✅ All | ✅ Assigned | ❌ |
| Delete Properties | ✅ | ✅ | ❌ | ❌ |
| Manage Tenants | ✅ | ✅ | ✅ Assigned | ❌ |
| Record Payments | ✅ | ✅ | ✅ Assigned | ❌ |
| View Payments | ✅ All | ✅ Org | ✅ Assigned | ✅ All |
| Financial Reports | ✅ All | ✅ Org | ✅ Assigned | ✅ All |
| Manage Users | ✅ All | ✅ Org | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ |
| System Config | ✅ | ❌ | ❌ | ❌ |
| Multi-Org Access | ✅ | ❌ | ❌ | ❌ |

---

## 🔒 Security Notes

### Password Requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Domain Convention:
- Using `@propertytest.com` for test accounts to clearly indicate non-production use

### First-Time Setup:
- Users need proper Firestore documents with correct `roleId` and `status: "active"`
- Permissions array must match the role's permissions
- Organization ID must be set for non-super-admin roles

---

## 🧪 Testing Checklist

### Super Admin
- [ ] Can see all navigation items including System Admin pages
- [ ] Can access properties from all organizations
- [ ] Can create organizations and manage all users
- [ ] Can access System Settings

### Org Admin
- [ ] Can see "User Management" in sidebar
- [ ] Can approve/reject new user access requests
- [ ] Can assign roles to users in their organization
- [ ] Can access "Admin Dashboard" and "Organization Settings"

### Property Manager
- [ ] Sees limited navigation (no admin pages)
- [ ] Can only see properties assigned to them
- [ ] Can edit assigned properties and manage tenants
- [ ] Can record payments for assigned properties

### Financial Viewer
- [ ] Sees minimal navigation
- [ ] All pages are READ-ONLY
- [ ] Cannot edit properties or record payments
- [ ] Can view financial analytics and reports

---

## 🆘 Troubleshooting

### Can't Login?
1. Verify account exists in Firebase Authentication
2. Check password is correct (case-sensitive)
3. Try password reset if needed
4. Check backend server is running
5. Check browser console for errors

### Don't See Expected Pages?
1. Check user's `roleId` in Firestore `users` collection
2. Verify role has correct permissions in `roles` collection
3. Check browser console for permission errors
4. Try logout and login again to refresh permissions

### Role Not Working?
1. Check user's document: `status` must be "active"
2. Verify `roleId` matches an existing role
3. Ensure `permissions` array contains expected permissions
4. Check Firebase security rules for that user

---

**✅ All test accounts configured and ready for development!**

🎉 **Happy Testing!**

A