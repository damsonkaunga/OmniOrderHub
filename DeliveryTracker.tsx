import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Gauge, 
  User, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Order, SupportedLanguage } from '../types';
import { formatMoney, TRANSLATIONS } from '../utils/i18n';

interface DeliveryTrackerProps {
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onAdvanceStage: (orderId: string) => void;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  currentCurrency,
  currentLang,
  onAdvanceStage,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [copiedPin, setCopiedPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerifiedMessage, setPinVerifiedMessage] = useState<string | null>(null);
  const [simulatingMovement, setSimulatingMovement] = useState(true);
  const [animationTick, setAnimationTick] = useState(0);

  // Active tracked order
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Auto-pulse map coordinates animation
  useEffect(() => {
    if (!simulatingMovement || !activeOrder || activeOrder.status === 'delivered') return;
    const interval = setInterval(() => {
      setAnimationTick((prev) => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, [simulatingMovement, activeOrder]);

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleVerifyPin = () => {
    if (!activeOrder) return;
    if (pinInput.trim() === activeOrder.deliveryPin) {
      setPinVerifiedMessage('✅ Success! PIN Authenticated. Delivery Verified.');
      if (activeOrder.status !== 'delivered') {
        onAdvanceStage(activeOrder.id);
      }
    } else {
      setPinVerifiedMessage('❌ Invalid PIN. Please check customer security code.');
    }
  };

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
        <Truck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Orders in Tracking Queue</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Place a new customer order or search for an active order to view real-time delivery GPS telemetry.
        </p>
      </div>
    );
  }

  const stages = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: Clock },
    { key: 'dispatched', label: 'Dispatched', icon: Navigation },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === activeOrder.status);
  const driver = activeOrder.driverInfo || {
    name: 'Carlos Mendez',
    phone: '+1 (415) 555-0199',
    vehicle: 'Eco Electric Van',
    plateNumber: '7XYZ892',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    speedKmH: 38,
    etaMinutes: 14,
    distanceKm: 3.2,
  };

