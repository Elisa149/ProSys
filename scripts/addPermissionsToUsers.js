/**
 * Script to Add Permissions to All Users Based on Their Roles
 * 
 * This script reads all users from Firestore and adds the appropriate
 * permissions array based on their roleId.
 * 
 * Usage: node scripts/addPermissionsToUsers.js
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

// Permission sets by role
const ROLE_PERMISSIONS = {
  super_admin: [
    // System Administration
    'system:admin',
    'system:config',
    
    // Organizations
    'organizations:read:all',
    'organizations:write:all',
    'organizations:delete:all',
    
    // Users
    'users:read:all',
    'users:write:all',
    'users:delete:all',
    
    // Roles
    'roles:read:all',
    'roles:write:all',
    'roles:delete:all',
    
    // Properties
    'properties:read:organization',
    'properties:write:organization',
    'properties:delete:organization',
    
    // Tenants
    'tenants:read:organization',
    'tenants:write:organization',
    'tenants:delete:organization',
    
    // Payments
    'payments:read:organization',
    'payments:write:organization',
    'payments:create:organization',
    'payments:delete:organization',
    
    // Reports
    'reports:read:organization',
    'reports:write:organization',
  ],
  
  org_admin: [
    // Users (within organization)
    'users:read:organization',
    'users:write:organization',
    'users:delete:organization',
    
    // Properties
    'properties:read:organization',
    'properties:write:organization',
    'properties:delete:organization',
    
    // Tenants
    'tenants:read:organization',
    'tenants:write:organization',
    'tenants:delete:organization',
    
    // Payments
    'payments:read:organization',
    'payments:write:organization',
    'payments:create:organization',
    'payments:delete:organization',
    
    // Reports
    'reports:read:organization',
    'reports:write:organization',
    
    // Organization settings
    'organization:settings:write',
    
    // Property assignments
    'assignments:read:organization',
    'assignments:write:organization',
  ],
  
  property_manager: [
    // Properties (assigned only)
    'properties:read:assigned',
    'properties:write:assigned',
    
    // Tenants (assigned properties)
    'tenants:read:assigned',
    'tenants:write:assigned',
    'tenants:delete:assigned',
    
    // Payments (assigned properties)
    'payments:read:assigned',
    'payments:write:assigned',
    'payments:create:assigned',
    
    // Reports (assigned properties)
    'reports:read:assigned',
    
    // Rent management
    'rent:read:assigned',
    'rent:write:assigned',
    'rent:create:assigned',
  ],
  
  financial_viewer: [
    // Reports (read-only)
    'reports:read:organization',
    
    // Properties (read-only, basic info)
    'properties:read:organization',
    
    // Payments (read-only)
    'payments:read:organization',
    
    // Financial analytics
    'analytics:read:organization',
  ],
};

// Main function
async function addPermissionsToAllUsers() {
  try {
    console.log('🚀 Starting permission update for all users...\n');
    
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty) {
      console.log('❌ No users found in Firestore!');
      return;
    }
    
    console.log(`📋 Found ${snapshot.size} users\n`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`\n👤 Processing: ${userData.email || userId}`);
      console.log(`   Role: ${userData.roleId || 'NO ROLE'}`);
      console.log(`   Status: ${userData.status || 'NO STATUS'}`);
      
      // Skip if no role assigned
      if (!userData.roleId) {
        console.log('   ⚠️  Skipped: No role assigned');
        skippedCount++;
        continue;
      }
      
      // Get permissions for this role
      const permissions = ROLE_PERMISSIONS[userData.roleId];
      
      if (!permissions) {
        console.log(`   ⚠️  Skipped: Unknown role "${userData.roleId}"`);
        skippedCount++;
        continue;
      }
      
      // Check if permissions already exist
      if (userData.permissions && userData.permissions.length > 0) {
        console.log(`   ℹ️  Current permissions: ${userData.permissions.length} items`);
        console.log('   🔄 Updating permissions...');
      } else {
        console.log('   ➕ Adding permissions...');
      }
      
      try {
        // Update user document with permissions
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          permissions: permissions,
          updatedAt: new Date(),
        });
        
        console.log(`   ✅ Success! Added ${permissions.length} permissions`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📋 Total processed: ${snapshot.size} users`);
    console.log('='.repeat(60));
    
    if (successCount > 0) {
      console.log('\n🎉 Permissions update completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Clear browser cache');
      console.log('   2. Refresh your application');
      console.log('   3. Login with any test account');
      console.log('   4. Verify sidebar shows correct items');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🔐 Permission Update Script');
console.log('=' .repeat(60));
console.log('This script will add permissions to all users based on their roles\n');

addPermissionsToAllUsers()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });





