import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import { Category, MenuItem, Order, RestaurantSettings, CartItem, Notification, User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dumpling_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('login');

  // Slide-in Toast notifications state
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('dumpling_cart', JSON.stringify(cart));
  }, [cart]);

  // Initial data loader
  const loadInitialData = async () => {
    try {
      const [catsRes, menuRes, settingsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu'),
        fetch('/api/settings')
      ]);

      const cats = await catsRes.json();
      const menu = await menuRes.json();
      const sets = await settingsRes.json();

      setCategories(cats);
      setMenuItems(menu);
      setSettings(sets);
    } catch (err) {
      console.error('Failed to load menu or settings data:', err);
    }
  };

  // User-dependent data loader (Orders & Notifications)
  const loadUserDependentData = async () => {
    if (!user) return;
    try {
      const ordersUrl = `/api/orders?userId=${user.id}&role=${user.role}`;
      const notifsUrl = `/api/notifications?userId=${user.id}`;

      const [ordersRes, notifsRes] = await Promise.all([
        fetch(ordersUrl),
        fetch(notifsUrl)
      ]);

      const ords = await ordersRes.json();
      const notifs = await notifsRes.json();

      setOrders(ords);

      // Real-time detection: Trigger Toast if new unread notification arrives
      setNotifications(prev => {
        const unreadNew = notifs.filter((n: Notification) => !n.read && !prev.some(p => p.id === n.id));
        if (unreadNew.length > 0) {
          setActiveToast(unreadNew[0]);
          setTimeout(() => setActiveToast(null), 5000);
        }
        return notifs;
      });
    } catch (err) {
      console.error('Failed to fetch orders or notifications:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!user) {
      setCurrentTab('login');
    } else {
      loadUserDependentData();
      if (user.role === 'admin' && (currentTab === 'home' || currentTab === 'login')) {
        setCurrentTab('dashboard');
      } else if (user.role === 'delivery' && (currentTab === 'home' || currentTab === 'login')) {
        setCurrentTab('delivery-orders');
      } else if (user.role === 'customer' && currentTab === 'login') {
        setCurrentTab('home');
      }
    }
  }, [user]);

  // Polling Interval: Synchronizes data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserDependentData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handlers
  const handleLogin = (loggedUser: User, sessionToken: string) => {
    setUser(loggedUser);
    setToken(sessionToken);
    localStorage.setItem('dumpling_user', JSON.stringify(loggedUser));
    localStorage.setItem('dumpling_token', sessionToken);
    if (loggedUser.role === 'admin') setCurrentTab('dashboard');
    else if (loggedUser.role === 'delivery') setCurrentTab('delivery-orders');
    else setCurrentTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setOrders([]);
    setNotifications([]);
    localStorage.removeItem('dumpling_user');
    localStorage.removeItem('dumpling_token');
    setCurrentTab('login');
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const index = prev.findIndex(c => c.menuItem.id === item.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += 1;
        return updated;
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: qty } : c));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = async (orderPayload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const placed = await res.json();
    if (!res.ok) throw new Error(placed.error || 'Failed to place order');
    
    // Update user reward points locally
    if (user) {
      const updatedUser = { ...user, rewardPoints: (user.rewardPoints || 0) + Math.floor(placed.total / 10) };
      setUser(updatedUser);
      localStorage.setItem('dumpling_user', JSON.stringify(updatedUser));
    }

    loadUserDependentData();
    return placed;
  };

  const handleCancelOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    if (!res.ok) throw new Error('Failed to cancel order');
    loadUserDependentData();
  };

  const handleUpdateOrderStatus = async (orderId: string, payload: any) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update order status');
    loadUserDependentData();
  };

  const handleReadAllNotifications = async () => {
    if (!user) return;
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    loadUserDependentData();
  };

  // Settings
  const handleUpdateSettings = async (updated: RestaurantSettings) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    const data = await res.json();
    setSettings(data);
  };

  // Categories CRUD
  const handleAddCategory = async (payload: any) => {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    loadInitialData();
  };

  const handleUpdateCategory = async (id: string, payload: any) => {
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    loadInitialData();
  };

  const handleDeleteCategory = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    loadInitialData();
  };

  // Menu CRUD
  const handleAddMenuItem = async (payload: any) => {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    loadInitialData();
  };

  const handleUpdateMenuItem = async (id: string, payload: any) => {
    await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    loadInitialData();
  };

  const handleDeleteMenuItem = async (id: string) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    loadInitialData();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between font-sans text-stone-100 antialiased selection:bg-red-600 selection:text-white">
      
      {/* 1. APP NAVIGATION */}
      <Navbar
        user={user}
        settings={settings}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        notifications={notifications}
        onReadAllNotifications={handleReadAllNotifications}
        onLogout={handleLogout}
        onTabChange={(tab) => {
          if (!user) {
            setCurrentTab('login');
            return;
          }
          setCurrentTab(tab);
        }}
        currentTab={currentTab}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow">
        {!user || currentTab === 'login' ? (
          <AuthModal onLogin={handleLogin} />
        ) : (
          <>
            {/* CUSTOMER VIEWS */}
            {user.role === 'customer' && ['home', 'menu', 'cart', 'orders', 'profile'].includes(currentTab) && (
              <CustomerDashboard
                user={user}
                categories={categories}
                menuItems={menuItems}
                settings={settings}
                orders={orders}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
                onCancelOrder={handleCancelOrder}
                onTabChange={setCurrentTab}
                currentTab={currentTab}
              />
            )}

            {/* ADMIN PANELS */}
            {user.role === 'admin' && ['dashboard', 'admin-menu', 'admin-orders', 'admin-users', 'admin-settings'].includes(currentTab) && (
              <AdminDashboard
                user={user}
                categories={categories}
                menuItems={menuItems}
                orders={orders}
                settings={settings!}
                onUpdateSettings={handleUpdateSettings}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddMenuItem={handleAddMenuItem}
                onUpdateMenuItem={handleUpdateMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                currentSubTab={currentTab}
              />
            )}

            {/* DELIVERY PANEL */}
            {user.role === 'delivery' && currentTab === 'delivery-orders' && (
              <DeliveryDashboard
                user={user}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}
          </>
        )}
      </main>

      {/* 3. SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemove={handleRemoveFromCart}
        onClear={handleClearCart}
        settings={settings}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentTab('cart');
        }}
      />

      {/* 4. CLIENT REAL-TIME NOTIFICATION POPUP TOAST */}
      {activeToast && (
        <div className="fixed top-20 right-5 z-50 bg-[#181818] border border-red-600/50 text-white max-w-sm rounded-xl p-4 shadow-2xl flex items-start space-x-3.5 transition-all transform animate-bounce">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            🥟
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-tight text-white">{activeToast.title}</h4>
            <p className="text-[11px] text-stone-300 mt-1 leading-normal font-semibold">{activeToast.message}</p>
          </div>
        </div>
      )}

      {/* 5. DUMPLING DREAM BRANDED FOOTER */}
      <footer className="bg-[#0e0e0e] border-t border-[#222222] py-10 text-stone-400 text-xs pb-24">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-medium">
          <div className="space-y-2">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">Dumpling Dream</h4>
            <p className="leading-relaxed text-stone-400 text-[11px]">
              {settings?.aboutSection || 'Welcome to Dumpling Dream! We serve fresh, authentic, and delicious momos made with love.'}
            </p>
          </div>
          <div className="space-y-2 text-[11px]">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">Location & Contact</h4>
            <p>📍 {settings?.address || 'Station Road, Sribhumi, Assam, 788710'}</p>
            <p>📞 {settings?.contactPhone || '+91 9876543210'}</p>
            <p>💬 WhatsApp: +91 {settings?.whatsappNumber || '9876543210'}</p>
          </div>
          <div className="space-y-2 text-[11px]">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">Hours of Operation</h4>
            <p>Opening Time: {settings?.openingHours || '10:00 AM'}</p>
            <p>Closing Time: {settings?.closingHours || '10:00 PM'}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 border-t border-[#1f1f1f] mt-6 pt-4 text-center text-stone-500 font-bold text-[10px] uppercase tracking-wider">
          &copy; {new Date().getFullYear()} Dumpling Dream. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
