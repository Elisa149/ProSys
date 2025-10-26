# 🔧 Manual Fix: Add Permissions in Firebase Console

## Quick Fix for Login Error

The error `Cannot read properties of undefined (reading 'indexOf')` happens because users are missing the `permissions` field.

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Open Firebase Console**

1. Go to: https://console.firebase.google.com/
2. Select project: **fam-rent-sys**
3. Click **Firestore Database** in left menu
4. Click on **users** collection

---

### **Step 2: Update Super Admin**

1. Find and click on document: `jIO7WMHiQ9WkM2gUfwIhbbiqGL53`
2. Click **"Add field"** button
3. **Field name**: `permissions`
4. **Type**: Select `array` from dropdown
5. Click **"Add item"** for each permission below:

#### Copy-Paste These Values (25 permissions):

```
system:admin
system:config
organizations:read:all
organizations:write:all
organizations:delete:all
users:read:all
users:write:all
users:delete:all
roles:read:all
roles:write:all
roles:delete:all
properties:read:organization
properties:write:organization
properties:delete:organization
tenants:read:organization
tenants:write:organization
tenants:delete:organization
payments:read:organization
payments:write:organization
payments:create:organization
payments:delete:organization
reports:read:organization
reports:write:organization
assignments:read:organization
assignments:write:organization
```

6. Click **Save** or **Update**

---

### **Step 3: Update Other Users**

Repeat for each user. Find them by email:

---

#### 🟠 **Organization Admin** (`admin@propertytest.com`)

**Field name**: `permissions`  
**Type**: `array`

**Add these 18 items:**
```
users:read:organization
users:write:organization
users:delete:organization
properties:read:organization
properties:write:organization
properties:delete:organization
tenants:read:organization
tenants:write:organization
tenants:delete:organization
payments:read:organization
payments:write:organization
payments:create:organization
payments:delete:organization
reports:read:organization
reports:write:organization
organization:settings:write
assignments:read:organization
assignments:write:organization
```

---

#### 🟡 **Property Manager** (`manager@propertytest.com`)

**Field name**: `permissions`  
**Type**: `array`

**Add these 12 items:**
```
properties:read:assigned
properties:write:assigned
tenants:read:assigned
tenants:write:assigned
tenants:delete:assigned
payments:read:assigned
payments:write:assigned
payments:create:assigned
reports:read:assigned
rent:read:assigned
rent:write:assigned
rent:create:assigned
```

---

#### 🟢 **Financial Viewer** (`finance@propertytest.com`)

**Field name**: `permissions`  
**Type**: `array`

**Add these 4 items:**
```
reports:read:organization
properties:read:organization
payments:read:organization
analytics:read:organization
```

---

## ⚡ **Faster Method: Copy All at Once**

If Firebase Console allows JSON editing:

### Super Admin Permissions (JSON):
```json
[
  "system:admin",
  "system:config",
  "organizations:read:all",
  "organizations:write:all",
  "organizations:delete:all",
  "users:read:all",
  "users:write:all",
  "users:delete:all",
  "roles:read:all",
  "roles:write:all",
  "roles:delete:all",
  "properties:read:organization",
  "properties:write:organization",
  "properties:delete:organization",
  "tenants:read:organization",
  "tenants:write:organization",
  "tenants:delete:organization",
  "payments:read:organization",
  "payments:write:organization",
  "payments:create:organization",
  "payments:delete:organization",
  "reports:read:organization",
  "reports:write:organization",
  "assignments:read:organization",
  "assignments:write:organization"
]
```

### Org Admin Permissions (JSON):
```json
[
  "users:read:organization",
  "users:write:organization",
  "users:delete:organization",
  "properties:read:organization",
  "properties:write:organization",
  "properties:delete:organization",
  "tenants:read:organization",
  "tenants:write:organization",
  "tenants:delete:organization",
  "payments:read:organization",
  "payments:write:organization",
  "payments:create:organization",
  "payments:delete:organization",
  "reports:read:organization",
  "reports:write:organization",
  "organization:settings:write",
  "assignments:read:organization",
  "assignments:write:organization"
]
```

### Property Manager Permissions (JSON):
```json
[
  "properties:read:assigned",
  "properties:write:assigned",
  "tenants:read:assigned",
  "tenants:write:assigned",
  "tenants:delete:assigned",
  "payments:read:assigned",
  "payments:write:assigned",
  "payments:create:assigned",
  "reports:read:assigned",
  "rent:read:assigned",
  "rent:write:assigned",
  "rent:create:assigned"
]
```

### Financial Viewer Permissions (JSON):
```json
[
  "reports:read:organization",
  "properties:read:organization",
  "payments:read:organization",
  "analytics:read:organization"
]
```

---

## ✅ **After Adding Permissions**

### 1. **Clear Browser Cache**
- Press `Ctrl + Shift + Delete`
- Check "Cached images and files"
- Click "Clear data"

### 2. **Refresh Application**
- Press `F5` or `Ctrl + R`

### 3. **Login and Test**
```
Email: superadmin@propertytest.com
Password: SuperAdmin123!
```

### 4. **Verify Success**
- ✅ No console errors
- ✅ Sidebar shows 17 navigation items
- ✅ Role badge shows "Super Admin"
- ✅ Can click on all menu items

---

## 📊 **Visual Guide**

### Adding Array Field in Firebase Console:

```
1. Click "Add field" button
   
2. In the popup:
   ┌─────────────────────────────────┐
   │ Field                           │
   │ [permissions            ]  [▼]  │ ← Type field name
   │                                 │
   │ Type                            │
   │ [array              ]  [▼]      │ ← Select "array"
   │                                 │
   │ Value                           │
   │ ┌─────────────────────────────┐ │
   │ │ [+ Add item]                │ │
   │ └─────────────────────────────┘ │
   │                                 │
   │        [Cancel]  [Save]         │
   └─────────────────────────────────┘

3. Click "Add item" for each permission
   
4. For each item:
   ┌─────────────────────────────────┐
   │ Type: [string        ] [▼]      │
   │ Value: [system:admin        ]   │ ← Paste permission
   └─────────────────────────────────┘

5. Click "Save" when done
```

---

## 🎯 **Checklist**

- [ ] Super Admin: Added 25 permissions
- [ ] Org Admin: Added 18 permissions  
- [ ] Property Manager: Added 12 permissions
- [ ] Financial Viewer: Added 4 permissions
- [ ] Cleared browser cache
- [ ] Refreshed application
- [ ] Tested login
- [ ] Verified sidebar items
- [ ] No console errors

---

## 🐛 **Troubleshooting**

### Still seeing errors after adding permissions?

1. **Verify field name is exactly**: `permissions` (lowercase, plural)
2. **Verify field type is**: `array` (not string, not map)
3. **Verify each item type is**: `string`
4. **Hard refresh browser**: `Ctrl + Shift + R`
5. **Try incognito/private mode**
6. **Logout and login again**

### Can't find the user document?

1. Check you're in the `users` collection (not `authentication`)
2. The document ID should be the User UID
3. Search by email in Firestore filters

### Don't see "Add field" button?

1. Make sure you've clicked ON the document (not just selected it)
2. The document should be open showing all fields
3. Look for a "+" or "Add field" button near the field list

---

## 📞 **Need More Help?**

If you're still stuck, take a screenshot of:
1. The Firestore user document
2. The browser console errors
3. The sidebar (what items show)

This will help diagnose the exact issue.

---

**Estimated Time**: 5-10 minutes per user  
**Total Time**: ~20-30 minutes for all 4 users

🎯 **Start with Super Admin first to test!**



