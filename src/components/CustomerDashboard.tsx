import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, Plus, Minus, ShoppingCart, ShoppingBag, MapPin, Phone, Info, Clock, ExternalLink, X, ChevronRight, Check, Trash2, ArrowLeft } from 'lucide-react';
import { MenuItem, Category, Order, CartItem, User } from '../types';

interface CustomerDashboardProps {
  user: User | null;
  categories: Category[];
  menuItems: MenuItem[];
  settings: any;
  orders: Order[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQty: (itemId: string, qty: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (formData: any) => Promise<Order>;
  onCancelOrder: (orderId: string) => Promise<void>;
  onTabChange: (tab: string) => void;
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
  onTabChange
}: CustomerDashboardProps) {
  // Navigation states
  const [activeView, setActiveView] = useState<'browse' | 'checkout' | 'order-tracking'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default'); // 'default' | 'price-asc' | 'price-desc' | 'discount'
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  
  // Product Detail Modal State
  const [detailedItem, setDetailedItem] = useState<MenuItem | null>(null);
  
  // Active tracking order ID
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Form states for checkout
  const [checkoutName, setCheckoutName] = useState(user?.name || '');
  const [checkoutPhone, setCheckoutPhone] = useState(user?.phone || '');
  const [checkoutAddress, setCheckoutAddress] = useState(user?.address || '');
  const [checkoutLandmark, setCheckoutLandmark] = useState(user?.landmark || '');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Sync user info to form when user changes
  useEffect(() => {
    if (user) {
      setCheckoutName(user.name || '');
      setCheckoutPhone(user.phone || '');
      setCheckoutAddress(user.address || '');
      setCheckoutLandmark(user.landmark || '');
    }
  }, [user]);

  // Calculations
  const getDiscountedPrice = (item: MenuItem) => {
    if (item.discountPercent > 0) {
      return Number((item.price * (1 - item.discountPercent / 100)).toFixed(2));
    }
    return item.price;
  };

  const getSubtotal = () => {
    return Number(cart.reduce((sum, item) => sum + getDiscountedPrice(item.menuItem) * item.quantity, 0).toFixed(2));
  };

  const deliveryCharge = getSubtotal() >= (settings?.minOrder || 0) ? Number(settings?.deliveryCharge || 0) : 0;
  const tax = Number((getSubtotal() * 0.08).toFixed(2)); // 8% tax
  const grandTotal = Number((getSubtotal() + deliveryCharge + tax).toFixed(2));

  // Filter & sort menu items
  const filteredMenuItems = menuItems
    .filter(item => {
      const matchesCategory = selectedCategory === '' || item.categoryId === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFeatured = !onlyFeatured || item.isFeatured;
      const isCategoryActive = categories.find(c => c.id === item.categoryId)?.active ?? true;
      return matchesCategory && matchesSearch && matchesFeatured && isCategoryActive;
    })
    .sort((a, b) => {
      const aPrice = getDiscountedPrice(a);
      const bPrice = getDiscountedPrice(b);
      if (sortBy === 'price-asc') return aPrice - bPrice;
      if (sortBy === 'price-desc') return bPrice - aPrice;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0; // Default order
    });

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in first to complete your order.');
      onTabChange('login');
      return;
    }

