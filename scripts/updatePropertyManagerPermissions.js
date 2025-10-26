/**
 * Update Property Manager Permissions Script
 * 
 * This script updates existing property manager users to include
 * the properties:create:organization permission.
 * 
 * Usage: node scripts/updatePropertyManagerPermissions.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7IltHmisfPRC55eVFZxX8aF_niT7Jf8A",
  authDomain: "fam-rent-sys.firebaseapp.com",
  projectId: "fam-rent-sys",
  storageBucket: "fam-rent-sys.firebasestorage.app",
  messagingSenderId: "143878786305",
  appId: "1:143878786305:web:08d8dc1f49063e3dc45f00",
  measurementId: "G-YN5JX52XS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Updated property manager permissions
const PROPERTY_MANAGER_PERMISSIONS = [
  'properties:read:assigned',
  'properties:write:assigned',
  'properties:create:organization', // Added this permission
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
];

async function updatePropertyManagerPermissions() {
  try {
    console.log('🔄 Updating property manager permissions...');
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let updatedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user is a property manager
      if (userData.roleId === 'property_manager') {
        console.log(`📝 Updating property manager: ${userData.email}`);
        
        // Update user permissions
        await updateDoc(doc(db, 'users', userDoc.id), {
          permissions: PROPERTY_MANAGER_PERMISSIONS,
          updatedAt: new Date(),
        });
        
        updatedCount++;
        console.log(`✅ Updated permissions for ${userData.email}`);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} property manager users`);
    
  } catch (error) {
    console.error('❌ Error updating property manager permissions:', error);
  }
}

// Run the update
updatePropertyManagerPermissions();

