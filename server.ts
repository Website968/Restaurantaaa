import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
const app = express();
const PORT = 3000;

app.use(express.json());

// Fallback Firebase Applet Config
const defaultConfig = {
  projectId: "dumplingdream-50fc7",
  appId: "1:1094911690931:web:3c56b3559405bf99d888c6",
  apiKey: "AIzaSyCxg8RYU3BHSUGCtnrvyOztATjAk7BzmAw",
  authDomain: "dumplingdream-50fc7.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-restaurantorderi-dcf7fd1c-9b61-446f-8afe-93b543f9ea64",
  storageBucket: "dumplingdream-50fc7.firebasestorage.app",
  messagingSenderId: "1094911690931"
};

// Safely load Firebase Applet Config
let firebaseConfig: any = defaultConfig;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const fileData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    firebaseConfig = { ...defaultConfig, ...fileData };
  }
} catch (e) {
  console.warn('Notice: Could not read firebase-applet-config.json:', e);
}

// Initialize Firebase App & Firestore Database safely
let firebaseApp: any = null;
let db: any = null;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    try {
      db = (dbId && dbId !== '(default)') ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
    } catch (e) {
      db = getFirestore(firebaseApp);
    }
  }
} catch (e) {
  console.warn('Notice: Firebase initialization notice:', e);
}

// Types
interface DBUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'delivery';
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  passwordHash: string;
  phone?: string;
  address?: string;
  landmark?: string;
  vehicleType?: string;
  licenseNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

interface DBCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DBMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  discountPercent: number;
  createdAt: string;
  updatedAt?: string;
}

interface DBOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface DBOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  notes?: string;
  items: DBOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  total: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed';
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  createdAt: string;
  updatedAt: string;
}

interface DBRestaurantSettings {
  restaurantName: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  email: string;
  deliveryCharge: number;
  minOrder: number;
  openingHours: string;
  closingHours: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  aboutSection: string;
  contactEmail: string;
  contactPhone: string;
}

interface DBNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
  orderId?: string;
  userId?: string;
}

// In-Memory Fallback Store (Ensures resilience if Cloud Firestore API is not enabled in Firebase Console)
let fallbackUsers: DBUser[] = [
  {
    id: 'u1',
    email: 'admin@dumplingdream.com',
    name: 'Alex Admin',
    role: 'admin',
    approvalStatus: 'approved',
    passwordHash: 'admin123',
    phone: '+91 9876543210',
    address: 'Station Road, Sribhumi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u1_alt',
    email: 'admin@restaurant.com',
    name: 'Alex Admin',
    role: 'admin',
    approvalStatus: 'approved',
    passwordHash: 'admin123',
    phone: '+91 9876543210',
    address: 'Station Road, Sribhumi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u1_gmail',
    email: 'admin@gmail.com',
    name: 'Alex Admin',
    role: 'admin',
    approvalStatus: 'approved',
    passwordHash: 'admin123',
    phone: '+91 9876543210',
    address: 'Station Road, Sribhumi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u2',
    email: 'delivery@dumplingdream.com',
    name: 'Rider Roy',
    role: 'delivery',
    approvalStatus: 'approved',
    passwordHash: 'delivery123',
    phone: '+91 9876543211',
    address: 'Delivery Hub, Sribhumi',
    vehicleType: 'Bike',
    licenseNumber: 'AS-11-2024-9981',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u2_pending',
    email: 'newrider@dumplingdream.com',
    name: 'Sam Express',
    role: 'delivery',
    approvalStatus: 'pending',
    passwordHash: 'delivery123',
    phone: '+91 9876543000',
    address: 'Central Market, Sribhumi',
    vehicleType: 'Scooter',
    licenseNumber: 'AS-11-2026-4432',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u3',
    email: 'customer@restaurant.com',
    name: 'Chris Customer',
    role: 'customer',
    approvalStatus: 'approved',
    passwordHash: 'customer123',
    phone: '+91 9876543212',
    address: '742 Main Terrace, Sribhumi',
    landmark: 'Near Railway Station',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u4',
    email: 'pronotoshbhattacharjee@gmail.com',
    name: 'Pronotosh Bhattacharjee',
    role: 'customer',
    approvalStatus: 'approved',
    passwordHash: 'customer123',
    phone: '+91 9876543210',
    address: 'Sribhumi',
    createdAt: new Date().toISOString()
  }
];