    if (cart.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    setOrderError('');
    setSubmittingOrder(true);

    try {
      const orderData = {
        customerId: user.id,
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        deliveryAddress: checkoutAddress,
        landmark: checkoutLandmark,
        notes: checkoutNotes,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: getDiscountedPrice(item.menuItem),
          image: item.menuItem.image
        })),
        subtotal: getSubtotal(),
        deliveryCharge,
        tax,
        total: grandTotal
      };

      const placedOrder = await onPlaceOrder(orderData);
      setTrackingOrderId(placedOrder.id);
      setActiveView('order-tracking');
      onClearCart();
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const activeTrackingOrder = orders.find(o => o.id === trackingOrderId);

  // Status timeline helper
  const getStatusStepIndex = (status: string) => {
    const steps = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* 1. HERO BANNER */}
      {activeView === 'browse' && (
        <div className="relative bg-stone-900 text-stone-100 overflow-hidden shadow-md">
          <div className="absolute inset-0 z-0">
            {settings?.banner ? (
              <img src={settings.banner} alt="Restaurant Banner" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-35" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-amber-900 to-stone-900 opacity-60"></div>
            )}
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-left">
            <span className="bg-amber-600 text-stone-50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3 animate-pulse">
              Artisan Gastronomy
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
              Crafting Flawless Culinary Masterpieces
            </h1>
            <p className="text-stone-300 text-sm md:text-lg max-w-2xl mt-4 leading-relaxed font-medium">
              {settings?.aboutSection || 'Welcome to our gourmet dining hub, where we fuse fresh ingredients, hand-picked spices, and exceptional kitchen craftsmanship.'}
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8 text-xs font-semibold text-stone-200">
              <div className="flex items-center space-x-2 bg-stone-950/60 backdrop-blur px-3 py-1.5 rounded-full border border-stone-800">
                <Clock size={14} className="text-amber-500" />
                <span>Open: {settings?.openingHours || '10:00 AM'} - {settings?.closingHours || '10:00 PM'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-stone-950/60 backdrop-blur px-3 py-1.5 rounded-full border border-stone-800">
                <Phone size={14} className="text-amber-500" />
                <span>Call: {settings?.phone || '+1 (555) 500-2026'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-stone-950/60 backdrop-blur px-3 py-1.5 rounded-full border border-stone-800">
                <MapPin size={14} className="text-amber-500" />
                <span>{settings?.address || '123 Epicurean Boulevard'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOMER INNER VIEWS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-left">
        {/* VIEW A: BROWSE & SHOP */}
        {activeView === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Categories, Search, Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-stone-900 tracking-wider">Search & Filters</h3>
                
                {/* Search input */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Keywords</label>
                  <div className="relative">
                    <input
                      id="food-search"
                      type="text"
                      placeholder="Burger, Pizza, Fries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    />
                    <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
                  </div>
                </div>

                {/* Sort selector */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Sort Price & Discounts</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-800 font-semibold"
                  >
                    <option value="default">Default Chef Picks</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Biggest Discounts</option>
                  </select>
                </div>

                {/* Toggle Featured */}
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    id="featured-only-toggle"
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => setOnlyFeatured(e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                  />
                  <label htmlFor="featured-only-toggle" className="text-xs font-bold text-stone-700 cursor-pointer">
                    Show Chef Specials Only ⭐
                  </label>
                </div>

                {/* Minimum Order Info */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-800">
                  <div className="flex items-start space-x-2">
                    <Info size={14} className="mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-bold">Order Minimums</p>
                      <p className="mt-0.5 leading-normal">
                        Minimum order value: <strong className="font-extrabold">${settings?.minOrder?.toFixed(2) || '10.00'}</strong>.
                        Get <strong className="font-extrabold">FREE delivery</strong> on chef picks!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Categories List */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase text-stone-900 tracking-wider mb-4">Categories</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex justify-between items-center ${
                      selectedCategory === '' ? 'bg-stone-900 text-stone-50 shadow' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span>All Flavors</span>
                    <ChevronRight size={14} />
                  </button>
                  {categories.filter(c => c.active).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex justify-between items-center ${
                        selectedCategory === cat.id ? 'bg-stone-900 text-stone-50 shadow' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Menu Items Listing */}
            <div className="lg:col-span-3 space-y-6">
              {/* Category Title / Info */}
              <div className="flex justify-between items-center border-b border-stone-200/80 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-stone-950">
                    {selectedCategory === '' 
                      ? 'Exquisite Culinary Menu' 
                      : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 font-semibold">
                    {selectedCategory === '' 
                      ? 'Browse through our premium selection of handcrafted dishes' 
                      : categories.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
                  Showing {filteredMenuItems.length} results
                </span>
              </div>

              {/* Grid of Dishes */}
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-sm">
                  <ShoppingBag size={48} className="mx-auto text-stone-400 mb-4 stroke-[1.5]" />
                  <p className="text-stone-850 font-extrabold text-lg">No dishes found</p>
                  <p className="text-stone-500 text-xs mt-1">Try resetting your search query or selecting a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenuItems.map(item => {
                    const discountPrice = getDiscountedPrice(item);
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                      >
                        {/* Food Image Container */}
                        <div className="relative h-44 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setDetailedItem(item)}>
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {item.isFeatured && (
                            <span className="absolute top-3 left-3 bg-stone-950 text-stone-50 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                              ⭐ Chef Special
                            </span>
                          )}
                          {item.discountPercent > 0 && (
                            <span className="absolute top-3 right-3 bg-amber-600 text-stone-50 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                              {item.discountPercent}% OFF
                            </span>
                          )}
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-stone-900/65 flex items-center justify-center backdrop-blur-[1px]">
                              <span className="bg-red-600 text-stone-50 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border border-red-500 shadow-lg">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="text-left">
                            <h4
                              onClick={() => setDetailedItem(item)}
                              className="font-extrabold text-stone-950 hover:text-amber-700 transition-colors text-base line-clamp-1 cursor-pointer leading-tight"
                            >
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                            {/* Price */}
                            <div className="text-left">
                              {item.discountPercent > 0 ? (
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-base font-black text-amber-700">${discountPrice.toFixed(2)}</span>
                                  <span className="text-xs text-stone-400 line-through">${item.price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="text-base font-black text-stone-900">${item.price.toFixed(2)}</span>
                              )}
                            </div>

                            {/* Add to Cart button */}
                            {item.isAvailable && (
                              <button
                                onClick={() => onAddToCart(item)}
                                className="bg-stone-900 hover:bg-stone-800 text-stone-50 p-2 rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold"
                              >
                                <Plus size={14} />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW B: CHECKOUT & PLACING ORDER */}
        {activeView === 'checkout' && (
          <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl overflow-hidden shadow-md">
            <div className="bg-stone-950 px-6 py-4 flex items-center space-x-3 text-stone-100">
              <button onClick={() => setActiveView('browse')} className="hover:text-amber-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-black uppercase tracking-wider">Checkout Order Summary</h2>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Side */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">Delivery Coordinates</h3>
                {orderError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium">
                    {orderError}
                  </div>
                )}
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Name</label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      placeholder="Chris Customer"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      placeholder="+1 (555) 444-5555"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Delivery Address</label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      placeholder="742 Evergreen Terrace"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Landmark (Optional)</label>
                    <input
                      id="checkout-landmark"
                      type="text"
                      placeholder="Next to Springfield Mall"
                      value={checkoutLandmark}
                      onChange={(e) => setCheckoutLandmark(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Special Notes for Kitchen/Rider</label>
                    <textarea
                      id="checkout-notes"
                      rows={3}
                      placeholder="Add custom sauce, ring doorbell twice, leave at gate etc."
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-850 text-stone-850"
                    ></textarea>
                  </div>

                  {getSubtotal() < (settings?.minOrder || 0) ? (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-3 text-xs font-bold rounded-lg leading-normal">
                      Minimum order threshold not met. Please add more items to cart (min ${settings?.minOrder?.toFixed(2)}).
                    </div>
                  ) : (
                    <button
                      id="checkout-place-order-btn"
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-stone-50 font-black py-3 rounded-lg transition-all uppercase tracking-wider shadow-md hover:shadow flex justify-center items-center text-xs mt-4"
                    >
                      {submittingOrder ? (
                        <span className="inline-block w-4 h-4 border-2 border-stone-200 border-t-amber-600 rounded-full animate-spin"></span>
                      ) : (
                        `Place Order • $${grandTotal.toFixed(2)}`
                      )}
                    </button>
                  )}
                </form>
              </div>

              {/* Items Summary Side */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">Cart Line Items</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4 divide-y divide-stone-200/50 pr-1">
                    {cart.map(item => (
                      <div key={item.menuItem.id} className="flex items-center space-x-3 pt-3 first:pt-0">
                        <img src={item.menuItem.image} alt={item.menuItem.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded object-cover border border-stone-200" />
                        <div className="flex-1 text-left">
                          <p className="text-xs font-bold text-stone-900">{item.menuItem.name}</p>
                          <p className="text-[10px] text-stone-500 font-semibold">Qty: {item.quantity} × ${getDiscountedPrice(item.menuItem).toFixed(2)}</p>
                        </div>
                        <span className="text-xs font-black text-stone-900">
                          ${(getDiscountedPrice(item.menuItem) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs text-stone-700 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-extrabold text-stone-900">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-extrabold text-stone-900">
                      {deliveryCharge > 0 ? `$${deliveryCharge.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (8%)</span>
                    <span className="font-extrabold text-stone-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-dashed border-stone-300 text-sm">
                    <span className="font-black text-stone-900 uppercase">Grand Total</span>
                    <span className="font-black text-amber-700 text-base">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: LIVE ORDER TRACKING */}
        {activeView === 'order-tracking' && (
          <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl overflow-hidden shadow-md text-center p-6 sm:p-8 space-y-6">
            {!activeTrackingOrder ? (
              <div className="py-12">
                <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4 animate-bounce" />
                <p className="text-stone-850 font-extrabold text-base">Retrieving order tracking session...</p>
                <button
                  onClick={() => setActiveView('browse')}
                  className="mt-4 bg-stone-900 hover:bg-stone-800 text-stone-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Return to Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-stone-200 pb-4">
                  <div className="text-left">
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2.5 py-1 rounded">
                      Order Placed
                    </span>
                    <h2 className="text-lg font-black text-stone-950 mt-1.5 uppercase">
                      ID: {activeTrackingOrder.id}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0 text-xs font-semibold text-stone-500">
                    <p>Estimated Delivery: 30 - 45 Mins</p>
                    <p className="mt-0.5">Amount Paid: <strong className="text-amber-700 font-extrabold">${activeTrackingOrder.total.toFixed(2)}</strong></p>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="py-6">
                  {activeTrackingOrder.status === 'Cancelled' ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 max-w-md mx-auto text-xs font-semibold">
                      ❌ This order has been cancelled.
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Tracking Line */}
                      <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 z-0"></div>
                      <div
                        className="absolute top-4 left-6 h-1 bg-amber-600 z-0 transition-all duration-500"
                        style={{
                          width: `${(getStatusStepIndex(activeTrackingOrder.status) / 5) * 100}%`
                        }}
                      ></div>

                      {/* Timeline Steps */}
                      <div className="grid grid-cols-6 relative z-10">
                        {['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                          const isCompleted = getStatusStepIndex(activeTrackingOrder.status) >= idx;
                          const isActive = activeTrackingOrder.status === step;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted 
                                    ? 'bg-amber-600 text-stone-50 ring-4 ring-amber-100 shadow-md' 
                                    : 'bg-white border-2 border-stone-300 text-stone-400'
                                }`}
                              >
                                {isCompleted ? <Check size={14} className="stroke-[3]" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                              </div>
                              <span className={`text-[9px] font-black uppercase mt-2 text-center tracking-tight ${isActive ? 'text-amber-700 font-black scale-105' : 'text-stone-400 font-medium'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Boy Details */}
                {activeTrackingOrder.deliveryBoyId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between max-w-md mx-auto text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-bold text-base">
                        🚴
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">Assigned Delivery Partner</p>
                        <p className="text-xs font-black text-stone-850">{activeTrackingOrder.deliveryBoyName}</p>
                      </div>
                    </div>
                    <span className="bg-amber-600 text-stone-50 text-[10px] font-black px-2.5 py-1 rounded">
                      En Route
                    </span>
                  </div>
                )}

                {/* Items in Active Order */}
                <div className="border border-stone-200 rounded-xl p-4 text-left max-w-md mx-auto">
                  <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">Order Line Items</h4>
                  <div className="divide-y divide-stone-100">
                    {activeTrackingOrder.items.map(it => (
                      <div key={it.menuItemId} className="flex justify-between py-2 text-xs font-bold text-stone-700">
                        <span>{it.name} <strong className="text-stone-400">x{it.quantity}</strong></span>
                        <span className="text-stone-900">${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 pt-2.5 mt-2 flex justify-between text-xs font-black">
                    <span className="text-stone-500">TOTAL</span>
                    <span className="text-amber-700 text-sm">${activeTrackingOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-4">
                  {activeTrackingOrder.status === 'Pending' && (
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          await onCancelOrder(activeTrackingOrder.id);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel Pending Order
                    </button>
                  )}
                  <button
                    onClick={() => setActiveView('browse')}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors"
                  >
                    Browse More Foods
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. DETAILED FOOD COMPONENT MODAL */}
      {detailedItem && (
        <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative text-left">
            <button
              onClick={() => setDetailedItem(null)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white p-1.5 rounded-full border border-stone-200 text-stone-700 transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Food banner */}
            <div className="relative h-60 w-full bg-stone-100">
              <img src={detailedItem.image} alt={detailedItem.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              {detailedItem.isFeatured && (
                <span className="absolute bottom-4 left-4 bg-stone-950 text-stone-50 text-[10px] font-bold uppercase px-3 py-1 rounded shadow-lg">
                  ⭐ Chef Special
                </span>
              )}
              {detailedItem.discountPercent > 0 && (
                <span className="absolute bottom-4 right-4 bg-amber-600 text-stone-50 text-[11px] font-black uppercase px-3 py-1 rounded shadow-lg">
                  {detailedItem.discountPercent}% OFF Today
                </span>
              )}
            </div>

            {/* Copy */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-700">
                  {categories.find(c => c.id === detailedItem.categoryId)?.name || 'Artesian Dish'}
                </span>
                <h3 className="text-2xl font-black text-stone-900 leading-tight mt-1">{detailedItem.name}</h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-semibold">
                {detailedItem.description}
              </p>

              {/* Specifications / Highlights */}
              <div className="grid grid-cols-3 gap-3 bg-stone-100 border border-stone-200 p-3 rounded-xl text-center text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                <div>
                  <p className="text-stone-400">Preparation</p>
                  <p className="text-stone-800 mt-0.5 font-black">Fresh to Order</p>
                </div>
                <div>
                  <p className="text-stone-400">Dietary</p>
                  <p className="text-stone-800 mt-0.5 font-black">Organically Sourced</p>
                </div>
                <div>
                  <p className="text-stone-400">Chef Rating</p>
                  <p className="text-stone-800 mt-0.5 font-black">⭐⭐⭐⭐⭐</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                <div className="text-left">
                  {detailedItem.discountPercent > 0 ? (
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">Special Discount Price</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-black text-amber-700">${getDiscountedPrice(detailedItem).toFixed(2)}</span>
                        <span className="text-sm text-stone-400 line-through">${detailedItem.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">Price</p>
                      <span className="text-2xl font-black text-stone-900">${detailedItem.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {detailedItem.isAvailable ? (
                  <button
                    onClick={() => {
                      onAddToCart(detailedItem);
                      setDetailedItem(null);
                    }}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-black px-6 py-3 rounded-xl transition-all shadow text-xs uppercase tracking-wider flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <span className="bg-red-100 text-red-800 border border-red-200 text-xs font-black px-4 py-2.5 rounded-lg uppercase tracking-widest">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
