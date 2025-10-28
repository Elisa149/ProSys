# 🔍 How to Check Your Database Data

## Problem
Dashboard is not reflecting data from the database.

## ✅ How to Check Database Data

### Method 1: Using the Diagnostic Page (Recommended)

1. **Start your development server:**
   ```bash
   yarn dev
   ```

2. **Log in to the app**

3. **Navigate to the Diagnostic Page:**
   - Go to: `http://localhost:5173/app/diagnostic`
   - Or click "Diagnostic" in your navigation menu

4. **Check what it shows:**
   - Your user profile from Firestore
   - Number of properties found
   - Number of rent records found
   - Number of payments found

5. **Check browser console (F12):**
   - Look for logs showing what data was fetched
   - Check for any errors

### Method 2: Using Firebase Console

1. **Go to:** https://console.firebase.google.com/project/fam-rent-sys/firestore

2. **Check these collections:**
   - `properties` - Your properties data
   - `payments` - Your payments data  
   - `rent` - Your rent/tenant records
   - `users` - Your users data

3. **Verify you have data in these collections**

### Method 3: Check Browser Console on Dashboard

1. **Open your dashboard:** `http://localhost:5173/app/dashboard`

2. **Open browser console (F12)**

3. **Look for these logs:**
   ```
   📊 Fetching dashboard summary with: { userId, userRole, organizationId }
   📊 Fetched X properties
   📊 Fetched X payments
   ```

4. **If you see "0 properties" or "0 payments"**: You have no data in the database

## 🐛 Common Issues

### Issue 1: "Missing or insufficient permissions"
- **Solution**: Add your data through the app interface
- Go to Properties → Create Property
- Add some properties with spaces
- Create rent agreements
- Record payments

### Issue 2: No data in database
- **Solution**: You need to add data first!
- Use the app to create properties
- Assign tenants to spaces
- Record payments

### Issue 3: Data exists but dashboard shows nothing
- **Check console logs** for what's being fetched
- **Verify your role** - make sure you have proper permissions
- **Check organizationId** - ensure it matches your data

## 📊 What Should I See?

### On Dashboard:
```
✅ Total Properties: 5
✅ Total Spaces: 32
✅ This Month Collected: UGX 500,000
✅ Monthly Potential: UGX 1,000,000
```

### On Diagnostic Page:
```
✅ Properties: 5 found
✅ Rent Records: 10 found
✅ Payments: 15 found
```

## 🔧 Next Steps

1. **Check if you have any data:**
   - Go to `http://localhost:5173/app/diagnostic`
   - See what collections have data

2. **If no data exists:**
   - Create a property
   - Add spaces to the property
   - Assign tenants to spaces
   - Record a payment

3. **If data exists but dashboard is empty:**
   - Check browser console for errors
   - Check your user role and permissions
   - Verify organizationId matches your data

4. **Share what you see:**
   - Take a screenshot of the diagnostic page
   - Share the browser console logs
   - This will help debug the issue


