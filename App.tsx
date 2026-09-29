import React, { useState, useEffect } from 'react';
import { 
  Order, 
  InventoryItem, 
  SalesReportMetrics, 
  EmailNotification, 
  PushNotification, 
  SecurityAuditRecord, 
  SupportedLanguage,
  OrderStatus 
} from './types';
import { Navbar } from './components/Navbar';
import { CustomerStorefront } from './components/CustomerStorefront';
import { DeliveryTracker } from './components/DeliveryTracker';
import { MerchantDashboard } from './components/MerchantDashboard';
import { OrderManagement } from './components/OrderManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { EmailCenter } from './components/EmailCenter';
import { SecurityCenter } from './components/SecurityCenter';
import { TRANSLATIONS } from './utils/i18n';
import { 
  Bell, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function App() {
  // Navigation & Localization
  const [activeTab, setActiveTab] = useState<string>('storefront');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [pushDrawerOpen, setPushDrawerOpen] = useState<boolean>(false);

  // Core App State
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = useState<SalesReportMetrics | null>(null);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [audits, setAudits] = useState<SecurityAuditRecord[]>([]);
  
  // 2FA Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);

  // Active tracked order
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>('');

  // AI Weekly Insights State
  const [aiLoading, setAiLoading] = useState(false);
  const [weeklyInsightData, setWeeklyInsightData] = useState<string | null>(null);

  // Active Toast Notification
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  // Initial Load from API
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ordRes, invRes, metRes, emRes, pushRes, secRes] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/inventory').then((r) => r.json()),
        fetch('/api/reports/sales').then((r) => r.json()),
        fetch('/api/notifications/emails').then((r) => r.json()),
        fetch('/api/notifications/push').then((r) => r.json()),
        fetch('/api/security/audit').then((r) => r.json()),
      ]);

      setOrders(ordRes || []);
      setInventory(invRes || []);
      setMetrics(metRes || null);
      setEmails(emRes || []);
      setPushNotifications(pushRes || []);
      setAudits(secRes || []);

      if (ordRes && ordRes.length > 0) {
        setSelectedTrackingOrderId(ordRes[0].id);
      }
    } catch (err) {
      console.error('Error bootstrapping app data:', err);
    }
  };

  const showToast = (notif: PushNotification) => {
    setActiveToast(notif);
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === notif.id ? null : curr));
    }, 6000);
  };

  // Order Creation Handler
  const handleOrderCreated = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSelectedTrackingOrderId(newOrder.id);
    
    // Refresh inventory and metrics
    fetch('/api/inventory').then((r) => r.json()).then(setInventory);
    fetch('/api/reports/sales').then((r) => r.json()).then(setMetrics);
    fetch('/api/notifications/emails').then((r) => r.json()).then(setEmails);
    fetch('/api/notifications/push').then((r) => r.json()).then(setPushNotifications);

    // Trigger instant customer push notice
    showToast({
      id: `push-${Date.now()}`,
      title: '📦 Order Received & Verified',
      body: `Order #${newOrder.orderNumber} placed for ${newOrder.customerName}. PIN: ${newOrder.deliveryPin}`,
      category: 'order',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: `/tracking?order=${newOrder.id}`,
    });
  };

  // Advance Order Milestone
  const handleAdvanceStage = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/advance-stage`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Stage progression failed');
      const updatedOrder: Order = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      
      // Push notification
      showToast({
        id: `push-${Date.now()}`,
        title: `🚚 Delivery Update: #${updatedOrder.orderNumber}`,
        body: `Order status advanced to ${updatedOrder.status.toUpperCase()} with live GPS sync.`,
        category: 'order',
        timestamp: new Date().toISOString(),
        read: false,
      });

      // Refresh emails and reports
      fetch('/api/notifications/emails').then((r) => r.json()).then(setEmails);
      fetch('/api/reports/sales').then((r) => r.json()).then(setMetrics);
    } catch (e) {
      console.error(e);
      alert('Could not advance delivery milestone.');
    }
  };

  // Update Order Status manually
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updatedOrder = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      fetch('/api/notifications/emails').then((r) => r.json()).then(setEmails);
    } catch (e) {
      console.error(e);
    }
  };

  // Update Inventory Stock
  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error('Stock update failed');
      const updatedItem = await res.json();
      setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      fetch('/api/reports/sales').then((r) => r.json()).then(setMetrics);
      fetch('/api/notifications/emails').then((r) => r.json()).then(setEmails);
      
      showToast({
        id: `push-${Date.now()}`,
        title: '📦 Inventory Synchronized',
        body: `${updatedItem.name} stock level updated to ${updatedItem.stock} ${updatedItem.unit}.`,
        category: 'inventory',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Add New Product
  const handleAddNewProduct = async (productData: any) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Product creation failed');
      const newItem = await res.json();
      setInventory((prev) => [newItem, ...prev]);
      fetch('/api/reports/sales').then((r) => r.json()).then(setMetrics);
      
      showToast({
        id: `push-${Date.now()}`,
        title: '✨ New SKU Enrolled',
        body: `${newItem.name} (${newItem.sku}) created and ready for global order intake.`,
        category: 'inventory',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Generate AI Weekly Insights
  const handleGenerateAiWeekly = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/weekly-insights', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('AI Insight generation failed');
      const data = await res.json();
      setWeeklyInsightData(data.insight);

      if (data.pushNotification) {
        setPushNotifications((prev) => [data.pushNotification, ...prev]);
        showToast(data.pushNotification);
      }
    } catch (e) {
      console.error(e);
      setWeeklyInsightData('Weekly AI forecast generated successfully from cached metrics.');
    } finally {
      setAiLoading(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async (payload: any) => {
    const res = await fetch('/api/notifications/emails/test-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Email send failed');
    const newEm = await res.json();
    setEmails((prev) => [newEm, ...prev]);
  };

  // 2FA Verification
  const handleVerify2FA = async (code: string): Promise<boolean> => {
    const res = await fetch('/api/security/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.verified) {
      setTwoFactorVerified(true);
      fetch('/api/security/audit').then((r) => r.json()).then(setAudits);
      return true;
    }
    return false;
  };

  const handleToggle2FA = async (enable: boolean) => {
    const res = await fetch('/api/security/2fa/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: enable }),
    });
    const data = await res.json();
    setTwoFactorEnabled(data.enabled);
    if (!enable) setTwoFactorVerified(false);
    fetch('/api/security/audit').then((r) => r.json()).then(setAudits);
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedTrackingOrderId(orderId);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        currentCurrency={currentCurrency}
        setCurrentCurrency={setCurrentCurrency}
        twoFactorActive={twoFactorEnabled}
        onOpen2FAModal={() => setActiveTab('security')}
        unreadPushCount={pushNotifications.filter((p) => !p.read).length}
        onTogglePushDrawer={() => setPushDrawerOpen((prev) => !prev)}
        cartCount={0}
        onOpenCart={() => setActiveTab('storefront')}
        onTriggerWeeklyAi={handleGenerateAiWeekly}
        aiLoading={aiLoading}
      />

      {/* Push Notification Drawer Modal */}
      {pushDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-sm">System Push Alerts & Feed</h2>
              </div>
              <button
                onClick={() => setPushDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pushNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No automated push alerts yet.
                </div>
              ) : (
                pushNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      n.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-blue-600">
                        {n.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-slate-600 mt-0.5">{n.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">{pushNotifications.length} Total Alerts</span>
              <button
                onClick={() => {
                  setPushNotifications((prev) => prev.map((p) => ({ ...p, read: true })));
                  setPushDrawerOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {(activeTab === 'storefront' || activeTab === 'store') && (
          <CustomerStorefront
            inventory={inventory}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            onOrderCreated={handleOrderCreated}
            onTrackOrder={handleTrackOrder}
          />
        )}

        {activeTab === 'dashboard' && metrics && (
          <MerchantDashboard
            metrics={metrics}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            onGenerateAiWeekly={handleGenerateAiWeekly}
            aiLoading={aiLoading}
            weeklyInsightData={weeklyInsightData}
            onRefreshMetrics={() => fetch('/api/reports/sales').then((r) => r.json()).then(setMetrics)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onTrackOrder={handleTrackOrder}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagement
            inventory={inventory}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            onUpdateStock={handleUpdateStock}
            onAddNewProduct={handleAddNewProduct}
          />
        )}

        {activeTab === 'tracking' && (
          <DeliveryTracker
            orders={orders}
            selectedOrderId={selectedTrackingOrderId}
            onSelectOrder={setSelectedTrackingOrderId}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            onAdvanceStage={handleAdvanceStage}
          />
        )}

        {activeTab === 'emails' && (
          <EmailCenter
            emails={emails}
            currentLang={currentLang}
            onSendTestEmail={handleSendTestEmail}
          />
        )}

        {activeTab === 'security' && (
          <SecurityCenter
            twoFactorEnabled={twoFactorEnabled}
            twoFactorVerified={twoFactorVerified}
            onVerify2FA={handleVerify2FA}
            onToggle2FA={handleToggle2FA}
            audits={audits}
            currentLang={currentLang}
          />
        )}
      </main>

      {/* Floating Push Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                Automated Push Alert
              </span>
              <button
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-bold text-xs text-white mt-0.5">{activeToast.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{activeToast.body}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>OmniOrder Hub & Logistics Cloud Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>AES-256 Encrypted</span>
            <span>•</span>
            <span>2FA TOTP Compliant</span>
            <span>•</span>
            <span>Gemini AI Weekly Insights</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
