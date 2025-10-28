# Check Manager Dashboard Data

## Overview
This guide helps you check what data exists in Firebase for the managers dashboard.

## Quick Check Methods

### Method 1: Use Firebase Console (Easiest)
1. Go to https://console.firebase.google.com
2. Select project: `fam-rent-sys`
3. Navigate to Firestore Database
4. Check these collections:
   - **users** - Check user organizationId and roleId
   - **properties** - Check organizationId matches user's org
   - **payments** - Check organizationId matches user's org
   - **rent** - Check organizationId matches user's org

### Method 2: Check from Browser Console
1. Open your app in the browser
2. Open Developer Tools (F12)
3. Login as a manager
4. Navigate to Dashboard
5. Open Console tab
6. Look for logs showing:
   - `📊 Fetched X properties`
   - `📊 Fetched X payments`
   - `✅ Returning X rent records`

### Method 3: Check from App
1. Login as a manager
2. Check the Dashboard page
3. Look at the stats displayed:
   - Total Properties
   - Total Spaces
   - This Month Collected
   - Monthly Potential

## What Data Managers See

### Dashboard Summary
Managers see data filtered by their `organizationId`:

**Properties:**
- Only properties with matching `organizationId`
- Spaces within those properties
- Expected monthly rent from those spaces

**Payments:**
- Only payments with matching `organizationId`
- Filtered by payment date
- Calculated for current month vs last month

**Rent Records:**
- Only rent records with matching `organizationId`
- Used to show tenant assignments

## Common Issues

### 1. Empty Dashboard
**Cause:** No data matches the manager's `organizationId`

**Solution:**
- Verify user has an `organizationId` set
- Verify properties have the same `organizationId`
- Verify payments/rent records have matching `organizationId`

### 2. Missing Properties
**Cause:** Properties don't have matching `organizationId`

**Check:**
```javascript
// In browser console
console.log('User Org:', auth.user.organizationId);
console.log('Properties:', properties.map(p => ({ 
  name: p.name, 
  org: p.organizationId 
})));
```

### 3. No Payments Showing
**Cause:** Payments don't have matching `organizationId` or date

**Check:**
```javascript
// In browser console
console.log('Payments:', payments.filter(p => 
  p.organizationId === auth.user.organizationId
));
```

## Data Requirements for Managers Dashboard

For the dashboard to show data, you need:

1. **User with organizationId**
   - User document must have `organizationId` field
   - User must have `roleId` set to `property_manager` or `org_admin`

2. **Properties with matching organizationId**
   - Each property needs `organizationId` matching user's org
   - Properties should have spaces defined (building floors/spaces or land squatters)

3. **Payments with matching organizationId** (optional)
   - Payments should have `organizationId` matching user's org
   - Needed for collection stats

4. **Rent Records with matching organizationId** (optional)
   - Rent records should have `organizationId` matching user's org
   - Needed for tenant information

## Expected Behavior

### With Data
- Dashboard shows property count
- Shows space count (floors + spaces or squatters)
- Shows expected monthly rent from properties
- Shows collection rate (if payments exist)
- Shows recent payments list

### Without Data
- Dashboard shows zeros for all stats
- "No recent payments" message
- "No properties" message if no properties

## Testing Checklist

- [ ] User has organizationId set
- [ ] User has roleId set (property_manager or org_admin)
- [ ] At least one property exists with matching organizationId
- [ ] Properties have spaces defined (floors/spaces or squatters)
- [ ] At least one payment exists with matching organizationId (optional)
- [ ] At least one rent record exists with matching organizationId (optional)

## How to Fix Empty Data

If you see empty data on the dashboard:

1. **Check User Organization:**
   ```javascript
   // Run in browser console when logged in
   const user = JSON.parse(localStorage.getItem('currentUser'));
   console.log('User Org:', user.organizationId);
   console.log('User Role:', user.roleId);
   ```

2. **Check Properties:**
   ```javascript
   // Run in browser console
   import { propertyService } from './services/firebaseService';
   const properties = await propertyService.getAll(userId, userRole, organizationId);
   console.log('Properties:', properties);
   ```

3. **Create Test Data if Needed:**
   - Go to Properties page
   - Create a new property with your organizationId
   - Add spaces to the property
   - Assign tenants to spaces (creates rent records)
   - Record payments (creates payment records)

## Next Steps

If the dashboard shows no data:
1. Create properties with your organizationId
2. Add spaces to properties (floors/spaces or squatters)
3. Assign tenants to spaces
4. Record payments

The dashboard will automatically update as data is added.


