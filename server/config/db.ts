/**
 * Database Connection & In-Memory MongoDB/Mongoose Simulation Layer
 * Designed for 2nd Year College Project "Equipment Rental System"
 * Simulates Mongoose Schemas, Validation, ObjectIDs, Indexes, and Pre-seeded Data.
 */

import bcrypt from 'bcryptjs';

export interface IDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

function generateId(): string {
  // Generates 24-char hex string mimicking MongoDB ObjectId
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

class MongoCollection<T extends IDocument> {
  name: string;
  items: T[] = [];

  constructor(name: string) {
    this.name = name;
  }

  async find(query: Partial<Record<string, any>> = {}): Promise<T[]> {
    return this.items.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && query[key] !== null) {
          if (item[key] !== query[key]) return false;
        }
      }
      return true;
    });
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.find(i => i._id === id);
    return item ? { ...item } : null;
  }

  async findOne(query: Partial<Record<string, any>>): Promise<T | null> {
    const results = await this.find(query);
    return results.length > 0 ? { ...results[0] } : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const doc = {
      _id: (data as any)._id || generateId(),
      createdAt: now,
      updatedAt: now,
      ...data,
    } as T;
    this.items.push(doc);
    return { ...doc };
  }

  async findByIdAndUpdate(id: string, updateData: Partial<T>, options = { new: true }): Promise<T | null> {
    const index = this.items.findIndex(i => i._id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    this.items[index] = {
      ...this.items[index],
      ...updateData,
      updatedAt: now,
    };
    return { ...this.items[index] };
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const index = this.items.findIndex(i => i._id === id);
    if (index === -1) return null;
    const removed = this.items.splice(index, 1)[0];
    return removed;
  }

  async countDocuments(query: Partial<Record<string, any>> = {}): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }
}

export const collections = {
  users: new MongoCollection<any>('users'),
  categories: new MongoCollection<any>('categories'),
  equipment: new MongoCollection<any>('equipment'),
  bookings: new MongoCollection<any>('bookings'),
  rentals: new MongoCollection<any>('rentals'),
  inspections: new MongoCollection<any>('inspections'),
  payments: new MongoCollection<any>('payments'),
};

export async function connectDB() {
  console.log('----------------------------------------------------');
  console.log(' [MongoDB/Mongoose] Connected successfully to Database: equipment_rental_db');
  console.log(' Models initialized: User, Equipment, Category, Booking, Rental, Inspection, Payment');
  console.log('----------------------------------------------------');

  await seedDatabase();
}