let fallbackCategories: DBCategory[] = [
  { id: 'c1', name: 'Steamed Momos', icon: 'soup', description: 'Freshly steamed delicate dumplings filled with seasoned ingredients', active: true },
  { id: 'c2', name: 'Fried & Kurkure Momos', icon: 'sandwich', description: 'Crispy golden fried momos with crunchy outer crust', active: true },
  { id: 'c3', name: 'C Gravy & Chili Momos', icon: 'pizza', description: 'Tossed in rich spicy Indo-Chinese chili & garlic gravies', active: true },
  { id: 'c4', name: 'Sides & Noodles', icon: 'salad', description: 'Hakka noodles, fried rice, and savory side dishes', active: true },
  { id: 'c5', name: 'Refreshing Beverages', icon: 'glass-water', description: 'Chilled craft sodas, ice teas, and mocktails', active: true }
];

let fallbackMenuItems: DBMenuItem[] = [
  {
    id: 'm1',
    name: 'Classic Chicken Steamed Momo (10 pcs)',
    description: 'Hand-crafted dumplings stuffed with juicy minced chicken, spring onions, and Himalayan herbs. Served with spicy tomato chutney.',
    price: 120,
    categoryId: 'c1',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    discountPercent: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    name: 'Paneer & Veg Steamed Momo (10 pcs)',
    description: 'Delicate steamed wrappers packed with grated cottage cheese, cabbage, carrots, and subtle aromatic spices.',
    price: 110,
    categoryId: 'c1',
    image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    discountPercent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm3',
    name: 'Crunchy Chicken Kurkure Momo',
    description: 'Coated in a crispy spiced cornflake shell and deep fried until golden. Served with chili mayonnaise.',
    price: 150,
    categoryId: 'c2',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    discountPercent: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm4',
    name: 'Schezwan Chili Chicken Momo',
    description: 'Deep-fried chicken momos wok-tossed in garlic Schezwan gravy, peppers, and scallions.',
    price: 160,
    categoryId: 'c3',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    discountPercent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm5',
    name: 'Special Veg Hakka Noodles',
    description: 'Wok-tossed noodles with julienned vegetables, white pepper, and light soy sauce.',
    price: 130,
    categoryId: 'c4',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    discountPercent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'm6',
    name: 'Chilled Lemon Mint Cooler',
    description: 'Zesty lemon juice muddled with crushed garden mint and sparkling soda.',
    price: 60,
    categoryId: 'c5',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    discountPercent: 0,
    createdAt: new Date().toISOString()
  }
];

let fallbackOrders: DBOrder[] = [];
let fallbackNotifications: DBNotification[] = [];

// Helper functions for Firestore collections with graceful fallback
async function getUsersFromFirestore(): Promise<DBUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const firestoreUsers = snap.docs.map(d => ({ id: d.id, ...d.data() } as DBUser));
    const combinedMap = new Map<string, DBUser>();
    for (const u of fallbackUsers) {
      if (u.email) combinedMap.set(u.email.toLowerCase(), u);
    }
    for (const u of firestoreUsers) {
      if (u.email) combinedMap.set(u.email.toLowerCase(), u);
    }
    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn('Firestore users read notice (using fallback):', err instanceof Error ? err.message : err);
    return fallbackUsers;
  }
}

async function getCategoriesFromFirestore(): Promise<DBCategory[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DBCategory));
    }
    return fallbackCategories;
  } catch (err) {
    console.warn('Firestore categories read notice (using fallback):', err instanceof Error ? err.message : err);
    return fallbackCategories;
  }
}

async function getMenuItemsFromFirestore(): Promise<DBMenuItem[]> {
  try {
    const snap = await getDocs(collection(db, 'menuItems'));
    if (snap.docs.length > 0) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DBMenuItem));
    }
    return fallbackMenuItems;
  } catch (err) {
    console.warn('Firestore menu read notice (using fallback):', err instanceof Error ? err.message : err);
    return fallbackMenuItems;
  }
}

async function getOrdersFromFirestore(): Promise<DBOrder[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DBOrder));
  } catch (err) {
    console.warn('Firestore orders read notice (using fallback):', err instanceof Error ? err.message : err);
    return fallbackOrders;
  }
}

