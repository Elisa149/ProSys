# Data Verification Guide

## ✅ Database Integration Status

All manager-accessible pages have been updated to fetch data directly from Firebase Firestore.

## 📊 Pages That Display Database Data

### 1. **Dashboard** (`/app/dashboard`)
- **Data Sources:**
  - Properties from `properties` collection
  - Payments from `payments` collection
- **What You'll See:**
  - Total properties count
  - Total spaces count
  - Monthly collection statistics
  - Recent payments list
  - Collection rate metrics

### 2. **Properties** (`/app/properties`)
- **Data Source:** `properties` collection
- **What You'll See:**
  - List of all properties (filtered by role)
  - Property cards with:
    - Property name and type (building/land)
    - Location information
    - Status (occupied/vacant/maintenance)
    - Number of spaces or squatters
    - Monthly income potential
  - Create Property button (for managers with permission)

### 3. **Tenants** (`/app/tenants`)
- **Data Sources:**
  - Properties from `properties` collection
  - Rent records from `rent` collection
- **What You'll See:**
  - List of all tenants extracted from rent records
  - Tenant information:
    - Name, email, phone
    - Property and space assigned
    - Monthly rent amount
    - Payment status
    - Last payment date
  - Summary statistics (total tenants, active leases, etc.)

### 4. **Rent Management** (`/app/rent`)
- **Data Sources:**
  - Properties from `properties` collection
  - Rent records from `rent` collection
  - Payments from `payments` collection
- **What You'll See:**
  - Active rent agreements
  - Tenant information with photos/avatars
  - Monthly rent amounts
  - Payment status (paid/pending/overdue)
  - Collection statistics
  - Tabs for different rent statuses
  - Record Payment button

### 5. **Payments** (`/app/payments`)
- **Data Sources:**
  - Payments from `payments` collection
  - Properties from `properties` collection (for filtering)
- **What You'll See:**
  - List of all payments
  - Payment details:
    - Tenant name
    - Property name
    - Amount paid
    - Payment date
    - Payment method (cash/bank transfer/etc.)
    - Transaction ID
    - Status
  - Summary statistics:
    - Total payments
    - Total amount collected
    - Average payment amount
  - Filter options (by property, method, status, date range)
  - Export functionality

## 🔍 How to Verify Data is Loading

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for:
   - ✅ No red errors related to Firebase
   - ✅ No "Failed to fetch" messages
   - ✅ Console logs showing data being loaded (if any)

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to the Network tab
3. Filter by "Fetch/XHR"
4. Look for:
   - ✅ Requests to `firestore.googleapis.com`
   - ✅ Status 200 (success) responses
   - ✅ Response data containing your properties/rent/payments

### Step 3: Visual Verification
1. **Dashboard:**
   - Should show numbers (not 0 or "N/A")
   - Should show recent payments if any exist
   - Statistics cards should have real data

2. **Properties Page:**
   - Should show property cards
   - Each card should have property details
   - If no properties, should show "Add your first property" message

3. **Tenants Page:**
   - Should show tenant list if rent records exist
   - Should show tenant details (name, property, rent amount)
   - If no tenants, should show "No tenants found" message

4. **Rent Management:**
   - Should show rent agreements
   - Should show tenant names and payment status
   - Should show statistics at the top

5. **Payments:**
   - Should show payment records
   - Should show payment amounts and dates
   - Should show summary statistics

## 🔧 Troubleshooting

### If You See "No Data" or Empty Lists:

1. **Check if you're logged in as the correct user:**
   - Super Admin: Should see ALL data
   - Org Admin: Should see organization data
   - Property Manager: Should see only assigned properties

2. **Verify data exists in Firebase:**
   - Go to Firebase Console
   - Navigate to Firestore Database
   - Check if collections have documents:
     - `properties` collection
     - `rent` collection
     - `payments` collection

3. **Check user permissions:**
   - Go to Firebase Console → Firestore Database → `users` collection
   - Find your user document
   - Verify `roleId` is set correctly
   - Verify `permissions` array includes necessary permissions
   - Verify `organizationId` is set (if not super_admin)

4. **Check Firestore Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Verify rules allow read access for your role
   - Rules should match `firestore-complete.rules`

### If You See Errors:

1. **"Permission Denied" Errors:**
   - Check Firestore rules
   - Verify user has correct role and permissions
   - Run `node scripts/bootstrapAdmin.js` to ensure admin user is set up

2. **"Index Required" Errors:**
   - Check browser console for the index creation link
   - Click the link to create the required index
   - Wait a few minutes for index to build
   - Refresh the page

3. **"Network Error" or "Failed to Fetch":**
   - Check internet connection
   - Verify Firebase project is active
   - Check Firebase Console for any service issues

## 📝 Sample Data Script

If you need to add sample data to test:

```bash
node scripts/addSampleData.js
```

This will create:
- 2 sample properties (1 building, 1 land)
- 3 rent records
- 3 payment records

**Note:** The script will skip if data already exists to avoid duplicates.

## 🎯 Expected Data Flow

```
User Login → Auth Context → Get User Role & Permissions
                ↓
        Page Component Loads
                ↓
   useQuery Hook Calls Firebase Service
                ↓
   Firebase Service Applies Role-Based Filtering
                ↓
        Firestore Query Executed
                ↓
        Data Returned as Array
                ↓
        React Query Caches Data
                ↓
        Component Renders with Data
```

## ✅ Verification Checklist

- [ ] Can log in as admin@prosys.com
- [ ] Dashboard shows statistics (not all zeros)
- [ ] Properties page shows property list or "add first property" message
- [ ] Tenants page shows tenant list or "no tenants" message
- [ ] Rent Management shows rent records or empty state
- [ ] Payments page shows payment records or empty state
- [ ] No red errors in browser console
- [ ] Network tab shows successful Firestore requests
- [ ] Can create new properties (if have permission)
- [ ] Can navigate between pages without errors

## 🚀 Next Steps

1. **If Data is Loading:** Everything is working correctly! You can now:
   - Add more properties
   - Create rent agreements
   - Record payments
   - Manage tenants

2. **If No Data is Showing:**
   - Run the sample data script: `node scripts/addSampleData.js`
   - Or manually add a property through the UI
   - Check the troubleshooting section above

3. **If Errors Persist:**
   - Check browser console for specific error messages
   - Verify Firebase configuration in `.env` or `src/config/firebase.js`
   - Ensure Firestore rules are deployed
   - Check that user has correct permissions in Firestore

## 📞 Support

If you continue to experience issues:
1. Check browser console for specific error messages
2. Verify Firebase project configuration
3. Ensure all Firebase services are enabled
4. Check Firestore rules and indexes
5. Verify user authentication and permissions


