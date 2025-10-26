const admin = require('firebase-admin');
const serviceAccount = require('../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkUsers() {
  console.log('\n🔍 Checking all users and their organization assignments:\n');
  console.log('='.repeat(80));
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found!');
      return;
    }
    
    console.log(`\n✅ Found ${usersSnapshot.size} users:\n`);
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`👤 User: ${data.displayName || data.email}`);
      console.log(`   📌 ID: ${doc.id}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   🎭 Role: ${data.roleId || 'NOT ASSIGNED'}`);
      console.log(`   🏛️  Organization: ${data.organizationId || 'NOT ASSIGNED'}`);
      console.log(`   ✨ Status: ${data.status || 'unknown'}`);
      console.log(`   🔒 Permissions: ${data.permissions?.length || 0} permissions`);
      console.log('---');
    });
    
    // Check the organization that has the data
    console.log('\n🏛️  Checking organization with data:\n');
    const rentSnapshot = await db.collection('rent').limit(1).get();
    if (!rentSnapshot.empty) {
      const rentData = rentSnapshot.docs[0].data();
      console.log(`Data Organization ID: ${rentData.organizationId}`);
      
      // Check if this organization exists
      const orgDoc = await db.collection('organizations').doc(rentData.organizationId).get();
      if (orgDoc.exists()) {
        console.log(`Organization Name: ${orgDoc.data().name}`);
        console.log(`Organization Status: ${orgDoc.data().status || 'active'}`);
      } else {
        console.log('⚠️  Organization document not found!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkUsers();

