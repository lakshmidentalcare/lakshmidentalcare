'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Download, UserPlus, Phone, Calendar, HeartPulse, RefreshCw, CheckCircle2 } from 'lucide-react';
import PatientModal from '@/components/patients/PatientModal';
import { exportToCSV } from '@/utils/exportUtils';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';
import { generateNextPatientCode } from '@/utils/patientUtils';

export type Patient = {
  id: string;
  patientCode: string;
  name: string;
  phone: string;
  gender: string;
  age: number;
  lastVisit?: string;
  medicalHistory?: string;
};

const INITIAL_PATIENTS: Patient[] = [];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fast 2-second cloud DB polling for instant cross-device updates with auto-deduplication
  const loadPatients = async () => {
    try {
      const loaded: Patient[] = await syncLoadFromCloud('LDC_PATIENTS', []);
      if (!Array.isArray(loaded)) return;

      let duplicatesFound = false;
      const seenCodes = new Set<string>();
      let maxNum = 0;

      loaded.forEach(p => {
        if (p && p.patientCode) {
          const m = String(p.patientCode).match(/\d+/g);
          if (m) {
            m.forEach(n => {
              const val = parseInt(n, 10);
              if (!isNaN(val) && val > maxNum) maxNum = val;
            });
          }
        }
      });

      const cleaned = loaded.map((p, idx) => {
        const code = (p.patientCode || '').trim().toUpperCase();
        if (!code || seenCodes.has(code)) {
          duplicatesFound = true;
          maxNum++;
          let newCode = `LDC-P-${String(maxNum).padStart(3, '0')}`;
          while (seenCodes.has(newCode.toUpperCase())) {
            maxNum++;
            newCode = `LDC-P-${String(maxNum).padStart(3, '0')}`;
          }
          seenCodes.add(newCode.toUpperCase());
          console.warn(`[LDC Patient Duplicate Fixed] Patient #${idx + 1} (${p.name}) had duplicate serial number "${p.patientCode}". Reassigned: "${newCode}".`);
          return { ...p, patientCode: newCode };
        }
        seenCodes.add(code);
        return p;
      });

      if (duplicatesFound) {
        setPatients(cleaned);
        await syncSaveToCloud('LDC_PATIENTS', cleaned);
      } else {
        setPatients(loaded);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadPatients();
    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadPatients);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadPatients);
      }
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadPatients();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const savePatientsToStorage = async (updated: Patient[]) => {
    setPatients(updated);
    await syncSaveToCloud('LDC_PATIENTS', updated);
  };

  const handleSavePatient = async (patientData: Partial<Patient>) => {
    if (selectedPatient) {
      // Edit
      const updated = patients.map(p => 
        p.id === selectedPatient.id ? { ...p, ...patientData } as Patient : p
      );
      await savePatientsToStorage(updated);
    } else {
      // Create New with guaranteed unique sequential serial number
      const nextCode = generateNextPatientCode(patients);
      const newPatient: Patient = {
        id: 'p-' + Date.now(),
        patientCode: nextCode,
        name: patientData.name || 'New Patient',
        phone: patientData.phone || '',
        gender: patientData.gender || 'MALE',
        age: Number(patientData.age) || 30,
        lastVisit: new Date().toISOString().slice(0, 10),
        medicalHistory: patientData.medicalHistory || 'None'
      };
      const updatedList = [newPatient, ...patients];
      await savePatientsToStorage(updatedList);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const patientToDelete = patients.find(p => p.id === id);
    const confirmMsg = patientToDelete
      ? `Are you sure you want to permanently delete patient "${patientToDelete.name}" (${patientToDelete.patientCode})?\n\nThis will also remove any appointments associated with this patient.`
      : 'Are you sure you want to remove this patient record?';

    if (confirm(confirmMsg)) {
      const updated = patients.filter(p => p.id !== id);
      await savePatientsToStorage(updated);

      // Also clean up any associated appointments in cloud storage
      try {
        const appts = await syncLoadFromCloud('LDC_APPOINTMENTS', []);
        const filteredAppts = appts.filter((a: any) => a.patientId !== id);
        if (filteredAppts.length !== appts.length) {
          await syncSaveToCloud('LDC_APPOINTMENTS', filteredAppts);
        }
      } catch (e) {}
    }
  };

  const handleExportCSV = () => {
    const exportData = patients.map(p => ({
      'Patient ID': p.patientCode,
      'Full Name': p.name,
      'Phone': p.phone,
      'Gender': p.gender,
      'Age': p.age,
      'Last Visit': p.lastVisit || 'N/A',
      'Medical History': p.medicalHistory || 'None'
    }));
    exportToCSV('Lakshmi_Dental_Patients', exportData);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) ||
    p.patientCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Patients CRM Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage patient medical histories & real-time cloud records.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          {/* Manual Sync Cloud Button */}
          <button 
            onClick={handleManualSync}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-[#73308A]/20 transition-all active:scale-95 border border-[#DCB6EC]/20"
            title="Sync Cloud Data Now"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="hidden sm:flex bg-white hover:bg-[#FAF6FB] text-slate-700 border border-[#73308A]/15 font-semibold py-2.5 px-4 rounded-xl text-xs items-center shadow-xs transition-all"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            Export CSV
          </button>
          
          <button 
            onClick={() => { setSelectedPatient(null); setIsModalOpen(true); }}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-md shadow-[#73308A]/25 transition-all active:scale-95 border border-[#DCB6EC]/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="elite-card overflow-hidden">
        
        {/* Search & Counter Bar */}
        <div className="p-4 border-b border-[#73308A]/10 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/70">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF6FB] border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] outline-none transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 w-full sm:w-auto text-right">
            Total Patients: <span className="font-extrabold text-[#73308A]">{filteredPatients.length}</span>
          </div>
        </div>

        {/* Mobile View: Clean Responsive Cards (Visible on mobile screens < md) */}
        <div className="block md:hidden divide-y divide-[#73308A]/5">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No patients found. Click <strong className="text-[#73308A]">"Add Patient"</strong> to register a record.
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 space-y-3 bg-white hover:bg-[#FAF6FB]/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40 font-black flex items-center justify-center text-sm shadow-xs">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{patient.name}</h3>
                      <p className="text-[10px] font-mono font-bold text-[#73308A]">{patient.patientCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-[#73308A] hover:bg-[#F5EBF9] rounded-xl bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(patient.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-50">
                  <div className="flex items-center text-slate-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    <a href={`tel:${patient.phone}`} className="hover:underline">{patient.phone}</a>
                  </div>
                  <div className="text-slate-600 text-right">
                    {patient.age} Yrs • <span className="capitalize">{patient.gender.toLowerCase()}</span>
                  </div>
                </div>

                {patient.medicalHistory && (
                  <div className="flex items-center space-x-1.5 text-[10px] bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200/60">
                    <HeartPulse className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>History: {patient.medicalHistory}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Data Table (Visible on md+ screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#FAF6FB] text-[#73308A] font-extrabold uppercase tracking-wider border-b border-[#73308A]/10">
              <tr>
                <th className="px-6 py-3.5">Patient ID</th>
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Age / Gender</th>
                <th className="px-6 py-3.5">Medical History</th>
                <th className="px-6 py-3.5">Last Visit</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#73308A]/5">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No patients found. Click <strong className="text-[#73308A]">"Add Patient"</strong> to register a record.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[#FAF6FB]/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#73308A]">{patient.patientCode}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/40 font-extrabold flex items-center justify-center text-xs">
                        {patient.name.charAt(0)}
                      </div>
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{patient.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.age} Yrs / <span className="capitalize">{patient.gender.toLowerCase()}</span></td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        {patient.medicalHistory || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{patient.lastVisit || 'Today'}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-[#73308A] rounded-xl hover:bg-[#F5EBF9] transition-colors mr-1"
                        title="Edit Patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  );
}
