/**
 * Diagnostic Script: Check Firebase Connection & User Profile
 * 
 * Run this in browser console to diagnose the issue
 */

// Copy and paste this into browser console (F12)

console.log('🔍 DIAGNOSTIC: Checking Firebase connection...');

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase not loaded');
} else {
  console.log('✅ Firebase loaded');
}

// Check if user is authenticated
const auth = firebase.auth();
const currentUser = auth.currentUser;

if (!currentUser) {
  console.log('❌ No authenticated user');
} else {
  console.log('✅ User authenticated:', currentUser.email);
  console.log('📋 User UID:', currentUser.uid);
  
  // Try to read user document
  const db = firebase.firestore();
  const userRef = db.collection('users').doc(currentUser.uid);
  
  userRef.get().then((doc) => {
    if (doc.exists) {
      console.log('✅ User document exists');
      console.log('📄 Document data:', doc.data());
    } else {
      console.log('❌ User document does NOT exist');
      console.log('🔧 This is why profile fetch fails!');
    }
  }).catch((error) => {
    console.error('❌ Error reading user document:', error);
    console.log('🔧 This is likely a Firestore security rules issue!');
  });
}

// Check Firestore security rules
console.log('🔍 Checking Firestore rules...');
const testRef = firebase.firestore().collection('users').doc('test');
testRef.get().then(() => {
  console.log('✅ Firestore read access works');
}).catch((error) => {
  console.error('❌ Firestore read access denied:', error);
  console.log('🔧 Security rules are blocking access!');
});

console.log('📋 Diagnostic complete. Check results above.');


