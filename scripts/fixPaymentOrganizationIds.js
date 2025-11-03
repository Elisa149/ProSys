/**
 * Fix Payment Organization IDs
 * 
 * This script fixes payments that are missing organizationId by looking up
 * the organizationId from their associated invoice or rent record.
 * 
 * Run with: node scripts/fixPaymentOrganizationIds.js
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixPaymentOrganizationIds() {
  try {
    console.log('🔧 Starting payment organizationId fix...\n');

    // Get all payments
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));
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
          const invoiceDoc = await getDoc(doc(db, 'invoices', payment.invoiceId));
          if (invoiceDoc.exists()) {
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
          const rentDoc = await getDoc(doc(db, 'rent', payment.rentId));
          if (rentDoc.exists()) {
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
          const propertyDoc = await getDoc(doc(db, 'properties', payment.propertyId));
          if (propertyDoc.exists()) {
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
          await updateDoc(doc(db, 'payments', paymentId), {
            organizationId,
            updatedAt: serverTimestamp(),
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

