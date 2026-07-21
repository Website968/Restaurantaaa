import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import DeliveryDashboard from './components/DeliveryDashboard';
import { Category, MenuItem, Order, RestaurantSettings, CartItem, Notification, User } from './types';
import { ShoppingBag, ChevronRight, User as UserIcon, MapPin, Phone, Mail, Clock, Shield, Bike, Check, Trash2, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gourmet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('gourmet_token');
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gourmet_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Slide-in Toast notifications state
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('gourmet_cart', JSON.stringify(cart));
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

      // Real-time detection: Trigger Toast if new unread notification arrives!
      setNotifications(prev => {
        const unreadNew = notifs.filter((n: Notification) => !n.read && !prev.some(p => p.id === n.id));
        if (unreadNew.length > 0) {
          // Trigger toast for the latest unread alert
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
    loadUserDependentData();
    // Tab coordination
    if (user) {
      if (user.role === 'admin') setCurrentTab('dashboard');
      else if (user.role === 'delivery') setCurrentTab('delivery-orders');
      else setCurrentTab('home');
    } else {
      setCurrentTab('home');
    }
  }, [user]);

  // Polling Interval: Synchronizes data every 5 seconds for a fluid real-time notification/status feel!
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserDependentData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user, notifications]);

  // Handlers
  const handleLogin = (loggedUser: User, sessionToken: string) => {
    setUser(loggedUser);
    setToken(sessionToken);
    localStorage.setItem('gourmet_user', JSON.stringify(loggedUser));
    localStorage.setItem('gourmet_token', sessionToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setOrders([]);
    setNotifications([]);
    localStorage.removeItem('gourmet_user');
    localStorage.removeItem('gourmet_token');
    setCurrentTab('home');
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
    setIsCartOpen(true);
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
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between font-sans text-stone-800 antialiased selection:bg-amber-600 selection:text-stone-50">
      
      {/* 1. APP NAVIGATION */}
      <Navbar
        user={user}
        settings={settings}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        notifications={notifications}
        onReadAllNotifications={handleReadAllNotifications}
        onLogout={handleLogout}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentTab={currentTab}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow">
        {currentTab === 'login' && !user && (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <AuthModal onLogin={handleLogin} />
          </div>
        )}

        {/* CUSTOMER PANEL */}
        {(!user || user.role === 'customer') && currentTab !== 'login' && (
          <>
            {currentTab === 'home' && (
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
              />
            )}

            {currentTab === 'my-orders' && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Order Booking Logs</h2>
                {orders.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-sm">
                    <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4 stroke-[1.2]" />
                    <p className="text-stone-850 font-black text-sm">No bookings logged yet</p>
                    <button onClick={() => setCurrentTab('home')} className="mt-4 bg-stone-900 hover:bg-stone-800 text-stone-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Browse gourmet menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(ord => (
                      <div key={ord.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm text-xs font-semibold text-stone-700 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-stone-400 text-[10px] uppercase font-bold">Booking ID</p>
                            <h4 className="text-sm font-black text-stone-950 uppercase">{ord.id}</h4>
                            <p className="text-stone-400 text-[10px] font-medium">{new Date(ord.createdAt).toLocaleString()}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded shadow-sm ${
                            ord.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                            ord.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        <div className="border-t border-stone-100 pt-3 flex flex-wrap gap-4 justify-between items-center text-[11px]">
                          <div>
                            <p className="font-extrabold text-stone-900">Delivery Address</p>
                            <p className="text-stone-500 mt-0.5">{ord.deliveryAddress}</p>
                          </div>
                          <div>
                            <p className="font-extrabold text-stone-900">Dispatched Items</p>
                            <p className="text-stone-500 mt-0.5">{ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                          </div>
                          <div>
                            <p className="font-extrabold text-stone-900">Billed Total</p>
                            <p className="text-amber-700 font-black text-sm mt-0.5">${ord.total.toFixed(2)}</p>
                          </div>
                        </div>

                        {ord.status === 'Pending' && (
                          <div className="border-t border-stone-100 pt-3.5 text-right">
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel this order?')) {
                                  await handleCancelOrder(ord.id);
                                }
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-150 px-4 py-2 rounded-lg text-[10px] uppercase font-bold transition-all"
                            >
                              Cancel Pending Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'profile' && user && (
              <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-6">
                <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-stone-200 pb-3 flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center font-black text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-950">{user.name}</h3>
                      <p className="text-stone-405 text-xs font-semibold capitalize mt-0.5">{user.role} Account Profile</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-stone-750">
                    <div className="flex items-start space-x-3">
                      <Mail size={16} className="text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[9px]">Email Address</p>
                        <p className="text-stone-800 text-sm mt-0.5 font-bold">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone size={16} className="text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[9px]">Phone Coordinate</p>
                        <p className="text-stone-850 mt-0.5">{user.phone || 'No phone registered yet.'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin size={16} className="text-stone-400 mt-0.5" />
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[9px]">Delivery Address</p>
                        <p className="text-stone-850 mt-0.5 leading-normal">{user.address || 'No address registered yet.'}</p>
                        {user.landmark && <p className="text-stone-400 text-[11px] mt-0.5">Landmark: {user.landmark}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ADMIN PANELS */}
        {user && user.role === 'admin' && (
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
        {user && user.role === 'delivery' && (
          <DeliveryDashboard
            user={user}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* 3. SHOPPING CART DRAWER (CLIENT SIDE PERSISTED) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemove={handleRemoveFromCart}
        onClear={handleClearCart}
        settings={settings}
        onCheckout={() => setCurrentTab('home')}
      />

      {/* 4. CLIENT REAL-TIME NOTIFICATION POPUP TOAST */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 border border-stone-800 text-stone-50 max-w-sm rounded-xl p-4 shadow-2xl flex items-start space-x-3.5 transition-all transform animate-slide-in">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-stone-50 text-sm font-bold shrink-0">
            🔔
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-tight text-white">{activeToast.title}</h4>
            <p className="text-[11px] text-stone-300 mt-1 leading-normal font-semibold">{activeToast.message}</p>
          </div>
        </div>
      )}

      {/* 5. GOURMET BRANDED FOOTER */}
      <footer className="bg-stone-950 border-t border-stone-900 py-12 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-medium">
          <div className="space-y-3">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">The Gourmet Craft</h4>
            <p className="leading-relaxed">
              We fuse fine food artisanry with prime, fresh toppings to curate and deliver perfect chef-driven gastronomic masterpieces.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">Coordinates</h4>
            <p>Address: {settings?.address || '123 Epicurean Boulevard, Plaza'}</p>
            <p>Call support: {settings?.phone || '+1 (555) 500-2026'}</p>
            <p>Email: {settings?.email || 'hello@gourmetcraft.com'}</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-black tracking-wider uppercase text-xs">Hours of Operations</h4>
            <p>Opening Time: {settings?.openingHours || '10:00 AM'}</p>
            <p>Closing Time: {settings?.closingHours || '10:00 PM'}</p>
            <p className="text-stone-500 text-[10px] font-bold">Closed on major public gazette holidays.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-stone-500 font-bold text-[10px] uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} The Gourmet Craft. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">Facebook</a>
            <a href={settings?.twitterUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">Twitter</a>
            <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
