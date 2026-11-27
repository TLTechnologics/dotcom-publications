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
  Package,
  Download,
  Printer,
  FileText,
  X
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
  const [exporting, setExporting] = useState(false);

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setOrders(res.items || []);
    } catch (err: any) {
      toast.error('Failed to load orders', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

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

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await api.downloadOrdersCsv(statusFilter !== 'all' ? statusFilter : undefined);
      toast.success('Orders Exported', 'CSV file generated and downloaded successfully.');
    } catch (err: any) {
      toast.error('Export Failed', err.message);
    } finally {
      setExporting(false);
    }
  };

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
        <div className="p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Total orders</p>
            <h3 className="text-2xl font-serif font-bold text-[#292326] mt-1">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-md bg-[#FFF6D9] text-[#651C32] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Active fulfilment</p>
            <h3 className="text-2xl font-serif font-bold text-[#651C32] mt-1">
              {orders.filter((o) => ['Confirmed', 'Processing', 'Shipped'].includes(o.status)).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Delivered orders</p>
            <h3 className="text-2xl font-serif font-bold text-emerald-800 mt-1">
              {orders.filter((o) => o.status === 'Delivered').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#82777A] uppercase tracking-wider">Processed value</p>
            <h3 className="text-2xl font-serif font-bold text-[#292326] mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
          <div className="w-12 h-12 rounded-md bg-[#F6E7A8] text-[#431322] flex items-center justify-center font-bold font-serif text-lg">
            ₹
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#82777A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs rounded-md border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial h-10 px-3 py-2 text-xs rounded-md border border-[#EAE3DE] bg-[#FAF8F3] text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
          >
            <option value="all">All statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={exporting || orders.length === 0}
            className="h-10 px-3.5"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchOrders} disabled={loading} className="h-10 px-3">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-lg border border-[#EAE3DE]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#651C32]" />
          <p className="text-xs text-[#82777A] mt-2">Loading customer orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-lg border border-[#EAE3DE]">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-[#292326] mt-3">No orders found</h3>
          <p className="text-xs text-[#82777A] mt-1">
            {search ? 'No orders match your search criteria.' : 'Customer orders placed via the storefront will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = parseItems(order.items_json);
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-[#EAE3DE] shadow-none p-5 hover:border-[#651C32]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3DE] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#FAF8F3] border border-[#F6E7A8] flex items-center justify-center text-[#651C32] font-semibold">
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

                  {/* Status Actions & Invoice Button */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-md border border-[#EAE3DE] bg-[#FAF8F3] hover:bg-white text-xs font-semibold text-[#651C32] hover:border-[#651C32] flex items-center gap-1.5 transition-all shadow-xs"
                      title="Generate and print official invoice receipt"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#82777A] font-medium hidden sm:inline">Status:</span>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="min-h-[40px] text-xs font-semibold px-3 py-1.5 rounded-md border border-[#EAE3DE] bg-[#FAF8F3] text-[#431322] focus:ring-2 focus:ring-[#651C32] focus:outline-none"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
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
                      Payment method: <span className="font-semibold text-[#292326]">{order.payment_method}</span>
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#292326] uppercase text-[10px] tracking-wider text-[#82777A]">
                        Items ({items.length})
                      </p>
                      <span className="font-serif font-bold text-sm text-[#651C32]">
                        Total: ₹{order.total_amount.toLocaleString('en-IN')}
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
                            ₹{(it.price * it.quantity).toLocaleString('en-IN')}
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

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#431322]/60  overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-lg border border-[#EAE3DE] shadow-elevated overflow-hidden my-6">
            {/* Modal Actions Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#EAE3DE] bg-[#FAF8F3] flex items-center justify-between print:hidden">
              <span className="text-xs font-semibold text-[#651C32] uppercase tracking-wider">
                Official Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  className="min-h-[38px]"
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Invoice
                </Button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-[#82777A] hover:bg-[#EAE3DE]/60 transition-colors"
                  aria-label="Close invoice preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div id="invoice-printable" className="p-4 sm:p-8 space-y-5 sm:space-y-6 text-[#292326] font-sans">
              {/* Invoice Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#EAE3DE] pb-4 sm:pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <img src="/logo.jpg" alt="Dotcom Publications" className="w-8 h-8 rounded-lg object-cover" />
                    <h2 className="font-serif font-bold text-xl text-[#651C32]">Dotcom Publications</h2>
                  </div>
                  <p className="text-xs text-[#82777A]">Academic & Educational Book Publishing House</p>
                  <p className="text-xs text-[#82777A]">Institutional Area, Delhi NCR, India</p>
                  <p className="text-xs text-[#82777A]">Email: support@dotcompublications.com</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]">
                    Tax Invoice
                  </span>
                  <p className="text-sm font-mono font-bold text-[#292326] mt-2">
                    {selectedInvoiceOrder.order_number}
                  </p>
                  <p className="text-xs text-[#82777A]">
                    Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-[#82777A]">
                    Status: <span className="font-semibold text-[#651C32]">{selectedInvoiceOrder.status}</span>
                  </p>
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs border-b border-[#EAE3DE] pb-4 sm:pb-6">
                <div>
                  <h4 className="font-bold text-[#82777A] uppercase text-[10px] tracking-wider mb-1">Customer and billing</h4>
                  <p className="font-bold text-sm text-[#292326]">{selectedInvoiceOrder.customer_name}</p>
                  <p className="text-[#82777A] mt-0.5">{selectedInvoiceOrder.customer_phone}</p>
                  <p className="text-[#82777A]">{selectedInvoiceOrder.customer_email}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#82777A] uppercase text-[10px] tracking-wider mb-1">Shipping destination</h4>
                  <p className="text-[#292326] leading-relaxed">
                    {selectedInvoiceOrder.shipping_address}
                    {selectedInvoiceOrder.city ? `, ${selectedInvoiceOrder.city}` : ''}
                    {selectedInvoiceOrder.state ? `, ${selectedInvoiceOrder.state}` : ''}
                    {selectedInvoiceOrder.pincode ? ` - ${selectedInvoiceOrder.pincode}` : ''}
                  </p>
                  <p className="text-[11px] text-[#82777A] mt-1">
                    Payment method: <span className="font-semibold text-[#292326]">{selectedInvoiceOrder.payment_method}</span>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-xs min-w-[360px]">
                  <thead>
                    <tr className="border-b border-[#EAE3DE] text-[#82777A] uppercase text-[10px] font-semibold text-left">
                      <th className="py-2">Item description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE3DE]/60">
                    {parseItems(selectedInvoiceOrder.items_json).map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2.5 font-medium text-[#292326]">{item.title}</td>
                        <td className="py-2.5 text-center text-[#82777A]">{item.quantity}</td>
                        <td className="py-2.5 text-right text-[#82777A]">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 text-right font-semibold text-[#292326]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="border-t border-[#EAE3DE] pt-4 flex justify-between items-start">
                <div className="text-[11px] text-[#82777A] space-y-1">
                  <p>Computer-generated invoice. No physical signature required.</p>
                  <p>Dotcom Publications • Academic Integrity & Research Excellence</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-[#82777A] flex justify-between gap-8">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoiceOrder.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-[#82777A] flex justify-between gap-8">
                    <span>Shipping & Handling:</span>
                    <span className="text-[#477A58] font-semibold">FREE</span>
                  </div>
                  <div className="text-base font-serif font-bold text-[#651C32] flex justify-between gap-8 border-t border-[#EAE3DE] pt-2">
                    <span>Total:</span>
                    <span>₹{selectedInvoiceOrder.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