  return (
    <div className="space-y-6">
      {/* Header & Order Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Live Real-Time Telemetry
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Tracking #{activeOrder.orderNumber}
          </h2>
          <p className="text-xs text-slate-500">
            Recipient: <strong className="text-slate-700">{activeOrder.customerName}</strong> ({activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.country})
          </p>
        </div>

        {/* Quick Order Selector Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label htmlFor="select-tracked-order" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Switch Order:
          </label>
          <select
            id="select-tracked-order"
            value={activeOrder.id}
            onChange={(e) => onSelectOrder(e.target.value)}
            className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.orderNumber} - {o.customerName} ({o.status.toUpperCase()})
              </option>
            ))}
          </select>
          
          <button
            id="advance-stage-trigger-btn"
            onClick={() => onAdvanceStage(activeOrder.id)}
            disabled={activeOrder.status === 'delivered'}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm disabled:opacity-50 whitespace-nowrap"
            title="Simulate Next Delivery Milestone Step"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Next Milestone</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map Visualizer & Tracking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live GPS Route Canvas & Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          {/* Interactive Map Visualizer */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
            {/* Map Canvas Background (Simulated Vector Map) */}
            <div className="relative h-80 sm:h-96 w-full bg-[#111827] overflow-hidden flex items-center justify-center">
              {/* Grid Roads and Contours */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Simulated Transit Corridor Curves */}
                <path
                  d="M 50 300 Q 200 150, 400 220 T 750 100"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
                <path
                  d="M 50 300 Q 200 150, 400 220 T 750 100"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
              </svg>

              {/* Warehouse Origin Node */}
              <div className="absolute left-10 bottom-16 flex flex-col items-center group">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-400 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-slate-800/90 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                  Fulfillment Hub
                </span>
              </div>

              {/* Driver Live Moving Marker */}
              <div 
                className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center"
                style={{
                  left: activeOrder.status === 'delivered' ? '82%' : activeOrder.status === 'out_for_delivery' ? '70%' : activeOrder.status === 'in_transit' ? '48%' : activeOrder.status === 'dispatched' ? '28%' : '15%',
                  top: activeOrder.status === 'delivered' ? '25%' : activeOrder.status === 'out_for_delivery' ? '30%' : activeOrder.status === 'in_transit' ? '50%' : activeOrder.status === 'dispatched' ? '65%' : '75%',
                }}
              >
                {/* Ripple radar */}
                <span className="absolute -inset-3 rounded-full bg-blue-500/30 animate-ping" />
                <div className="relative w-12 h-12 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-2xl shadow-blue-500">
                  <Navigation className="w-6 h-6 transform rotate-45" />
                </div>
                <div className="mt-1.5 px-2.5 py-1 rounded-md bg-slate-900/95 text-white border border-blue-400/40 text-center shadow-xl">
                  <p className="text-[11px] font-bold text-blue-300">{driver.name}</p>
                  <p className="text-[9px] text-slate-300">{driver.vehicle} • {driver.speedKmH} km/h</p>
                </div>
              </div>

              {/* Destination Dropoff Marker */}
              <div className="absolute right-10 top-12 flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                  {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.countryCode}
                </span>
              </div>

              {/* Live Overlay HUD Telemetry */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>ETA: <strong className="text-yellow-400">{driver.etaMinutes} mins</strong></span>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Speed: <strong className="text-emerald-400">{driver.speedKmH} km/h</strong></span>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dist: <strong className="text-purple-300">{driver.distanceKm} km left</strong></span>
                </div>
              </div>

              {/* Bottom Street Name Ribbon */}
              <div className="absolute bottom-3 left-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">Destination: {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                  Lat: {activeOrder.shippingAddress.lat.toFixed(4)}, Lng: {activeOrder.shippingAddress.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progression Milestone Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Delivery Milestones & Timeline</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPastOrCurrent = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage.key}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-500/20'
                        : isPastOrCurrent
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                        : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPastOrCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-[11px] leading-tight">
                      {stage.label}
                    </span>
                    <span className="text-[9px] mt-0.5 text-slate-500">
                      {isPastOrCurrent ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Detailed Timeline Events */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              {activeOrder.trackingTimeline.map((item, i) => (
                <div key={item.id || i} className="flex items-start gap-3 text-xs">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {item.completed ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold ${item.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '--:--'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Courier Profile & PIN Security Verification */}
        <div className="space-y-4">
          {/* Driver Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assigned Courier</h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Driver
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={driver.avatar}
                alt={driver.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                <p className="text-xs text-slate-500">{driver.vehicle} ({driver.plateNumber})</p>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                  ★ {driver.rating} <span className="text-slate-400 font-normal">/ 5.0 (2,400+ deliveries)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${driver.phone}`}
                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </a>
              <button
                onClick={() => alert(`Direct dispatcher connected with courier ${driver.name}.`)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Message
              </button>
            </div>
          </div>

          {/* Recipient Security PIN Verification Module */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-md border border-indigo-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Delivery 2FA PIN
              </span>
              <button
                onClick={() => copyPin(activeOrder.deliveryPin)}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
              >
                {copiedPin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>

            <div className="text-center py-2 bg-slate-800/80 rounded-xl border border-slate-700">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Receipt Verification Code</p>
              <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest my-1">
                {activeOrder.deliveryPin}
              </div>
              <p className="text-[10px] text-slate-400">Share only with courier upon package handoff</p>
            </div>

            {/* Merchant / Courier Confirmation simulator */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label htmlFor="courier-pin-input" className="block text-[11px] text-slate-300 font-semibold">
                Courier Hand-off Verification Check:
              </label>
              <div className="flex gap-2">
                <input
                  id="courier-pin-input"
                  type="text"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  id="confirm-pin-btn"
                  onClick={handleVerifyPin}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
              {pinVerifiedMessage && (
                <p className="text-[11px] font-medium text-slate-200 mt-1">
                  {pinVerifiedMessage}
                </p>
              )}
            </div>
          </div>

          {/* Order Details Accordion Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-2 text-slate-600">
            <h4 className="font-bold text-slate-800 pb-2 border-b border-slate-100">
              Package Manifest
            </h4>
            <div className="space-y-1.5">
              {activeOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 truncate mr-2">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatMoney(it.price * it.quantity, currentCurrency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total:</span>
              <span className="text-blue-600">
                {formatMoney(activeOrder.total, currentCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
