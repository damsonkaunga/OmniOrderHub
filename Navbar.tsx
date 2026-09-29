import React from 'react';
import { 
  Package, 
  Store, 
  MapPin, 
  Boxes, 
  BarChart3, 
  Mail, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Coins, 
  Sparkles,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { CURRENCIES, LANGUAGES, TRANSLATIONS } from '../utils/i18n';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentLang: SupportedLanguage;
  setCurrentLang: (lang: SupportedLanguage) => void;
  currentCurrency: string;
  setCurrentCurrency: (currency: string) => void;
  twoFactorActive: boolean;
  onOpen2FAModal: () => void;
  unreadPushCount: number;
  onTogglePushDrawer: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onTriggerWeeklyAi: () => void;
  aiLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentLang,
  setCurrentLang,
  currentCurrency,
  setCurrentCurrency,
  twoFactorActive,
  onOpen2FAModal,
  unreadPushCount,
  onTogglePushDrawer,
  cartCount,
  onOpenCart,
  onTriggerWeeklyAi,
  aiLoading,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const navItems = [
    { id: 'storefront', label: t.customerStore, icon: Store },
    { id: 'tracking', label: t.trackDelivery, icon: MapPin },
    { id: 'dashboard', label: t.merchantPortal, icon: BarChart3 },
    { id: 'orders', label: t.orders, icon: Package },
    { id: 'inventory', label: t.inventory, icon: Boxes },
    { id: 'emails', label: t.emailCenter, icon: Mail },
    { id: 'security', label: t.securityCenter, icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('storefront')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    OmniOrder
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    HUB
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Orders • Inventory • GPS Delivery
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: AI Weekly, 2FA, Language, Currency, Cart, Push */}
          <div className="flex items-center gap-2">
            {/* Quick AI Insights button */}
            <button
              id="quick-ai-insights-btn"
              onClick={onTriggerWeeklyAi}
              disabled={aiLoading}
              title="Generate Automated Weekly Business Insights"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/40 text-purple-200 hover:from-purple-600/40 hover:to-indigo-600/40 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 text-purple-300 ${aiLoading ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">{t.generateAiInsights}</span>
              <span className="xl:hidden">AI Insights</span>
            </button>

            {/* 2FA Badge Button */}
            <button
              id="nav-2fa-status-badge"
              onClick={onOpen2FAModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                twoFactorActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="2FA Security Status & Session Verification"
            >
              {twoFactorActive ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {twoFactorActive ? t.twoFactorActive : t.twoFactorDisabled}
              </span>
            </button>

            {/* Currency Selector */}
            <div className="relative flex items-center">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <Coins className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                id="currency-select"
                value={currentCurrency}
                onChange={(e) => setCurrentCurrency(e.target.value)}
                className="pl-6 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold cursor-pointer"
                title="Select international transaction currency"
              >
                {Object.values(CURRENCIES).map((cur) => (
                  <option key={cur.code} value={cur.code} className="bg-slate-900 text-white">
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <label htmlFor="language-select" className="sr-only">Language</label>
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                id="language-select"
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value as SupportedLanguage)}
                className="pl-6 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                title="Select language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Push Notifications Bell */}
            <button
              id="push-alerts-toggle-btn"
              onClick={onTogglePushDrawer}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
              title="Push Notification Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadPushCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadPushCount > 9 ? '9+' : unreadPushCount}
                </span>
              )}
            </button>

            {/* Cart Button (for storefront) */}
            <button
              id="nav-open-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-200 hover:bg-blue-600/50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Shopping Cart"
            >
              <Store className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="bg-blue-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onTriggerWeeklyAi();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-purple-600 text-white"
            >
              <Sparkles className="w-4 h-4" />
              {t.generateAiInsights}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