async function getSettingsFromFirestore(): Promise<DBRestaurantSettings> {
  const defaultSettings: DBRestaurantSettings = {
    restaurantName: 'Dumpling Dream',
    logo: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=150&h=150&q=80',
    banner: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80',
    address: 'Station Road, Sribhumi, Assam, 788710',
    phone: '+91 9876543210',
    email: 'dumplingdream@gmail.com',
    deliveryCharge: 30.00,
    minOrder: 150.00,
    openingHours: '10:00 AM',
    closingHours: '10:00 PM',
    facebookUrl: 'https://facebook.com/dumplingdream',
    twitterUrl: 'https://twitter.com/dumplingdream',
    instagramUrl: 'https://instagram.com/dumplingdream',
    aboutSection: 'Welcome to Dumpling Dream! We serve fresh, authentic, and mouth-watering momos & dumplings made with hand-rolled dough and rich aromatic fillings.',
    contactEmail: 'support@dumplingdream.com',
    contactPhone: '+91 9876543210',
  };

  try {
    const docSnap = await getDoc(doc(db, 'restaurantSettings', 'default'));
    if (docSnap.exists()) {
      return { ...defaultSettings, ...docSnap.data() } as DBRestaurantSettings;
    } else {
      await setDoc(doc(db, 'restaurantSettings', 'default'), defaultSettings);
      return defaultSettings;
    }
  } catch (err) {
    console.warn('Firestore settings notice (using fallback):', err instanceof Error ? err.message : err);
    return defaultSettings;
  }
}

async function getNotificationsFromFirestore(): Promise<DBNotification[]> {
  try {
    const snap = await getDocs(collection(db, 'notifications'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DBNotification));
  } catch (err) {
    console.warn('Firestore notifications notice (using fallback):', err instanceof Error ? err.message : err);
    return fallbackNotifications;
  }
}

