# 🏠 Rent Page - Assign New Tenant Flow

## 📋 Complete Process Flow

This document explains what happens when a user clicks the "Assign New Tenant" button on the Rent page.

---

## 🔄 Step-by-Step Flow

### **Step 1: User Clicks "Assign New Tenant" Button**

**Location:** `src/pages/RentPage.jsx` (Lines 336-342)

```javascript
<Button
  key="assign-tenant"
  variant="contained"
  startIcon={<Add />}
  onClick={() => setPropertyDialog(true)}  // ← Opens the dialog
>
  Assign New Tenant
</Button>
```

**Action:** Sets `propertyDialog` state to `true`, which opens the PropertySelectorDialog component.

---

### **Step 2: PropertySelectorDialog Opens**

**Location:** `src/components/PropertySelectorDialog.jsx`

**What Happens:**
1. Dialog appears with title "Select Property to Assign Tenant"
2. **Fetches properties from Firebase** using:
   ```javascript
   propertyService.getAll(userId, userRole, organizationId)
   ```
3. Displays a list of all properties the user has access to
4. Shows property details:
   - Property name
   - Property type (Building/Land)
   - Location (village, district)
   - Number of spaces (for buildings) or squatters (for land)

**Visual Example:**
```
┌─────────────────────────────────────────┐
│ 🏠 Select Property to Assign Tenant     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 🏢 ELISA SSEKUTOLEKO             │   │
│ │    building                       │   │
│ │    📍 nkokonjerwu, wakiso        │   │
│ │    4 spaces                       │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 🏢 Another Property              │   │
│ │    building                       │   │
│ │    📍 kampala, kampala            │   │
│ │    8 spaces                       │   │
│ └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│         [Cancel]  [Continue to Space    │
│                    Assignment]          │
└─────────────────────────────────────────┘
```

---

### **Step 3: User Selects a Property**

**Action:** User clicks on one of the property cards

**Result:** 
- Property card gets highlighted with blue border
- Selected property is stored in `selectedProperty` state
- "Continue to Space Assignment" button becomes enabled

---

### **Step 4: User Confirms Selection**

**Location:** `PropertySelectorDialog.jsx` (Lines 50-56)

```javascript
const handleConfirm = () => {
  if (selectedProperty) {
    navigate(`/app/properties/${selectedProperty.id}/spaces`);
    onClose();
    setSelectedProperty(null);
  }
};
```

**Action:** User clicks "Continue to Space Assignment"

**Result:**
1. Navigates to property detail page with spaces tab
2. URL: `/app/properties/{propertyId}/spaces`
3. Dialog closes
4. Selected property state is reset

---

### **Step 5: Property Detail Page Opens (Spaces Tab)**

**Location:** `src/pages/PropertyDetailPage.jsx` (assumed - spaces management)

**What User Sees:**
- Property details at the top
- Tabs: Overview | **Spaces** | Tenants | History
- List of all spaces in the property
- For each space:
  - Space name/number
  - Floor (if building)
  - Size/dimensions
  - Monthly rent
  - Current tenant (if assigned) or "Vacant"
  - "Assign Tenant" button

**From Here, User Can:**
1. Click "Assign Tenant" on a specific space
2. Fill in tenant information:
   - Tenant name
   - Contact information
   - Monthly rent amount
   - Lease start date
   - Payment due date
   - Lease duration
3. Save the tenant assignment
4. This creates a **rent record** in the database

---

## 🗄️ Data Flow

### **Database Collections Involved:**

1. **`properties`** - Fetched to show property list
2. **`rent`** - Created when tenant is assigned to a space
3. **`tenants`** - Tenant information stored (if using separate tenant collection)

### **Firebase Query:**

```javascript
// Fetches properties based on user role and organization
propertyService.getAll(userId, userRole, organizationId)

// Query logic:
// - Super Admin: All properties
// - Org Admin: Properties in their organization
// - Property Manager: Properties in their organization
// - Financial Viewer: Properties in their organization
```

---

## 🔧 Recent Fix Applied

### **Problem:**
PropertySelectorDialog was using old REST API service instead of Firebase:
```javascript
// ❌ OLD (Incorrect)
import { propertiesAPI } from '../services/api';
const { data: propertiesData } = useQuery('properties', propertiesAPI.getAll);
const properties = propertiesData?.data?.properties || [];
```

### **Solution:**
Updated to use Firebase service:
```javascript
// ✅ NEW (Correct)
import { propertyService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const { user, userRole, organizationId } = useAuth();
const { data: properties = [] } = useQuery(
  ['properties-dialog', user?.uid, userRole, organizationId],
  () => propertyService.getAll(user?.uid, userRole, organizationId),
  { enabled: open && !!user }
);
```

