/**
 * Check Rent Data Script
 * 
 * This script checks what rent records and payments exist in Firestore
 * 
 * Usage: node scripts/checkRentData.js
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

async function checkRentData() {
  try {
    console.log('💰 Checking Rent Data in Firestore...\n');
    console.log('='.repeat(80));
    
    // Get all properties
    const propertiesSnapshot = await db.collection('properties').get();
    console.log(`\n📊 Properties: ${propertiesSnapshot.size} found\n`);
    
    // Get all rent records
    const rentSnapshot = await db.collection('rent').get();
    console.log(`📋 Rent Records: ${rentSnapshot.size} found\n`);
    
    if (rentSnapshot.size === 0) {
      console.log('❌ NO RENT RECORDS FOUND!');
      console.log('\nThis is why you see empty rent page.');
      console.log('\n📝 To add rent records, you need to:');
      console.log('   1. Go to Rent page → Click "Assign New Tenant"');
      console.log('   2. Select a property');
      console.log('   3. Assign a tenant to a space');
      console.log('\nOR I can create test rent data for you.');
    } else {
      console.log('✅ RENT RECORDS FOUND:\n');
      rentSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Rent ${index + 1}:`);
        console.log(`  📌 ID: ${doc.id}`);
        console.log(`  👤 Tenant: ${data.tenantName}`);
        console.log(`  📞 Phone: ${data.tenantPhone || 'N/A'}`);
        console.log(`  🏠 Property ID: ${data.propertyId}`);
        console.log(`  💰 Monthly Rent: UGX ${data.monthlyRent?.toLocaleString() || 0}`);
        console.log(`  📅 Lease: ${data.leaseStart} to ${data.leaseEnd || 'Ongoing'}`);
        console.log(`  ✨ Status: ${data.status || 'active'}`);
        console.log(`  🏛️  Organization: ${data.organizationId || 'NOT SET'}`);
        console.log('  ' + '-'.repeat(76));
      });
    }
    
    // Get all payments
    const paymentsSnapshot = await db.collection('payments').get();
    console.log(`\n💳 Payments: ${paymentsSnapshot.size} found\n`);
    
    if (paymentsSnapshot.size === 0) {
      console.log('❌ NO PAYMENT RECORDS FOUND!');
      console.log('\nPayments will appear after you record them on the Rent page.');
    } else {
      console.log('✅ PAYMENT RECORDS FOUND:\n');
      paymentsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Payment ${index + 1}:`);
        console.log(`  📌 ID: ${doc.id}`);
        console.log(`  💰 Amount: UGX ${data.amount?.toLocaleString() || 0}`);
        console.log(`  📅 Date: ${data.paymentDate?.toDate?.() || 'N/A'}`);
        console.log(`  💳 Method: ${data.paymentMethod || 'cash'}`);
        console.log(`  🏛️  Organization: ${data.organizationId || 'NOT SET'}`);
        console.log('  ' + '-'.repeat(76));
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`Properties: ${propertiesSnapshot.size}`);
    console.log(`Rent Records: ${rentSnapshot.size}`);
    console.log(`Payments: ${paymentsSnapshot.size}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the script
checkRentData();



