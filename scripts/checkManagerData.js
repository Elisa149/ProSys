/**
 * Check Manager Dashboard Data
 * 
 * This script checks what data exists in Firestore for managers
 * Shows properties, payments, rent records, and users by organization
 * 
 * Usage: node scripts/checkManagerData.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json'), 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'fam-rent-sys'
  });
}

const db = admin.firestore();

async function checkManagerData() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  MANAGER DASHBOARD DATA CHECK');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Users: ${usersSnapshot.size} found`);
    
    // Group users by organization
    const usersByOrg = {};
    const allUsers = [];
    
    usersSnapshot.forEach(doc => {
      const user = { id: doc.id, ...doc.data() };
      allUsers.push(user);
      const orgId = user.organizationId || 'no-org';
      if (!usersByOrg[orgId]) {
        usersByOrg[orgId] = [];
      }
      usersByOrg[orgId].push(user);
    });
    
    console.log(`🏛️  Organizations: ${Object.keys(usersByOrg).length}`);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
    
    // For each organization, check the data
    for (const [orgId, users] of Object.entries(usersByOrg)) {
      console.log(`\n🏛️  ORGANIZATION: ${orgId === 'no-org' ? '❌ NO ORGANIZATION' : orgId}`);
      console.log('═'.repeat(80));
      
      // Show users
      console.log(`\n👥 USERS (${users.length}):`);
      users.forEach(user => {
        const role = user.roleId || '❌ no role';
        const status = user.status || 'unknown';
        const perms = user.permissions?.length || 0;
        console.log(`   • ${user.displayName || user.email || 'Unknown'} (${role}, ${status}, ${perms} perms)`);
      });
      
      // Check properties
      let propertiesSnapshot;
      if (orgId === 'no-org') {
        propertiesSnapshot = await db.collection('properties').get();
        console.log(`\n🏠 PROPERTIES (${propertiesSnapshot.size} found):`);
        console.log('   ⚠️  Properties without organization ID - will show to all users');
      } else {
        propertiesSnapshot = await db.collection('properties')
          .where('organizationId', '==', orgId)
          .get();
        console.log(`\n🏠 PROPERTIES (${propertiesSnapshot.size} found):`);
      }
      
      if (propertiesSnapshot.size === 0) {
        console.log('   ❌ No properties found');
      } else {
        let totalSpaces = 0;
        let totalExpectedRent = 0;
        
        propertiesSnapshot.forEach(doc => {
          const data = doc.data();
          let spaceInfo = '';
          
          if (data.type === 'building' && data.buildingDetails?.floors) {
            const spaces = data.buildingDetails.floors.reduce((total, floor) => {
              return total + (floor.spaces?.length || 0);
            }, 0);
            const rent = data.buildingDetails.floors.reduce((total, floor) => {
              return total + (floor.spaces?.reduce((spaceTotal, space) => 
                spaceTotal + (space.monthlyRent || 0), 0) || 0);
            }, 0);
            spaceInfo = `${spaces} spaces, UGX ${rent.toLocaleString()}/month`;
            totalSpaces += spaces;
            totalExpectedRent += rent;
          } else if (data.type === 'land' && data.landDetails?.squatters) {
            const squatters = data.landDetails.squatters.length;
            const rent = data.landDetails.squatters.reduce((total, squatter) => 
              total + (squatter.monthlyPayment || 0), 0);
            spaceInfo = `${squatters} squatters, UGX ${rent.toLocaleString()}/month`;
            totalSpaces += squatters;
            totalExpectedRent += rent;
          } else {
            spaceInfo = '❌ No spaces defined';
          }
          
          console.log(`   • ${data.name} - ${spaceInfo}`);
        });
        
        console.log(`\n   📊 Summary: ${totalSpaces} total spaces, UGX ${totalExpectedRent.toLocaleString()}/month expected`);
      }
      
      // Check payments
      let paymentsSnapshot;
      if (orgId === 'no-org') {
        paymentsSnapshot = await db.collection('payments').get();
        console.log(`\n💳 PAYMENTS (${paymentsSnapshot.size} found):`);
      } else {
        paymentsSnapshot = await db.collection('payments')
          .where('organizationId', '==', orgId)
          .get();
        console.log(`\n💳 PAYMENTS (${paymentsSnapshot.size} found):`);
      }
      
      if (paymentsSnapshot.size === 0) {
        console.log('   ❌ No payments found');
      } else {
        let totalAmount = 0;
        let thisMonthAmount = 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        paymentsSnapshot.forEach(doc => {
          const data = doc.data();
          const amount = data.amount || 0;
          totalAmount += amount;
          
          // Check if this month
          const paymentDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear) {
            thisMonthAmount += amount;
          }
          
          const date = paymentDate.toLocaleDateString();
          console.log(`   • UGX ${amount.toLocaleString()} - ${data.tenantName || 'Unknown'} - ${date}`);
        });
        
        console.log(`\n   💰 Total Collected: UGX ${totalAmount.toLocaleString()}`);
        console.log(`   📅 This Month: UGX ${thisMonthAmount.toLocaleString()}`);
      }
      
      // Check rent records
      let rentSnapshot;
      if (orgId === 'no-org') {
        rentSnapshot = await db.collection('rent').get();
        console.log(`\n📋 RENT RECORDS (${rentSnapshot.size} found):`);
      } else {
        rentSnapshot = await db.collection('rent')
          .where('organizationId', '==', orgId)
          .get();
        console.log(`\n📋 RENT RECORDS (${rentSnapshot.size} found):`);
      }
      
      if (rentSnapshot.size === 0) {
        console.log('   ❌ No rent records found');
      } else {
        rentSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   • ${data.tenantName || 'Unknown'} - ${data.propertyName || 'Unknown'} - UGX ${(data.monthlyRent || 0).toLocaleString()}/month`);
        });
      }
      
      console.log('');
    }
    
    // Overall summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  OVERALL SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const allProperties = await db.collection('properties').get();
    const allPayments = await db.collection('payments').get();
    const allRent = await db.collection('rent').get();
    
    console.log(`👥 Total Users: ${usersSnapshot.size}`);
    console.log(`🏠 Total Properties: ${allProperties.size}`);
    console.log(`💳 Total Payments: ${allPayments.size}`);
    console.log(`📋 Total Rent Records: ${allRent.size}`);
    
    console.log('\n💡 For managers to see data in the dashboard:');
    console.log('   1. Users must have an organizationId');
    console.log('   2. Properties must have matching organizationId');
    console.log('   3. Payments should have matching organizationId');
    console.log('   4. Rent records should have matching organizationId');
    console.log('\n✅ Data is filtered by organization for managers');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the script
checkManagerData();


