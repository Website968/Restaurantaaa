import { useState } from 'react';
import { Bike, Navigation, MapPin, Phone, MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Filter assigned orders
  const assignedOrders = orders.filter(o => o.deliveryBoyId === user.id);
  
  // Split into active vs historical
  const activeOrders = assignedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const deliveryHistory = assignedOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  const handleStatusChange = async (orderId: string, currentStatus: string) => {
    setUpdatingId(orderId);
    try {
      let nextStatus = '';
      if (currentStatus === 'Ready') {
        nextStatus = 'Accepted'; // Delivery Boy accepts delivery and is preparing to pick up
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
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-left space-y-8">
        
        {/* Banner */}
        <div className="bg-stone-900 rounded-2xl p-6 md:p-8 text-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center shadow border border-stone-800">
          <div>
            <span className="bg-emerald-600 text-stone-50 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider inline-block mb-2">
              Rider Console
            </span>
            <h2 className="text-2xl font-extrabold text-white">Welcome Back, {user.name}!</h2>
            <p className="text-stone-400 text-xs mt-1 font-medium">Manage assignments, track coordinates, and mark successful deliveries.</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0 text-xs font-semibold">
            <div className="bg-stone-950 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
              <p className="text-stone-500 font-bold uppercase text-[9px]">Active Deliveries</p>
              <p className="text-lg font-black text-amber-500 mt-0.5">{activeOrders.length}</p>
            </div>
            <div className="bg-stone-950 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
              <p className="text-stone-500 font-bold uppercase text-[9px]">Completed Trips</p>
              <p className="text-lg font-black text-emerald-500 mt-0.5">{deliveryHistory.length}</p>
            </div>
          </div>
        </div>

        {/* Active Assignments */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-stone-900 tracking-wider flex items-center space-x-2">
            <Bike size={18} className="text-amber-600" />
            <span>Active Assignments ({activeOrders.length})</span>
          </h3>

          {activeOrders.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-stone-500 text-xs font-semibold">No active deliveries assigned yet.</p>
              <p className="text-[10px] text-stone-400 mt-1">Check back once orders are cooked and ready to go!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => {
                const isExpanded = expandedId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm transition-all text-stone-800"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/60">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400">Order ID</span>
                        <h4 className="text-sm font-extrabold text-stone-900 leading-tight">{order.id}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2.5 py-1 rounded">
                          {order.status}
                        </span>
                        
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          disabled={updatingId === order.id}
                          className="bg-stone-900 hover:bg-stone-800 text-stone-50 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all"
                        >
                          {updatingId === order.id ? (
                            <span className="inline-block w-3 h-3 border border-stone-200 border-t-stone-800 rounded-full animate-spin"></span>
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
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium border-b border-stone-100">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2.5 text-stone-700">
                          <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-stone-900">Delivery Address</p>
                            <p className="mt-1 text-stone-600">{order.deliveryAddress}</p>
                            {order.landmark && (
                              <p className="mt-0.5 text-stone-400">Landmark: {order.landmark}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-2.5 text-stone-700">
                          <Phone size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-stone-900">Customer Coordinates</p>
                            <p className="mt-1 text-stone-600 font-semibold">{order.customerName}</p>
                            <p className="text-stone-500 font-bold mt-0.5">{order.customerPhone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 md:border-l md:border-stone-100 md:pl-4">
                        <div className="flex items-start space-x-2.5 text-stone-700">
                          <MessageSquare size={16} className="text-stone-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-stone-900">Kitchen & Delivery Notes</p>
                            <p className="mt-1 text-stone-600 leading-normal italic font-semibold">
                              {order.notes || 'No notes specified.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2.5 text-stone-700">
                          <Clock size={16} className="text-stone-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-extrabold text-stone-900">Timestamp</p>
                            <p className="mt-1 text-stone-500">
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
                        className="w-full py-2 bg-stone-50/50 hover:bg-stone-50 flex justify-center items-center text-stone-500 hover:text-stone-850 text-[10px] font-bold uppercase tracking-wider space-x-1.5 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide items list' : 'Expand items list'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-stone-50/20 border-t border-stone-100 divide-y divide-stone-100 max-w-lg">
                          {order.items.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center py-2 text-xs font-bold">
                              <span className="text-stone-700">
                                {item.name} <strong className="text-stone-400">x{item.quantity}</strong>
                              </span>
                              <span className="text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-2.5 mt-2 flex justify-between text-xs font-black">
                            <span className="text-stone-500">COD Total Revenue</span>
                            <span className="text-amber-700 text-sm">${order.total.toFixed(2)}</span>
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
          <h3 className="text-sm font-black uppercase text-stone-900 tracking-wider flex items-center space-x-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <span>Delivery History & Earnings ({deliveryHistory.length})</span>
          </h3>

          {deliveryHistory.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-stone-500 text-xs font-semibold">No finished deliveries listed on this shift.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm divide-y divide-stone-150">
              {deliveryHistory.map(order => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-stone-950">{order.id}</strong>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-stone-500 text-[11px] font-medium leading-tight">{order.deliveryAddress}</p>
                    <p className="text-[10px] text-stone-400">Completed: {new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="text-stone-400 font-bold uppercase text-[9px]">Shift Earnings</p>
                    <p className="text-sm font-black text-stone-900">${order.deliveryCharge.toFixed(2)}</p>
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
