/**
 * Bootstrap Admin User Script
 * 
 * This script creates a super admin user with all permissions
 * to bootstrap the system before Cloud Functions are deployed.
 * 
 * Usage: node scripts/bootstrapAdmin.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

// Super admin permissions
const SUPER_ADMIN_PERMISSIONS = [
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
  'properties:read:all',
  'properties:write:all',
  'properties:delete:all',
  'tenants:read:all',
  'tenants:write:all',
  'tenants:delete:all',
  'payments:read:all',
  'payments:write:all',
  'payments:create:all',
  'payments:delete:all',
  'reports:read:all',
  'reports:write:all',
  'assignments:read:all',
  'assignments:write:all',
  'rent:read:all',
  'rent:write:all',
  'rent:create:all',
  'analytics:read:all',
];

async function bootstrapAdmin() {
  try {
    console.log('🚀 Starting admin bootstrap process...\n');
    
    // Admin credentials
    const adminEmail = 'admin@prosys.com';
    const adminPassword = 'Admin123!';
    const adminDisplayName = 'System Administrator';
    
    console.log(`📧 Creating admin user: ${adminEmail}`);
    
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = userCredential.user;
    
    console.log(`✅ Admin user created with UID: ${adminUser.uid}`);
    
    // Create admin profile in Firestore
    const adminProfile = {
      email: adminEmail,
      displayName: adminDisplayName,
      uid: adminUser.uid,
      status: 'active',
      roleId: 'super_admin',
      organizationId: 'system',
      permissions: SUPER_ADMIN_PERMISSIONS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'users', adminUser.uid), adminProfile);
    console.log('✅ Admin profile saved to Firestore');
    
    // Sign out
    await auth.signOut();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADMIN BOOTSTRAP COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Role: super_admin`);
    console.log(`🔒 Permissions: ${SUPER_ADMIN_PERMISSIONS.length} permissions`);
    console.log('='.repeat(60));
    
    console.log('\n📝 Next steps:');
    console.log('1. Login to your app with the admin credentials above');
    console.log('2. Assign roles to other users through the admin panel');
    console.log('3. Deploy Cloud Functions when Blaze plan is enabled');
    console.log('4. Cloud Functions will then handle role assignment automatically');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Admin user already exists. Checking profile...');
      
      // Try to sign in and check if profile exists
      try {
        const signInResult = await signInWithEmailAndPassword(auth, 'admin@prosys.com', 'Admin123!');
        const adminUser = signInResult.user;
        
        // Check if profile exists in Firestore
        const userDoc = await getDocs(collection(db, 'users'));
        const existingProfile = userDoc.docs.find(doc => doc.id === adminUser.uid);
        
        if (existingProfile) {
          console.log('✅ Admin profile already exists in Firestore');
          console.log('📋 Profile data:', existingProfile.data());
        } else {
          console.log('⚠️  Admin user exists but no Firestore profile found');
          console.log('🔄 Creating Firestore profile...');
          
          const adminProfile = {
            email: 'admin@prosys.com',
            displayName: 'System Administrator',
            uid: adminUser.uid,
            status: 'active',
            roleId: 'super_admin',
            organizationId: 'system',
            permissions: SUPER_ADMIN_PERMISSIONS,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', adminUser.uid), adminProfile);
          console.log('✅ Admin profile created in Firestore');
        }
        
        await auth.signOut();
        
        console.log('\n🎉 Admin user is ready!');
        console.log('📧 Email: admin@prosys.com');
        console.log('🔑 Password: Admin123!');
        
      } catch (signInError) {
        console.error('❌ Error checking existing admin:', signInError.message);
      }
    } else {
      console.error('❌ Bootstrap failed:', error.message);
    }
  }
}

// Run the script
console.log('🔐 Admin Bootstrap Script');
console.log('=' .repeat(60));
console.log('This script will create a super admin user to bootstrap the system\n');

bootstrapAdmin()
  .then(() => {
    console.log('\n✅ Bootstrap script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Bootstrap script failed:', error);
    process.exit(1);
  });
