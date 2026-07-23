import React, { useState } from 'react';
import { ShoppingBag, Bell, LogOut, User as UserIcon, Shield, Bike, Utensils, Check, Home, Menu, ShoppingCart, Clock, MapPin, Gift, Copy } from 'lucide-react';
import { User, Notification, RestaurantSettings } from '../types';

interface NavbarProps {
  user: User | null;
  settings: RestaurantSettings | null;
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
    <>
      {/* 1. TOP NAVBAR */}
      <nav id="app-navbar" className="bg-[#121212] border-b border-[#262626] sticky top-0 z-40 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                if (!user) onTabChange('login');
                else if (user.role === 'admin') onTabChange('dashboard');
                else if (user.role === 'delivery') onTabChange('delivery-orders');
                else onTabChange('home');
              }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-red-600/50 flex items-center justify-center bg-[#1a1a1a] shrink-0 shadow-md">
                {settings?.logo ? (
                  <img src={settings.logo} alt="Dumpling Dream Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🥟</span>
                )}
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight text-white block leading-none">
                  {settings?.restaurantName || 'Dumpling Dream'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 block mt-0.5">
                  Fresh, Hot & Delicious Momos
                </span>
              </div>
            </div>

            {/* Admin / Delivery Portal Tabs (if logged in as admin/delivery) */}
            {user && user.role === 'admin' && (
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange('admin-menu')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'admin-menu' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Manage Menu
                </button>
                <button
                  onClick={() => onTabChange('admin-orders')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'admin-orders' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => onTabChange('admin-users')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'admin-users' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => onTabChange('admin-settings')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'admin-settings' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Settings
                </button>
              </div>
            )}

            {user && user.role === 'delivery' && (
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onTabChange('delivery-orders')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'delivery-orders' ? 'bg-red-600 text-white' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Assigned Orders
                </button>
              </div>
            )}

            {/* Desktop Navigation for Customer */}
            {user && user.role === 'customer' && (
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onTabChange('home')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'home' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onTabChange('menu')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'menu' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Our Menu
                </button>
                <button
                  onClick={() => onTabChange('cart')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative ${
                    currentTab === 'cart' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1.5 bg-white text-red-600 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onTabChange('orders')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'orders' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => onTabChange('profile')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    currentTab === 'profile' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-300 hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </div>
            )}

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell Dropdown */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 rounded-full hover:bg-[#1f1f1f] text-stone-300 hover:text-white transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 h-2.5 w-2.5 rounded-full ring-2 ring-[#121212]"></span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                      <div className="flex justify-between items-center px-4 py-2.5 border-b border-[#2a2a2a]">
                        <span className="text-xs font-black uppercase text-white tracking-wider">Alerts ({unreadCount})</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              onReadAllNotifications();
                              setShowNotifDropdown(false);
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline flex items-center space-x-1"
                          >
                            <Check size={12} />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-[#262626]">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-xs text-stone-400 font-medium">No new alerts</p>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className="p-3 text-left hover:bg-[#222222] transition-colors">
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-white">{notif.title}</p>
                                <span className="text-[9px] text-stone-500 font-medium">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-1">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account / Login button */}
              {user ? (
                <div className="flex items-center space-x-2 border-l border-[#282828] pl-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                    <p className="text-[9px] text-red-400 font-semibold capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-[#262626] text-stone-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onTabChange('login')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. BOTTOM NAVIGATION BAR FOR MOBILE */}
      {user && user.role === 'customer' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-[#262626] px-2 py-1.5 flex justify-around items-center text-stone-400">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              currentTab === 'home' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5 font-bold">Home</span>
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              currentTab === 'menu' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            <Utensils size={20} />
            <span className="text-[10px] mt-0.5 font-bold">Menu</span>
          </button>

          <button
            onClick={() => onTabChange('cart')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all relative ${
              currentTab === 'cart' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-[#121212]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-bold">Cart</span>
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              currentTab === 'orders' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            <ShoppingBag size={20} />
            <span className="text-[10px] mt-0.5 font-bold">Orders</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              currentTab === 'profile' ? 'text-red-500 font-bold' : 'hover:text-white'
            }`}
          >
            <UserIcon size={20} />
            <span className="text-[10px] mt-0.5 font-bold">Profile</span>
          </button>
        </div>
      )}
    </>
  );
}
