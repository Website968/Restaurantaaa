import { useState } from 'react';
import { ShoppingCart, Bell, LogOut, User as UserIcon, Shield, Bike, UtensilsCrossed, Check } from 'lucide-react';
import { User, Notification } from '../types';

interface NavbarProps {
  user: User | null;
  settings: any;
  cartCount: number;
  onCartToggle: () => void;
  notifications: Notification[];
  onReadAllNotifications: () => void;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
  currentTab: string;
}

export default function Navbar({
  user,
  settings,
  cartCount,
  onCartToggle,
  notifications,
  onReadAllNotifications,
  onLogout,
  onTabChange,
  currentTab
}: NavbarProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav id="app-navbar" className="bg-white border-b border-stone-200/80 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('home')}>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 flex items-center justify-center bg-stone-50">
              {settings?.logo ? (
                <img src={settings.logo} alt="Restaurant Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <UtensilsCrossed className="text-stone-800" size={20} />
              )}
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-stone-900 block leading-none">
                {settings?.restaurantName || 'The Gourmet Craft'}
              </span>
              {user && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {user.role === 'admin' ? '🛡️ Admin Console' : user.role === 'delivery' ? '🚴 Delivery Portal' : '✨ Gastronomer'}
                </span>
              )}
            </div>
          </div>

          {/* Nav Tabs for Admin / Delivery */}
          {user && user.role === 'admin' && (
            <div className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-dashboard"
                onClick={() => onTabChange('dashboard')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'dashboard' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Dashboard
              </button>
              <button
                id="nav-tab-menu"
                onClick={() => onTabChange('menu')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'menu' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Menu Items
              </button>
              <button
                id="nav-tab-categories"
                onClick={() => onTabChange('categories')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'categories' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Categories
              </button>
              <button
                id="nav-tab-orders"
                onClick={() => onTabChange('orders')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'orders' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Orders
              </button>
              <button
                id="nav-tab-settings"
                onClick={() => onTabChange('settings')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'settings' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Restaurant Settings
              </button>
            </div>
          )}

          {user && user.role === 'delivery' && (
            <div className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-delivery-orders"
                onClick={() => onTabChange('delivery-orders')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'delivery-orders' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Assigned Orders
              </button>
              <button
                id="nav-tab-delivery-history"
                onClick={() => onTabChange('delivery-history')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'delivery-history' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Delivery History
              </button>
            </div>
          )}

          {user && user.role === 'customer' && (
            <div className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-home"
                onClick={() => onTabChange('home')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'home' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                Order Online
              </button>
              <button
                id="nav-tab-my-orders"
                onClick={() => onTabChange('my-orders')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'my-orders' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                My Orders
              </button>
              <button
                id="nav-tab-profile"
                onClick={() => onTabChange('profile')}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  currentTab === 'profile' ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                My Profile
              </button>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="flex items-center space-x-3">
            {/* Shopping Cart button (only for customers/guests) */}
            {(!user || user.role === 'customer') && (
              <button
                id="navbar-cart-btn"
                onClick={onCartToggle}
                className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-800 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span id="cart-badge" className="absolute -top-1 -right-1 bg-amber-600 text-stone-50 text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="relative">
                <button
                  id="navbar-notif-bell"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-800 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span id="notif-badge" className="absolute top-1 right-1 bg-red-600 h-2.5 w-2.5 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div id="notif-dropdown" className="absolute right-0 mt-3 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-stone-100">
                      <span className="text-xs font-black uppercase text-stone-800 tracking-wider">Alerts & Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          id="notif-read-all-btn"
                          onClick={() => {
                            onReadAllNotifications();
                            setShowNotifDropdown(false);
                          }}
                          className="text-[10px] font-bold text-amber-700 hover:underline flex items-center space-x-1"
                        >
                          <Check size={12} />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-stone-500 font-medium">You have no new alerts</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3.5 text-left hover:bg-stone-50 transition-colors ${!notif.read ? 'bg-amber-50/40' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-stone-900 font-black' : 'text-stone-700'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[9px] text-stone-400 font-medium">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-1 leading-normal font-medium">{notif.message}</p>
                            {notif.orderId && (
                              <button
                                onClick={() => {
                                  onTabChange(user.role === 'admin' ? 'orders' : user.role === 'delivery' ? 'delivery-orders' : 'my-orders');
                                  setShowNotifDropdown(false);
                                }}
                                className="text-[10px] text-stone-800 hover:underline font-bold mt-1 block"
                              >
                                View Order {notif.orderId}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login Indicator */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-stone-200 pl-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-stone-900 leading-tight">{user.name}</p>
                  <p className="text-[9px] text-stone-500 font-semibold capitalize">{user.role}</p>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-2.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-red-700 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => onTabChange('login')}
                className="bg-stone-900 text-stone-50 px-4 py-2 rounded-lg font-bold hover:bg-stone-800 transition-all text-xs uppercase tracking-wider shadow-sm"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
