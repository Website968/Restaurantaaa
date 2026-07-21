import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const dbPath = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Type definitions for DB JSON structure
interface DBUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'delivery';
  passwordHash: string; // Plaintext or simple hash for dev convenience
  phone?: string;
  address?: string;
  landmark?: string;
  createdAt: string;
}

interface DBCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
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

interface DBSchema {
  users: DBUser[];
  categories: DBCategory[];
  menuItems: DBMenuItem[];
  orders: DBOrder[];
  settings: DBRestaurantSettings;
  notifications: DBNotification[];
}

// Ensure db.json exists with initial pre-seeded data
function initializeDatabase() {
  if (fs.existsSync(dbPath)) {
    return;
  }

  const initialData: DBSchema = {
    users: [
      {
        id: 'u1',
        email: 'admin@restaurant.com',
        name: 'Alex Admin',
        role: 'admin',
        passwordHash: 'admin123',
        phone: '+1 (555) 123-4567',
        address: '100 Main Restaurant St',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u2',
        email: 'delivery@restaurant.com',
        name: 'Rider Roy',
        role: 'delivery',
        passwordHash: 'delivery123',
        phone: '+1 (555) 987-6543',
        address: '200 Delivery Hub Ave',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u3',
        email: 'customer@restaurant.com',
        name: 'Chris Customer',
        role: 'customer',
        passwordHash: 'customer123',
        phone: '+1 (555) 444-5555',
        address: '742 Evergreen Terrace',
        landmark: 'Next to Springfield Mall',
        createdAt: new Date().toISOString(),
      }
    ],
    categories: [
      { id: 'c1', name: 'Gourmet Burgers', icon: 'sandwich', description: 'Flame-grilled burgers crafted with premium beef and fresh toppings', active: true },
      { id: 'c2', name: 'Artisanal Pizzas', icon: 'pizza', description: 'Wood-fired oven pizzas with house-made marinara and fresh mozzarella', active: true },
      { id: 'c3', name: 'Sides & Sharing', icon: 'soup', description: 'Perfect companions to complete your meal', active: true },
      { id: 'c4', name: 'Sinful Desserts', icon: 'cake', description: 'Sweet treats to end your dining experience on a high note', active: true },
      { id: 'c5', name: 'Refreshing Drinks', icon: 'glass-water', description: 'Chilled craft sodas, mocktails, and iced coffee', active: true },
      { id: 'c6', name: 'Nourishing Bowls', icon: 'salad', description: 'Fresh, organic salads and protein-packed grains', active: true }
    ],
    menuItems: [
      {
        id: 'm1',
        name: 'The Vintage Cheeseburger',
        description: 'Prime dry-aged beef patty, mature cheddar cheese, heirloom tomato, crisp butter lettuce, house burger sauce, toasted brioche bun.',
        price: 14.99,
        categoryId: 'c1',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: true,
        discountPercent: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        name: 'Spicy Firehouse Chicken Burger',
        description: 'Crispy buttermilk chicken breast, spicy habanero glaze, cooling slaw, pickled jalapeños, chipotle aioli, brioche bun.',
        price: 15.49,
        categoryId: 'c1',
        image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: true,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm3',
        name: 'Margherita Classica Pizza',
        description: 'San Marzano tomato base, fresh buffalo mozzarella, aromatic basil leaves, extra virgin olive oil drizzle, hand-stretched thin crust.',
        price: 16.99,
        categoryId: 'c2',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: true,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm4',
        name: 'Double Pepperoni Supreme',
        description: 'House tomato sauce, loaded with cup-and-char pepperoni, fontina cheese, oregano, hot honey finish.',
        price: 18.99,
        categoryId: 'c2',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm5',
        name: 'Crispy Sea Salt Fries',
        description: 'Hand-cut russet potatoes fried to golden perfection, seasoned with sea salt and fresh rosemary sprigs. Served with truffle ketchup.',
        price: 5.99,
        categoryId: 'c3',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm6',
        name: 'Loaded Mozzarella Dippers',
        description: 'Herb-crusted mozzarella blocks, gooey melted core. Served with warm spicy marinara dipping sauce.',
        price: 8.49,
        categoryId: 'c3',
        image: 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm7',
        name: 'Decadent Chocolate Lava Cake',
        description: 'Warm, rich chocolate cake with a molten dark chocolate center. Served with a scoop of premium Madagascar vanilla bean ice cream.',
        price: 9.99,
        categoryId: 'c4',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: true,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm8',
        name: 'Wild Strawberry Cheesecake',
        description: 'New York style baked cheesecake on a buttery graham cracker crust, topped with house-made wild strawberry compote.',
        price: 8.99,
        categoryId: 'c4',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm9',
        name: 'Fresh Mint Lime Mojito',
        description: 'Refreshing blend of muddled garden mint, fresh lime wedges, organic cane sugar, sparkling water, over crushed ice.',
        price: 5.49,
        categoryId: 'c5',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm10',
        name: 'Iced Vanilla Bean Latte',
        description: 'Double shot of organic espresso, cold milk, rich natural vanilla bean syrup, served over ice.',
        price: 6.29,
        categoryId: 'c5',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm11',
        name: 'Classic Chicken Caesar Bowl',
        description: 'Crisp romaine lettuce, flame-grilled chicken breast, garlic herb croutons, shaved parmigiano-reggiano, creamy caesar dressing.',
        price: 13.99,
        categoryId: 'c6',
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: false,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm12',
        name: 'Quinoa Avocado Power Bowl',
        description: 'Nutritious red quinoa, creamy hass avocado, cherry tomatoes, edamame, baby spinach, roasted sesame ginger dressing.',
        price: 14.49,
        categoryId: 'c6',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isFeatured: true,
        discountPercent: 5,
        createdAt: new Date().toISOString(),
      }
    ],
    orders: [
      {
        id: 'ORD-101',
        customerId: 'u3',
        customerName: 'Chris Customer',
        customerPhone: '+1 (555) 444-5555',
        deliveryAddress: '742 Evergreen Terrace',
        landmark: 'Next to Springfield Mall',
        notes: 'Please knock on the side door.',
        items: [
          { menuItemId: 'm1', name: 'The Vintage Cheeseburger', quantity: 1, price: 13.49, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
          { menuItemId: 'm5', name: 'Crispy Sea Salt Fries', quantity: 1, price: 5.99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80' }
        ],
        subtotal: 19.48,
        deliveryCharge: 3.99,
        tax: 1.56,
        total: 25.03,
        status: 'Delivered',
        deliveryBoyId: 'u2',
        deliveryBoyName: 'Rider Roy',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ORD-102',
        customerId: 'u3',
        customerName: 'Chris Customer',
        customerPhone: '+1 (555) 444-5555',
        deliveryAddress: '742 Evergreen Terrace',
        landmark: 'Next to Springfield Mall',
        notes: 'Leave at door.',
        items: [
          { menuItemId: 'm3', name: 'Margherita Classica Pizza', quantity: 2, price: 16.99, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' }
        ],
        subtotal: 33.98,
        deliveryCharge: 3.99,
        tax: 2.72,
        total: 40.69,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    settings: {
      restaurantName: 'The Gourmet Craft',
      logo: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=150&h=150&q=80',
      banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      address: '123 Epicurean Boulevard, Gastronomy Plaza',
      phone: '+1 (555) 500-2026',
      email: 'hello@gourmetcraft.com',
      deliveryCharge: 3.99,
      minOrder: 10.00,
      openingHours: '10:00 AM',
      closingHours: '10:00 PM',
      facebookUrl: 'https://facebook.com/gourmetcraft',
      twitterUrl: 'https://twitter.com/gourmetcraft',
      instagramUrl: 'https://instagram.com/gourmetcraft',
      aboutSection: 'Welcome to The Gourmet Craft, where we combine chef-driven flavor curation with prime hand-selected ingredients. Our wood-fired ovens and signature flame grills ensure that every dish served is a masterpiece of culinary artisanry.',
      contactEmail: 'support@gourmetcraft.com',
      contactPhone: '+1 (555) 500-2027',
    },
    notifications: [
      {
        id: 'n1',
        title: 'New Order Placed',
        message: 'Order ORD-102 has been placed by Chris Customer.',
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false,
        orderId: 'ORD-102'
      }
    ]
  };

  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
}

initializeDatabase();

// Helper functions to read/write DB
function readDb(): DBSchema {
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB, reinitializing:', error);
    initializeDatabase();
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  }
}

function writeDb(data: DBSchema) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// REST API Endpoints

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = `mock-token-${user.id}-${Date.now()}`;
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      landmark: user.landmark,
      createdAt: user.createdAt
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address, landmark } = req.body;
  const db = readDb();

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  const newUser: DBUser = {
    id: `u${Date.now()}`,
    email,
    name,
    role: 'customer',
    passwordHash: password,
    phone,
    address,
    landmark,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = `mock-token-${newUser.id}-${Date.now()}`;
  res.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      landmark: newUser.landmark,
      createdAt: newUser.createdAt
    }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email, newPassword } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: 'No user found with this email.' });
  }

  db.users[userIndex].passwordHash = newPassword || 'customer123';
  writeDb(db);
  res.json({ message: 'Password reset successfully!' });
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const { name, icon, description } = req.body;
  const db = readDb();
  const newCategory: DBCategory = {
    id: `c${Date.now()}`,
    name,
    icon: icon || 'soup',
    description: description || '',
    active: true
  };
  db.categories.push(newCategory);
  writeDb(db);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon, description, active } = req.body;
  const db = readDb();
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) return res.status(404).json({ error: 'Category not found.' });

  db.categories[index] = {
    ...db.categories[index],
    name: name !== undefined ? name : db.categories[index].name,
    icon: icon !== undefined ? icon : db.categories[index].icon,
    description: description !== undefined ? description : db.categories[index].description,
    active: active !== undefined ? active : db.categories[index].active
  };

  writeDb(db);
  res.json(db.categories[index]);
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.categories = db.categories.filter(c => c.id !== id);
  // Also delete associated menu items
  db.menuItems = db.menuItems.filter(m => m.categoryId !== id);
  writeDb(db);
  res.json({ message: 'Category deleted successfully.' });
});