// Initial seed function for Firestore
async function seedFirestoreIfEmpty() {
  try {
    console.log('Checking Firestore initial state...');
    
    // 1. Settings
    try {
      await getSettingsFromFirestore();
    } catch (e) {}

    // 2. Categories
    const existingCats = await getCategoriesFromFirestore();
    if (existingCats.length === 0) {
      console.log('Seeding initial categories...');
      const initialCats: DBCategory[] = [
        { id: 'c1', name: 'Steamed Momos', icon: 'soup', description: 'Freshly steamed delicate dumplings filled with seasoned ingredients', active: true },
        { id: 'c2', name: 'Fried & Kurkure Momos', icon: 'sandwich', description: 'Crispy golden fried momos with crunchy outer crust', active: true },
        { id: 'c3', name: 'C Gravy & Chili Momos', icon: 'pizza', description: 'Tossed in rich spicy Indo-Chinese chili & garlic gravies', active: true },
        { id: 'c4', name: 'Sides & Noodles', icon: 'salad', description: 'Hakka noodles, fried rice, and savory side dishes', active: true },
        { id: 'c5', name: 'Refreshing Beverages', icon: 'glass-water', description: 'Chilled craft sodas, ice teas, and mocktails', active: true }
      ];
      fallbackCategories = [...initialCats];
      for (const cat of initialCats) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch (e) {}
      }
    }

    // 3. Menu Items
    const existingMenu = await getMenuItemsFromFirestore();
    if (existingMenu.length === 0) {
      console.log('Seeding initial menu items...');
      const initialMenu: DBMenuItem[] = [
        {
          id: 'm1',
          name: 'Classic Chicken Steamed Momo (10 pcs)',
          description: 'Hand-crafted dumplings stuffed with juicy minced chicken, spring onions, and Himalayan herbs. Served with spicy tomato chutney.',
          price: 120,
          categoryId: 'c1',
          image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: true,
          discountPercent: 10,
          createdAt: new Date().toISOString()
        },
        {
          id: 'm2',
          name: 'Paneer & Veg Steamed Momo (10 pcs)',
          description: 'Delicate steamed wrappers packed with grated cottage cheese, cabbage, carrots, and subtle aromatic spices.',
          price: 110,
          categoryId: 'c1',
          image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: true,
          discountPercent: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'm3',
          name: 'Crunchy Chicken Kurkure Momo',
          description: 'Coated in a crispy spiced cornflake shell and deep fried until golden. Served with chili mayonnaise.',
          price: 150,
          categoryId: 'c2',
          image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: true,
          discountPercent: 5,
          createdAt: new Date().toISOString()
        },
        {
          id: 'm4',
          name: 'Schezwan Chili Chicken Momo',
          description: 'Deep-fried chicken momos wok-tossed in garlic Schezwan gravy, peppers, and scallions.',
          price: 160,
          categoryId: 'c3',
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: false,
          discountPercent: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'm5',
          name: 'Special Veg Hakka Noodles',
          description: 'Wok-tossed noodles with julienned vegetables, white pepper, and light soy sauce.',
          price: 130,
          categoryId: 'c4',
          image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: false,
          discountPercent: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'm6',
          name: 'Chilled Lemon Mint Cooler',
          description: 'Zesty lemon juice muddled with crushed garden mint and sparkling soda.',
          price: 60,
          categoryId: 'c5',
          image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          isFeatured: false,
          discountPercent: 0,
          createdAt: new Date().toISOString()
        }
      ];
      fallbackMenuItems = [...initialMenu];
      for (const item of initialMenu) {
        try {
          await setDoc(doc(db, 'menuItems', item.id), item);
        } catch (e) {}
      }
    }

    // 4. Default Users
    const existingUsers = await getUsersFromFirestore();
    if (existingUsers.length === 0) {
      console.log('Seeding initial users...');
      const initialUsers: DBUser[] = [
        {
          id: 'u1',
          email: 'admin@dumplingdream.com',
          name: 'Alex Admin',
          role: 'admin',
          passwordHash: 'admin123',
          phone: '+91 9876543210',
          address: 'Station Road, Sribhumi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u1_alt',
          email: 'admin@restaurant.com',
          name: 'Alex Admin',
          role: 'admin',
          passwordHash: 'admin123',
          phone: '+91 9876543210',
          address: 'Station Road, Sribhumi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u1_gmail',
          email: 'admin@gmail.com',
          name: 'Alex Admin',
          role: 'admin',
          passwordHash: 'admin123',
          phone: '+91 9876543210',
          address: 'Station Road, Sribhumi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u2',
          email: 'delivery@dumplingdream.com',
          name: 'Rider Roy',
          role: 'delivery',
          passwordHash: 'delivery123',
          phone: '+91 9876543211',
          address: 'Delivery Hub, Sribhumi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u2_alt',
          email: 'delivery@restaurant.com',
          name: 'Rider Roy',
          role: 'delivery',
          passwordHash: 'delivery123',
          phone: '+91 9876543211',
          address: 'Delivery Hub, Sribhumi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u3',
          email: 'customer@restaurant.com',
          name: 'Chris Customer',
          role: 'customer',
          passwordHash: 'customer123',
          phone: '+91 9876543212',
          address: '742 Main Terrace, Sribhumi',
          landmark: 'Near Railway Station',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u4',
          email: 'pronotoshbhattacharjee@gmail.com',
          name: 'Pronotosh Bhattacharjee',
          role: 'customer',
          passwordHash: 'customer123',
          phone: '+91 9876543210',
          address: 'Sribhumi',
          createdAt: new Date().toISOString()
        }
      ];
      fallbackUsers = [...initialUsers];
      for (const u of initialUsers) {
        try {
          await setDoc(doc(db, 'users', u.id), u);
        } catch (e) {}
      }
    }

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
}

// Run initial seed on start
seedFirestoreIfEmpty();

// REST API ENDPOINTS CONNECTED TO FIRESTORE

