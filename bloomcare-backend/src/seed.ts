import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Medicine from './models/Medicine';
import Pharmacy from './models/Pharmacy';
import User from './models/User';

dotenv.config();

// ========================================
// FIX 1: Add type definition for inventory
// ========================================
type InventoryMap = {
  [key: string]: { medicineName: string; price: number; quantity: number }[];
};

// ---- CONFIG ----
const SEED_DATA = {
  // Coordinates near the given point
  pharmacies: [
    {
      name: 'አብርሃም ፋርማሲ (Abraham Pharmacy)',
      address: 'Bole, Addis Ababa, near Friendship',
      latitude: 9.0350,
      longitude: 38.7600,
      phone: '+251-911-123456',
      email: 'abrahampharmacy@example.com',
      website: 'https://abrahampharmacy.com',
      openingHours: {
        monday: '08:00-20:00',
        tuesday: '08:00-20:00',
        wednesday: '08:00-20:00',
        thursday: '08:00-20:00',
        friday: '08:00-20:00',
        saturday: '09:00-18:00',
        sunday: '09:00-14:00',
      },
      image: 'https://via.placeholder.com/200?text=Abraham+Pharmacy',
      isActive: true,
    },
    {
      name: 'ሄልት ፋርማሲ (Health Pharmacy)',
      address: 'Cazanchise, Addis Ababa, near Total',
      latitude: 9.0420,
      longitude: 38.7530,
      phone: '+251-911-654321',
      email: 'healthpharmacy@example.com',
      website: 'https://healthpharmacy.com',
      openingHours: {
        monday: '08:00-22:00',
        tuesday: '08:00-22:00',
        wednesday: '08:00-22:00',
        thursday: '08:00-22:00',
        friday: '08:00-22:00',
        saturday: '09:00-20:00',
        sunday: '10:00-18:00',
      },
      image: 'https://via.placeholder.com/200?text=Health+Pharmacy',
      isActive: true,
    },
    {
      name: 'ጥሩ ህክምና ፋርማሲ (Tiru Hikmna Pharmacy)',
      address: 'Meskel Square, Addis Ababa',
      latitude: 9.0470,
      longitude: 38.7490,
      phone: '+251-911-789012',
      email: 'tiruhikmna@example.com',
      website: 'https://tiruhikmna.com',
      openingHours: {
        monday: '07:00-21:00',
        tuesday: '07:00-21:00',
        wednesday: '07:00-21:00',
        thursday: '07:00-21:00',
        friday: '07:00-21:00',
        saturday: '08:00-19:00',
        sunday: '08:00-17:00',
      },
      image: 'https://via.placeholder.com/200?text=Tiru+Hikmna',
      isActive: true,
    },
  ],
  medicines: [
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Pain Relief', manufacturer: 'Cadila' },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Anti-inflammatory', manufacturer: 'Pfizer' },
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'GSK' },
    { name: 'Lisinopril 10mg', genericName: 'Lisinopril', category: 'Blood Pressure', manufacturer: 'Novartis' },
    { name: 'Metformin 850mg', genericName: 'Metformin', category: 'Diabetes', manufacturer: 'Merck' },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', manufacturer: 'AstraZeneca' },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', manufacturer: 'Bayer' },
    { name: 'Loratadine 10mg', genericName: 'Loratadine', category: 'Antihistamine', manufacturer: 'Schering-Plough' },
    { name: 'Aspirin 75mg', genericName: 'Aspirin', category: 'Blood Thinner', manufacturer: 'Bayer' },
    { name: 'Vitamin C 1000mg', genericName: 'Ascorbic Acid', category: 'Vitamin', manufacturer: 'Nature\'s Bounty' },
  ],
  // ========================================
  // FIX 2: Add type assertion to inventory
  // ========================================
  inventory: {
    'አብርሃም ፋርማሲ (Abraham Pharmacy)': [
      { medicineName: 'Paracetamol 500mg', price: 5.00, quantity: 100 },
      { medicineName: 'Ibuprofen 400mg', price: 8.50, quantity: 80 },
      { medicineName: 'Amoxicillin 500mg', price: 12.00, quantity: 50 },
      { medicineName: 'Omeprazole 20mg', price: 9.00, quantity: 40 },
      { medicineName: 'Loratadine 10mg', price: 6.00, quantity: 60 },
    ],
    'ሄልት ፋርማሲ (Health Pharmacy)': [
      { medicineName: 'Paracetamol 500mg', price: 4.50, quantity: 120 },
      { medicineName: 'Metformin 850mg', price: 10.00, quantity: 70 },
      { medicineName: 'Ciprofloxacin 500mg', price: 15.00, quantity: 45 },
      { medicineName: 'Aspirin 75mg', price: 3.00, quantity: 200 },
      { medicineName: 'Vitamin C 1000mg', price: 7.00, quantity: 90 },
    ],
    'ጥሩ ህክምና ፋርማሲ (Tiru Hikmna Pharmacy)': [
      { medicineName: 'Ibuprofen 400mg', price: 7.50, quantity: 90 },
      { medicineName: 'Amoxicillin 500mg', price: 11.00, quantity: 60 },
      { medicineName: 'Lisinopril 10mg', price: 14.00, quantity: 35 },
      { medicineName: 'Omeprazole 20mg', price: 9.50, quantity: 50 },
      { medicineName: 'Loratadine 10mg', price: 5.50, quantity: 70 },
    ],
  } as InventoryMap,  // ← FIX 3: Type assertion here
};

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ---- Clean existing data (optional) ----
    await Medicine.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('🧹 Cleared existing medicines and pharmacies');

    // ---- Insert Medicines ----
    const medicineDocs = await Medicine.insertMany(SEED_DATA.medicines);
    console.log(`✅ Inserted ${medicineDocs.length} medicines`);

    // Create lookup: name -> ObjectId
    const medicineMap = new Map<string, mongoose.Types.ObjectId>();
    medicineDocs.forEach((doc) => {
      medicineMap.set(doc.name, doc._id as mongoose.Types.ObjectId);
    });

    // ---- Need a default user (pharmacy owner) ----
    let owner = await User.findOne({ role: 'admin' });
    if (!owner) {
      owner = await User.create({
        fullName: 'Seed Admin',
        email: 'seedadmin@bloomcare.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('👤 Created seed admin user for pharmacy ownership');
    }

    // ---- Insert Pharmacies ----
    for (const pharmData of SEED_DATA.pharmacies) {
      // ========================================
      // FIX 4: Type-safe inventory access with keyof
      // ========================================
      const inventoryData = SEED_DATA.inventory[pharmData.name as keyof typeof SEED_DATA.inventory] || [];

      // ========================================
      // FIX 5: Explicitly type the item parameter
      // ========================================
      const medicinesInventory = inventoryData.map((item: { medicineName: string; price: number; quantity: number }) => {
        const medId = medicineMap.get(item.medicineName);
        if (!medId) {
          console.warn(`⚠️ Medicine "${item.medicineName}" not found, skipping for ${pharmData.name}`);
          return null;
        }
        const stockStatus = item.quantity > 10 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock';
        return {
          medicine: medId,
          price: item.price,
          quantity: item.quantity,
          stockStatus,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      const pharmacy = new Pharmacy({
        ...pharmData,
        owner: owner._id,
        medicines: medicinesInventory,
        rating: Math.round((3 + Math.random() * 2) * 10) / 10,
        totalReviews: Math.floor(Math.random() * 50) + 5,
      });
      await pharmacy.save();
      console.log(`✅ Created pharmacy: ${pharmData.name} with ${medicinesInventory.length} medicines`);
    }

    console.log('🎉 Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();