import React from 'react';
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

  const getSubtotal = () => {
    return Number(cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0).toFixed(2));
  };

  const subtotal = getSubtotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div id="cart-drawer" className="w-screen max-w-md bg-[#121212] border-l border-[#262626] flex flex-col shadow-2xl h-full text-left text-white">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#262626] flex items-center justify-between bg-[#181818]">
            <div className="flex items-center space-x-2">
              <ShoppingCart size={20} className="text-red-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Your Cart ({cart.length})</h2>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#262626]">
              <X size={20} />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                <ShoppingBag size={48} className="text-stone-600 mb-4 stroke-[1.2]" />
                <p className="text-white font-black text-base">Your Cart is Empty</p>
                <p className="text-stone-400 text-xs mt-1 max-w-xs">Explore our hot and fresh momos menu to add items.</p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Order Items</span>
                  <button
                    onClick={onClear}
                    className="text-[10px] font-bold text-red-500 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="space-y-4 divide-y divide-[#1f1f1f]">
                  {cart.map(item => (
                    <div key={item.menuItem.id} className="flex space-x-3 pt-4 first:pt-0">
                      <img src={item.menuItem.image} alt={item.menuItem.name} referrerPolicy="no-referrer" className="w-16 h-16 rounded-lg object-cover border border-[#262626]" />
                      <div className="flex-1 text-left">
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">{item.menuItem.name}</h4>
                        <p className="text-[10px] text-red-500 font-extrabold mt-0.5">₹{item.menuItem.price}</p>
                        
                        {/* Qty edit buttons */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => onUpdateQty(item.menuItem.id, item.quantity - 1)}
                            className="p-1 border border-[#333333] hover:bg-[#222222] rounded text-stone-300 transition-colors"
                          >
                            <Minus size={10} className="stroke-[3]" />
                          </button>
                          <span className="text-xs font-black text-white w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQty(item.menuItem.id, item.quantity + 1)}
                            className="p-1 border border-[#333333] hover:bg-[#222222] rounded text-stone-300 transition-colors"
                          >
                            <Plus size={10} className="stroke-[3]" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => onRemove(item.menuItem.id)}
                          className="text-stone-500 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <span className="text-xs font-extrabold text-white">₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer Billing Section */}
          {cart.length > 0 && (
            <div className="border-t border-[#262626] bg-[#181818] p-6 space-y-4">
              <div className="space-y-2 text-xs font-semibold text-stone-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[10px]">
                  <span>Delivery Charge</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dashed border-[#333333] text-sm">
                  <span className="font-black text-white">EST. TOTAL</span>
                  <span className="font-black text-red-500 text-base">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
                className="w-full font-black py-3 rounded-xl uppercase tracking-wider text-xs shadow-lg bg-red-600 hover:bg-red-700 text-white transition-all flex justify-center items-center"
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
