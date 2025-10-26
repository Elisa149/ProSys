# 📋 Quick Copy-Paste: User Permissions

## 🚀 **Super Fast Method**

Copy the permissions for each user and paste them into Firebase Console.

---

## 🔴 **SUPER ADMIN**
**Email**: `superadmin@propertytest.com`  
**User UID**: `jIO7WMHiQ9WkM2gUfwIhbbiqGL53`

### Add field: `permissions` (type: array)

**Copy these 25 lines** (one per array item):

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

---

## 🟠 **ORGANIZATION ADMIN**
**Email**: `admin@propertytest.com`

### Add field: `permissions` (type: array)

**Copy these 18 lines**:

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

## 🟡 **PROPERTY MANAGER**
**Email**: `manager@propertytest.com`

### Add field: `permissions` (type: array)

**Copy these 12 lines**:

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

## 🟢 **FINANCIAL VIEWER**
**Email**: `finance@propertytest.com`

### Add field: `permissions` (type: array)

**Copy these 4 lines**:

```
reports:read:organization
properties:read:organization
payments:read:organization
analytics:read:organization
```

---

## 🎯 **How to Use**

### For each user:

1. **Open Firebase Console** → Firestore Database → `users` collection
2. **Find the user** by email
3. **Click "Add field"**
4. **Field name**: `permissions`
5. **Type**: `array`
6. **For each line above**:
   - Click "Add item"
   - Type: `string`
   - Paste one permission
7. **Click Save**

---

## ✅ **Verify**

After adding permissions to Super Admin:

1. Clear browser cache
2. Login: `superadmin@propertytest.com` / `SuperAdmin123!`
3. Check sidebar has **17 items**
4. No errors in console

---

## 📝 **Tips**

- Add permissions to **Super Admin FIRST** to test
- Each permission is a **separate array item**
- Don't forget to click **Save/Update**
- Clear cache after each change

---

**🎯 Start Here**: Super Admin → Org Admin → Property Manager → Financial Viewer