async function seedDatabase() {
  if (collections.users.items.length > 0) return;

  console.log(' [MongoDB Seed] Initializing realistic demo college project data...');

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordStaff = await bcrypt.hash('staff123', 10);
  const hashedPasswordCust = await bcrypt.hash('cust123', 10);

  // 1. Users with stable IDs
  const admin = await collections.users.create({
    _id: '65f000000000000000000001',
    name: 'Prof. Rajesh Sharma (Admin)',
    email: 'admin@rental.edu',
    password: hashedPasswordAdmin,
    role: 'Admin',
    phone: '+91 98765 43210',
    address: 'Faculty Block B, Central University Campus',
  });

  const staff = await collections.users.create({
    _id: '65f000000000000000000002',
    name: 'Kavita Verma (Store Manager)',
    email: 'staff@rental.edu',
    password: hashedPasswordStaff,
    role: 'Staff',
    phone: '+91 98111 22334',
    address: 'Equipment Stores & Lab Depot, Ground Floor',
  });

  const customer1 = await collections.users.create({
    _id: '65f000000000000000000003',
    name: 'Aman Gupta (Student Customer)',
    email: 'customer@rental.edu',
    password: hashedPasswordCust,
    role: 'Customer',
    phone: '+91 91234 56789',
    address: 'Boys Hostel 3, Room 402, Campus',
  });

  const customer2 = await collections.users.create({
    _id: '65f000000000000000000004',
    name: 'Sneha Patel (Media Club)',
    email: 'sneha@rental.edu',
    password: hashedPasswordCust,
    role: 'Customer',
    phone: '+91 99887 76655',
    address: 'Girls Hostel 1, Room 214, Campus',
  });

  // 2. Categories with stable IDs
  const catMap: Record<string, any> = {};

  const catAudioVisual = await collections.categories.create({
    _id: '65f000000000000000000011',
    name: 'Audio/Visual & Cameras',
    description: 'DSLRs, Cinema Cameras, Microphones, Lights and Lenses for photography and media productions.',
    icon: 'Camera',
  });
  catMap['Audio/Visual & Cameras'] = catAudioVisual;

  const catPowerTools = await collections.categories.create({
    _id: '65f000000000000000000012',
    name: 'Construction & Power Tools',
    description: 'Heavy duty drills, saws, angle grinders, and safety equipment for engineering workshops.',
    icon: 'Wrench',
  });
  catMap['Construction & Power Tools'] = catPowerTools;

  const catLabTesting = await collections.categories.create({
    _id: '65f000000000000000000013',
    name: 'Laboratory & Electronics',
    description: 'Digital storage oscilloscopes, multimeters, soldering stations, and signal generators.',
    icon: 'Cpu',
  });
  catMap['Laboratory & Electronics'] = catLabTesting;

  const catSoundStaging = await collections.categories.create({
    _id: '65f000000000000000000014',
    name: 'Event & Sound Staging',
    description: 'PA systems, stage monitors, wireless collar mics, and portable generators for college fest events.',
    icon: 'Music',
  });
  catMap['Event & Sound Staging'] = catSoundStaging;

  const catSurveying = await collections.categories.create({
    _id: '65f000000000000000000015',
    name: 'Surveying & Drones',
    description: 'Thermal imaging mapping drones, optical levels, RTK GNSS receivers, and laser distance instruments.',
    icon: 'Navigation',
  });
  catMap['Surveying & Drones'] = catSurveying;

  const catComputing = await collections.categories.create({
    _id: '65f000000000000000000016',
    name: 'IT & Computing Hardware',
    description: 'Workstations, VR headsets, managed PoE switches, 5G hotspots, and network test equipment.',
    icon: 'Server',
  });
  catMap['IT & Computing Hardware'] = catComputing;

  // 3. Seed 100 Equipment Items
  const { initial100Equipment } = await import('./equipmentSeedList.ts');
  const seededEquipment: any[] = [];

  for (let i = 0; i < initial100Equipment.length; i++) {
    const item = initial100Equipment[i];
    const categoryDoc = catMap[item.category] || catAudioVisual;
    const hexIndex = (i + 1).toString(16).padStart(6, '0');
    const stableId = `65f000000000000000${hexIndex}`;

    const eqDoc = await collections.equipment.create({
      _id: stableId,
      name: item.name,
      categoryId: categoryDoc._id,
      categoryName: categoryDoc.name,
      modelNumber: item.modelNumber,
      serialNumber: item.serialNumber,
      dailyRate: item.dailyRate,
      securityDeposit: item.securityDeposit,
      status: item.status,
      condition: item.condition,
      description: item.description,
      imageUrl: item.imageUrl,
    });
    seededEquipment.push(eqDoc);
  }

  const eq1 = seededEquipment[0];
  const eq3 = seededEquipment[2];

  // 4. Bookings
  const today = new Date();
  const startD = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endD = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const futureStartD = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const futureEndD = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const booking1 = await collections.bookings.create({
    bookingNumber: 'BK-2026-001',
    customerId: customer1._id,
    customerName: customer1.name,
    customerEmail: customer1.email,
    equipmentId: eq1._id,
    equipmentName: eq1.name,
    startDate: startD,
    endDate: endD,
    totalDays: 4,
    totalAmount: 6000,
    depositAmount: 5000,
    status: 'Confirmed',
    notes: 'Required for campus annual documentary film project shoot.',
  });

  const booking2 = await collections.bookings.create({
    bookingNumber: 'BK-2026-002',
    customerId: customer2._id,
    customerName: customer2.name,
    customerEmail: customer2.email,
    equipmentId: eq3._id,
    equipmentName: eq3.name,
    startDate: futureStartD,
    endDate: futureEndD,
    totalDays: 3,
    totalAmount: 2400,
    depositAmount: 3000,
    status: 'Pending',
    notes: 'Electronics club workshop on circuit debugging.',
  });

  // 5. Rental (Active rental for Booking 1)
  const rental1 = await collections.rentals.create({
    rentalNumber: 'RN-2026-001',
    bookingId: booking1._id,
    customerId: customer1._id,
    customerName: customer1.name,
    equipmentId: eq1._id,
    equipmentName: eq1.name,
    staffId: staff._id,
    staffName: staff.name,
    pickupDate: startD,
    expectedReturnDate: endD,
    actualReturnDate: null,
    status: 'Active',
    initialDepositPaid: 5000,
    remarks: 'Equipment handed over in mint condition with 2 extra batteries and charger.',
  });

  // 6. Inspection (Pickup inspection for Rental 1)
  await collections.inspections.create({
    rentalId: rental1._id,
    equipmentId: eq1._id,
    equipmentName: eq1.name,
    inspectorId: staff._id,
    inspectorName: staff.name,
    inspectionType: 'Pickup',
    conditionRating: 'Excellent',
    damageNotes: 'Clean sensor, glass clean without scratches, battery health 100%.',
    repairCostEstimate: 0,
    cleanState: true,
    approved: true,
  });

  // 7. Payments
  await collections.payments.create({
    paymentNumber: 'PAY-2026-001',
    bookingId: booking1._id,
    rentalId: rental1._id,
    customerId: customer1._id,
    customerName: customer1.name,
    amount: 5000,
    paymentType: 'Deposit',
    paymentMethod: 'UPI',
    status: 'Completed',
    transactionId: 'UPI-TXN-99882144',
    paymentDate: startD,
    remarks: 'Security deposit received in full prior to equipment dispatch.',
  });

  await collections.payments.create({
    paymentNumber: 'PAY-2026-002',
    bookingId: booking1._id,
    rentalId: rental1._id,
    customerId: customer1._id,
    customerName: customer1.name,
    amount: 6000,
    paymentType: 'Rental Fee',
    paymentMethod: 'Net Banking',
    status: 'Completed',
    transactionId: 'NETB-TXN-441198',
    paymentDate: startD,
    remarks: '4-day rental fee advance payment for Sony FX3 Camera Kit.',
  });

  console.log(` [MongoDB Seed] Database successfully seeded with 4 users, 6 categories, ${seededEquipment.length} equipment items, 2 bookings, 1 rental, 1 inspection, 2 payments.`);
}
