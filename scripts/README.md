# 🔧 Firebase Scripts

This folder contains utility scripts for managing Firebase data.

## 📋 Available Scripts

### `addPermissionsToUsers.js`

Automatically adds permissions to all users in Firestore based on their assigned roles.

#### **What it does:**
- Reads all users from Firestore `users` collection
- Checks each user's `roleId`
- Adds appropriate `permissions` array based on role
- Updates the user document in Firestore

#### **When to use:**
- After setting up new users with roles but no permissions
- When you need to update permissions for all users
- After changing role permission structure

---

## 🚀 How to Run

### **Step 1: Install Dependencies**

Make sure you have Node.js installed, then run:

```bash
npm install firebase
```

Or if you're using yarn:

```bash
yarn add firebase
```

### **Step 2: Run the Script**

```bash
node scripts/addPermissionsToUsers.js
```

---

## 📊 Expected Output

```
🔐 Permission Update Script
============================================================
This script will add permissions to all users based on their roles

🚀 Starting permission update for all users...

📋 Found 4 users

👤 Processing: superadmin@propertytest.com
   Role: super_admin
   Status: active
   ➕ Adding permissions...
   ✅ Success! Added 25 permissions

👤 Processing: admin@propertytest.com
   Role: org_admin
   Status: active
   ➕ Adding permissions...
   ✅ Success! Added 16 permissions

👤 Processing: manager@propertytest.com
   Role: property_manager
   Status: active
   ➕ Adding permissions...
   ✅ Success! Added 11 permissions

👤 Processing: finance@propertytest.com
   Role: financial_viewer
   Status: active
   ➕ Adding permissions...
   ✅ Success! Added 4 permissions

============================================================
📊 SUMMARY
============================================================
✅ Successfully updated: 4 users
⚠️  Skipped: 0 users
❌ Errors: 0 users
📋 Total processed: 4 users
============================================================

🎉 Permissions update completed successfully!

📝 Next steps:
   1. Clear browser cache
   2. Refresh your application
   3. Login with any test account
   4. Verify sidebar shows correct items

✅ Script completed
```

---

## 🔐 Permissions by Role

### Super Admin (25 permissions)
```javascript
[
  'system:admin',
  'system:config',
  'organizations:read:all',
  'organizations:write:all',
  'organizations:delete:all',
  'users:read:all',
  'users:write:all',
  'users:delete:all',
  'roles:read:all',
  'roles:write:all',
  'roles:delete:all',
  'properties:read:organization',
  'properties:write:organization',
  'properties:delete:organization',
  'tenants:read:organization',
  'tenants:write:organization',
  'tenants:delete:organization',
  'payments:read:organization',
  'payments:write:organization',
  'payments:create:organization',
  'payments:delete:organization',
  'reports:read:organization',
  'reports:write:organization',
]
```

### Organization Admin (16 permissions)
```javascript
[
  'users:read:organization',
  'users:write:organization',
  'users:delete:organization',
  'properties:read:organization',
  'properties:write:organization',
  'properties:delete:organization',
  'tenants:read:organization',
  'tenants:write:organization',
  'tenants:delete:organization',
  'payments:read:organization',
  'payments:write:organization',
  'payments:create:organization',
  'payments:delete:organization',
  'reports:read:organization',
  'reports:write:organization',
  'organization:settings:write',
  'assignments:read:organization',
  'assignments:write:organization',
]
```

### Property Manager (11 permissions)
```javascript
[
  'properties:read:assigned',
  'properties:write:assigned',
  'tenants:read:assigned',
  'tenants:write:assigned',
  'tenants:delete:assigned',
  'payments:read:assigned',
  'payments:write:assigned',
  'payments:create:assigned',
  'reports:read:assigned',
  'rent:read:assigned',
  'rent:write:assigned',
  'rent:create:assigned',
]
```

### Financial Viewer (4 permissions)
```javascript
[
  'reports:read:organization',
  'properties:read:organization',
  'payments:read:organization',
  'analytics:read:organization',
]
```

---

## ⚠️ Important Notes

1. **Firebase Config**: The script uses your Firebase configuration. Make sure it matches your `.env` file.

2. **Firestore Rules**: Ensure your Firestore security rules allow writes to user documents.

3. **Backup**: The script updates existing data. Consider backing up your Firestore before running.

4. **Dry Run**: You can modify the script to do a dry run first (just log changes without updating).

5. **Role Names**: The script expects these exact role names:
   - `super_admin`
   - `org_admin`
   - `property_manager`
   - `financial_viewer`

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'firebase'"
```bash
npm install firebase
# or
yarn add firebase
```

### Error: "Permission denied"
- Check your Firestore security rules
- Ensure the Firebase config is correct
- Verify you have write permissions to the `users` collection

### Users Skipped
- Check if users have `roleId` field
- Verify `roleId` matches one of the expected role names
- Check console output for details

---

## 🔄 Re-running the Script

You can safely run this script multiple times. It will:
- ✅ Update existing permissions
- ✅ Add missing permissions
- ✅ Replace outdated permission sets

---

## 📝 Customizing Permissions

To modify permissions for a role:

1. Open `scripts/addPermissionsToUsers.js`
2. Find the `ROLE_PERMISSIONS` object
3. Edit the permissions array for the desired role
4. Save and run the script again

Example:
```javascript
const ROLE_PERMISSIONS = {
  property_manager: [
    'properties:read:assigned',
    'properties:write:assigned',
    'your:new:permission',  // Add new permission
    // ... other permissions
  ],
};
```

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console output for specific errors
2. Verify your Firebase configuration
3. Check Firestore security rules
4. Ensure all users have valid `roleId` values

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0



