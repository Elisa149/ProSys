/**
 * Check Manager Dashboard Data
 * This script checks what data exists in Firebase for managers
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Firebase config from .env
const envPath = join(__dirname, '..', '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read .env file');
  process.exit(1);
}

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1] : null;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MANAGER DASHBOARD DATA CHECK');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Initialize Firebase
let app;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  console.log('✅ Firebase initialized');
  console.log('');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

// Check data in a specific organization
async function checkOrganizationData() {
  console.log('🔍 Fetching organization data...\n');
  
  try {
    // First, get all users to find organization IDs
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data
      });
    });

    console.log(`📊 Found ${users.length} users in the system\n`);
    
    // Group users by organization
    const organizations = {};
    users.forEach(user => {
      const orgId = user.organizationId || 'no-org';
      if (!organizations[orgId]) {
        organizations[orgId] = [];
      }
      organizations[orgId].push(user);
    });

    console.log(`📊 Found ${Object.keys(organizations).length} organizations\n`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check data for each organization
    for (const [orgId, orgUsers] of Object.entries(organizations)) {
      console.log(`\n🏛️  ORGANIZATION: ${orgId === 'no-org' ? 'No Organization' : orgId}`);
      console.log('─'.repeat(50));
      
      // Show users in this org
      console.log(`👥 Users (${orgUsers.length}):`);
      orgUsers.forEach(user => {
        console.log(`   • ${user.displayName || user.email || 'Unknown'} (${user.roleId || 'no role'})`);
      });
      
      // Check properties
      try {
        let propertiesQuery;
        if (orgId === 'no-org') {
          propertiesQuery = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
        } else {
          propertiesQuery = query(
            collection(db, 'properties'),
            where('organizationId', '==', orgId),
            orderBy('createdAt', 'desc')
          );
        }
        
        const propertiesSnapshot = await getDocs(propertiesQuery);
        console.log(`\n🏠 Properties (${propertiesSnapshot.size}):`);
        
        if (propertiesSnapshot.size > 0) {
          propertiesSnapshot.forEach(doc => {
            const data = doc.data();
            let spaceInfo = '';
            
            if (data.type === 'building' && data.buildingDetails?.floors) {
              const totalSpaces = data.buildingDetails.floors.reduce((total, floor) => {
                return total + (floor.spaces?.length || 0);
              }, 0);
              const totalRent = data.buildingDetails.floors.reduce((total, floor) => {
                return total + (floor.spaces?.reduce((spaceTotal, space) => 
                  spaceTotal + (space.monthlyRent || 0), 0) || 0);
              }, 0);
              spaceInfo = `${totalSpaces} spaces, UGX ${totalRent.toLocaleString()}/month`;
            } else if (data.type === 'land' && data.landDetails?.squatters) {
              const totalSquatters = data.landDetails.squatters.length;
              const totalRent = data.landDetails.squatters.reduce((total, squatter) => 
                total + (squatter.monthlyPayment || 0), 0);
              spaceInfo = `${totalSquatters} squatters, UGX ${totalRent.toLocaleString()}/month`;
            } else {
              spaceInfo = 'No spaces defined';
            }
            
            console.log(`   • ${data.name} - ${spaceInfo}`);
          });
        } else {
          console.log('   (no properties)');
        }
        
        // Check payments for this org
        try {
          let paymentsQuery;
          if (orgId === 'no-org') {
            paymentsQuery = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'));
          } else {
            paymentsQuery = query(
              collection(db, 'payments'),
              where('organizationId', '==', orgId),
              orderBy('paymentDate', 'desc')
            );
          }
          
          const paymentsSnapshot = await getDocs(paymentsQuery);
          console.log(`\n💳 Payments (${paymentsSnapshot.size}):`);
          
          if (paymentsSnapshot.size > 0) {
            let totalAmount = 0;
            paymentsSnapshot.forEach(doc => {
              const data = doc.data();
              totalAmount += data.amount || 0;
              const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'unknown';
              console.log(`   • UGX ${(data.amount || 0).toLocaleString()} - ${data.tenantName || 'Unknown'} - ${date}`);
            });
            console.log(`   Total: UGX ${totalAmount.toLocaleString()}`);
          } else {
            console.log('   (no payments)');
          }
          
          // Check rent records for this org
          try {
            let rentQuery;
            if (orgId === 'no-org') {
              rentQuery = query(collection(db, 'rent'), orderBy('createdAt', 'desc'));
            } else {
              rentQuery = query(
                collection(db, 'rent'),
                where('organizationId', '==', orgId),
                orderBy('createdAt', 'desc')
              );
            }
            
            const rentSnapshot = await getDocs(rentQuery);
            console.log(`\n📋 Rent Records (${rentSnapshot.size}):`);
            
            if (rentSnapshot.size > 0) {
              rentSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`   • ${data.tenantName || 'Unknown'} - ${data.propertyName || 'Unknown'} - UGX ${(data.monthlyRent || 0).toLocaleString()}/month`);
              });
            } else {
              console.log('   (no rent records)');
            }
          } catch (error) {
            console.log(`   ❌ Error checking rent: ${error.message}`);
          }
          
        } catch (error) {
          console.log(`   ❌ Error checking payments: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking properties: ${error.message}`);
      }
      
      console.log('\n');
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 Total Organizations: ${Object.keys(organizations).length}`);
    console.log(`👥 Total Users: ${users.length}`);
    
    // Try to get all properties without filter
    try {
      const allProps = await getDocs(collection(db, 'properties'));
      console.log(`🏠 Total Properties: ${allProps.size}`);
    } catch (error) {
      console.log('🏠 Total Properties: Unable to fetch');
    }
    
    // Try to get all payments without filter
    try {
      const allPayments = await getDocs(collection(db, 'payments'));
      console.log(`💳 Total Payments: ${allPayments.size}`);
    } catch (error) {
      console.log('💳 Total Payments: Unable to fetch');
    }
    
    // Try to get all rent records without filter
    try {
      const allRent = await getDocs(collection(db, 'rent'));
      console.log(`📋 Total Rent Records: ${allRent.size}`);
    } catch (error) {
      console.log('📋 Total Rent Records: Unable to fetch');
    }
    
    console.log('');
    console.log('💡 If you see empty collections, you need to add data.');
    console.log('💡 Managers will only see data from their organization.');
    console.log('');

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error);
  }
}

// Run the check
checkOrganizationData().then(() => {
  console.log('✅ Check complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


