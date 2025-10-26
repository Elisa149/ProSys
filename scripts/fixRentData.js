/**
 * Fix Rent Data Script
 * 
 * This script enriches rent records with missing fields needed for display
 * 
 * Usage: node scripts/fixRentData.js
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

async function fixRentData() {
  try {
    console.log('🔧 Fixing Rent Data...\n');
    console.log('='.repeat(80));
    
    // Get all properties first (to get property names)
    const propertiesSnapshot = await db.collection('properties').get();
    const propertiesMap = {};
    propertiesSnapshot.forEach(doc => {
      propertiesMap[doc.id] = doc.data();
    });
    
    console.log(`📊 Found ${propertiesSnapshot.size} properties\n`);
    
    // Get all rent records
    const rentSnapshot = await db.collection('rent').get();
    console.log(`📋 Found ${rentSnapshot.size} rent records\n`);
    
    let fixedCount = 0;
    
    for (const doc of rentSnapshot.docs) {
      const rentData = doc.data();
      const propertyId = rentData.propertyId;
      const property = propertiesMap[propertyId];
      
      if (!property) {
        console.log(`⚠️  Rent ${doc.id}: Property ${propertyId} not found, skipping...`);
        continue;
      }
      
      // Prepare updated data
      const updates = {
        propertyName: property.name,
        propertyType: property.type,
        // Ensure dates are properly stored
        leaseStart: rentData.leaseStart instanceof admin.firestore.Timestamp 
          ? rentData.leaseStart 
          : admin.firestore.Timestamp.fromDate(new Date(rentData.leaseStart || new Date())),
      };
      
      // Add lease end if it exists and is not "Ongoing"
      if (rentData.leaseEnd && rentData.leaseEnd !== 'Ongoing') {
        updates.leaseEnd = rentData.leaseEnd instanceof admin.firestore.Timestamp
          ? rentData.leaseEnd
          : admin.firestore.Timestamp.fromDate(new Date(rentData.leaseEnd));
      }
      
      // Ensure other fields exist
      if (!rentData.status) {
        updates.status = 'active';
      }
      
      if (!rentData.paymentDueDate) {
        updates.paymentDueDate = 1; // Default to 1st of month
      }
      
      if (!rentData.organizationId && property.organizationId) {
        updates.organizationId = property.organizationId;
      }
      
      // Update the document
      await db.collection('rent').doc(doc.id).update(updates);
      
      console.log(`✅ Fixed rent record for: ${rentData.tenantName}`);
      console.log(`   Property: ${property.name}`);
      console.log(`   Monthly Rent: UGX ${rentData.monthlyRent?.toLocaleString()}`);
      console.log('');
      
      fixedCount++;
    }
    
    // Now fix payment data
    const paymentsSnapshot = await db.collection('payments').get();
    console.log(`\n💳 Found ${paymentsSnapshot.size} payment records\n`);
    
    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data();
      const updates = {};
      
      // Find the rent record this payment belongs to
      if (paymentData.rentId) {
        const rentDoc = await db.collection('rent').doc(paymentData.rentId).get();
        if (rentDoc.exists) {
          const rentData = rentDoc.data();
          updates.tenantName = rentData.tenantName;
          updates.propertyName = rentData.propertyName;
        }
      }
      
      // Ensure payment date is a timestamp
      if (paymentData.paymentDate && !(paymentData.paymentDate instanceof admin.firestore.Timestamp)) {
        updates.paymentDate = admin.firestore.Timestamp.fromDate(new Date(paymentData.paymentDate));
      }
      
      // Add month and year for easier querying
      const paymentDate = paymentData.paymentDate?.toDate?.() || new Date();
      updates.month = paymentDate.getMonth() + 1;
      updates.year = paymentDate.getFullYear();
      
      if (Object.keys(updates).length > 0) {
        await db.collection('payments').doc(doc.id).update(updates);
        console.log(`✅ Fixed payment: UGX ${paymentData.amount?.toLocaleString()}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DONE!');
    console.log('='.repeat(80));
    console.log(`Fixed ${fixedCount} rent records`);
    console.log(`Fixed ${paymentsSnapshot.size} payment records`);
    console.log('\n🎉 Now refresh your Rent page to see the data!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fixRentData();