// 1. Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, firebaseUid } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const users = await getUsersFromFirestore();
    let user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    // Fallback lookup in fallbackUsers if not yet present in Firestore
    if (!user) {
      user = fallbackUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    }

    // If authenticated via Firebase Auth directly (firebaseUid exists) and not in user list yet:
    if (!user && firebaseUid) {
      const isSystemAdmin = cleanEmail.includes('admin') || cleanEmail === 'nathsujan991@gmail.com' || cleanEmail === 'pronotoshbhattacharjee@gmail.com';
      user = {
        id: firebaseUid,
        email: cleanEmail,
        name: isSystemAdmin ? 'Admin User' : cleanEmail.split('@')[0],
        role: isSystemAdmin ? 'admin' : 'customer',
        passwordHash: cleanPassword,
        phone: '+91 9876543210',
        address: 'Sribhumi',
        createdAt: new Date().toISOString()
      };
      
      // Persist user in Firestore and fallback
      try {
        await setDoc(doc(db, 'users', firebaseUid), user);
      } catch (e) {}
      fallbackUsers.push(user);
    }

    // Special auto-grant for admin emails (e.g. admin2026@gmail.com, admin@dumplingdream.com, etc)
    const isAdminPattern = cleanEmail.includes('admin') || cleanEmail.startsWith('admin');
    if (!user && (isAdminPattern || cleanPassword === 'admin123') && cleanPassword.length >= 4) {
      user = {
        id: `u_admin_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        name: isAdminPattern ? 'Admin User' : 'User',
        role: isAdminPattern ? 'admin' : 'customer',
        approvalStatus: 'approved',
        passwordHash: cleanPassword,
        phone: '+91 9876543210',
        address: 'Station Road, Sribhumi',
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', user.id), user);
      } catch (e) {}
      fallbackUsers.push(user);
    }

    // Validation: Require correct password if not authenticated via Firebase Auth directly
    if (!user || (!firebaseUid && user.passwordHash !== cleanPassword)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = `firebase-token-${user.id}-${Date.now()}`;
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        approvalStatus: user.approvalStatus || 'approved',
        phone: user.phone,
        address: user.address,
        landmark: user.landmark,
        vehicleType: user.vehicleType,
        licenseNumber: user.licenseNumber,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, landmark } = req.body;
    const users = await getUsersFromFirestore();

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const userId = `u${Date.now()}`;
    const newUser: DBUser = {
      id: userId,
      email,
      name,
      role: 'customer',
      approvalStatus: 'approved',
      passwordHash: password,
      phone,
      address,
      landmark,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {
      console.warn('Firestore user write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackUsers.push(newUser);

    const token = `firebase-token-${newUser.id}-${Date.now()}`;
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        approvalStatus: newUser.approvalStatus,
        phone: newUser.phone,
        address: newUser.address,
        landmark: newUser.landmark,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Register Delivery Partner Endpoint
app.post('/api/auth/register-delivery', async (req, res) => {
  try {
    const { name, email, password, phone, address, vehicleType, licenseNumber } = req.body;
    const users = await getUsersFromFirestore();

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const userId = `u_del_${Date.now()}`;
    const newUser: DBUser = {
      id: userId,
      email,
      name,
      role: 'delivery',
      approvalStatus: 'pending',
      passwordHash: password,
      phone,
      address,
      vehicleType: vehicleType || 'Bike',
      licenseNumber: licenseNumber || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {
      console.warn('Firestore user write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackUsers.push(newUser);

    res.status(201).json({
      message: 'Delivery partner registration submitted successfully! Your account is pending admin approval.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        approvalStatus: newUser.approvalStatus,
        phone: newUser.phone,
        address: newUser.address,
        vehicleType: newUser.vehicleType,
        licenseNumber: newUser.licenseNumber,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Delivery partner registration failed.' });
  }
});

// Admin endpoint to approve or reject delivery partner
app.post('/api/admin/delivery-partners/approve', async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!userId || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid parameters.' });
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {}

    const targetUser = fallbackUsers.find(u => u.id === userId);
    if (targetUser) {
      targetUser.approvalStatus = status;
    }

    res.json({ message: `Delivery partner status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update approval status.' });
  }
});

