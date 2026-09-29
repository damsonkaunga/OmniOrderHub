import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Globe, 
  Tag, 
  Search, 
  MapPin, 
  CreditCard, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { InventoryItem, Order, SupportedLanguage } from '../types';
import { formatMoney, TRANSLATIONS } from '../utils/i18n';
import { generateOrderNumber, generateSecurePin } from '../utils/crypto';

interface CustomerStorefrontProps {
  inventory: InventoryItem[];
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onOrderCreated: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  inventory,
  currentCurrency,
  currentLang,
  onOrderCreated,
  onTrackOrder,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('Marcus Vance');
  const [email, setEmail] = useState('marcus.vance@techcorp.io');
  const [phone, setPhone] = useState('+1 (415) 882-9912');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [postalCode, setPostalCode] = useState('94107');
  const [country, setCountry] = useState('United States');
  const [countryCode, setCountryCode] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Instant 3D Secure)');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  const categories = ['all', ...new Set(inventory.map((i) => i.category))];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev;
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > ci.item.stock) return ci;
            return { ...ci, quantity: newQty };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  const isInternational = countryCode !== 'US';
  const shippingFee = cart.length > 0 ? (isInternational ? 28.0 : 15.0) : 0;
  const estimatedTax = cart.length > 0 ? Math.round(cartSubtotal * 0.08 * 100) / 100 : 0;
  const grandTotal = Math.max(0, cartSubtotal + shippingFee + estimatedTax - discountAmount);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'OMNI15' || promoCode.trim().toUpperCase() === 'SAVE15') {
      const disc = Math.round(cartSubtotal * 0.15 * 100) / 100;
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else if (promoCode.trim().toUpperCase() === 'WELCOME20') {
      const disc = Math.round(cartSubtotal * 0.20 * 100) / 100;
      setDiscountAmount(disc);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "OMNI15" for 15% off.');
    }
  };

  const handleCountryChange = (cCode: string) => {
    setCountryCode(cCode);
    if (cCode === 'US') {
      setCountry('United States');
    } else if (cCode === 'DE') {
      setCountry('Germany');
      setCity('Berlin');
      setState('Berlin');
      setPostalCode('10117');
    } else if (cCode === 'JP') {
      setCountry('Japan');
      setCity('Tokyo');
      setState('Tokyo');
      setPostalCode('107-0062');
    } else if (cCode === 'GB') {
      setCountry('United Kingdom');
      setCity('London');
      setState('Greater London');
      setPostalCode('NW1 6XE');
    } else if (cCode === 'FR') {
      setCountry('France');
      setCity('Paris');
      setState('Île-de-France');
      setPostalCode('75001');
    } else if (cCode === 'AU') {
      setCountry('Australia');
      setCity('Sydney');
      setState('NSW');
      setPostalCode('2000');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        items: cart.map((ci) => ({
          id: ci.item.id,
          sku: ci.item.sku,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          category: ci.item.category,
          imageUrl: ci.item.imageUrl,
        })),
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          postalCode,
          country,
          countryCode,
          lat: countryCode === 'US' ? 37.7749 : countryCode === 'DE' ? 52.52 : countryCode === 'JP' ? 35.6762 : 51.5074,
          lng: countryCode === 'US' ? -122.4194 : countryCode === 'DE' ? 13.405 : countryCode === 'JP' ? 139.6503 : -0.1278,
        },
        currency: currentCurrency,
        paymentMethod,
        discount: discountAmount,
        notes: orderNotes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const createdOrder: Order = await res.json();
      
      onOrderCreated(createdOrder);
      setOrderSuccess(createdOrder);
      setCart([]);
      setIsCheckingOut(false);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Store Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Globe className="w-3.5 h-3.5" />
            {t.internationalShipping}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Direct Customer Storefront & Quick Checkout
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Order premium verified inventory with instant multi-currency conversion, automated email dispatch, and live real-time GPS tracking code generation.
          </p>
        </div>

        {/* Global Security Micro-Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            {t.encryptionStandards}
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <Truck className="w-4 h-4" />
            Live Courier GPS Telemetry
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <Tag className="w-4 h-4" />
            Code: <strong className="text-white ml-1">OMNI15</strong> (15% Off)
          </span>
        </div>
      </div>

      {/* Main Content Layout: Catalog & Side Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="storefront-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`filter-cat-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredInventory.map((item) => {
              const inStock = item.stock > 0;
              const isLow = item.stock > 0 && item.stock <= item.minThreshold;
              const cartItem = cart.find((ci) => ci.item.id === item.id);

              return (
                <div
                  key={item.id}
                  id={`product-card-${item.id}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Stock Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {item.stock === 0 ? (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-red-500 text-white shadow">
                            {t.outOfStock}
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow">
                            {t.lowStock} ({item.stock} left)
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow">
                            {t.inStock} ({item.stock})
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        SKU: {item.sku}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                        {item.category}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">
                        Supplier: {item.supplier}
                      </p>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-slate-900">
                            {formatMoney(item.price, currentCurrency)}
                          </span>
                          {currentCurrency !== 'USD' && (
                            <span className="text-[11px] text-slate-400 ml-1">
                              (${item.price} USD)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.weightKg} kg / {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0">
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white border border-slate-200 rounded text-slate-700 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-800">
                          {cartItem.quantity} in cart
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={cartItem.quantity >= item.stock}
                          className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-to-cart-${item.id}`}
                        onClick={() => addToCart(item)}
                        disabled={!inStock}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {inStock ? 'Add to Cart' : t.outOfStock}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Shopping Cart & Checkout Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-base">{t.cart}</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                {cart.reduce((s, c) => s + c.quantity, 0)} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-medium">{t.emptyCart}</p>
                <p className="text-xs text-slate-400">
                  Select products from the catalog to build your customer order.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Cart Items List */}
                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {cart.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <img
                        src={ci.item.imageUrl}
                        alt={ci.item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {ci.item.name}
                        </p>
                        <p className="text-slate-500">
                          {formatMoney(ci.item.price, currentCurrency)} × {ci.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(ci.item.id, -1)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold px-1">{ci.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ci.item.id, 1)}
                          disabled={ci.quantity >= ci.item.stock}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(ci.item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Discount code (e.g. OMNI15)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Promo discount applied!
                    </p>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.subtotal}</span>
                    <span className="font-semibold text-slate-800">
                      {formatMoney(cartSubtotal, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      {t.shipping}
                      <span className="text-[10px] text-slate-400">
                        ({countryCode === 'US' ? 'Domestic' : 'International Express'})
                      </span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatMoney(shippingFee, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.tax}</span>
                    <span className="font-semibold text-slate-800">
                      {formatMoney(estimatedTax, currentCurrency)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatMoney(discountAmount, currentCurrency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>{t.total}</span>
                    <span className="text-blue-600">
                      {formatMoney(grandTotal, currentCurrency)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  id="start-checkout-modal-btn"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>{t.checkout}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Instant Secure Checkout
                </h3>
                <p className="text-xs text-slate-500">
                  Global fulfillment with automated customer notifications & GPS route generation.
                </p>
              </div>
              <button
                onClick={() => setIsCheckingOut(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              {/* Recipient Information */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  1. Customer Contact & Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Email (For Automated Dispatch)</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Phone Number (SMS / PIN Alerts)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* International Shipping Address */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    2. Shipping Address & Destination
                  </h4>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Auto-routing GPS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Country</label>
                    <select
                      value={countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="US">🇺🇸 United States</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="JP">🇯🇵 Japan</option>
                      <option value="GB">🇬🇧 United Kingdom</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="AU">🇦🇺 Australia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">State / Province</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  3. Encrypted Payment Gateway
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit Card (Instant 3D Secure)')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                      paymentMethod.includes('Credit Card')
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Apple Pay / Google Pay')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 ${
                      paymentMethod.includes('Apple Pay')
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-slate-700" />
                    <span>Apple / Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-slate-600 mb-1">Driver Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Leave at front door or buzzer #4"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Security & Grand Total Confirmation */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total Charged ({currentCurrency})</p>
                  <p className="text-lg font-black text-emerald-400">
                    {formatMoney(grandTotal, currentCurrency)}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Encrypting & Placing...' : t.placeOrder}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Order Received & Logged
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                #{orderSuccess.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated confirmation dispatched to <strong>{orderSuccess.customerEmail}</strong>
              </p>
            </div>

            {/* Security PIN box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Delivery Verification Security PIN
              </p>
              <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest">
                {orderSuccess.deliveryPin}
              </div>
              <p className="text-[10px] text-slate-400">
                Provide this 4-digit code to the courier to complete final verification.
              </p>
            </div>

            {/* Order Brief Summary */}
            <div className="bg-slate-50 p-3 rounded-lg text-left text-xs text-slate-600 space-y-1 border border-slate-100">
              <div className="flex justify-between">
                <span>Items:</span>
                <strong className="text-slate-800">{orderSuccess.items.length} product(s)</strong>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span>
                <strong className="text-slate-800">{orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.country}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <strong className="text-blue-600 font-extrabold">{formatMoney(orderSuccess.total, orderSuccess.currency)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                id="view-live-tracking-btn"
                onClick={() => {
                  onTrackOrder(orderSuccess.id);
                  setOrderSuccess(null);
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Truck className="w-4 h-4" />
                <span>Track Delivery Live</span>
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