// Menu Items CRUD
app.get('/api/menu', (req, res) => {
  const db = readDb();
  res.json(db.menuItems);
});

app.post('/api/menu', (req, res) => {
  const { name, description, price, categoryId, image, isAvailable, isFeatured, discountPercent } = req.body;
  const db = readDb();
  const newItem: DBMenuItem = {
    id: `m${Date.now()}`,
    name,
    description,
    price: Number(price) || 0,
    categoryId,
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
    discountPercent: Number(discountPercent) || 0,
    createdAt: new Date().toISOString()
  };
  db.menuItems.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.menuItems.findIndex(m => m.id === id);

  if (index === -1) return res.status(404).json({ error: 'Menu item not found.' });

  const { name, description, price, categoryId, image, isAvailable, isFeatured, discountPercent } = req.body;

  db.menuItems[index] = {
    ...db.menuItems[index],
    name: name !== undefined ? name : db.menuItems[index].name,
    description: description !== undefined ? description : db.menuItems[index].description,
    price: price !== undefined ? Number(price) : db.menuItems[index].price,
    categoryId: categoryId !== undefined ? categoryId : db.menuItems[index].categoryId,
    image: image !== undefined ? image : db.menuItems[index].image,
    isAvailable: isAvailable !== undefined ? isAvailable : db.menuItems[index].isAvailable,
    isFeatured: isFeatured !== undefined ? isFeatured : db.menuItems[index].isFeatured,
    discountPercent: discountPercent !== undefined ? Number(discountPercent) : db.menuItems[index].discountPercent
  };

  writeDb(db);
  res.json(db.menuItems[index]);
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.menuItems = db.menuItems.filter(m => m.id !== id);
  writeDb(db);
  res.json({ message: 'Menu item deleted successfully.' });
});