// Admin endpoint to create new admin accounts
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const users = await getUsersFromFirestore();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const userId = `u_admin_${Date.now()}`;
    const newAdmin: DBUser = {
      id: userId,
      email,
      name,
      role: 'admin',
      approvalStatus: 'approved',
      passwordHash: password,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', userId), newAdmin);
    } catch (e) {}
    fallbackUsers.push(newAdmin);

    res.status(201).json({
      message: 'New admin account created successfully.',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        approvalStatus: newAdmin.approvalStatus,
        phone: newAdmin.phone,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin account.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const users = await getUsersFromFirestore();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: 'No user found with this email.' });
    }

    await updateDoc(doc(db, 'users', user.id), {
      passwordHash: newPassword || 'customer123',
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// User Management (Admin)
app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsersFromFirestore();
    const sanitized = users.map(({ passwordHash, ...u }) => u);
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Categories CRUD
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await getCategoriesFromFirestore();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const id = `c${Date.now()}`;
    const newCategory: DBCategory = {
      id,
      name,
      icon: icon || 'soup',
      description: description || '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'categories', id), newCategory);
    } catch (e) {
      console.warn('Firestore category write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackCategories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, active } = req.body;
    const updateData: Partial<DBCategory> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    try {
      await updateDoc(doc(db, 'categories', id), updateData);
    } catch (e) {
      console.warn('Firestore category update fallback notice:', e instanceof Error ? e.message : e);
    }

    const idx = fallbackCategories.findIndex(c => c.id === id);
    if (idx !== -1) {
      fallbackCategories[idx] = { ...fallbackCategories[idx], ...updateData };
      res.json(fallbackCategories[idx]);
    } else {
      res.json({ id, ...updateData });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.warn('Firestore category delete fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackCategories = fallbackCategories.filter(c => c.id !== id);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// Menu Items CRUD
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await getMenuItemsFromFirestore();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items.' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, categoryId, image, isAvailable, isFeatured, discountPercent } = req.body;
    const id = `m${Date.now()}`;
    const newItem: DBMenuItem = {
      id,
      name,
      description: description || '',
      price: Number(price) || 0,
      categoryId,
      image: image || 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      discountPercent: Number(discountPercent) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'menuItems', id), newItem);
    } catch (e) {
      console.warn('Firestore menu write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackMenuItems.push(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add menu item.' });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, image, isAvailable, isFeatured, discountPercent } = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (image !== undefined) updateData.image = image;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (discountPercent !== undefined) updateData.discountPercent = Number(discountPercent);

    try {
      await updateDoc(doc(db, 'menuItems', id), updateData);
    } catch (e) {
      console.warn('Firestore menu update fallback notice:', e instanceof Error ? e.message : e);
    }

    const idx = fallbackMenuItems.findIndex(m => m.id === id);
    if (idx !== -1) {
      fallbackMenuItems[idx] = { ...fallbackMenuItems[idx], ...updateData };
      res.json(fallbackMenuItems[idx]);
    } else {
      res.json({ id, ...updateData });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (e) {
      console.warn('Firestore menu delete fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackMenuItems = fallbackMenuItems.filter(m => m.id !== id);
    res.json({ message: 'Menu item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

// Restaurant Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettingsFromFirestore();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant settings.' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    try {
      await setDoc(doc(db, 'restaurantSettings', 'default'), req.body, { merge: true });
    } catch (e) {
      console.warn('Firestore settings update fallback notice:', e instanceof Error ? e.message : e);
    }
    const updated = await getSettingsFromFirestore();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update restaurant settings.' });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const { userId, role } = req.query;
    let orders = await getOrdersFromFirestore();

    if (role === 'customer' && userId) {
      orders = orders.filter(o => o.customerId === userId);
    } else if (role === 'delivery' && userId) {
      orders = orders.filter(o => o.deliveryBoyId === userId);
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, deliveryAddress, landmark, notes, items, subtotal, deliveryCharge, tax, total, paymentMethod } = req.body;

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: DBOrder = {
      id: orderId,
      customerId,
      customerName,
      customerPhone,
      deliveryAddress,
      landmark: landmark || '',
      notes: notes || '',
      items,
      subtotal: Number(subtotal),
      deliveryCharge: Number(deliveryCharge),
      tax: Number(tax),
      total: Number(total),
      paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
      paymentStatus: 'pending',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (e) {
      console.warn('Firestore order write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackOrders.unshift(newOrder);

    // Create Notification
    const notifId = `n${Date.now()}`;
    const newNotif: DBNotification = {
      id: notifId,
      title: 'New COD Order Received',
      message: `Order ${orderId} of ₹${newOrder.total.toFixed(2)} placed by ${customerName}.`,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false,
      orderId
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (e) {
      console.warn('Firestore notification write fallback notice:', e instanceof Error ? e.message : e);
    }
    fallbackNotifications.unshift(newNotif);

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryBoyId, deliveryBoyName, paymentStatus } = req.body;
    
    let oldOrder: DBOrder | undefined;
    try {
      const docSnap = await getDoc(doc(db, 'orders', id));
      if (docSnap.exists()) {
        oldOrder = docSnap.data() as DBOrder;
      }
    } catch (e) {}

    if (!oldOrder) {
      oldOrder = fallbackOrders.find(o => o.id === id);
    }

    if (!oldOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (status !== undefined) updateData.status = status;
    if (deliveryBoyId !== undefined) updateData.deliveryBoyId = deliveryBoyId;
    if (deliveryBoyName !== undefined) updateData.deliveryBoyName = deliveryBoyName;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    if (status === 'Delivered') {
      updateData.paymentStatus = 'completed';
    }

    try {
      await updateDoc(doc(db, 'orders', id), updateData);
    } catch (e) {
      console.warn('Firestore order update fallback notice:', e instanceof Error ? e.message : e);
    }

    const idx = fallbackOrders.findIndex(o => o.id === id);
    if (idx !== -1) {
      fallbackOrders[idx] = { ...fallbackOrders[idx], ...updateData };
    }

    // Add Notification
    if (status && status !== oldOrder.status) {
      let title = `Order ${status}`;
      let message = `Your order ${id} status has been updated to ${status}.`;
      let type: 'info' | 'success' | 'warning' = 'info';

      if (status === 'Accepted') {
        title = 'Order Accepted';
        message = `Dumpling Dream has accepted your order ${id}!`;
        type = 'success';
      } else if (status === 'Preparing') {
        title = 'Preparing Dumplings';
        message = `Our expert chefs are steaming your delicious momos for order ${id}.`;
      } else if (status === 'Ready') {
        title = 'Order Ready for Pickup/Dispatch';
        message = `Your order ${id} is cooked and ready!`;
        type = 'success';
      } else if (status === 'Out for Delivery') {
        title = 'Out for Delivery';
        message = `Rider ${deliveryBoyName || oldOrder.deliveryBoyName || 'Roy'} is on the way with order ${id}!`;
      } else if (status === 'Delivered') {
        title = 'Order Delivered';
        message = `Order ${id} was delivered. Enjoy your hot momos!`;
        type = 'success';
      } else if (status === 'Cancelled') {
        title = 'Order Cancelled';
        message = `Order ${id} has been cancelled.`;
        type = 'warning';
      }

      const notifId = `n${Date.now()}`;
      const newNotif: DBNotification = {
        id: notifId,
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        read: false,
        orderId: id,
        userId: oldOrder.customerId
      };
      try {
        await setDoc(doc(db, 'notifications', notifId), newNotif);
      } catch (e) {
        console.warn('Firestore notification fallback notice:', e instanceof Error ? e.message : e);
      }
      fallbackNotifications.unshift(newNotif);
    }

    res.json({ id, ...oldOrder, ...updateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    let notifs = await getNotificationsFromFirestore();

    if (userId) {
      const users = await getUsersFromFirestore();
      const user = users.find(u => u.id === userId);
      if (user) {
        if (user.role === 'admin') {
          notifs = notifs.filter(n => !n.userId || n.userId === userId);
        } else {
          notifs = notifs.filter(n => n.userId === userId);
        }
      }
    } else {
      notifs = notifs.filter(n => !n.userId);
    }

    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

app.post('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    const notifs = await getNotificationsFromFirestore();
    for (const n of notifs) {
      if (!n.read) {
        if (!userId || n.userId === userId || (!n.userId && userId === 'u1')) {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        }
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications read.' });
  }
});

// Dashboard Analytics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const orders = await getOrdersFromFirestore();
    const users = await getUsersFromFirestore();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenue = orders
      .filter(o => o.status === 'Delivered' && o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
    const customersCount = users.filter(u => u.role === 'customer').length;

    const foodCountMap: Record<string, { count: number; revenue: number; image: string }> = {};
    orders.filter(o => o.status === 'Delivered').forEach(o => {
      o.items.forEach(item => {
        if (!foodCountMap[item.name]) {
          foodCountMap[item.name] = { count: 0, revenue: 0, image: item.image };
        }
        foodCountMap[item.name].count += item.quantity;
        foodCountMap[item.name].revenue += item.quantity * item.price;
      });
    });

    const popularFoods = Object.entries(foodCountMap)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const salesMap: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      salesMap[dateStr] = { orders: 0, revenue: 0 };
    }

    orders.filter(o => o.status === 'Delivered').forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr].orders += 1;
        salesMap[dateStr].revenue += o.total;
      }
    });

    const salesData = Object.entries(salesMap).map(([date, val]) => ({
      date,
      orders: val.orders,
      revenue: Number(val.revenue.toFixed(2))
    }));

    res.json({
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayRevenue: Number(todayRevenue.toFixed(2)),
      pendingOrdersCount,
      completedOrdersCount,
      customersCount,
      popularFoods,
      salesData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute dashboard stats.' });
  }
});

// Production static or Vite dev server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_BUILDER);

if (process.env.NODE_ENV !== 'test' && !isVercel) {
  startServer();
}
