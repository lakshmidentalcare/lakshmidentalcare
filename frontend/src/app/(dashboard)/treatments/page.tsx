'use client';

import { useState } from 'react';
import { Stethoscope, Search, Plus, CheckCircle2, Shield, HeartPulse, Edit2, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { MASTER_DENTAL_TREATMENTS, DentalTreatmentItem } from '@/data/treatmentsData';

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<DentalTreatmentItem[]>(MASTER_DENTAL_TREATMENTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(MASTER_DENTAL_TREATMENTS.map(t => t.category)))];

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const exportData = treatments.map(t => ({
      'Procedure Name': t.name,
      'Category': t.category,
      'Default Fee (₹)': t.defaultCost,
      'Avg Duration': t.duration,
      'Description': t.description
    }));
    exportToCSV('Lakshmi_Dental_Master_Treatments_Catalog', exportData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#73308A]" />
            Master Dental Treatments Catalog ({treatments.length} Services)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Complete clinic catalog organized by 19 specialties with standard fees, duration, and descriptions.</p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="bg-white hover:bg-[#FAF6FB] text-slate-700 border border-[#73308A]/15 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-xs transition-all"
        >
          <Download className="w-4 h-4 mr-2 text-slate-500" />
          Export Treatments CSV
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="elite-card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search treatments (e.g. Root Canal, Crown, Implant, Whitening)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF6FB] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#73308A] focus:ring-2 focus:ring-[#73308A]/20 transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-[#73308A] to-[#5D2471] text-white shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20' 
                  : 'bg-slate-50 text-slate-600 hover:bg-[#FAF6FB] hover:text-[#73308A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Treatments Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreatments.map((treatment) => (
          <div key={treatment.id} className="elite-card p-6 space-y-3 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40">
                {treatment.category}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">{treatment.duration}</span>
            </div>

            {/* Clean Procedure Name without concatenated price */}
            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#73308A] transition-colors">
              {treatment.name}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
              {treatment.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Standard Fee</span>
                <span className="text-lg font-extrabold text-slate-900 font-mono">₹{treatment.defaultCost.toLocaleString()}</span>
              </div>

              <button 
                onClick={() => alert(`Procedure "${treatment.name}" selected! Standard Fee: ₹${treatment.defaultCost}`)}
                className="bg-slate-50 hover:bg-[#F5EBF9] text-slate-700 hover:text-[#73308A] font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-200 hover:border-[#DCB6EC] transition-all"
              >
                Select Procedure
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
