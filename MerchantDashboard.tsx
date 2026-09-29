import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck, 
  Boxes, 
  Sparkles, 
  Globe, 
  Calendar, 
  Download, 
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SalesReportMetrics, SupportedLanguage } from '../types';
import { formatMoney, TRANSLATIONS } from '../utils/i18n';

interface MerchantDashboardProps {
  metrics: SalesReportMetrics;
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onGenerateAiWeekly: () => void;
  aiLoading: boolean;
  weeklyInsightData: string | null;
  onRefreshMetrics: () => void;
  onNavigateTab: (tab: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  metrics,
  currentCurrency,
  currentLang,
  onGenerateAiWeekly,
  aiLoading,
  weeklyInsightData,
  onRefreshMetrics,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('7d');

  const exportCSV = () => {
    const rows = [
      ['Date', 'Revenue (USD)', 'Orders'],
      ...metrics.revenueByDay.map((r) => [r.date, r.revenue.toString(), r.orders.toString()]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Business Owner Executive Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Encrypted Synced Store
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            OmniOrder Performance & Logistics Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-currency sales velocity, international delivery tracking, and automated AI forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Filter */}
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === 'ytd' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              YTD
            </button>
          </div>

          <button
            onClick={onRefreshMetrics}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
            title="Refresh Real-time Metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exportCSV}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportReports}</span>
          </button>

          <button
            id="executive-gemini-ai-insights-btn"
            onClick={onGenerateAiWeekly}
            disabled={aiLoading}
            className="py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analyzing...' : t.generateAiInsights}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatMoney(metrics.grossRevenue, currentCurrency)}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% WoW Velocity</span>
            </div>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Orders & Avg Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalOrders} <span className="text-xs font-semibold text-slate-400 font-normal">orders</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              AOV: <strong className="text-slate-800">{formatMoney(metrics.averageOrderValue, currentCurrency)}</strong>
            </div>
          </div>
        </div>

        {/* Active GPS Deliveries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.activeDeliveries} <span className="text-xs font-semibold text-slate-400 font-normal">in transit</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold mt-1 cursor-pointer hover:underline" onClick={() => onNavigateTab('tracking')}>
              <span>View live route map →</span>
            </div>
          </div>
        </div>

        {/* Inventory Health Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Inventory Health</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.inventoryHealthScore}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Stock levels optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Automated Executive Briefing Banner (if generated or prompt ready) */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-purple-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Automated Weekly Business Intelligence Briefing
              </h3>
              <p className="text-xs text-purple-200/80">
                Synthesized across real-time order history, inventory depletion curves, and international delivery speeds.
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateAiWeekly}
            disabled={aiLoading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Insights</span>
          </button>
        </div>

        {/* Insight content display */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-5 border border-purple-500/20 text-xs text-slate-200 leading-relaxed font-sans prose-invert max-w-none">
          {aiLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-purple-300">
              <Sparkles className="w-8 h-8 animate-spin" />
              <p className="text-xs font-medium">Gemini 3.7 Flash is analyzing weekly sales velocity & inventory forecast...</p>
            </div>
          ) : weeklyInsightData ? (
            <div className="whitespace-pre-line space-y-2">
              {weeklyInsightData}
            </div>
          ) : (
            <div className="py-4 text-slate-400 text-center space-y-2">
              <p>Click <strong>"Generate AI Weekly Insights"</strong> to produce an automated executive summary and send out push alert notifications.</p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Charts: Revenue Area & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Velocity Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Revenue & Order Volume Trend</h3>
              <p className="text-xs text-slate-500">Daily trajectory across all international settlement currencies</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              High Growth Corridor
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueByDay}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: International Shipping by Country */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">International Orders by Country</h3>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.salesByCountry}
                  dataKey="revenue"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={4}
                >
                  {metrics.salesByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto pr-1">
            {metrics.salesByCountry.map((c, i) => (
              <div key={c.country} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>{c.flag}</span>
                  <span className="font-medium text-slate-800">{c.country}</span>
                </span>
                <span className="font-bold text-slate-900">
                  {formatMoney(c.revenue, currentCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Top-Performing SKUs by Revenue</h3>
            <p className="text-xs text-slate-500">Cross-referenced with inventory reservation counters</p>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage Inventory →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Product Name</th>
                <th className="pb-2.5">SKU</th>
                <th className="pb-2.5 text-right">Units Sold</th>
                <th className="pb-2.5 text-right">Gross Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.topSellingItems.map((item, idx) => (
                <tr key={item.sku} className="hover:bg-slate-50">
                  <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 font-black text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-700">{item.unitsSold} pcs</td>
                  <td className="py-2.5 text-right font-black text-slate-900">
                    {formatMoney(item.revenue, currentCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
