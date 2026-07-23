import { useState } from 'react';
import { Bike, MapPin, Phone, MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, User } from '../types';

interface DeliveryDashboardProps {
  user: User;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: any) => Promise<void>;
}

export default function DeliveryDashboard({
  user,
  orders,
  onUpdateOrderStatus
}: DeliveryDashboardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const assignedOrders = orders.filter(o => o.deliveryBoyId === user.id);
  const activeOrders = assignedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const deliveryHistory = assignedOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    setUpdatingId(orderId);
    try {
      let nextStatus = '';
      if (currentStatus === 'Ready') {
        nextStatus = 'Accepted';
      } else if (currentStatus === 'Accepted') {
        nextStatus = 'Out for Delivery';
      } else if (currentStatus === 'Out for Delivery') {
        nextStatus = 'Delivered';
      }

      if (nextStatus) {
        await onUpdateOrderStatus(orderId, nextStatus);
      }
    } catch (err) {
      console.error('Error changing order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-black text-stone-100 pb-20 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-[#121212] rounded-2xl p-6 md:p-8 text-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xl border border-[#262626]">
          <div>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block mb-2">
              Rider Console
            </span>
            <h2 className="text-2xl font-black text-white">Welcome Back, {user.name}!</h2>
            <p className="text-stone-400 text-xs mt-1 font-medium">Manage assignments, track coordinates, and mark successful deliveries.</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0 text-xs font-semibold">
            <div className="bg-[#181818] border border-[#262626] px-4 py-2.5 rounded-xl text-center">
              <p className="text-stone-500 font-extrabold uppercase text-[9px]">Active Deliveries</p>
              <p className="text-lg font-black text-red-500 mt-0.5">{activeOrders.length}</p>
            </div>
            <div className="bg-[#181818] border border-[#262626] px-4 py-2.5 rounded-xl text-center">
              <p className="text-stone-500 font-extrabold uppercase text-[9px]">Completed Trips</p>
              <p className="text-lg font-black text-emerald-500 mt-0.5">{deliveryHistory.length}</p>
            </div>
          </div>
        </div>

        {/* Active Assignments */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <Bike size={18} className="text-red-500" />
            <span>Active Assignments ({activeOrders.length})</span>
          </h3>

          {activeOrders.length === 0 ? (
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-8 text-center space-y-1">
              <p className="text-stone-300 text-xs font-semibold">No active deliveries assigned yet.</p>
              <p className="text-[10px] text-stone-500">Check back once orders are cooked and ready to go!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => {
                const isExpanded = expandedId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden shadow-md transition-all text-stone-200"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#222222] flex justify-between items-center bg-[#181818]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-500">Order ID</span>
                        <h4 className="text-sm font-black text-white leading-tight">{order.id}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="bg-amber-950 text-amber-400 border border-amber-800/60 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
                          {order.status}
                        </span>
                        
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          disabled={updatingId === order.id}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all"
                        >
                          {updatingId === order.id ? (
                            <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : order.status === 'Ready' ? (
                            'Accept delivery'
                          ) : order.status === 'Accepted' ? (
                            'Mark Out for Delivery'
                          ) : order.status === 'Out for Delivery' ? (
                            'Mark Delivered'
                          ) : (
                            'Process order'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Delivery Locations */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium border-b border-[#1f1f1f]">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2.5 text-stone-300">
                          <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white">Delivery Address</p>
                            <p className="mt-1 text-stone-300">{order.deliveryAddress}</p>
                            {order.landmark && (
                              <p className="mt-0.5 text-stone-500">Landmark: {order.landmark}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 text-stone-300">
                          <Phone size={16} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white">Customer Coordinates</p>
                            <p className="mt-1 text-stone-300 font-semibold">{order.customerName}</p>
                            <p className="text-red-400 font-bold mt-0.5">{order.customerPhone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 md:border-l md:border-[#222222] md:pl-4">
                        <div className="flex items-start space-x-2.5 text-stone-300">
                          <MessageSquare size={16} className="text-stone-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white">Kitchen & Delivery Notes</p>
                            <p className="mt-1 text-stone-400 italic font-semibold">
                              {order.notes || 'No notes specified.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2.5 text-stone-300">
                          <Clock size={16} className="text-stone-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-white">Timestamp</p>
                            <p className="mt-1 text-stone-400">
                              Placed: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable items section */}
                    <div>
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full py-2 bg-[#181818] hover:bg-[#202020] flex justify-center items-center text-stone-400 hover:text-white text-[10px] font-bold uppercase tracking-wider space-x-1.5 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide items list' : 'Expand items list'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-[#141414] border-t border-[#1f1f1f] divide-y divide-[#1f1f1f] max-w-lg">
                          {order.items.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center py-2 text-xs font-bold">
                              <span className="text-stone-300">
                                {item.name} <strong className="text-stone-500">x{item.quantity}</strong>
                              </span>
                              <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-2.5 mt-2 flex justify-between text-xs font-black">
                            <span className="text-stone-400">COD Total Revenue</span>
                            <span className="text-red-500 text-sm">₹{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Assignments */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <CheckCircle size={18} className="text-emerald-500" />
            <span>Delivery History & Earnings ({deliveryHistory.length})</span>
          </h3>

          {deliveryHistory.length === 0 ? (
            <div className="bg-[#121212] border border-[#222222] rounded-xl p-8 text-center">
              <p className="text-stone-500 text-xs font-semibold">No finished deliveries listed on this shift.</p>
            </div>
          ) : (
            <div className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden shadow-md divide-y divide-[#1f1f1f]">
              {deliveryHistory.map(order => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-semibold text-stone-300 hover:bg-[#181818] transition-colors">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-white">{order.id}</strong>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px] font-medium leading-tight">{order.deliveryAddress}</p>
                    <p className="text-[10px] text-stone-500">Completed: {new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="text-stone-500 font-bold uppercase text-[9px]">Shift Earnings</p>
                    <p className="text-sm font-black text-emerald-400">₹{order.deliveryCharge.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
