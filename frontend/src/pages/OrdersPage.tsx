import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Package
} from 'lucide-react';
import { Order, OrderItem } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

export const OrdersPage: React.FC = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      toast.error('Failed to load orders', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success('Order Status Updated', `Order #${updated.order_number} marked as ${newStatus}.`);
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-600" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  const parseItems = (jsonStr: string): OrderItem[] => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-serif font-bold text-[#292326] mt-1">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF6D9] text-[#651C32] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Active Fulfillment</p>
            <h3 className="text-2xl font-serif font-bold text-[#651C32] mt-1">
              {orders.filter((o) => ['Confirmed', 'Processing', 'Shipped'].includes(o.status)).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Delivered Orders</p>
            <h3 className="text-2xl font-serif font-bold text-emerald-800 mt-1">
              {orders.filter((o) => o.status === 'Delivered').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-serif font-bold text-[#292326] mt-1">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F6E7A8] text-[#431322] flex items-center justify-center font-bold font-serif text-lg">
            ₹
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#82777A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order #, customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE3DE]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#651C32]" />
          <p className="text-xs text-[#82777A] mt-2">Loading customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#EAE3DE]">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-[#292326] mt-3">No orders found</h3>
          <p className="text-xs text-[#82777A] mt-1">
            {search ? 'No orders match your search criteria.' : 'Customer orders placed via the storefront will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = parseItems(order.items_json);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle p-5 hover:border-[#651C32]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3DE] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#F6E7A8] flex items-center justify-center text-[#651C32] font-semibold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#292326]">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-[11px] text-[#82777A]">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#82777A] font-medium hidden sm:inline">Update Status:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#EAE3DE] bg-[#FAF8F3] text-[#431322] focus:ring-2 focus:ring-[#651C32] focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-[#292326] uppercase text-[10px] tracking-wider text-[#82777A]">
                      Customer Details
                    </p>
                    <p className="font-bold text-sm text-[#292326]">{order.customer_name}</p>
                    <div className="flex items-center gap-1.5 text-[#82777A]">
                      <Phone className="w-3.5 h-3.5 text-[#651C32]" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#82777A]">
                      <Mail className="w-3.5 h-3.5 text-[#651C32]" />
                      <span>{order.customer_email}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-[#292326] uppercase text-[10px] tracking-wider text-[#82777A]">
                      Delivery Address
                    </p>
                    <div className="flex items-start gap-1.5 text-[#292326]">
                      <MapPin className="w-3.5 h-3.5 text-[#651C32] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {order.shipping_address}
                        {order.city ? `, ${order.city}` : ''}
                        {order.state ? `, ${order.state}` : ''}
                        {order.pincode ? ` - ${order.pincode}` : ''}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#82777A]">
                      Payment: <span className="font-semibold text-[#292326]">{order.payment_method}</span>
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#292326] uppercase text-[10px] tracking-wider text-[#82777A]">
                        Items ({items.length})
                      </p>
                      <span className="font-serif font-bold text-sm text-[#651C32]">
                        Total: ₹{order.total_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#FAF8F3] p-2 rounded-lg border border-[#EAE3DE]">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-medium text-[#292326] truncate">{it.title}</p>
                            <span className="text-[10px] text-[#82777A]">Qty: {it.quantity} × ₹{it.price}</span>
                          </div>
                          <span className="font-semibold text-[#292326] shrink-0">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
