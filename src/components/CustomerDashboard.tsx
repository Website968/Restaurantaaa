import React, { useState, useEffect } from 'react';
import { Search, Heart, Plus, Minus, ShoppingBag, MapPin, Phone, Clock, ExternalLink, ChevronRight, Check, Trash2, ArrowLeft, Gift, QrCode, Tag, CreditCard, HelpCircle, LogOut, Star, MessageSquare, Flame } from 'lucide-react';
import { MenuItem, Category, Order, CartItem, User, RestaurantSettings } from '../types';

interface CustomerDashboardProps {
  user: User | null;
  categories: Category[];
  menuItems: MenuItem[];
  settings: RestaurantSettings | null;
  orders: Order[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQty: (itemId: string, qty: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderPayload: any) => Promise<Order>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onTabChange: (tab: string) => void;
  currentTab: string;
}

export default function CustomerDashboard({
  user,
  categories,
  menuItems,
  settings,
  orders,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  onCancelOrder,
  onTabChange,
  currentTab
}: CustomerDashboardProps) {
  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Checkout states (Screenshot 1)
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [paymentMethod, setPaymentMethod] = useState<'UPI/QR' | 'Cash'>('UPI/QR');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Address & Checkout Form
  const [checkoutName, setCheckoutName] = useState(user?.name || 'Prakash');
  const [checkoutPhone, setCheckoutPhone] = useState(user?.phone || '+91 9876543210');
  const [checkoutAddress, setCheckoutAddress] = useState(user?.address || 'Station Road, Sribhumi, Assam, 788710');
  const [checkoutLandmark, setCheckoutLandmark] = useState(user?.landmark || '');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (user) {
      setCheckoutName(user.name || '');
      setCheckoutPhone(user.phone || '');
      setCheckoutAddress(user.address || '');
      setCheckoutLandmark(user.landmark || '');
    }
  }, [user]);

  // Calculations
  const getSubtotal = () => {
    return Number(cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0).toFixed(2));
  };

  const deliveryFee = orderType === 'Delivery' ? (settings?.deliveryCharge || 20) : 0;
  const subtotalVal = getSubtotal();
  const discountAmount = Number(((subtotalVal * appliedDiscount) / 100).toFixed(2));
  const finalTotal = Math.max(0, Number((subtotalVal + deliveryFee - discountAmount).toFixed(2)));

  // Apply Coupon Handler
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'MOMO10' || code === 'DREAM10') {
      setAppliedDiscount(10);
      setCouponMsg({ text: 'Coupon MOMO10 applied! 10% discount added.', isError: false });
    } else if (code === 'DREAM20' || code === 'FIRST20') {
      setAppliedDiscount(20);
      setCouponMsg({ text: 'Coupon DREAM20 applied! 20% discount added.', isError: false });
    } else {
      setCouponMsg({ text: 'Invalid coupon code. Try MOMO10 or DREAM20', isError: true });
    }
  };

  // Handle Checkout Order Submission
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }
    setSubmittingOrder(true);
    setOrderError('');

    try {
      const payload = {
        customerId: user?.id || 'guest',
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        deliveryAddress: checkoutAddress,
        landmark: checkoutLandmark,
        orderType,
        paymentMethod,
        couponCode: appliedDiscount > 0 ? couponCode : undefined,
        items: cart.map(c => ({
          menuItemId: c.menuItem.id,
          name: c.menuItem.name,
          quantity: c.quantity,
          price: c.menuItem.price,
          image: c.menuItem.image
        })),
        subtotal: subtotalVal,
        deliveryCharge: deliveryFee,
        tax: 0,
        total: finalTotal
      };

      await onPlaceOrder(payload);
      onClearCart();
      setAppliedDiscount(0);
      setCouponCode('');
      onTabChange('orders');
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Today's special items
  const specialItems = menuItems.filter(i => i.isSpecial || i.isFeatured).slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-stone-100 pb-24 text-left selection:bg-red-600 selection:text-white font-sans">
      
      {/* =========================================================================
          TAB 1: HOME SCREEN (Screenshot 3)
         ========================================================================= */}
      {currentTab === 'home' && (
        <div className="space-y-6">
          {/* Top Hero Banner */}
          <div className="relative bg-[#121212] overflow-hidden rounded-b-2xl border-b border-[#262626]">
            <div className="absolute inset-0 z-0">
              <img
                src={settings?.banner || "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80"}
                alt="Hot Dumplings Banner"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
            </div>

            <div className="relative z-10 px-4 py-12 md:py-16 max-w-4xl mx-auto text-left space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Fresh, Hot &<br />
                <span className="text-red-500">Delicious Momos</span>
              </h1>
              <p className="text-stone-300 text-sm md:text-base font-medium">
                Made with love, served with passion
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => onTabChange('menu')}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-red-900/40 transition-all transform active:scale-95"
                >
                  Order Now
                </button>
                <button
                  onClick={() => onTabChange('menu')}
                  className="border border-stone-600 hover:border-white text-stone-200 hover:text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
                >
                  View Menu
                </button>
              </div>
            </div>
          </div>

          {/* Reward Points Card */}
          <div className="max-w-4xl mx-auto px-4">
            <div
              onClick={() => onTabChange('profile')}
              className="bg-[#121212] border border-[#222222] hover:border-red-600/40 rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all shadow-md group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-950/60 text-red-500 rounded-lg border border-red-900/40">
                  <Gift size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-stone-400 tracking-wider">Your Reward Points</p>
                  <p className="text-base font-black text-white">{user?.rewardPoints || 0} Points</p>
                  <p className="text-[10px] text-stone-400">Earn 1 point for every ₹10 spent</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-500 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Today's Special */}
          <div className="max-w-4xl mx-auto px-4 space-y-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-white tracking-tight">Today's Special</h2>
              <span className="text-red-500 text-sm">★</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {specialItems.map(item => (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden hover:border-[#333333] transition-all flex flex-col justify-between"
                >
                  <div className="relative h-28 sm:h-36 w-full bg-[#181818]">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur p-1 rounded border border-stone-800">
                      <div className={`w-3.5 h-3.5 border ${item.isVeg !== false ? 'border-green-500' : 'border-red-500'} flex items-center justify-center p-0.5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2 leading-snug">{item.description}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                      <span className="text-sm font-black text-red-500">₹{item.price}</span>
                      <button
                        onClick={() => onAddToCart(item)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors flex items-center justify-center"
                        title="Add to cart"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Dumpling Dream */}
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">About Dumpling Dream</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                {settings?.aboutSection || 'Welcome to Dumpling Dream! We serve fresh, authentic, and delicious momos made with love. From traditional steamed momos to crispy fried varieties, we have something for everyone.'}
              </p>

              <div className="pt-2 border-t border-[#1f1f1f] space-y-2 text-xs text-stone-400">
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-red-500 shrink-0" />
                  <span>{settings?.openingHours || '10:00 AM'} - {settings?.closingHours || '10:00 PM'}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings?.address || 'Station Road, Sribhumi, Assam, 788710'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Get in Touch Section */}
          <div className="max-w-4xl mx-auto px-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">Get in Touch</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings?.whatsappNumber || '919876543210'}?text=Hi%20Dumpling%20Dream!%20I%20would%20like%20to%20order%20momos.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-500 flex items-center justify-center border border-emerald-800/40">
                  <MessageSquare size={16} />
                </div>
                <span className="text-[10px] font-bold text-white group-hover:text-emerald-400">WhatsApp</span>
              </a>

              {/* Call Now */}
              <a
                href={`tel:${settings?.contactPhone || '+919876543210'}`}
                className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-red-950 text-red-500 flex items-center justify-center border border-red-800/40">
                  <Phone size={16} />
                </div>
                <span className="text-[10px] font-bold text-white group-hover:text-red-400">Call Now</span>
              </a>

              {/* Location */}
              <a
                href={settings?.locationUrl || "https://maps.google.com/?q=Station+Road,Sribhumi,Assam,788710"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#121212] hover:bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-500 flex items-center justify-center border border-blue-800/40">
                  <MapPin size={16} />
                </div>
                <span className="text-[10px] font-bold text-white group-hover:text-blue-400">Location</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: OUR MENU SCREEN (Screenshot 4)
         ========================================================================= */}
      {currentTab === 'menu' && (
        <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Our Menu</h1>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">Delicious momos for you</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search momos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            <Search className="absolute left-3 top-3 text-stone-500" size={16} />
          </div>

          {/* Filter Categories Pill Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase whitespace-nowrap transition-all ${
                selectedCategory === '' ? 'bg-red-600 text-white shadow-md' : 'bg-[#181818] border border-[#262626] text-stone-400 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.filter(c => c.active).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'bg-red-600 text-white shadow-md' : 'bg-[#181818] border border-[#262626] text-stone-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {filteredMenuItems.length === 0 ? (
              <div className="bg-[#121212] border border-[#222222] rounded-xl p-12 text-center space-y-2">
                <ShoppingBag size={40} className="mx-auto text-stone-600 stroke-[1.2]" />
                <p className="text-sm font-bold text-white">No momos found</p>
                <p className="text-xs text-stone-500">Try adjusting your search or category filter.</p>
              </div>
            ) : (
              filteredMenuItems.map(item => {
                const cartQty = cart.find(c => c.menuItem.id === item.id)?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    className="bg-[#121212] border border-[#222222] hover:border-[#333333] rounded-xl p-3 sm:p-4 flex items-center space-x-3.5 transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h3 className="font-extrabold text-white text-xs sm:text-sm">{item.name}</h3>
                            {item.isSpecial && (
                              <span className="bg-red-950 text-red-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-red-800/50">
                                ★ Special
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Veg / Non-Veg Indicator Icon */}
                        <div className="shrink-0 p-0.5 bg-black/60 rounded border border-stone-800">
                          <div className={`w-3.5 h-3.5 border ${item.isVeg !== false ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          </div>
                        </div>
                      </div>

                      {/* Spice rating chilis */}
                      {item.spiceLevel && item.spiceLevel > 0 && (
                        <div className="flex items-center space-x-0.5 mt-1">
                          {Array.from({ length: item.spiceLevel }).map((_, idx) => (
                            <span key={idx} className="text-[10px]">🌶️</span>
                          ))}
                        </div>
                      )}

                      {/* Price & Action Button */}
                      <div className="mt-2.5 flex justify-between items-center">
                        <span className="text-sm font-black text-red-500">₹{item.price}</span>

                        {cartQty > 0 ? (
                          <div className="flex items-center space-x-2 bg-[#1a1a1a] border border-[#333333] rounded-lg px-2 py-1">
                            <button
                              onClick={() => onUpdateCartQty(item.id, cartQty - 1)}
                              className="text-stone-300 hover:text-white"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-black text-white px-1">{cartQty}</span>
                            <button
                              onClick={() => onAddToCart(item)}
                              className="text-stone-300 hover:text-white"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(item)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center space-x-1"
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CART & CHECKOUT SCREEN (Screenshot 1)
         ========================================================================= */}
      {currentTab === 'cart' && (
        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Cart</h1>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">{cart.length} items</p>
          </div>

          {cart.length === 0 ? (
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-12 text-center space-y-3">
              <ShoppingBag size={48} className="mx-auto text-stone-600 stroke-[1.2]" />
              <p className="text-sm font-bold text-white">Your cart is empty</p>
              <p className="text-xs text-stone-500">Explore our delicious momos and add them to your cart!</p>
              <button
                onClick={() => onTabChange('menu')}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-2.5">
                {cart.map(item => (
                  <div
                    key={item.menuItem.id}
                    className="bg-[#121212] border border-[#222222] rounded-xl p-3.5 flex items-center justify-between space-x-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.menuItem.name}</h4>
                        <p className="text-xs font-black text-red-500 mt-0.5">₹{item.menuItem.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="flex items-center space-x-2 bg-[#1a1a1a] border border-[#282828] rounded-lg px-2 py-1">
                        <button
                          onClick={() => onUpdateCartQty(item.menuItem.id, item.quantity - 1)}
                          className="bg-red-600 text-white p-0.5 rounded hover:bg-red-700"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-white px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateCartQty(item.menuItem.id, item.quantity + 1)}
                          className="bg-red-600 text-white p-0.5 rounded hover:bg-red-700"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveFromCart(item.menuItem.id)}
                        className="text-stone-500 hover:text-red-500 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Type Selector (Pickup / Delivery) */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-white uppercase tracking-wider block">Order Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setOrderType('Pickup')}
                    className={`bg-[#121212] p-4 rounded-xl cursor-pointer border text-center transition-all ${
                      orderType === 'Pickup'
                        ? 'border-red-600 bg-red-950/20 text-white ring-1 ring-red-600'
                        : 'border-[#222222] text-stone-400 hover:border-[#333333]'
                    }`}
                  >
                    <ShoppingBag size={20} className={`mx-auto mb-1 ${orderType === 'Pickup' ? 'text-red-500' : 'text-stone-500'}`} />
                    <p className="text-xs font-black uppercase">Pickup</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Free</p>
                  </div>

                  <div
                    onClick={() => setOrderType('Delivery')}
                    className={`bg-[#121212] p-4 rounded-xl cursor-pointer border text-center transition-all ${
                      orderType === 'Delivery'
                        ? 'border-red-600 bg-red-950/20 text-white ring-1 ring-red-600'
                        : 'border-[#222222] text-stone-400 hover:border-[#333333]'
                    }`}
                  >
                    <MapPin size={20} className={`mx-auto mb-1 ${orderType === 'Delivery' ? 'text-red-500' : 'text-stone-500'}`} />
                    <p className="text-xs font-black uppercase">Delivery</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">₹{settings?.deliveryCharge || 20}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address input if Delivery */}
              {orderType === 'Delivery' && (
                <div className="bg-[#121212] border border-[#222222] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase text-white">Delivery Details</h4>
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Address</label>
                    <input
                      type="text"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder="Street address..."
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={checkoutLandmark}
                      onChange={(e) => setCheckoutLandmark(e.target.value)}
                      placeholder="Near railway station, etc."
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-white uppercase tracking-wider block">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('Cash')}
                    className={`bg-[#121212] p-4 rounded-xl cursor-pointer border text-center transition-all ${
                      paymentMethod === 'Cash' || paymentMethod === 'COD'
                        ? 'border-red-600 bg-red-950/20 text-white ring-1 ring-red-600'
                        : 'border-[#222222] text-stone-400 hover:border-[#333333]'
                    }`}
                  >
                    <CreditCard size={20} className={`mx-auto mb-1 ${paymentMethod === 'Cash' || paymentMethod === 'COD' ? 'text-red-500' : 'text-stone-500'}`} />
                    <p className="text-xs font-black uppercase">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Pay cash upon delivery</p>
                  </div>

                  <div
                    className="bg-[#121212]/50 p-4 rounded-xl border border-[#222222] text-center opacity-60 cursor-not-allowed"
                    title="Online payment gateway currently unavailable. Please select COD."
                  >
                    <QrCode size={20} className="mx-auto mb-1 text-stone-600" />
                    <p className="text-xs font-black uppercase text-stone-500">Online Gateway</p>
                    <p className="text-[10px] text-red-400 mt-0.5">Unavailable (Use COD)</p>
                  </div>
                </div>
              </div>

              {/* Apply Coupon */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-white uppercase tracking-wider block">Apply Coupon</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. MOMO10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#222222] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[10px] font-bold ${couponMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Bill Summary */}
              <div className="bg-[#121212] border border-[#222222] rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase text-white tracking-wider">Bill Summary</h4>
                <div className="flex justify-between text-xs text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">₹{subtotalVal.toFixed(2)}</span>
                </div>
                {orderType === 'Delivery' && (
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-white">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400 font-bold">
                    <span>Discount ({appliedDiscount}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#222222] pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-black text-white">Total</span>
                  <span className="text-base font-black text-red-500">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl font-bold">
                  {orderError}
                </div>
              )}

              {/* Bottom Sticky Bar for Checkout */}
              <div className="fixed bottom-14 left-0 right-0 z-40 bg-[#121212] border-t border-[#262626] p-3 max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Total Amount</p>
                  <p className="text-lg font-black text-white">₹{finalTotal.toFixed(2)}</p>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={submittingOrder}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-900/50 flex items-center space-x-2 transition-all"
                >
                  <span>{submittingOrder ? 'Placing Order...' : 'Proceed to Checkout →'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: MY ORDERS SCREEN (Screenshot 2)
         ========================================================================= */}
      {currentTab === 'orders' && (
        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">My Orders</h1>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">{orders.length} orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-16 text-center space-y-3 my-8">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto text-stone-500">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-base font-black text-white">No orders yet</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">Start ordering delicious momos!</p>
              <button
                onClick={() => onTabChange('menu')}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(ord => (
                <div key={ord.id} className="bg-[#121212] border border-[#222222] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-stone-500 font-extrabold uppercase">Order ID</p>
                      <h4 className="text-sm font-black text-white">{ord.id}</h4>
                      <p className="text-[10px] text-stone-400">{new Date(ord.createdAt).toLocaleString()}</p>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                      ord.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      ord.status === 'Cancelled' ? 'bg-red-950 text-red-400 border-red-800' :
                      'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="border-t border-[#1f1f1f] pt-3 text-xs space-y-2 text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Items:</span>
                      <span className="font-bold text-white">
                        {ord.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Type & Payment:</span>
                      <span className="font-bold text-stone-200">
                        {ord.orderType || 'Pickup'} • {ord.paymentMethod || 'UPI/QR'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-stone-400 font-medium">Total Billed:</span>
                      <span className="text-sm font-black text-red-500">₹{ord.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {ord.status === 'Pending' && (
                    <div className="border-t border-[#1f1f1f] pt-2.5 text-right">
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to cancel this order?')) {
                            await onCancelOrder(ord.id);
                          }
                        }}
                        className="bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: PROFILE SCREEN (Screenshot 5)
         ========================================================================= */}
      {currentTab === 'profile' && (
        <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
          {/* Top Avatar & User details */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-red-600 text-white rounded-full mx-auto flex items-center justify-center font-black text-2xl shadow-xl shadow-red-900/40 border-2 border-red-500">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <h2 className="text-xl font-black text-white">{user?.name || 'Prakash'}</h2>
            <p className="text-xs text-stone-400">{user?.email || 'pronotoshbhattacharjee@gmail.com'}</p>
          </div>

          {/* Reward Points Banner */}
          <div className="bg-[#121212] border border-[#222222] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-950 text-red-500 rounded-lg">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-extrabold text-stone-400">Your Reward Points</p>
                <p className="text-base font-black text-white">{user?.rewardPoints || 0}</p>
                <p className="text-[10px] text-stone-400">Earn 1 point for every ₹10 spent</p>
              </div>
            </div>
          </div>

          {/* Profile Options List */}
          <div className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden divide-y divide-[#1f1f1f] text-xs">
            <div className="p-3.5 flex justify-between items-center text-stone-200">
              <div className="flex items-center space-x-3">
                <Gift size={16} className="text-red-500" />
                <span className="font-extrabold">Reward Points</span>
              </div>
              <span className="text-stone-400 font-bold">{user?.rewardPoints || 0} pts &gt;</span>
            </div>

            <div
              onClick={() => {
                navigator.clipboard?.writeText(user?.referralCode || '27ZDUZRC');
                setCopiedReferral(true);
                setTimeout(() => setCopiedReferral(false), 3000);
              }}
              className="p-3.5 flex justify-between items-center text-stone-200 cursor-pointer hover:bg-[#181818]"
            >
              <div className="flex items-center space-x-3">
                <Tag size={16} className="text-red-500" />
                <span className="font-extrabold">Referral Code</span>
              </div>
              <span className="text-stone-400 font-bold">
                {copiedReferral ? 'Copied! ✓' : `${user?.referralCode || '27ZDUZRC'} >`}
              </span>
            </div>

            <div
              onClick={() => setShowQRModal(true)}
              className="p-3.5 flex justify-between items-center text-stone-200 cursor-pointer hover:bg-[#181818]"
            >
              <div className="flex items-center space-x-3">
                <QrCode size={16} className="text-red-500" />
                <span className="font-extrabold">Show QR Code</span>
              </div>
              <span className="text-stone-400 font-bold">&gt;</span>
            </div>

            <div className="p-3.5 flex justify-between items-center text-stone-200">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-red-500" />
                <span className="font-extrabold">Saved Addresses</span>
              </div>
              <span className="text-stone-400 font-bold">&gt;</span>
            </div>

            <div className="p-3.5 flex justify-between items-center text-stone-200">
              <div className="flex items-center space-x-3">
                <CreditCard size={16} className="text-red-500" />
                <span className="font-extrabold">Payment Methods</span>
              </div>
              <span className="text-stone-400 font-bold">&gt;</span>
            </div>

            <div
              onClick={() => setShowHelpModal(true)}
              className="p-3.5 flex justify-between items-center text-stone-200 cursor-pointer hover:bg-[#181818]"
            >
              <div className="flex items-center space-x-3">
                <HelpCircle size={16} className="text-red-500" />
                <span className="font-extrabold">Help & Support</span>
              </div>
              <span className="text-stone-400 font-bold">&gt;</span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                onTabChange('login');
              }
            }}
            className="w-full border border-red-600/60 text-red-500 hover:bg-red-950/40 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-black text-white">Your Customer QR</h3>
            <div className="p-4 bg-white rounded-xl inline-block mx-auto">
              {/* Mock QR Code representation */}
              <div className="w-40 h-40 bg-stone-900 p-2 flex flex-col justify-between items-center rounded">
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 bg-white"></div>
                  <div className="w-10 h-10 bg-white"></div>
                </div>
                <p className="text-[10px] text-white font-mono">{user?.referralCode || '27ZDUZRC'}</p>
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 bg-white"></div>
                  <div className="w-10 h-10 bg-white"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400">Scan at store counter to redeem reward points!</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-red-600 text-white font-bold py-2 rounded-xl text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full text-left space-y-4">
            <h3 className="text-base font-black text-white">Dumpling Dream Support</h3>
            <div className="space-y-2 text-xs text-stone-300">
              <p>📍 <strong>Address:</strong> Station Road, Sribhumi, Assam, 788710</p>
              <p>📞 <strong>Phone:</strong> +91 9876543210</p>
              <p>📧 <strong>Email:</strong> pronotoshbhattacharjee@gmail.com</p>
              <p>🕐 <strong>Hours:</strong> 10:00 AM - 10:00 PM</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-red-600 text-white font-bold py-2 rounded-xl text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
