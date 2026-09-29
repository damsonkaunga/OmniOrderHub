import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Edit, 
  ArrowUpRight, 
  DollarSign, 
  Package, 
  Truck,
  TrendingDown
} from 'lucide-react';
import { InventoryItem, SupportedLanguage } from '../types';
import { formatMoney, TRANSLATIONS } from '../utils/i18n';

interface InventoryManagementProps {
  inventory: InventoryItem[];
  currentCurrency: string;
  currentLang: SupportedLanguage;
  onUpdateStock: (itemId: string, newStock: number) => void;
  onAddNewProduct: (product: any) => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  inventory,
  currentCurrency,
  currentLang,
  onUpdateStock,
  onAddNewProduct,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);

  // New product form
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState(120);
  const [costPrice, setCostPrice] = useState(55);
  const [stock, setStock] = useState(25);
  const [minThreshold, setMinThreshold] = useState(8);
  const [unit, setUnit] = useState('pcs');
  const [supplier, setSupplier] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80');

  const filteredItems = inventory.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.supplier.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const totalValuation = inventory.reduce((sum, i) => sum + i.stock * i.price, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) return;

    onAddNewProduct({
      sku: sku.toUpperCase(),
      name,
      category,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      minThreshold: Number(minThreshold),
      unit,
      supplier: supplier || 'Global Supplier Hub',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    });

    setIsAddModalOpen(false);
    // Reset form
    setSku('');
    setName('');
  };

  const handleSaveStockAdjustment = () => {
    if (!adjustingItem) return;
    onUpdateStock(adjustingItem.id, Math.max(0, adjustQty));
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Live Inventory Ledger
              </span>
              {lowStockCount > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lowStockCount} SKUs Need Restock
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Inventory & Supply Chain Management
            </h2>
            <p className="text-xs text-slate-500">
              Real-time stock reservation, automatic threshold warnings, and direct supplier restock workflows.
            </p>
          </div>

          <button
            id="add-new-sku-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>

        {/* Inventory KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold">Total Inventory Value</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {formatMoney(totalValuation, currentCurrency)}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold">Tracked Product SKUs</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {inventory.length} items
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold">Reserved for Orders</span>
            <p className="text-lg font-black text-blue-600 mt-0.5">
              {inventory.reduce((s, i) => s + (i.reserved || 0), 0)} units
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold">Reorder Alerts</span>
            <p className="text-lg font-black text-amber-600 mt-0.5">
              {lowStockCount} flagged
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU, Product Name, Category, or Supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Inventory Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (Alert)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.status === 'low_stock';
                const isOut = item.status === 'out_of_stock';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="font-mono text-[10px] text-blue-600 font-semibold">{item.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatMoney(item.price, currentCurrency)}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Cost: {formatMoney(item.costPrice, currentCurrency)}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 font-bold">
                      <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}>
                        {item.stock} {item.unit}
                      </span>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Threshold: {item.minThreshold}
                      </div>
                    </td>

                    {/* Reserved */}
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {item.reserved} {item.unit}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-[140px] truncate">
                      {item.supplier}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustQty(item.stock);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Adjust / Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Dialog */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Adjust Inventory Stock Level
            </h3>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-bold text-slate-800">{adjustingItem.name}</p>
              <p className="font-mono text-slate-500">SKU: {adjustingItem.sku}</p>
              <p className="text-slate-600">Current Stock: <strong>{adjustingItem.stock}</strong> (Threshold: {adjustingItem.minThreshold})</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                New Stock Quantity ({adjustingItem.unit}):
              </label>
              <input
                type="number"
                min="0"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveStockAdjustment}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Save & Synchronize
              </button>
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New SKU Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add New Inventory SKU</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRO-MIC-99"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Pro Condenser Microphone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">Retail Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Cost Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1">Initial Stock (Units) *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Reorder Alert Threshold</label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Supplier Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Sound Ltd"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow"
                >
                  Create & Allocate Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
