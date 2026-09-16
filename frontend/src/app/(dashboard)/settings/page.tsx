'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Building, CreditCard, CheckCircle2, Download, Globe, UserCheck } from 'lucide-react';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

const DEFAULT_CONFIG = {
  superAdminName: 'Dr. Iswariya',
  superAdminSpecialization: 'Chief Dental Surgeon',
  clinicName: 'Lakshmi Dental Care',
  regNumber: '1463',
  phone: '+91 86808 55897',
  email: 'lakshmidentalcare5@gmail.com',
  address: 'No.72, Barathipuram Main Road, Govindasalai, Puducherry-605011',
  gstRate: 0,
  currencySymbol: '₹',
  invoicePrefix: 'INV-2026-',
  chair1Name: 'Chair 1 (Premium Operatory)',
  chair2Name: 'Chair 2 (Surgical Suite)',
  chair3Name: 'Chair 3 (Orthodontics & Hygiene)',
  autoBackup: true,
};

export default function SettingsPage() {
  const [clinicConfig, setClinicConfig] = useState(DEFAULT_CONFIG);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const loaded = await syncLoadFromCloud('LDC_CLINIC_CONFIG', DEFAULT_CONFIG);
      setClinicConfig({ ...DEFAULT_CONFIG, ...loaded });
    }
    loadSettings();

    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadSettings);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadSettings);
      }
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Save clinic config
      await syncSaveToCloud('LDC_CLINIC_CONFIG', clinicConfig);

      // 2. Update staff roster Super Admin name
      let staff = [];
      try {
        staff = JSON.parse(localStorage.getItem('LDC_STAFF') || '[]');
      } catch (e) {}

      if (staff.length > 0) {
        staff = staff.map((s: any) => s.id === '1' || s.role === 'SUPER_ADMIN' ? {
          ...s,
          name: clinicConfig.superAdminName,
          specialization: clinicConfig.superAdminSpecialization,
          regNumber: clinicConfig.regNumber
        } : s);
      } else {
        staff = [
          { id: '1', name: clinicConfig.superAdminName, email: 'admin@lakshmidental.com', phone: '9840001111', role: 'SUPER_ADMIN', regNumber: clinicConfig.regNumber, specialization: clinicConfig.superAdminSpecialization, status: 'ACTIVE' }
        ];
      }
      await syncSaveToCloud('LDC_STAFF', staff);

      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e) {
      setIsSaving(false);
      alert('Failed to save settings.');
    }
  };

  const handleExportFullDatabaseBackup = () => {
    const backupData = {
      patients: JSON.parse(localStorage.getItem('LDC_PATIENTS') || '[]'),
      appointments: JSON.parse(localStorage.getItem('LDC_APPOINTMENTS') || '[]'),
      invoices: JSON.parse(localStorage.getItem('LDC_INVOICES') || '[]'),
      staff: JSON.parse(localStorage.getItem('LDC_STAFF') || '[]'),
      config: clinicConfig,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LDC_Clinic_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#73308A]" />
            Clinic Master Settings & Cross-Device Cloud Sync
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure clinic profile, doctor names, registration numbers, tax settings, and cloud sync across all devices.</p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Settings Saved & Synced Across All Devices!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Section 1: Super Admin & Doctor Profile */}
        <div className="bg-white p-6 rounded-3xl elite-card border border-[#73308A]/10 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-[#73308A]/10 pb-3">
            <UserCheck className="w-5 h-5 text-[#73308A]" />
            Super Admin & Chief Clinician Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Super Admin Doctor Name *</label>
              <input 
                type="text" 
                value={clinicConfig.superAdminName} 
                onChange={e => setClinicConfig({...clinicConfig, superAdminName: e.target.value})}
                placeholder="Dr. Iswariya"
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-extrabold text-slate-900 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Designation & Specialization</label>
              <input 
                type="text" 
                value={clinicConfig.superAdminSpecialization} 
                onChange={e => setClinicConfig({...clinicConfig, superAdminSpecialization: e.target.value})}
                placeholder="Chief Dental Surgeon"
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinic Identity */}
        <div className="bg-white p-6 rounded-3xl elite-card border border-[#73308A]/10 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-[#73308A]/10 pb-3">
            <Building className="w-5 h-5 text-[#73308A]" />
            Clinic Identity & Dental Registration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Clinic Name</label>
              <input 
                type="text" 
                value={clinicConfig.clinicName} 
                onChange={e => setClinicConfig({...clinicConfig, clinicName: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">State Dental Registration No.</label>
              <input 
                type="text" 
                value={clinicConfig.regNumber} 
                onChange={e => setClinicConfig({...clinicConfig, regNumber: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-mono font-extrabold text-[#73308A] outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Official Phone Number</label>
              <input 
                type="text" 
                value={clinicConfig.phone} 
                onChange={e => setClinicConfig({...clinicConfig, phone: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Official Email</label>
              <input 
                type="email" 
                value={clinicConfig.email} 
                onChange={e => setClinicConfig({...clinicConfig, email: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Clinic Address (Appears on Invoices & Prescriptions)</label>
              <input 
                type="text" 
                value={clinicConfig.address} 
                onChange={e => setClinicConfig({...clinicConfig, address: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-medium text-slate-700 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Billing & Tax Settings */}
        <div className="bg-white p-6 rounded-3xl elite-card border border-[#73308A]/10 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-[#73308A]/10 pb-3">
            <CreditCard className="w-5 h-5 text-[#73308A]" />
            Tax & Financial Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Default GST Tax Rate (%)</label>
              <input 
                type="number" 
                value={clinicConfig.gstRate} 
                onChange={e => setClinicConfig({...clinicConfig, gstRate: Number(e.target.value)})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Currency Symbol</label>
              <input 
                type="text" 
                value={clinicConfig.currencySymbol} 
                onChange={e => setClinicConfig({...clinicConfig, currencySymbol: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1.5">Invoice Prefix Format</label>
              <input 
                type="text" 
                value={clinicConfig.invoicePrefix} 
                onChange={e => setClinicConfig({...clinicConfig, invoicePrefix: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data Security & Backup */}
        <div className="bg-white p-6 rounded-3xl elite-card border border-[#73308A]/10 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-[#73308A]/10 pb-3">
            <Globe className="w-5 h-5 text-[#73308A]" />
            Cross-Device Synchronization & Database Backup
          </h3>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF6FB] p-4 rounded-2xl border border-[#73308A]/15">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Download Complete Clinic Data Backup</h4>
              <p className="text-[11px] text-slate-500">Exports all patients, appointments, billing invoices, staff records, and settings into a JSON backup file.</p>
            </div>

            <button 
              type="button"
              onClick={handleExportFullDatabaseBackup}
              className="bg-[#1E0726] hover:bg-[#32113E] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shrink-0 transition-all shadow-md border border-[#DCB6EC]/20"
            >
              <Download className="w-4 h-4 text-[#DCB6EC]" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-lg shadow-[#73308A]/25 border border-[#DCB6EC]/30 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving & Syncing...' : 'Save All Settings & Sync'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
