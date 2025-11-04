# Floor and Space Editing Feature

## Overview
The property management system now has full support for editing buildings and their floors/spaces, as well as editing land properties with squatter management.

## What's New

### 1. Edit Property Page (`EditPropertyPage.jsx`)
A comprehensive property editing page that allows you to:
- **Edit all basic property information** (name, type, location, caretaker, etc.)
- **Add, edit, and remove floors** on buildings
- **Add, edit, and remove spaces** within each floor
- **Manage land squatters** for land properties
- **Update property images**
- **Change property descriptions**

### 2. Updated Routing
- **New Route**: `/app/properties/:id/edit` - Dedicated edit page for properties
- **Role Protection**: Only users with roles `super_admin`, `org_admin`, or `property_manager` can edit properties

### 3. Navigation Updates
Updated navigation throughout the application:
- Properties page menu now navigates to dedicated edit page
- Property details page "Edit" button navigates to edit page
- After successful edits, users are redirected back to property details

## How to Use

### Editing a Building's Floors and Spaces

1. **Navigate to Properties Page**
   - Go to `/app/properties`
   - Find the property you want to edit

2. **Access Edit Mode**
   - Click the three-dot menu (⋮) on a property card
   - Select "Edit Property"
   - OR click "Edit" button on the property details page

3. **Manage Floors**
   - Click "Add Floor" to create a new floor
   - Edit floor name and description for each floor
   - Click the delete (🗑️) icon to remove a floor
   - Floors are automatically renumbered when deleted

4. **Manage Spaces**
   Within each floor accordion:
   - Click "Add Space" to create a new rentable space
   - Fill in space details:
     - **Space Name**: e.g., "Room 101", "Shop A"
     - **Space Type**: Room, Apartment, Shop, Office, Storage, Other
     - **Monthly Rent**: Amount in UGX
     - **Size/Specifications**: e.g., "2 bedroom", "50 sqm"
     - **Status**: Vacant, Occupied, Maintenance
     - **Description**: Additional details

5. **Edit Existing Spaces**
   - Click the edit (✏️) icon on any space
   - Modify the details in the dialog
   - Click "Update Space" to save changes

6. **Delete Spaces**
   - Click the delete (🗑️) icon on any space
   - Space is immediately removed from the floor

7. **Save Changes**
   - Scroll to the bottom of the page
   - Click "Save Changes" to persist all modifications
   - You'll be redirected to the property details page

### Editing Land Properties

For land properties, you can:
- Update land details (total area, land use)
- Add, edit, or remove squatters
- Update squatter information (name, phone, assigned area, monthly payment)
- Manage agreement dates and status

## Features of the Space Management Component

### Real-time Calculations
- **Floor Income**: Automatically calculates total monthly income per floor
- **Building Summary**: Shows total floors, spaces, and potential monthly income
- **Visual Feedback**: Color-coded status chips for spaces (vacant, occupied, maintenance)

### Smart Naming
- Spaces are automatically named based on floor and count
- You can customize names to match your property's layout

### Data Preservation
- All existing tenant assignments are preserved
- Property relationships remain intact
- Historical data is maintained

### Validation
- Required fields are enforced (space name and type)
- Monetary values are validated
- Changes require confirmation before saving

## Technical Details

### Components Used
- **SpaceManagement.jsx**: Handles building floors and spaces
- **SquatterManagement.jsx**: Handles land squatter management
- **EditPropertyPage.jsx**: Main edit page container

### Data Structure

#### Building with Floors and Spaces
```javascript
{
  type: "building",
  buildingDetails: {
    buildingType: "apartment",
    numberOfFloors: 3,
    floors: [
      {
        floorNumber: 0,
        floorName: "Ground Floor",
        description: "Commercial spaces",
        spaces: [
          {
            spaceId: "abc123",
            spaceName: "Shop 1",
            spaceType: "shop",
            monthlyRent: 500000,
            size: "40 sqm",
            status: "vacant",
            description: "Corner shop with large windows",
            amenities: []
          }
        ]
      }
    ],
    totalRentableSpaces: 12
  }
}
```

#### Land with Squatters
```javascript
{
  type: "land",
  landDetails: {
    totalArea: "5 acres",
    landUse: "agricultural",
    totalSquatters: 3,
    squatters: [
      {
        squatterId: "sq123",
        squatterName: "John Doe",
        squatterPhone: "+256 700 123 456",
        assignedArea: "North section",
        areaSize: "1 acre",
        monthlyPayment: 100000,
        agreementDate: "2024-01-01",
        status: "active"
      }
    ]
  }
}
```

### Permissions Required
To edit properties, users must have one of these roles:
- `super_admin`
- `org_admin`
- `property_manager`

### Image Management
- Upload new property images
- Automatic cleanup of old images when replaced
- Images stored in Firebase Storage under `properties/{organizationId}/`

## Benefits

1. **Flexibility**: Add or remove floors and spaces as your property evolves
2. **Accuracy**: Keep rental information up-to-date
3. **Organization**: Manage all properties from one interface
4. **Automation**: Automatic calculations reduce errors
5. **History**: All changes are tracked with timestamps

## Best Practices

1. **Regular Updates**: Keep floor and space information current
2. **Clear Naming**: Use consistent naming conventions for spaces
3. **Status Management**: Update space status when tenants move in/out
4. **Descriptions**: Add helpful descriptions for unique features
5. **Verification**: Review the building summary before saving

## Related Features

- **Space Assignment**: After editing spaces, assign tenants via "Assign Tenants to Spaces"
- **Rent Management**: Create rent agreements for spaces
- **Payment Tracking**: Record payments for assigned spaces
- **Property Analytics**: View occupancy rates and income potential

## Troubleshooting

### Changes Not Saving?
- Ensure all required fields are filled (property name, type, location)
- For buildings, ensure at least one floor exists
- Check that you have the necessary permissions

### Floor/Space Deleted by Mistake?
- Cancel the form without saving
- Changes are only persisted when you click "Save Changes"

### Image Upload Failing?
- Check file size (keep under 5MB)
- Ensure file is a valid image format (JPG, PNG, etc.)
- You can continue without an image if needed

## Future Enhancements
- Bulk space creation
- Template-based floor creation
- Space cloning across floors
- Advanced space filtering
- Custom amenities management
- Floor plan image upload

---

**Last Updated**: November 4, 2025
**Version**: 1.0

