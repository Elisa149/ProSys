/**
 * Create Test User Script
 * 
 * This script creates a test user with pending status
 * to demonstrate the role assignment functionality.
 * 
 * Usage: node scripts/createTestUser.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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

async function createTestUser() {
  try {
    console.log('🚀 Creating test user for role assignment demo...\n');
    
    // Test user credentials
    const testEmail = 'testuser@prosys.com';
    const testPassword = 'Test123!';
    const testDisplayName = 'Test User';
    
    console.log(`📧 Creating test user: ${testEmail}`);
    
    // Create test user
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const testUser = userCredential.user;
    
    console.log(`✅ Test user created with UID: ${testUser.uid}`);
    
    // Create test user profile in Firestore with pending status
    const testProfile = {
      email: testEmail,
      displayName: testDisplayName,
      uid: testUser.uid,
      status: 'pending', // User needs role assignment
      roleId: null, // No role assigned yet
      organizationId: null, // No organization yet
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'users', testUser.uid), testProfile);
    console.log('✅ Test user profile saved to Firestore');
    
    // Sign out
    await auth.signOut();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`👤 Name: ${testDisplayName}`);
    console.log(`📊 Status: pending (needs role assignment)`);
    console.log(`🔒 Role: Not assigned yet`);
    console.log('='.repeat(60));
    
    console.log('\n📝 Next steps:');
    console.log('1. Login as admin (admin@prosys.com)');
    console.log('2. Go to "Role Assignment" page in the sidebar');
    console.log('3. Find the test user in "Pending Users" tab');
    console.log('4. Assign a role to the test user');
    console.log('5. Test user will be able to login after role assignment');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Test user already exists!');
      console.log('📧 Email: testuser@prosys.com');
      console.log('🔑 Password: Test123!');
      console.log('📊 Status: Check in Role Assignment page');
    } else {
      console.error('❌ Failed to create test user:', error.message);
    }
  }
}

// Run the script
console.log('🧪 Test User Creation Script');
console.log('=' .repeat(60));
console.log('This script will create a test user for role assignment demo\n');

createTestUser()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

