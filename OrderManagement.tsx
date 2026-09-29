import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  Calendar, 
  ArrowUpDown,
  Phone,
  FileText
} from 'lucide-react';
import { Order, OrderStatus, SupportedLanguage } from '../types';
import { formatMoney, TRANSLATIONS } from '../utils/i18n';
import { maskPII, simulateAES256Decrypt } from '../utils/crypto';

interface OrderManagementProps {
  orders: Order[];
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  currentCurrency,
  currentLang,
  onUpdateOrderStatus,
  onTrackOrder,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [decryptPiiMode, setDecryptPiiMode] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const countries = ['all', ...new Set(orders.map((o) => o.shippingAddress.country))];

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.shippingAddress.city.toLowerCase().includes(q) ||
      order.shippingAddress.country.toLowerCase().includes(q) ||
      order.items.some((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || order.shippingAddress.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Preparing</span>;
      case 'dispatched':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">Dispatched</span>;
      case 'in_transit':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800">In Transit</span>;
      case 'out_for_delivery':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Out for Delivery</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const handleResendEmail = async (order: Order) => {
    setResendingEmail(true);
    try {
      await fetch('/api/notifications/emails/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: order.customerEmail,
          subject: `📦 Resent Order Status Notice: #${order.orderNumber}`,
          type: 'order_confirmation',
          message: `<p>Status update for order #${order.orderNumber}: Current stage is <strong>${order.status.toUpperCase()}</strong>.</p>`,
        }),
      });
      setResendNotice(`Dispatched update to ${order.customerEmail}`);
      setTimeout(() => setResendNotice(null), 3000);
    } catch (e) {
      alert('Failed to trigger email dispatcher.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Historical Orders & Fulfillment Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Query customer records, inspect encrypted payloads, and trigger direct notification updates.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Main Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="order-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchOrdersPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Countries' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Order Number */}
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    #{order.orderNumber}
                    <div className="text-[10px] text-slate-400 font-normal">
                      PIN: <span className="font-mono font-bold text-slate-700">{order.deliveryPin}</span>
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[11px] text-slate-500">{order.customerEmail}</div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-slate-600">
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-semibold">{order.shippingAddress.city}</div>
                    <div className="text-[11px] text-slate-400">{order.shippingAddress.country} ({order.shippingAddress.countryCode})</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatMoney(order.total, currentCurrency)}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {order.items.length} item(s) • {order.paymentMethod.split(' ')[0]}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1"
                        title="Inspect Order Details & Encrypted Metadata"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => onTrackOrder(order.id)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1"
                        title="Track Real-time GPS Delivery"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">
                    Order Manifest #{selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedOrder.id} • Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Advance Buttons */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Update Order Fulfillment Stage
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['confirmed', 'preparing', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateOrderStatus(selectedOrder.id, st);
                      setSelectedOrder({ ...selectedOrder, status: st });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      selectedOrder.status === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Encrypted PII Protection Module */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AES-256 Encrypted Customer Ledger
                </span>
                <button
                  onClick={() => setDecryptPiiMode(!decryptPiiMode)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 font-semibold"
                >
                  {decryptPiiMode ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                  <span>{decryptPiiMode ? 'Mask PII Data' : 'Decrypt with Audit Key'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Customer Identity</p>
                  <p className="font-bold text-white">
                    {decryptPiiMode ? selectedOrder.customerName : maskPII(selectedOrder.customerName, 'name')}
                  </p>
                  <p className="text-slate-300">
                    {decryptPiiMode ? selectedOrder.customerEmail : maskPII(selectedOrder.customerEmail, 'email')}
                  </p>
                  <p className="text-slate-300 font-mono">
                    {decryptPiiMode ? selectedOrder.customerPhone : maskPII(selectedOrder.customerPhone, 'phone')}
                  </p>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Destination</p>
                  <p className="font-bold text-white">
                    {decryptPiiMode ? selectedOrder.shippingAddress.street : maskPII(selectedOrder.shippingAddress.street, 'address')}
                  </p>
                  <p className="text-slate-300">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-emerald-400 font-medium">
                    {selectedOrder.shippingAddress.country} ({selectedOrder.shippingAddress.countryCode})
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-400 break-all bg-slate-950/60 p-2 rounded border border-slate-800">
                Cryptographic Hash: {selectedOrder.encryptedDataHash} • Payload: {selectedOrder.encryptedPii}
              </div>
            </div>

            {/* Items Manifest Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Ordered Items
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{it.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {it.sku} • Category: {it.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatMoney(it.price, currentCurrency)} × {it.quantity}</p>
                      <p className="text-slate-500 font-extrabold">{formatMoney(it.price * it.quantity, currentCurrency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResendEmail(selectedOrder)}
                  disabled={resendingEmail}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{resendingEmail ? 'Sending...' : 'Resend Email Notification'}</span>
                </button>
                {resendNotice && <span className="text-emerald-600 font-semibold">{resendNotice}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onTrackOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Open Live Tracker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