// Restaurant Settings
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = readDb();
  const { userId, role } = req.query;

  let filteredOrders = db.orders;

  if (role === 'customer' && userId) {
    filteredOrders = db.orders.filter(o => o.customerId === userId);
  } else if (role === 'delivery' && userId) {
    filteredOrders = db.orders.filter(o => o.deliveryBoyId === userId);
  }

  // Sort orders descending by date
  filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filteredOrders);
});

app.post('/api/orders', (req, res) => {
  const { customerId, customerName, customerPhone, deliveryAddress, landmark, notes, items, subtotal, deliveryCharge, tax, total } = req.body;
  const db = readDb();

  const newOrder: DBOrder = {
    id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId,
    customerName,
    customerPhone,
    deliveryAddress,
    landmark,
    notes,
    items,
    subtotal: Number(subtotal),
    deliveryCharge: Number(deliveryCharge),
    tax: Number(tax),
    total: Number(total),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Send admin notification
  const newNotif: DBNotification = {
    id: `n${Date.now()}`,
    title: 'New Order Received',
    message: `Order ${newOrder.id} of $${newOrder.total.toFixed(2)} placed by ${customerName}.`,
    type: 'info',
    createdAt: new Date().toISOString(),
    read: false,
    orderId: newOrder.id
  };
  db.notifications.push(newNotif);

  writeDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, deliveryBoyId, deliveryBoyName } = req.body;
  const db = readDb();
  const index = db.orders.findIndex(o => o.id === id);

  if (index === -1) return res.status(404).json({ error: 'Order not found.' });

  const oldOrder = db.orders[index];
  const originalStatus = oldOrder.status;

  db.orders[index] = {
    ...oldOrder,
    status: status !== undefined ? status : oldOrder.status,
    deliveryBoyId: deliveryBoyId !== undefined ? deliveryBoyId : oldOrder.deliveryBoyId,
    deliveryBoyName: deliveryBoyName !== undefined ? deliveryBoyName : oldOrder.deliveryBoyName,
    updatedAt: new Date().toISOString()
  };

  // Add Notification for user
  if (status && status !== originalStatus) {
    let title = `Order ${status}`;
    let message = `Your order ${id} status has been updated to ${status}.`;
    let type: 'info' | 'success' | 'warning' = 'info';

    if (status === 'Accepted') {
      title = 'Order Accepted';
      message = `Hurrah! Gourmet Craft has accepted your order ${id}.`;
      type = 'success';
    } else if (status === 'Preparing') {
      title = 'Preparing Food';
      message = `Our expert chefs are cooking your fresh meal for order ${id}.`;
    } else if (status === 'Ready') {
      title = 'Order Ready';
      message = `Your order ${id} is ready for pick-up or dispatch!`;
      type = 'success';
    } else if (status === 'Out for Delivery') {
      title = 'Out for Delivery';
      message = `Our delivery hero ${db.orders[index].deliveryBoyName || 'Roy'} is heading your way with order ${id}!`;
    } else if (status === 'Delivered') {
      title = 'Order Delivered';
      message = `Order ${id} was marked delivered. Enjoy your meal!`;
      type = 'success';
    } else if (status === 'Cancelled') {
      title = 'Order Cancelled';
      message = `Order ${id} was cancelled.`;
      type = 'warning';
    }

    const customerNotif: DBNotification = {
      id: `n${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      orderId: id,
      userId: oldOrder.customerId
    };
    db.notifications.push(customerNotif);
  }

  // Delivery partner assignment notification
  if (deliveryBoyId && deliveryBoyId !== oldOrder.deliveryBoyId) {
    const deliveryNotif: DBNotification = {
      id: `n${Date.now() + 1}`,
      title: 'New Delivery Assigned',
      message: `You have been assigned order ${id} for delivery.`,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false,
      orderId: id,
      userId: deliveryBoyId
    };
    db.notifications.push(deliveryNotif);
  }

  writeDb(db);
  res.json(db.orders[index]);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const db = readDb();

  let userNotifs = db.notifications;
  if (userId) {
    // Show user-specific notifications AND admin notifications (if they are admin)
    const user = db.users.find(u => u.id === userId);
    if (user) {
      if (user.role === 'admin') {
        // Admin sees admin notifications (no specific userId) and direct ones
        userNotifs = db.notifications.filter(n => !n.userId || n.userId === userId);
      } else {
        // Customer or Delivery partner sees only their specific notifications
        userNotifs = db.notifications.filter(n => n.userId === userId);
      }
    }
  } else {
    // Default fallback
    userNotifs = db.notifications.filter(n => !n.userId);
  }

  // Sort descending
  userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifs);
});

app.post('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  const db = readDb();

  db.notifications.forEach(n => {
    if (userId) {
      if (n.userId === userId || (!n.userId && userId === 'u1')) {
        n.read = true;
      }
    } else {
      n.read = true;
    }
  });

  writeDb(db);
  res.json({ success: true });
});

// Dashboard Analytics
app.get('/api/dashboard-stats', (req, res) => {
  const db = readDb();
  const orders = db.orders;

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total, 0);

  // Calculate Today's Revenue (assuming all matching date)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = orders
    .filter(o => o.status === 'Delivered' && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const customersCount = db.users.filter(u => u.role === 'customer').length;

  // Calculate Popular Foods
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

  // Calculate Sales Graph (last 7 days)
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
});

// Vite Middleware Setup or static serving for Production
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

startServer();
