'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Activity, Box, Truck, CheckCircle2, Download, X } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type LabCase = {
  id: string;
  caseNumber: string;
  caseType: string;
  patientName: string;
  patientCode: string;
  labName: string;
  expectedDate: string;
  status: 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'FITTED';
  cost: number;
};
export default function LabManagementPage() {
  const [labCases, setLabCases] = useState<LabCase[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LabCase | null>(null);

  // Modal Form
  const [patientId, setPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [caseType, setCaseType] = useState('Monolithic Zirconia Crown');
  const [labName, setLabName] = useState('');
  const [expectedDate, setExpectedDate] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [status, setStatus] = useState<'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'FITTED'>('SENT');
  const [cost, setCost] = useState(0);

  useEffect(() => {
    async function loadData() {
      const loadedLab = await syncLoadFromCloud('LDC_LAB_CASES', []);
      setLabCases(Array.isArray(loadedLab) ? loadedLab : []);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(Array.isArray(loadedPatients) ? loadedPatients : []);
    }
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

  const saveLabCasesToStorage = async (updated: LabCase[]) => {
    setLabCases(updated);
    await syncSaveToCloud('LDC_LAB_CASES', updated);
  };

  const handleOpenCreate = () => {
    setSelectedCase(null);
    setPatientId(patients[0]?.id || '');
    setCustomPatientName('');
    setCaseType('Monolithic Zirconia Crown');
    setLabName('');
    setExpectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setStatus('SENT');
    setCost(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: LabCase) => {
    setSelectedCase(c);
    setCaseType(c.caseType);
    setLabName(c.labName);
    setExpectedDate(c.expectedDate);
    setStatus(c.status);
    setCost(c.cost);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.id === patientId);

    if (selectedCase) {
      const updated = labCases.map(c => c.id === selectedCase.id ? { ...c, caseType, labName, expectedDate, status, cost } : c);
      saveLabCasesToStorage(updated);
    } else {
      const newCase: LabCase = {
        id: 'lab-' + Date.now(),
        caseNumber: `LAB-${new Date().getFullYear()}-${String(labCases.length + 1).padStart(3, '0')}`,
        caseType,
        patientName: selPatient ? selPatient.name : (customPatientName.trim() || 'Walk-in Patient'),
        patientCode: selPatient ? (selPatient.patientCode || 'LDC-P') : 'LDC-WALK',
        labName: labName.trim() || 'Dental Laboratory',
        expectedDate,
        status,
        cost: Number(cost) || 0
      };
      saveLabCasesToStorage([newCase, ...labCases]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this lab tracking record?')) {
      const updated = labCases.filter(c => c.id !== id);
      saveLabCasesToStorage(updated);
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    const updated = labCases.map(c => c.id === id ? { ...c, status: newStatus } : c);
    saveLabCasesToStorage(updated);
  };

  const handleExportCSV = () => {
    const data = labCases.map(c => ({
      'Case #': c.caseNumber,
      'Case Type': c.caseType,
      'Patient Name': c.patientName,
      'Patient Code': c.patientCode,
      'Laboratory': c.labName,
      'Expected Delivery': c.expectedDate,
      'Status': c.status,
      'Lab Cost (₹)': c.cost
    }));
    exportToCSV('Lakshmi_Dental_Lab_Tracking', data);
  };

  const filteredCases = labCases.filter(c => 
    c.caseType.toLowerCase().includes(search.toLowerCase()) || 
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.labName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCases = labCases.filter(c => c.status === 'SENT' || c.status === 'IN_TRANSIT');
  const inTransitCases = labCases.filter(c => c.status === 'IN_TRANSIT');

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#73308A]" />
            Lab Case Tracking & Dental Prosthetics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track outgoing prosthetics, zirconia crowns, aligners, and lab partner deliveries.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-[#FAF6FB] text-slate-700 border border-[#73308A]/15 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-xs transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export CSV
          </button>
          
          <button 
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lab Case
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total Sent Cases</span>
            <h3 className="text-3xl font-extrabold text-[#73308A] mt-1">{labCases.length}</h3>
          </div>
          <div className="p-3 bg-[#F5EBF9] text-[#73308A] rounded-2xl border border-[#DCB6EC]/40">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Active Pending</span>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{activeCases.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="elite-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">In Transit</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{inTransitCases.length}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Main Table */}
      <div className="elite-card overflow-hidden">
        <div className="p-4 border-b border-[#73308A]/10 bg-white/70">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lab cases by patient, crown type, or lab name..."
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
                <th className="py-3.5 px-6">Case #</th>
                <th className="py-3.5 px-6">Restoration Type</th>
                <th className="py-3.5 px-6">Patient Name</th>
                <th className="py-3.5 px-6">Dental Laboratory</th>
                <th className="py-3.5 px-6">Expected Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#73308A]/5">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5EBF9] text-[#73308A] flex items-center justify-center border border-[#DCB6EC]/50 shadow-inner">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">No Lab Cases Recorded</h4>
                        <p className="text-xs text-slate-500">Track crowns, bridges, dentures, clear aligners, and dental lab partner dispatches.</p>
                      </div>
                      <button
                        onClick={handleOpenCreate}
                        className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2 px-4 rounded-xl text-xs flex items-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create First Lab Case
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF6FB]/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#73308A]">{c.caseNumber}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{c.caseType}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{c.patientName} <span className="text-slate-400 text-[10px]">({c.patientCode})</span></td>
                  <td className="py-4 px-6 text-slate-600">{c.labName}</td>
                  <td className="py-4 px-6 text-slate-500 font-mono">{c.expectedDate}</td>
                  <td className="py-4 px-6">
                    <select 
                      value={c.status} 
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold outline-none cursor-pointer ${
                        c.status === 'FITTED' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'DELIVERED' ? 'bg-[#F5EBF9] text-[#5D2471] border border-[#DCB6EC]/60' :
                        c.status === 'IN_TRANSIT' ? 'bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="SENT">SENT TO LAB</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED TO CLINIC</option>
                      <option value="FITTED">FITTED IN PATIENT</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-[#73308A] rounded-xl hover:bg-[#F5EBF9] mr-1 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="elite-card bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20">
            <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
              <h2 className="text-base font-extrabold text-slate-900">
                {selectedCase ? 'Edit Lab Case' : 'Create New Dental Lab Case'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Patient *</label>
                {patients.length > 0 ? (
                  <select 
                    value={patientId} 
                    onChange={e => setPatientId(e.target.value)}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#73308A]"
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customPatientName}
                    onChange={e => setCustomPatientName(e.target.value)}
                    placeholder="Enter Patient Full Name..."
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#73308A]"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Restoration / Prosthetic Type *</label>
                <input 
                  type="text" 
                  value={caseType} 
                  onChange={e => setCaseType(e.target.value)}
                  placeholder="e.g. Monolithic Zirconia Crown (#46)"
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-medium focus:border-[#73308A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Dental Laboratory Partner</label>
                <input 
                  type="text" 
                  value={labName} 
                  onChange={e => setLabName(e.target.value)}
                  placeholder="e.g. DentCare Prosthetic Lab"
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-medium focus:border-[#73308A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Expected Delivery</label>
                  <input 
                    type="date" 
                    value={expectedDate} 
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Lab Fee (₹)</label>
                  <input 
                    type="number" 
                    value={cost} 
                    onChange={e => setCost(Number(e.target.value))}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold font-mono focus:border-[#73308A]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#73308A]/10 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900">Cancel</button>
                <button type="submit" className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95">Save Lab Case</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
