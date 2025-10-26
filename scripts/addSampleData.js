/**
 * Add Sample Data Script
 * 
 * This script adds sample properties, rent records, and payments to the database
 * so we can verify that data is being displayed correctly.
 * 
 * Usage: node scripts/addSampleData.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7IltHmisfPRC55eVFZxX8aF_niT7Jf8A",
  authDomain: "fam-rent-sys.firebaseapp.com",
  projectId: "fam-rent-sys",
  storageBucket: "fam-rent-sys.firebasestorage.app",
  messagingSenderId: "143878786305",
  appId: "1:143878786305:web:08d8dc1f49063e3dc45f00",
  measurementId: "G-YN5JX52XS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function addSampleData() {
  try {
    console.log('🚀 Starting sample data creation...\n');
    
    // Sign in as admin
    console.log('📧 Signing in as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@prosys.com', 'Admin123!');
    const adminUser = userCredential.user;
    console.log(`✅ Signed in as: ${adminUser.email}\n`);
    
    // Check if sample data already exists
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    if (propertiesSnapshot.size > 0) {
      console.log(`⚠️  Database already has ${propertiesSnapshot.size} properties.`);
      console.log('Do you want to add more sample data? (This will add duplicate data)');
      console.log('Skipping to avoid duplicates. Delete existing data first if needed.\n');
      await auth.signOut();
      return;
    }
    
    console.log('📝 Creating sample properties...\n');
    
    // Sample Property 1: Building
    const property1 = {
      name: 'Sunrise Apartments',
      type: 'building',
      status: 'occupied',
      ownershipType: 'owned',
      plotNumber: 'PLOT-001',
      location: {
        village: 'Nakawa',
        parish: 'Nakawa Parish',
        subCounty: 'Nakawa',
        county: 'Kampala',
        district: 'Kampala',
        landmarks: 'Near Nakawa Market'
      },
      caretakerName: 'John Doe',
      caretakerPhone: '+256700123456',
      establishmentDate: new Date('2020-01-15'),
      description: 'Modern apartment building with 12 units',
      buildingDetails: {
        buildingType: 'residential',
        numberOfFloors: 3,
        totalRentableSpaces: 12,
        floors: [
          {
            floorNumber: 1,
            floorName: 'Ground Floor',
            spaces: [
              {
                spaceName: 'Unit 1A',
                spaceType: 'apartment',
                monthlyRent: 500000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 1B',
                spaceType: 'apartment',
                monthlyRent: 500000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 1C',
                spaceType: 'apartment',
                monthlyRent: 600000,
                status: 'vacant',
                size: '3 bedroom'
              },
              {
                spaceName: 'Unit 1D',
                spaceType: 'apartment',
                monthlyRent: 500000,
                status: 'occupied',
                size: '2 bedroom'
              }
            ]
          },
          {
            floorNumber: 2,
            floorName: 'First Floor',
            spaces: [
              {
                spaceName: 'Unit 2A',
                spaceType: 'apartment',
                monthlyRent: 550000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 2B',
                spaceType: 'apartment',
                monthlyRent: 550000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 2C',
                spaceType: 'apartment',
                monthlyRent: 650000,
                status: 'occupied',
                size: '3 bedroom'
              },
              {
                spaceName: 'Unit 2D',
                spaceType: 'apartment',
                monthlyRent: 550000,
                status: 'vacant',
                size: '2 bedroom'
              }
            ]
          },
          {
            floorNumber: 3,
            floorName: 'Second Floor',
            spaces: [
              {
                spaceName: 'Unit 3A',
                spaceType: 'apartment',
                monthlyRent: 600000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 3B',
                spaceType: 'apartment',
                monthlyRent: 600000,
                status: 'occupied',
                size: '2 bedroom'
              },
              {
                spaceName: 'Unit 3C',
                spaceType: 'apartment',
                monthlyRent: 700000,
                status: 'occupied',
                size: '3 bedroom'
              },
              {
                spaceName: 'Unit 3D',
                spaceType: 'apartment',
                monthlyRent: 600000,
                status: 'maintenance',
                size: '2 bedroom'
              }
            ]
          }
        ]
      },
      userId: adminUser.uid,
      organizationId: 'system',
      assignedManagers: [adminUser.uid],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const property1Ref = await addDoc(collection(db, 'properties'), property1);
    console.log(`✅ Created property: ${property1.name} (ID: ${property1Ref.id})`);
    
    // Sample Property 2: Land
    const property2 = {
      name: 'Green Valley Land',
      type: 'land',
      status: 'occupied',
      ownershipType: 'leased',
      plotNumber: 'PLOT-002',
      location: {
        village: 'Bugolobi',
        parish: 'Bugolobi Parish',
        subCounty: 'Nakawa',
        county: 'Kampala',
        district: 'Kampala',
        landmarks: 'Near Bugolobi Market'
      },
      caretakerName: 'Jane Smith',
      caretakerPhone: '+256700654321',
      establishmentDate: new Date('2019-06-20'),
      description: 'Prime land with multiple squatters',
      landDetails: {
        totalArea: '5 acres',
        landUse: 'residential',
        totalSquatters: 5,
        squatters: [
          {
            squatterName: 'Alice Nambi',
            assignedArea: 'Section A',
            areaSize: '0.5 acres',
            monthlyPayment: 200000,
            status: 'active'
          },
          {
            squatterName: 'Bob Mugisha',
            assignedArea: 'Section B',
            areaSize: '0.8 acres',
            monthlyPayment: 250000,
            status: 'active'
          },
          {
            squatterName: 'Carol Nakato',
            assignedArea: 'Section C',
            areaSize: '0.6 acres',
            monthlyPayment: 220000,
            status: 'active'
          },
          {
            squatterName: 'David Okello',
            assignedArea: 'Section D',
            areaSize: '1.0 acres',
            monthlyPayment: 300000,
            status: 'active'
          },
          {
            squatterName: 'Emma Nabirye',
            assignedArea: 'Section E',
            areaSize: '0.7 acres',
            monthlyPayment: 230000,
            status: 'active'
          }
        ]
      },
      userId: adminUser.uid,
      organizationId: 'system',
      assignedManagers: [adminUser.uid],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const property2Ref = await addDoc(collection(db, 'properties'), property2);
    console.log(`✅ Created property: ${property2.name} (ID: ${property2Ref.id})\n`);
    
    console.log('📝 Creating sample rent records...\n');
    
    // Sample Rent Records for Building
    const rentRecords = [
      {
        propertyId: property1Ref.id,
        propertyName: property1.name,
        spaceId: 'unit-1a',
        spaceName: 'Unit 1A',
        tenantName: 'Michael Ssemakula',
        tenantEmail: 'michael@example.com',
        tenantPhone: '+256700111222',
        amount: 500000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        lastPaymentDate: new Date('2024-10-01'),
        nextPaymentDate: new Date('2024-11-01'),
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        propertyId: property1Ref.id,
        propertyName: property1.name,
        spaceId: 'unit-1b',
        spaceName: 'Unit 1B',
        tenantName: 'Sarah Nakato',
        tenantEmail: 'sarah@example.com',
        tenantPhone: '+256700222333',
        amount: 500000,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2025-01-31'),
        status: 'active',
        lastPaymentDate: new Date('2024-10-01'),
        nextPaymentDate: new Date('2024-11-01'),
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        propertyId: property1Ref.id,
        propertyName: property1.name,
        spaceId: 'unit-2a',
        spaceName: 'Unit 2A',
        tenantName: 'Peter Okello',
        tenantEmail: 'peter@example.com',
        tenantPhone: '+256700333444',
        amount: 550000,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-02-28'),
        status: 'active',
        lastPaymentDate: new Date('2024-09-15'),
        nextPaymentDate: new Date('2024-10-15'),
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    for (const rent of rentRecords) {
      const rentRef = await addDoc(collection(db, 'rent'), rent);
      console.log(`✅ Created rent record for: ${rent.tenantName} (ID: ${rentRef.id})`);
    }
    
    console.log('\n📝 Creating sample payments...\n');
    
    // Sample Payments
    const payments = [
      {
        rentId: 'rent-1',
        propertyId: property1Ref.id,
        propertyName: property1.name,
        tenantName: 'Michael Ssemakula',
        amount: 500000,
        paymentDate: new Date('2024-10-01'),
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-001',
        status: 'completed',
        notes: 'October rent payment',
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-01'),
      },
      {
        rentId: 'rent-2',
        propertyId: property1Ref.id,
        propertyName: property1.name,
        tenantName: 'Sarah Nakato',
        amount: 500000,
        paymentDate: new Date('2024-10-01'),
        paymentMethod: 'cash',
        transactionId: 'TXN-002',
        status: 'completed',
        notes: 'October rent payment',
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-01'),
      },
      {
        rentId: 'rent-3',
        propertyId: property1Ref.id,
        propertyName: property1.name,
        tenantName: 'Peter Okello',
        amount: 550000,
        paymentDate: new Date('2024-09-15'),
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-003',
        status: 'completed',
        notes: 'September rent payment',
        userId: adminUser.uid,
        organizationId: 'system',
        propertyManagerIds: [adminUser.uid],
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15'),
      }
    ];
    
    for (const payment of payments) {
      const paymentRef = await addDoc(collection(db, 'payments'), payment);
      console.log(`✅ Created payment: ${payment.tenantName} - UGX ${payment.amount.toLocaleString()} (ID: ${paymentRef.id})`);
    }
    
    // Sign out
    await auth.signOut();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SAMPLE DATA CREATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`✅ Created 2 properties`);
    console.log(`✅ Created ${rentRecords.length} rent records`);
    console.log(`✅ Created ${payments.length} payments`);
    console.log('='.repeat(60));
    
    console.log('\n📝 Next steps:');
    console.log('1. Login to your app with admin credentials');
    console.log('2. Navigate to Properties, Tenants, Rent, or Payments pages');
    console.log('3. You should now see the sample data displayed');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    console.error('Error details:', error.message);
  }
}

// Run the script
addSampleData();