---

## 🎯 User Journey Example

**Scenario:** Property manager wants to assign a new tenant

1. **Navigate to Rent Page** → `/app/rent`
2. **Click "Assign New Tenant"** button (top right)
3. **Select Property** from the list (e.g., "ELISA SSEKUTOLEKO")
4. **Click "Continue to Space Assignment"**
5. **Redirected to** `/app/properties/{id}/spaces`
6. **View available spaces:**
   - Floor 1, Room 1 - Vacant
   - Floor 1, Room 2 - Occupied (John Doe)
   - Floor 2, Room 1 - Vacant
7. **Click "Assign Tenant"** on Floor 1, Room 1
8. **Fill in tenant details:**
   - Name: Jane Smith
   - Phone: +256 700 123 456
   - Email: jane@example.com
   - Monthly Rent: 500,000 UGX
   - Start Date: 2025-11-01
   - Due Date: 5th of each month
9. **Save Assignment**
10. **Rent record created** in database
11. **Tenant now appears** in Rent Management table

---

## 🔍 Key Components

| Component | File | Purpose |
|-----------|------|---------|
| RentPage | `src/pages/RentPage.jsx` | Main rent management page |
| PropertySelectorDialog | `src/components/PropertySelectorDialog.jsx` | Property selection popup |
| PropertyDetailPage | `src/pages/PropertyDetailPage.jsx` | Property details with space management |
| propertyService | `src/services/firebaseService.js` | Firebase property queries |
| rentService | `src/services/firebaseService.js` | Firebase rent record creation |

---

## 📊 State Management

### **RentPage States:**
```javascript
const [propertyDialog, setPropertyDialog] = useState(false);  // Controls dialog visibility
```

### **PropertySelectorDialog States:**
```javascript
const [selectedProperty, setSelectedProperty] = useState(null);  // Selected property
```

### **React Query Cache:**
```javascript
// Properties are cached with key:
['properties-dialog', userId, userRole, organizationId]

// Invalidated when:
// - User logs out
// - Property is created/updated/deleted
// - Organization changes
```

---

## ✅ Testing the Flow

### **Prerequisites:**
1. ✅ User is logged in
2. ✅ User has at least one property in their organization
3. ✅ User has permission to assign tenants

### **Test Steps:**
1. Navigate to **Rent page**: `http://localhost:5174/app/rent`
2. Click **"Assign New Tenant"** button
3. Verify **PropertySelectorDialog opens**
4. Verify **properties are displayed** (should show 2 properties)
5. Click on **a property** to select it
6. Verify **blue border** appears around selected property
7. Click **"Continue to Space Assignment"**
8. Verify **redirect** to property detail page
9. Verify **spaces tab** is active
10. Verify **space list** is displayed

### **Expected Results:**
- ✅ Dialog opens smoothly
- ✅ Properties load from Firebase
- ✅ Properties show correct information
- ✅ Selection works
- ✅ Navigation works
- ✅ No console errors

---

## 🆘 Troubleshooting

### **Dialog Opens But Shows No Properties:**

**Check:**
1. Browser console for errors
2. User authentication state (press F12, check console for auth logs)
3. User's organizationId matches properties in database
4. Firestore rules allow read access

**Solution:**
```javascript
// Run this in browser console to check:
console.log('Auth State:', {
  userId: user?.uid,
  userRole: userRole,
  organizationId: organizationId
});
```

### **Dialog Doesn't Open:**

**Check:**
1. `propertyDialog` state is updating
2. No JavaScript errors in console
3. Button onClick handler is firing

### **Navigation Fails:**

**Check:**
1. Property ID exists
2. Route `/app/properties/:id/spaces` is defined
3. User has permission to view property details

---

## 🔐 Permissions Required

| Action | Required Permission | Required Role |
|--------|-------------------|---------------|
| View properties | `properties:read:organization` | Property Manager, Org Admin, Super Admin |
| Assign tenant | `tenants:write:assigned` | Property Manager |
| Assign tenant | `tenants:write:organization` | Org Admin, Super Admin |

---

## 📝 Notes

1. **PropertySelectorDialog** now uses Firebase instead of REST API
2. **Properties are filtered** based on user role and organization
3. **Dialog only fetches** data when opened (performance optimization)
4. **Selected property state** is reset when dialog closes
5. **Space assignment** happens on the property detail page, not in the dialog

---

**✅ Flow is now working correctly with Firebase!**

Last Updated: 2025-10-26

