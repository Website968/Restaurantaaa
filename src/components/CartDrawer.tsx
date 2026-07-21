import { X, Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react';
import { CartItem, MenuItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  settings: any;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  onClear,
  settings,
  onCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const getDiscountedPrice = (item: MenuItem) => {
    if (item.discountPercent > 0) {
      return Number((item.price * (1 - item.discountPercent / 100)).toFixed(2));
    }
    return item.price;
  };

  const getSubtotal = () => {
    return Number(cart.reduce((sum, item) => sum + getDiscountedPrice(item.menuItem) * item.quantity, 0).toFixed(2));
  };

  const minOrder = settings?.minOrder || 10.00;
  const isMinOrderMet = getSubtotal() >= minOrder;
  const remainingForMin = minOrder - getSubtotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div id="cart-drawer" className="w-screen max-w-md bg-white border-l border-stone-200 flex flex-col shadow-2xl h-full text-left">
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-950 text-stone-100">
            <div className="flex items-center space-x-2">
              <ShoppingCart size={20} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">My Gourmet Cart ({cart.length})</h2>
            </div>
            <button onClick={onClose} className="text-stone-300 hover:text-stone-50 transition-colors p-1 rounded-full hover:bg-stone-800">
              <X size={20} />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                <ShoppingBag size={48} className="text-stone-300 mb-4 stroke-[1.2]" />
                <p className="text-stone-850 font-black text-base">Your Cart is Empty</p>
                <p className="text-stone-500 text-xs mt-1 max-w-xs">Savor our premium cuisines by adding some items to your order.</p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-stone-900 hover:bg-stone-800 text-stone-50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow"
                >
                  Explore Delicious Dishes
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Order Items</span>
                  <button
                    onClick={onClear}
                    className="text-[10px] font-bold text-red-700 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="space-y-4 divide-y divide-stone-100">
                  {cart.map(item => {
                    const price = getDiscountedPrice(item.menuItem);
                    return (
                      <div key={item.menuItem.id} className="flex space-x-3 pt-4 first:pt-0">
                        <img src={item.menuItem.image} alt={item.menuItem.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-lg object-cover border border-stone-200" />
                        <div className="flex-1 text-left">
                          <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">{item.menuItem.name}</h4>
                          <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Price: ${price.toFixed(2)}</p>
                          
                          {/* Qty edit buttons */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => onUpdateQty(item.menuItem.id, item.quantity - 1)}
                              className="p-1 border border-stone-300 hover:bg-stone-100 rounded text-stone-600 transition-colors"
                            >
                              <Minus size={10} className="stroke-[3]" />
                            </button>
                            <span className="text-xs font-black text-stone-900 w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQty(item.menuItem.id, item.quantity + 1)}
                              className="p-1 border border-stone-300 hover:bg-stone-100 rounded text-stone-600 transition-colors"
                            >
                              <Plus size={10} className="stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => onRemove(item.menuItem.id)}
                            className="text-stone-400 hover:text-red-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <span className="text-xs font-extrabold text-stone-900">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Billing Section */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 bg-stone-50 p-6 space-y-4">
              {/* Minimum Order Limit Check */}
              {!isMinOrderMet && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-800 text-left">
                  <p className="font-bold">Minimum Order Required</p>
                  <p className="mt-0.5 leading-normal">
                    Please add <strong className="font-extrabold">${remainingForMin.toFixed(2)}</strong> worth of items to proceed with placing your order.
                  </p>
                </div>
              )}

              <div className="space-y-2 text-xs font-semibold text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-stone-900">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (Included, 8%)</span>
                  <span className="font-extrabold text-stone-900">${(getSubtotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[10px]">
                  <span>Delivery Charge</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dashed border-stone-300 text-sm">
                  <span className="font-black text-stone-900">EST. TOTAL</span>
                  <span className="font-black text-amber-700 text-base">${getSubtotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout"
                disabled={!isMinOrderMet}
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
                className={`w-full font-black py-3 rounded-xl uppercase tracking-wider text-xs shadow transition-all flex justify-center items-center ${
                  isMinOrderMet 
                    ? 'bg-amber-600 hover:bg-amber-700 text-stone-50' 
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
