const admin = require('firebase-admin');
const serviceAccount = require('../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function forceSetAuth() {
  try {
    // Get the user's email from command line or default
    const email = process.argv[2] || 'elisasaychitoleko2@gmail.com';
    
    console.log('\n🔧 Setting auth data for:', email);
    console.log('='.repeat(80));
    
    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      console.log('❌ User not found with email:', email);
      console.log('\nAvailable users:');
      const allUsers = await db.collection('users').get();
      allUsers.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.email} (${data.displayName})`);
      });
      process.exit(1);
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('\n✅ User found:');
    console.log(`   Name: ${userData.displayName}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.roleId}`);
    console.log(`   Organization: ${userData.organizationId}`);
    console.log(`   Status: ${userData.status}`);
    
    // If user doesn't have organization, set it
    if (!userData.organizationId) {
      console.log('\n⚠️  User has no organization! Setting to SVRDIbZ3ir7TmWfWWyXh...');
      await db.collection('users').doc(userDoc.id).update({
        organizationId: 'SVRDIbZ3ir7TmWfWWyXh',
        status: 'active',
        roleId: userData.roleId || 'property_manager',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ User updated with organization!');
    }
    
    // Generate JavaScript code to run in browser console
    console.log('\n📋 COPY AND RUN THIS IN YOUR BROWSER CONSOLE:');
    console.log('='.repeat(80));
    console.log(`
localStorage.setItem('userId', '${userDoc.id}');
localStorage.setItem('userRole', '${userData.roleId || 'property_manager'}');
localStorage.setItem('organizationId', '${userData.organizationId || 'SVRDIbZ3ir7TmWfWWyXh'}');
console.log('✅ Auth data set! Reloading page...');
setTimeout(() => window.location.reload(), 1000);
`);
    console.log('='.repeat(80));
    
    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. Open your browser developer tools (F12)');
    console.log('2. Go to the Console tab');
    console.log('3. Copy and paste the code above');
    console.log('4. Press Enter');
    console.log('5. The page will reload with correct auth data');
    console.log('6. The Rent page should now show your data!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

forceSetAuth();



