/**
 * Fix Payment Organization IDs
 * 
 * This script fixes payments that are missing organizationId by looking up
 * the organizationId from their associated invoice or rent record.
 * 
 * Run with: node scripts/fixPaymentOrganizationIds.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../prosys-dev-firebase-adminsdk-d7z3z-74bfdfa5e7.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixPaymentOrganizationIds() {
  try {
    console.log('🔧 Starting payment organizationId fix...\n');

    // Get all payments
    const paymentsSnapshot = await db.collection('payments').get();
    console.log(`📊 Found ${paymentsSnapshot.size} total payments\n`);

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const paymentDoc of paymentsSnapshot.docs) {
      const payment = paymentDoc.data();
      const paymentId = paymentDoc.id;

      // Skip if already has organizationId
      if (payment.organizationId) {
        skipped++;
        continue;
      }

      console.log(`\n🔍 Processing payment ${paymentId}`);
      console.log(`   Missing organizationId`);

      let organizationId = null;
      let source = null;

      // Try to get organizationId from invoice
      if (payment.invoiceId) {
        try {
          const invoiceDoc = await db.collection('invoices').doc(payment.invoiceId).get();
          if (invoiceDoc.exists) {
            const invoice = invoiceDoc.data();
            if (invoice.organizationId) {
              organizationId = invoice.organizationId;
              source = 'invoice';
            }
          }
        } catch (error) {
          console.log(`   ⚠️ Could not fetch invoice: ${error.message}`);
        }
      }

      // Try to get organizationId from rent record
      if (!organizationId && payment.rentId) {
        try {
          const rentDoc = await db.collection('rent').doc(payment.rentId).get();
          if (rentDoc.exists) {
            const rent = rentDoc.data();
            if (rent.organizationId) {
              organizationId = rent.organizationId;
              source = 'rent';
            }
          }
        } catch (error) {
          console.log(`   ⚠️ Could not fetch rent record: ${error.message}`);
        }
      }

      // Try to get organizationId from property
      if (!organizationId && payment.propertyId) {
        try {
          const propertyDoc = await db.collection('properties').doc(payment.propertyId).get();
          if (propertyDoc.exists) {
            const property = propertyDoc.data();
            if (property.organizationId) {
              organizationId = property.organizationId;
              source = 'property';
            }
          }
        } catch (error) {
          console.log(`   ⚠️ Could not fetch property: ${error.message}`);
        }
      }

      if (organizationId) {
        try {
          // Update the payment with organizationId
          await db.collection('payments').doc(paymentId).update({
            organizationId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`   ✅ Updated with organizationId: ${organizationId} (from ${source})`);
          fixed++;
        } catch (error) {
          console.log(`   ❌ Failed to update: ${error.message}`);
          failed++;
        }
      } else {
        console.log(`   ❌ Could not find organizationId from any source`);
        console.log(`      Payment details:`, {
          invoiceId: payment.invoiceId || 'none',
          rentId: payment.rentId || 'none',
          propertyId: payment.propertyId || 'none',
          amount: payment.amount,
          paymentDate: payment.paymentDate?.toDate?.()?.toISOString() || payment.paymentDate,
        });
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixed:   ${fixed} payments`);
    console.log(`⏭️  Skipped: ${skipped} payments (already had organizationId)`);
    console.log(`❌ Failed:  ${failed} payments (could not find organizationId)`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
fixPaymentOrganizationIds();

