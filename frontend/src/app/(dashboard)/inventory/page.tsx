'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Search, Edit, Trash2, Download, RefreshCw } from 'lucide-react';
import InventoryModal from '@/components/inventory/InventoryModal';
import { exportToCSV } from '@/utils/exportUtils';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
  unitCost: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const loadData = async () => {
    try {
      const saved = await syncLoadFromCloud('LDC_INVENTORY_ITEMS', []);
      setItems(Array.isArray(saved) ? saved : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadData);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadData);
      }
    };
  }, []);

  const saveItemsToStorage = async (updated: InventoryItem[]) => {
    setItems(updated);
    await syncSaveToCloud('LDC_INVENTORY_ITEMS', updated);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = (formData: any) => {
    if (selectedItem) {
      const updated = items.map(i => i.id === selectedItem.id ? { ...i, ...formData } as InventoryItem : i);
      saveItemsToStorage(updated);
    } else {
      const newItem: InventoryItem = {
        id: 'inv-' + Date.now(),
        name: formData.name,
        category: formData.category || 'Supplies',
        sku: formData.sku || `LDC-SKU-${items.length + 1}`,
        currentStock: Number(formData.currentStock) || 0,
        minStock: Number(formData.minStock) || 0,
        unit: formData.unit || 'unit',
        unitCost: Number(formData.unitCost) || 0
      };
      saveItemsToStorage([newItem, ...items]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      const updated = items.filter(i => i.id !== id);
      saveItemsToStorage(updated);
    }
  };

  const handleExportCSV = () => {
    const data = items.map(i => ({
      'Item Name': i.name,
      'Category': i.category,
      'SKU Code': i.sku,
      'Current Stock': `${i.currentStock} ${i.unit}`,
      'Minimum Alert Stock': `${i.minStock} ${i.unit}`,
      'Unit Cost (₹)': i.unitCost,
      'Total Value (₹)': i.currentStock * i.unitCost
    }));
    exportToCSV('Lakshmi_Dental_Inventory_Stock', data);
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(i => i.currentStock <= i.minStock);
  const totalValue = items.reduce((acc, curr) => acc + (curr.currentStock * curr.unitCost), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#73308A]" />
            Dental Inventory & Clinical Supplies
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track anesthetics, composite resins, PPE, endodontic files, and low-stock alerts.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-[#FAF6FB] text-slate-700 border border-[#73308A]/15 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-xs transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Inventory CSV
          </button>

          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supply Item
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Tracked Items</span>
            <h3 className="text-3xl font-extrabold text-[#73308A] mt-1">{items.length}</h3>
          </div>
          <div className="p-3 bg-[#F5EBF9] text-[#73308A] rounded-2xl border border-[#DCB6EC]/40">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Low Stock Alerts</span>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{lowStockItems.length}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Stock Value</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">₹{totalValue.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <span className="text-xl font-black">₹</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="elite-card overflow-hidden">
        <div className="p-4 border-b border-[#73308A]/10 bg-white/70">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory supplies by name, category, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF6FB] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#73308A] focus:ring-2 focus:ring-[#73308A]/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF6FB] text-[#73308A] font-extrabold uppercase tracking-wider border-b border-[#73308A]/10">
              <tr>
                <th className="py-3.5 px-6">Item Name & SKU</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Current Stock</th>
                <th className="py-3.5 px-6">Min Alert Stock</th>
                <th className="py-3.5 px-6">Unit Cost</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#73308A]/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5EBF9] text-[#73308A] flex items-center justify-center border border-[#DCB6EC]/50 shadow-inner">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">No Inventory Items Tracked</h4>
                        <p className="text-xs text-slate-500">Add dental materials, anesthetics, restorative composites, and surgical supplies to monitor stock levels.</p>
                      </div>
                      <button
                        onClick={handleCreate}
                        className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2 px-4 rounded-xl text-xs flex items-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add First Supply Item
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-[#FAF6FB]/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {isLow && <AlertTriangle className="w-4 h-4 text-rose-500 mr-2 shrink-0 animate-bounce" />}
                        <div>
                          <div className="font-extrabold text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono">{item.minStock} {item.unit}</td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">₹{item.unitCost}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-[#73308A] rounded-xl hover:bg-[#F5EBF9] mr-1 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSave={handleSaveModal}
      />
    </div>
  );
}
