/**
 * Assign User to Organization Script
 * 
 * This script creates an organization (if needed) and assigns a user to it
 * 
 * Usage: node scripts/assignUserToOrganization.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../docs/fam-rent-sys-firebase-adminsdk-fbsvc-074bdb4833.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fam-rent-sys'
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function assignUserToOrganization() {
  try {
    console.log('🏢 Assign User to Organization\n');
    console.log('='.repeat(60));
    
    // Step 1: List all users
    console.log('\n📋 Fetching users...');
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        roleId: userData.roleId,
        organizationId: userData.organizationId || 'none',
      });
    });
    
    if (users.length === 0) {
      console.log('❌ No users found!');
      process.exit(1);
    }
    
    console.log('\n👥 Available Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.roleId}) - Org: ${user.organizationId}`);
    });
    
    // Step 2: Select user
    const userIndex = await question('\nEnter user number to assign: ');
    const selectedUser = users[parseInt(userIndex) - 1];
    
    if (!selectedUser) {
      console.log('❌ Invalid user selection');
      process.exit(1);
    }
    
    console.log(`\n✅ Selected: ${selectedUser.email}`);
    
    // Step 3: List or create organization
    console.log('\n🏢 Fetching organizations...');
    const orgsSnapshot = await db.collection('organizations').get();
    const organizations = [];
    
    orgsSnapshot.forEach((doc) => {
      const orgData = doc.data();
      organizations.push({
        id: doc.id,
        name: orgData.name,
        type: orgData.type,
      });
    });
    
    if (organizations.length === 0) {
      console.log('⚠️  No organizations found. Creating a new one...\n');
      
      const orgName = await question('Enter organization name: ');
      const orgType = await question('Enter organization type (individual/company/other): ');
      
      const newOrgRef = db.collection('organizations').doc();
      const newOrg = {
        name: orgName,
        type: orgType || 'company',
        contactEmail: selectedUser.email,
        status: 'active',
        settings: {
          currency: 'UGX',
          timezone: 'Africa/Kampala',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await newOrgRef.set(newOrg);
      console.log(`✅ Organization created with ID: ${newOrgRef.id}`);
      
      // Assign user to new organization
      await db.collection('users').doc(selectedUser.id).update({
        organizationId: newOrgRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ User ${selectedUser.email} assigned to ${orgName}`);
      
    } else {
      console.log('\n🏢 Available Organizations:');
      organizations.forEach((org, index) => {
        console.log(`${index + 1}. ${org.name} (${org.type}) - ID: ${org.id}`);
      });
      console.log(`${organizations.length + 1}. Create new organization`);
      
      const orgIndex = await question('\nEnter organization number: ');
      const orgChoice = parseInt(orgIndex);
      
      if (orgChoice === organizations.length + 1) {
        // Create new organization
        const orgName = await question('Enter organization name: ');
        const orgType = await question('Enter organization type (individual/company/other): ');
        
        const newOrgRef = db.collection('organizations').doc();
        const newOrg = {
          name: orgName,
          type: orgType || 'company',
          contactEmail: selectedUser.email,
          status: 'active',
          settings: {
            currency: 'UGX',
            timezone: 'Africa/Kampala',
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        await newOrgRef.set(newOrg);
        console.log(`✅ Organization created with ID: ${newOrgRef.id}`);
        
        // Assign user to new organization
        await db.collection('users').doc(selectedUser.id).update({
          organizationId: newOrgRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ User ${selectedUser.email} assigned to ${orgName}`);
        
      } else {
        // Assign to existing organization
        const selectedOrg = organizations[orgChoice - 1];
        
        if (!selectedOrg) {
          console.log('❌ Invalid organization selection');
          process.exit(1);
        }
        
        await db.collection('users').doc(selectedUser.id).update({
          organizationId: selectedOrg.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ User ${selectedUser.email} assigned to ${selectedOrg.name}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 USER ASSIGNMENT COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser to load the new organization');
    console.log('2. You can now create properties!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
console.log('🔐 User Organization Assignment Script');
console.log('=' .repeat(60));

assignUserToOrganization()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

