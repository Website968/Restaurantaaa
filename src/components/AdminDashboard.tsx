import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Star,
  Settings as SettingsIcon,
  FolderOpen,
  Check,
  X,
  Bike,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Category, MenuItem, Order, RestaurantSettings, User, DashboardStats } from '../types';
import { safeFetchJson } from '../lib/api';

interface AdminDashboardProps {
  user: User;
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  settings: RestaurantSettings;
  onUpdateSettings: (settings: RestaurantSettings) => Promise<void>;
  onAddCategory: (category: any) => Promise<void>;
  onUpdateCategory: (id: string, category: any) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddMenuItem: (item: any) => Promise<void>;
  onUpdateMenuItem: (id: string, item: any) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, payload: any) => Promise<void>;
  currentSubTab: string;
}

export default function AdminDashboard({
  user,
  categories,
  menuItems,
  orders,
  settings,
  onUpdateSettings,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUpdateOrderStatus,
  currentSubTab
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<'stats' | 'orders' | 'menu' | 'categories' | 'users' | 'settings'>('stats');
  
  useEffect(() => {
    if (currentSubTab === 'dashboard') setSubTab('stats');
    else if (currentSubTab === 'menu' || currentSubTab === 'admin-menu') setSubTab('menu');
    else if (currentSubTab === 'categories') setSubTab('categories');
    else if (currentSubTab === 'orders' || currentSubTab === 'admin-orders') setSubTab('orders');
    else if (currentSubTab === 'users' || currentSubTab === 'admin-users') setSubTab('users');
    else if (currentSubTab === 'settings' || currentSubTab === 'admin-settings') setSubTab('settings');
  }, [currentSubTab]);

  // Users & Delivery Partner Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'delivery' | 'admin' | 'customer'>('delivery');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Create Admin Form State
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [adminFormMsg, setAdminFormMsg] = useState('');
  const [adminFormErr, setAdminFormErr] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const data = await safeFetchJson('/api/users');
      setUsersList(data);
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (subTab === 'users') {
      fetchUsersList();
    }
  }, [subTab]);

  const handleApproveDeliveryPartner = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const data = await safeFetchJson('/api/admin/delivery-partners/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      });
      fetchUsersList();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormErr('');
    setAdminFormMsg('');
    setCreatingAdmin(true);

    try {
      const data = await safeFetchJson('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          phone: newAdminPhone
        })
      });

      setAdminFormMsg('New admin account created successfully!');
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminPhone('');
      setShowAdminForm(false);
      fetchUsersList();
    } catch (err: any) {
      setAdminFormErr(err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  // General statistics loader
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Filters for orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // CRUD Forms State
  // Categories form
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('soup');
  const [catDesc, setCatDesc] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // Menu items form
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCatId, setMenuCatId] = useState('');
  const [menuImage, setMenuImage] = useState('');
  const [menuIsAvailable, setMenuIsAvailable] = useState(true);
  const [menuIsFeatured, setMenuIsFeatured] = useState(false);
  const [menuDiscount, setMenuDiscount] = useState('0');
  const [showMenuForm, setShowMenuForm] = useState(false);

  // Settings Form State
  const [setRestName, setSetRestName] = useState(settings?.restaurantName || '');
  const [setLogo, setSetLogo] = useState(settings?.logo || '');
  const [setBanner, setSetBanner] = useState(settings?.banner || '');
  const [setAddress, setSetAddress] = useState(settings?.address || '');
  const [setPhone, setSetPhone] = useState(settings?.phone || '');
  const [setEmail, setSetEmail] = useState(settings?.email || '');
  const [setDeliveryCharge, setSetDeliveryCharge] = useState(settings?.deliveryCharge?.toString() || '3.99');
  const [setMinOrder, setSetMinOrder] = useState(settings?.minOrder?.toString() || '10.00');
  const [setOpenHours, setSetOpenHours] = useState(settings?.openingHours || '10:00 AM');
  const [setCloseHours, setSetCloseHours] = useState(settings?.closingHours || '10:00 PM');
  const [setAbout, setSetAbout] = useState(settings?.aboutSection || '');
  const [setFb, setSetFb] = useState(settings?.facebookUrl || '');
  const [setTw, setSetTw] = useState(settings?.twitterUrl || '');
  const [setInsta, setSetInsta] = useState(settings?.instagramUrl || '');

  // Fetch stats on load or change
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await safeFetchJson('/api/dashboard-stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [orders, menuItems, categories]);

  // Sync settings states on settings prop update
  useEffect(() => {
    if (settings) {
      setSetRestName(settings.restaurantName);
      setSetLogo(settings.logo);
      setSetBanner(settings.banner);
      setSetAddress(settings.address);
      setSetPhone(settings.phone);
      setSetEmail(settings.email);
      setSetDeliveryCharge(settings.deliveryCharge?.toString() || '3.99');
      setSetMinOrder(settings.minOrder?.toString() || '10.00');
      setSetOpenHours(settings.openingHours);
      setSetCloseHours(settings.closingHours);
      setSetAbout(settings.aboutSection);
      setSetFb(settings.facebookUrl);
      setSetTw(settings.twitterUrl);
      setSetInsta(settings.instagramUrl);
    }
  }, [settings]);

  // Categories submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: catName, icon: catIcon, description: catDesc };
    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, payload);
    } else {
      await onAddCategory(payload);
    }
    setCatName('');
    setCatDesc('');
    setCatIcon('soup');
    setEditingCategory(null);
    setShowCatForm(false);
  };

  // Menu items submit
  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: menuName,
      description: menuDesc,
      price: Number(menuPrice),
      categoryId: menuCatId || categories[0]?.id,
      image: menuImage,
      isAvailable: menuIsAvailable,
      isFeatured: menuIsFeatured,
      discountPercent: Number(menuDiscount)
    };

    if (editingMenuItem) {
      await onUpdateMenuItem(editingMenuItem.id, payload);
    } else {
      await onAddMenuItem(payload);
    }

    setMenuName('');
    setMenuDesc('');
    setMenuPrice('');
    setMenuImage('');
    setMenuIsAvailable(true);
    setMenuIsFeatured(false);
    setMenuDiscount('0');
    setEditingMenuItem(null);
    setShowMenuForm(false);
  };

  // Settings submit
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settings,
      restaurantName: setRestName,
      logo: setLogo,
      banner: setBanner,
      address: setAddress,
      phone: setPhone,
      email: setEmail,
      deliveryCharge: Number(setDeliveryCharge),
      minOrder: Number(setMinOrder),
      openingHours: setOpenHours,
      closingHours: setCloseHours,
      aboutSection: setAbout,
      facebookUrl: setFb,
      twitterUrl: setTw,
      instagramUrl: setInsta
    };
    await onUpdateSettings(updated);
    alert('Restaurant Settings updated successfully!');
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Tab select bar (Mobile) */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-2 flex items-center space-x-1 overflow-x-auto">
        {[
          { id: 'stats', label: 'Dashboard' },
          { id: 'orders', label: 'Orders' },
          { id: 'menu', label: 'Menu' },
          { id: 'categories', label: 'Categories' },
          { id: 'users', label: 'Users & Delivery' },
          { id: 'settings', label: 'Settings' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setSubTab(tb.id as any)}
            className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-md ${
              subTab === tb.id ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-left">
        {/* SUBTAB 1: ANALYTICS & DASHBOARD */}
        {subTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Admin Insights & Metrics</h2>
                <p className="text-stone-500 text-xs font-semibold">Real-time performance metrics and sales summaries</p>
              </div>
              <button
                onClick={fetchStats}
                className="p-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 rounded-lg shadow-sm transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingStats ? (
              <div className="py-24 text-center">
                <span className="inline-block w-8 h-8 border-4 border-stone-200 border-t-stone-850 rounded-full animate-spin"></span>
                <p className="text-stone-500 text-xs mt-3 font-semibold">Recalculating analytics ledger...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Statistics cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { title: 'Gross Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, desc: 'Completed checks', icon: <DollarSign size={16} className="text-amber-700" /> },
                    { title: 'Today\'s Sales', value: `$${stats.todayRevenue.toFixed(2)}`, desc: 'Delivered today', icon: <TrendingUp size={16} className="text-emerald-700" /> },
                    { title: 'Total Invoices', value: stats.totalOrders, desc: 'Lifetime orders', icon: <ShoppingBag size={16} className="text-blue-700" /> },
                    { title: 'Pending Checks', value: stats.pendingOrdersCount, desc: 'In kitchen / transit', icon: <Clock size={16} className="text-amber-600 animate-pulse" /> },
                    { title: 'Delivered Checks', value: stats.completedOrdersCount, desc: 'Finished runs', icon: <CheckCircle size={16} className="text-emerald-600" /> },
                    { title: 'Registered Users', value: stats.customersCount, desc: 'Active accounts', icon: <Users size={16} className="text-stone-750" /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm space-y-1.5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{stat.title}</span>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-lg font-black text-stone-900 leading-none">{stat.value}</p>
                        <p className="text-[10px] text-stone-400 mt-1 leading-none font-semibold">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sales Graph Trend Line & Popular Foods */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sales trend graph */}
                  <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-5 shadow-sm text-left">
                    <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider mb-4 flex items-center space-x-1.5">
                      <TrendingUp size={14} className="text-amber-700" />
                      <span>Sales & Orders Trend (Last 7 Days)</span>
                    </h3>
                    
                    {/* Responsive SVG Sparkline Chart */}
                    <div className="h-44 w-full flex items-end justify-between px-2 pt-4 relative">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-stone-100"></div>
                      <div className="absolute inset-x-0 top-2/4 border-t border-stone-100"></div>
                      <div className="absolute inset-x-0 top-3/4 border-t border-stone-100"></div>
                      
                      {stats.salesData.map((day, dIdx) => {
                        const maxRev = Math.max(...stats.salesData.map(s => s.revenue), 10);
                        const pct = (day.revenue / maxRev) * 100;
                        return (
                          <div key={dIdx} className="flex-1 flex flex-col items-center z-10">
                            <div className="text-[9px] font-extrabold text-amber-700 mb-1">${day.revenue}</div>
                            {/* Bar segment */}
                            <div
                              className="w-10 bg-amber-600 hover:bg-stone-900 rounded-t transition-all cursor-pointer relative group"
                              style={{ height: `${Math.max(pct * 1.1, 8)}px` }}
                            >
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-stone-900 text-stone-50 text-[9px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity z-50">
                                {day.orders} orders
                              </div>
                            </div>
                            <span className="text-[9px] text-stone-400 font-bold mt-2 uppercase">{day.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popular foods */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm text-left flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider mb-4 flex items-center space-x-1.5">
                        <Star size={14} className="text-amber-500" />
                        <span>Best Selling Delicacies</span>
                      </h3>
                      {stats.popularFoods.length === 0 ? (
                        <p className="text-stone-400 text-xs py-8 text-center">Data accumulates once orders are delivered.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {stats.popularFoods.map((food, fIdx) => (
                            <div key={fIdx} className="flex items-center justify-between text-xs font-semibold text-stone-700">
                              <div className="flex items-center space-x-3 text-left">
                                <img src={food.image} alt={food.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded object-cover border border-stone-200" />
                                <div>
                                  <p className="text-stone-900 font-bold">{food.name}</p>
                                  <p className="text-[10px] text-stone-400 mt-0.5">{food.count} units sold</p>
                                </div>
                              </div>
                              <span className="font-extrabold text-stone-900">${food.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {stats.popularFoods.length > 0 && (
                      <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-[10px] text-stone-500 font-bold text-center mt-3 flex items-center justify-center space-x-1.5 uppercase">
                        <Sparkles size={12} className="text-amber-600 animate-pulse" />
                        <span>Featured items increase order volumes!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent orders ledger quick view */}
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm text-left">
                  <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h3 className="text-xs font-black uppercase text-stone-900 tracking-wider">Latest Orders Dispatch List</h3>
                    <button
                      onClick={() => setSubTab('orders')}
                      className="text-xs font-bold text-amber-700 hover:underline uppercase tracking-wider"
                    >
                      Process all orders &rarr;
                    </button>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-stone-700">
                        <div className="text-left space-y-1">
                          <p className="text-stone-900">ID: <strong className="font-extrabold text-amber-700">{o.id}</strong> • {o.customerName}</p>
                          <p className="text-stone-400 text-[10px] font-semibold">{o.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                          <span className="text-[10px] text-stone-400">{new Date(o.createdAt).toLocaleString()}</span>
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded ${
                            o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* SUBTAB 2: ORDER PROCESSING */}
        {subTab === 'orders' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-stone-200 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
              <div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Active Invoices & Cooking Orders</h2>
                <p className="text-stone-500 text-xs font-semibold">Change cooking statuses, dispatch riders, or reject orders</p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    id="order-admin-search"
                    type="text"
                    placeholder="Search order or client..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-stone-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-stone-850"
                  />
                  <Search className="absolute left-2.5 top-2 text-stone-400" size={14} />
                </div>
                <select
                  id="order-admin-filter"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-stone-300 bg-white rounded-lg text-xs font-semibold text-stone-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4 stroke-[1.2]" />
                <p className="text-stone-850 font-black text-base">No orders matching parameters found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row text-xs font-semibold text-stone-700">
                    
                    {/* Left details pane */}
                    <div className="p-5 flex-1 space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-stone-400 text-[10px] uppercase font-bold">Order Session</p>
                          <h4 className="text-base font-black text-stone-900 mt-0.5">{order.id}</h4>
                          <p className="text-stone-400 text-[10px] mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm ${
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed border-t border-dashed border-stone-150 pt-4">
                        <div>
                          <p className="text-stone-900 font-extrabold">Delivery Coordinates</p>
                          <p className="text-stone-600 mt-1">{order.customerName} • {order.customerPhone}</p>
                          <p className="text-stone-600 mt-0.5">{order.deliveryAddress}</p>
                          {order.landmark && <p className="text-stone-400 text-[11px] mt-0.5">Landmark: {order.landmark}</p>}
                        </div>
                        <div>
                          <p className="text-stone-900 font-extrabold">Dispatch / Notes</p>
                          <p className="text-stone-600 mt-1 italic">Notes: "{order.notes || 'None specify.'}"</p>
                          <p className="text-stone-600 mt-1">Rider Assigned: <strong className="text-stone-900 font-black">{order.deliveryBoyName || 'None assigned yet'}</strong></p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 mt-2">
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">Food Items Ledger</p>
                        <div className="divide-y divide-stone-200/50">
                          {order.items.map(it => (
                            <div key={it.menuItemId} className="flex justify-between py-1 text-xs">
                              <span className="text-stone-700">{it.name} <strong className="text-stone-400 font-extrabold">x{it.quantity}</strong></span>
                              <span className="text-stone-900 font-extrabold">${(it.price * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between pt-2 mt-2 border-t border-dashed border-stone-300 text-xs font-black text-stone-950">
                          <span>Subtotal & Tax</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right admin actions pane */}
                    <div className="bg-stone-50 border-t md:border-t-0 md:border-l border-stone-200 p-5 w-full md:w-72 text-left flex flex-col justify-between space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2.5">Update Cooking Status</p>
                        <div className="grid grid-cols-1 gap-2">
                          {order.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, { status: 'Accepted' })}
                                className="bg-emerald-600 hover:bg-emerald-700 text-stone-50 py-1.5 rounded text-[11px] uppercase font-bold transition-colors shadow-sm"
                              >
                                Accept Order ✔
                              </button>
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, { status: 'Cancelled' })}
                                className="bg-red-600 hover:bg-red-700 text-stone-50 py-1.5 rounded text-[11px] uppercase font-bold transition-colors shadow-sm"
                              >
                                Reject Order ❌
                              </button>
                            </>
                          )}
                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, { status: 'Preparing' })}
                              className="bg-amber-600 hover:bg-amber-700 text-stone-50 py-1.5 rounded text-[11px] uppercase font-bold transition-colors shadow-sm"
                            >
                              Mark Preparing 🍳
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, { status: 'Ready' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-stone-50 py-1.5 rounded text-[11px] uppercase font-bold transition-colors shadow-sm"
                            >
                              Mark Ready / cooked 📦
                            </button>
                          )}
                          {order.status === 'Ready' && !order.deliveryBoyId && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-[10px] font-semibold leading-normal">
                              ⚠️ Order cooked! Please assign a Delivery Partner to route dispatch.
                            </div>
                          )}
                          {order.status === 'Ready' && order.deliveryBoyId && (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-emerald-800 text-[10px] font-semibold leading-normal">
                              👍 Assigned to {order.deliveryBoyName}. Waiting for Rider pickup.
                            </div>
                          )}
                          {order.status === 'Out for Delivery' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, { status: 'Delivered' })}
                              className="bg-emerald-600 hover:bg-emerald-700 text-stone-50 py-1.5 rounded text-[11px] uppercase font-bold transition-colors shadow-sm"
                            >
                              Mark Delivered ✔
                            </button>
                          )}
                          {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                            <div className="bg-stone-200 border border-stone-300 p-3 rounded text-stone-600 text-center text-[10px] font-bold uppercase">
                              Order Complete
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Assign Box */}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Assign Dispatch Rider</p>
                          <div className="flex space-x-2">
                            <select
                              id={`rider-select-${order.id}`}
                              defaultValue={order.deliveryBoyId || ''}
                              onChange={(e) => {
                                if (e.target.value === 'u2') {
                                  onUpdateOrderStatus(order.id, { deliveryBoyId: 'u2', deliveryBoyName: 'Rider Roy' });
                                }
                              }}
                              className="flex-1 bg-white border border-stone-300 p-1.5 rounded text-xs font-semibold text-stone-800 focus:outline-none"
                            >
                              <option value="">-- No Rider --</option>
                              <option value="u2">Rider Roy (Pre-seeded Boy)</option>
                            </select>
                            <span className="p-1.5 bg-stone-900 text-stone-50 rounded flex items-center justify-center">
                              <Bike size={14} />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: FOOD ITEMS MANAGEMENT */}
        {subTab === 'menu' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-stone-200 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Artisan Food Menu Management</h2>
                <p className="text-stone-500 text-xs font-semibold">Perform CRUD edits on dishes, toggles, prices, or discounts</p>
              </div>
              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuName('');
                  setMenuDesc('');
                  setMenuPrice('');
                  setMenuImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
                  setMenuCatId(categories[0]?.id || '');
                  setMenuIsAvailable(true);
                  setMenuIsFeatured(false);
                  setMenuDiscount('0');
                  setShowMenuForm(!showMenuForm);
                }}
                className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider shadow flex items-center space-x-1.5"
              >
                {showMenuForm ? <X size={14} /> : <Plus size={14} />}
                <span>{showMenuForm ? 'Close form' : 'Add food item'}</span>
              </button>
            </div>

            {/* Menu Form */}
            {showMenuForm && (
              <form onSubmit={handleMenuItemSubmit} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs font-bold text-stone-700">
                <div className="space-y-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Dish Name</label>
                    <input
                      id="menu-form-name"
                      type="text"
                      required
                      placeholder="e.g. Bacon Cheddar Burger"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-850 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Description / Ingredients</label>
                    <textarea
                      id="menu-form-desc"
                      rows={3}
                      required
                      placeholder="e.g. Triple smoked crispy bacon, sharp cheddar cheese..."
                      value={menuDesc}
                      onChange={(e) => setMenuDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-850 font-semibold"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Price ($)</label>
                      <input
                        id="menu-form-price"
                        type="number"
                        step="0.01"
                        required
                        placeholder="14.99"
                        value={menuPrice}
                        onChange={(e) => setMenuPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Discount (%)</label>
                      <input
                        id="menu-form-discount"
                        type="number"
                        placeholder="0 for no discount"
                        value={menuDiscount}
                        onChange={(e) => setMenuDiscount(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Menu Category</label>
                    <select
                      id="menu-form-category"
                      value={menuCatId}
                      onChange={(e) => setMenuCatId(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Dish Image URL</label>
                    <input
                      id="menu-form-image"
                      type="url"
                      placeholder="Paste Unsplash or high-quality food image URL"
                      value={menuImage}
                      onChange={(e) => setMenuImage(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-850"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        id="menu-form-available"
                        type="checkbox"
                        checked={menuIsAvailable}
                        onChange={(e) => setMenuIsAvailable(e.target.checked)}
                        className="h-4 w-4 text-stone-900 border-stone-300 rounded"
                      />
                      <span>Item Available</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        id="menu-form-featured"
                        type="checkbox"
                        checked={menuIsFeatured}
                        onChange={(e) => setMenuIsFeatured(e.target.checked)}
                        className="h-4 w-4 text-stone-900 border-stone-300 rounded"
                      />
                      <span>Featured Special⭐</span>
                    </label>
                  </div>

                  <button
                    id="menu-form-save-btn"
                    type="submit"
                    className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-black py-2.5 rounded-lg uppercase tracking-wider text-[11px] shadow-md hover:shadow mt-2"
                  >
                    Save Dish details
                  </button>
                </div>
              </form>
            )}

            {/* Menu List Table */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Dish details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Base Price</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Available</th>
                      <th className="px-6 py-4">Special</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 font-semibold">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3.5">
                          <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded object-cover border border-stone-200 shrink-0" />
                          <div>
                            <p className="text-stone-950 font-extrabold text-sm">{item.name}</p>
                            <p className="text-stone-400 text-[10px] line-clamp-1 max-w-xs">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {categories.find(c => c.id === item.categoryId)?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 font-black text-stone-900">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {item.discountPercent > 0 ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black">
                              {item.discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="text-stone-400 font-medium">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Yes' : 'Sold Out'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.isFeatured ? (
                            <span className="text-amber-500 font-bold" title="Featured Special">⭐</span>
                          ) : (
                            <span className="text-stone-300 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 shrink-0 whitespace-nowrap">
                          <button
                            id={`edit-item-${item.id}`}
                            onClick={() => {
                              setEditingMenuItem(item);
                              setMenuName(item.name);
                              setMenuDesc(item.description);
                              setMenuPrice(item.price.toString());
                              setMenuImage(item.image);
                              setMenuCatId(item.categoryId);
                              setMenuIsAvailable(item.isAvailable);
                              setMenuIsFeatured(item.isFeatured);
                              setMenuDiscount(item.discountPercent.toString());
                              setShowMenuForm(true);
                            }}
                            className="p-1.5 border border-stone-300 hover:border-stone-850 hover:bg-stone-50 rounded text-stone-600 hover:text-stone-900 transition-all inline-block"
                            title="Edit Item"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            id={`delete-item-${item.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                onDeleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 border border-red-200 hover:border-red-500 hover:bg-red-50 rounded text-red-650 hover:text-red-750 transition-all inline-block"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: CATEGORIES CONFIG */}
        {subTab === 'categories' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-stone-200 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Category Hierarchy Config</h2>
                <p className="text-stone-500 text-xs font-semibold">Organize categories and allocate Lucide representation icons</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCatName('');
                  setCatIcon('soup');
                  setCatDesc('');
                  setShowCatForm(!showCatForm);
                }}
                className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider shadow flex items-center space-x-1.5"
              >
                {showCatForm ? <X size={14} /> : <Plus size={14} />}
                <span>{showCatForm ? 'Close form' : 'Add Category'}</span>
              </button>
            </div>

            {/* Category Form */}
            {showCatForm && (
              <form onSubmit={handleCategorySubmit} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm max-w-xl text-left text-xs font-bold text-stone-700 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Category Name</label>
                    <input
                      id="cat-form-name"
                      type="text"
                      required
                      placeholder="e.g. Sizzling Starters"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-850 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Lucide Icon identifier</label>
                    <select
                      id="cat-form-icon"
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                    >
                      <option value="sandwich">sandwich 🥪</option>
                      <option value="pizza">pizza 🍕</option>
                      <option value="soup">soup 🍲</option>
                      <option value="cake">cake 🍰</option>
                      <option value="glass-water">glass-water 🍹</option>
                      <option value="salad">salad 🥗</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[10px] text-stone-500 mb-1">Brief Description</label>
                  <input
                    id="cat-form-desc"
                    type="text"
                    placeholder="e.g. Fresh wood-fired starters cooked in olive oil..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-850"
                  />
                </div>

                <button
                  id="cat-form-save-btn"
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-black py-2.5 rounded-lg uppercase tracking-wider text-[11px]"
                >
                  Save Category Hierarchy
                </button>
              </form>
            )}

            {/* Categories list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm text-left flex justify-between items-start space-x-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 bg-stone-100 rounded-lg border border-stone-200 inline-block font-black text-sm">
                        {cat.icon === 'sandwich' ? '🥪' : cat.icon === 'pizza' ? '🍕' : cat.icon === 'soup' ? '🍲' : cat.icon === 'cake' ? '🍰' : cat.icon === 'glass-water' ? '🍹' : '🥗'}
                      </span>
                      <h4 className="text-base font-extrabold text-stone-900">{cat.name}</h4>
                    </div>
                    <p className="text-stone-400 text-[11px] leading-normal font-semibold pt-1">{cat.description || 'No description listed.'}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block mt-2 ${
                      cat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cat.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1.5 shrink-0">
                    <button
                      id={`edit-cat-${cat.id}`}
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatIcon(cat.icon);
                        setCatDesc(cat.description);
                        setShowCatForm(true);
                      }}
                      className="p-1.5 border border-stone-300 hover:border-stone-850 hover:bg-stone-50 rounded text-stone-600 hover:text-stone-900 transition-all"
                      title="Edit Category"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      id={`delete-cat-${cat.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete category ${cat.name}? This will purge associated menu items!`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 border border-red-200 hover:border-red-500 hover:bg-red-50 rounded text-red-650 hover:text-red-750 transition-all"
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 5: RESTAURANT CONFIG */}
        {subTab === 'settings' && (
          <form onSubmit={handleSettingsSubmit} className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm text-left text-xs font-bold text-stone-700 space-y-6">
            <div className="pb-2 border-b border-stone-250/80">
              <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight flex items-center space-x-2">
                <SettingsIcon size={20} className="text-stone-800" />
                <span>Restaurant Settings & Configurations</span>
              </h2>
              <p className="text-stone-500 text-xs font-semibold">Store name, details, pricing constraints, opening hours, etc.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Core Details */}
              <div className="space-y-4">
                <h3 className="text-stone-900 uppercase tracking-widest text-[10px] font-black pb-1.5 border-b border-stone-150">Gourmet Core Specs</h3>
                
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">Restaurant Name</label>
                  <input
                    id="settings-form-name"
                    type="text"
                    required
                    value={setRestName}
                    onChange={(e) => setSetRestName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Logo URL</label>
                    <input
                      id="settings-form-logo"
                      type="url"
                      value={setLogo}
                      onChange={(e) => setSetLogo(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Banner Photo URL</label>
                    <input
                      id="settings-form-banner"
                      type="url"
                      value={setBanner}
                      onChange={(e) => setSetBanner(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Support Email</label>
                    <input
                      id="settings-form-email"
                      type="email"
                      value={setEmail}
                      onChange={(e) => setSetEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Support Phone</label>
                    <input
                      id="settings-form-phone"
                      type="tel"
                      value={setPhone}
                      onChange={(e) => setSetPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">Gourmet Address Coordinates</label>
                  <input
                    id="settings-form-address"
                    type="text"
                    value={setAddress}
                    onChange={(e) => setSetAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Kitchen Scheduling & Charges */}
              <div className="space-y-4">
                <h3 className="text-stone-900 uppercase tracking-widest text-[10px] font-black pb-1.5 border-b border-stone-150">Rates & Hours</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Delivery Fee ($)</label>
                    <input
                      id="settings-form-charge"
                      type="number"
                      step="0.01"
                      value={setDeliveryCharge}
                      onChange={(e) => setSetDeliveryCharge(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Min Order Requirement ($)</label>
                    <input
                      id="settings-form-min"
                      type="number"
                      step="0.01"
                      value={setMinOrder}
                      onChange={(e) => setSetMinOrder(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Opening Hours</label>
                    <input
                      id="settings-form-open"
                      type="text"
                      value={setOpenHours}
                      onChange={(e) => setSetOpenHours(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-stone-400 mb-1">Closing Hours</label>
                    <input
                      id="settings-form-close"
                      type="text"
                      value={setCloseHours}
                      onChange={(e) => setSetCloseHours(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">About Content Description</label>
                  <textarea
                    id="settings-form-about"
                    rows={3}
                    value={setAbout}
                    onChange={(e) => setSetAbout(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-stone-900 uppercase tracking-widest text-[10px] font-black pb-1.5 border-b border-stone-150">Social Media & Public Outreach</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">Facebook Handle</label>
                  <input
                    id="settings-form-fb"
                    type="url"
                    value={setFb}
                    onChange={(e) => setSetFb(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">Twitter Handle</label>
                  <input
                    id="settings-form-tw"
                    type="url"
                    value={setTw}
                    onChange={(e) => setSetTw(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 mb-1">Instagram Handle</label>
                  <input
                    id="settings-form-insta"
                    type="url"
                    value={setInsta}
                    onChange={(e) => setSetInsta(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <button
                id="settings-form-save-btn"
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-black px-8 py-3.5 rounded-xl uppercase tracking-wider text-[11px] shadow-lg hover:shadow transition-all"
              >
                Save configurations
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 5: USERS & DELIVERY PARTNERS MANAGEMENT */}
        {subTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">User & Delivery Partner Directory</h2>
                <p className="text-stone-500 text-xs font-semibold">Review delivery partner applications, manage admin staff, and inspect accounts</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchUsersList}
                  className="p-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 rounded-lg shadow-sm transition-colors"
                  title="Refresh User Directory"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow"
                >
                  <Plus size={15} />
                  <span>Create Admin</span>
                </button>
              </div>
            </div>

            {/* Create Admin Form Modal / Card */}
            {showAdminForm && (
              <div className="bg-white border-2 border-stone-900 rounded-xl p-5 shadow-lg max-w-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">Create New Administrator Account</h3>
                  <button
                    onClick={() => setShowAdminForm(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                {adminFormErr && (
                  <div className="mb-3 p-2.5 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg font-bold">
                    {adminFormErr}
                  </div>
                )}
                {adminFormMsg && (
                  <div className="mb-3 p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-bold">
                    {adminFormMsg}
                  </div>
                )}

                <form onSubmit={handleCreateAdminSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Admin Name"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@restaurant.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={newAdminPhone}
                        onChange={(e) => setNewAdminPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdminForm(false)}
                      className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                    >
                      {creatingAdmin ? 'Creating...' : 'Save Admin'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Role Category Tabs */}
            <div className="flex space-x-2 border-b border-stone-200 pb-2">
              {[
                { id: 'delivery', label: 'Delivery Partners', icon: <Bike size={14} /> },
                { id: 'admin', label: 'Admins & Staff', icon: <ShieldCheck size={14} /> },
                { id: 'customer', label: 'Customers', icon: <Users size={14} /> },
                { id: 'all', label: 'All Accounts', icon: <Users size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUserRoleFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all ${
                    userRoleFilter === tab.id
                      ? 'bg-stone-900 text-white shadow'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Delivery Partner Status Sub-Filter */}
            {userRoleFilter === 'delivery' && (
              <div className="flex items-center space-x-2 bg-stone-100 p-2 rounded-lg">
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Status:</span>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setDeliveryStatusFilter(st)}
                    className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md transition-all ${
                      deliveryStatusFilter === st
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-white text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}

            {loadingUsers ? (
              <div className="py-16 text-center">
                <span className="inline-block w-7 h-7 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></span>
                <p className="text-stone-400 text-xs mt-2 font-medium">Fetching accounts from Firestore...</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 border-b border-stone-200 text-[10px] font-black uppercase text-stone-500 tracking-wider">
                      <tr>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Contact Details</th>
                        <th className="p-3.5">Vehicle Specs</th>
                        <th className="p-3.5">Approval Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {usersList
                        .filter(u => {
                          if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
                          if (u.role === 'delivery' && deliveryStatusFilter !== 'all') {
                            const status = u.approvalStatus || 'approved';
                            if (status !== deliveryStatusFilter) return false;
                          }
                          return true;
                        })
                        .map(u => {
                          const status = u.approvalStatus || 'approved';
                          return (
                            <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5">
                                <p className="font-extrabold text-stone-900">{u.name}</p>
                                <p className="text-[11px] text-stone-500">{u.email}</p>
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : u.role === 'delivery'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <p className="text-stone-800 font-medium">{u.phone || 'N/A'}</p>
                                <p className="text-[10px] text-stone-500 truncate max-w-xs">{u.address || 'N/A'}</p>
                              </td>
                              <td className="p-3.5">
                                {u.role === 'delivery' ? (
                                  <div>
                                    <p className="font-bold text-stone-800">{u.vehicleType || 'Bike'}</p>
                                    <p className="text-[10px] text-stone-500 font-mono">{u.licenseNumber || 'N/A'}</p>
                                  </div>
                                ) : (
                                  <span className="text-stone-400">—</span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                                  status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}>
                                  {status === 'approved' && <Check size={12} />}
                                  {status === 'pending' && <Clock size={12} />}
                                  {status === 'rejected' && <X size={12} />}
                                  <span>{status}</span>
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                {u.role === 'delivery' && (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    {status !== 'approved' && (
                                      <button
                                        onClick={() => handleApproveDeliveryPartner(u.id, 'approved')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow"
                                        title="Approve Delivery Partner"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {status !== 'rejected' && (
                                      <button
                                        onClick={() => handleApproveDeliveryPartner(u.id, 'rejected')}
                                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow"
                                        title="Reject Delivery Partner"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
