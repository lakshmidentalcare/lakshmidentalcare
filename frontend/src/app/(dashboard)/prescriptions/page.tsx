'use client';

import { useState, useEffect } from 'react';
import { Printer, Plus, Trash2, Pill, Search, Download, Edit2, Check, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

export type DrugItem = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  remarks: string;
};

const COMMON_DENTAL_MEDS = [
  { name: 'Tab. Augmentin 625mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', remarks: 'After food' },
  { name: 'Tab. Amoxicillin 500mg', dosage: '1 Cap', frequency: '1-1-1', duration: '5 Days', remarks: 'After food' },
  { name: 'Tab. Paracetamol 650mg', dosage: '1 Tab', frequency: '1-0-1', duration: '3 Days', remarks: 'SOS for pain / fever' },
  { name: 'Tab. Ketorolac DT 10mg', dosage: '1 Tab', frequency: 'SOS', duration: '3 Days', remarks: 'Dissolve in water, after food' },
  { name: 'Tab. Metronidazole 400mg', dosage: '1 Tab', frequency: '1-0-1', duration: '5 Days', remarks: 'After food' },
  { name: 'Chlorhexidine 0.2% Rinse', dosage: '10 ml', frequency: '1-0-1', duration: '7 Days', remarks: 'Rinse for 30 sec, don\'t swallow' },
];

const FREQUENCY_PRESETS = [
  '1-0-1 (Twice daily after food)',
  '1-1-1 (Thrice daily after food)',
  '1-0-0 (Once daily morning)',
  '0-0-1 (Once daily night)',
  '1-0-1',
  '1-1-1',
  '1-0-0',
  '0-0-1',
  'SOS (As needed for pain)',
  'Stat (Immediate single dose)',
  'Every 8 Hours',
  'Every 6 Hours',
  '0-1-0 (Afternoon)',
];

const DURATION_PRESETS = [
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '1 Month',
  'SOS',
  'Until relief',
];

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('Take medications after food unless specified otherwise.');
  
  // Drug inputs (for adding or editing)
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('5 Days');
  const [remarks, setRemarks] = useState('');
  
  const [drugsList, setDrugsList] = useState<DrugItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Direct medicine name editing state on Rx sheet
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [tempMedicineName, setTempMedicineName] = useState('');

  // Inline editing state for direct editing on the Rx sheet
  const [inlineEditItem, setInlineEditItem] = useState<DrugItem | null>(null);

  const saveMedicineNameDirectly = (idx: number, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed) {
      const updated = [...drugsList];
      updated[idx] = { ...updated[idx], medicineName: trimmed };
      setDrugsList(updated);
      if (editingIndex === idx) {
        setDrugName(trimmed);
        if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, medicineName: trimmed });
      }
    }
    setEditingNameIndex(null);
  };

  useEffect(() => {
    async function loadPatients() {
      try {
        const saved = await syncLoadFromCloud('LDC_PATIENTS', []);
        setPatients(Array.isArray(saved) ? saved : []);
      } catch (e) {
        console.error(e);
      }
    }
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

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Quick fill common dental meds
  const handleSelectQuickMed = (med: typeof COMMON_DENTAL_MEDS[0]) => {
    setDrugName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setDuration(med.duration);
    setRemarks(med.remarks);
  };

  const handleAddOrUpdateDrug = () => {
    if (!drugName.trim()) return;

    const newDrug: DrugItem = {
      medicineName: drugName.trim(),
      dosage: dosage.trim() || '1 Dose',
      frequency,
      duration,
      remarks: remarks.trim()
    };

    if (editingIndex !== null) {
      // Update existing
      const updated = [...drugsList];
      updated[editingIndex] = newDrug;
      setDrugsList(updated);
      setEditingIndex(null);
      setInlineEditItem(null);
    } else {
      // Add new
      setDrugsList([...drugsList, newDrug]);
    }

    // Reset fields
    setDrugName('');
    setDosage('');
    setRemarks('');
  };

  const startEditDrug = (idx: number) => {
    const target = drugsList[idx];
    setEditingIndex(idx);
    setDrugName(target.medicineName);
    setDosage(target.dosage);
    setFrequency(target.frequency);
    setDuration(target.duration);
    setRemarks(target.remarks);
    setInlineEditItem({ ...target });
  };

  const cancelEditDrug = () => {
    if (editingIndex !== null && (!drugsList[editingIndex]?.medicineName || !drugsList[editingIndex].medicineName.trim())) {
      const updated = [...drugsList];
      updated.splice(editingIndex, 1);
      setDrugsList(updated);
    }
    setEditingIndex(null);
    setInlineEditItem(null);
    setDrugName('');
    setDosage('');
    setRemarks('');
  };

  const saveInlineEdit = () => {
    if (editingIndex === null || !inlineEditItem) return;
    if (!inlineEditItem.medicineName.trim()) {
      alert('Please enter a medicine name or cancel.');
      return;
    }
    const updated = [...drugsList];
    updated[editingIndex] = { ...inlineEditItem };
    setDrugsList(updated);
    setEditingIndex(null);
    setInlineEditItem(null);
    setDrugName('');
    setDosage('');
    setRemarks('');
  };

  const addNewMedicineRow = (preset?: typeof COMMON_DENTAL_MEDS[0]) => {
    let currentList = [...drugsList];
    if (editingIndex !== null && inlineEditItem) {
      if (inlineEditItem.medicineName.trim()) {
        currentList[editingIndex] = { ...inlineEditItem };
      } else {
        currentList.splice(editingIndex, 1);
      }
    }

    const newDrug: DrugItem = preset
      ? {
          medicineName: preset.name,
          dosage: preset.dosage,
          frequency: preset.frequency,
          duration: preset.duration,
          remarks: preset.remarks,
        }
      : {
          medicineName: '',
          dosage: '1 Tab',
          frequency: '1-0-1',
          duration: '5 Days',
          remarks: 'After food',
        };

    const newIndex = currentList.length;
    setDrugsList([...currentList, newDrug]);

    if (!preset) {
      setEditingIndex(newIndex);
      setInlineEditItem({ ...newDrug });
      setDrugName(newDrug.medicineName);
      setDosage(newDrug.dosage);
      setFrequency(newDrug.frequency);
      setDuration(newDrug.duration);
      setRemarks(newDrug.remarks);
    } else {
      setEditingIndex(null);
      setInlineEditItem(null);
    }
  };

  const removeDrug = (idx: number) => {
    const newDocs = [...drugsList];
    newDocs.splice(idx, 1);
    setDrugsList(newDocs);
    if (editingIndex === idx) {
      cancelEditDrug();
    } else if (editingIndex !== null && editingIndex > idx) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedPatientId || drugsList.length === 0) {
      alert('Please select a patient and add at least one medication.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('LDC_PRESCRIPTIONS') || '[]');
      const newRecord = {
        id: 'rx-' + Date.now(),
        patientId: selectedPatientId,
        patientName: selectedPatient?.name || 'Unknown',
        patientCode: selectedPatient?.patientCode || '',
        diagnosis,
        instructions,
        items: drugsList,
        createdAt: new Date().toISOString()
      };
      const updated = [newRecord, ...existing];
      localStorage.setItem('LDC_PRESCRIPTIONS', JSON.stringify(updated));
      await syncSaveToCloud('LDC_PRESCRIPTIONS', updated);
    } catch (e) {
      console.error(e);
    }

    alert('Prescription saved successfully to clinical record!');
    setDrugsList([]);
    setDiagnosis('');
    setEditingIndex(null);
    setInlineEditItem(null);
  };

  const handleExportCSV = () => {
    const data = drugsList.map(d => ({
      'Patient Name': selectedPatient?.name || 'N/A',
      'Diagnosis': diagnosis || 'N/A',
      'Medicine Name': d.medicineName,
      'Dosage': d.dosage,
      'Frequency': d.frequency,
      'Duration': d.duration,
      'Remarks': d.remarks
    }));
    exportToCSV('Lakshmi_Dental_Prescription', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Prescriptions Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Generate, edit, and print digital prescriptions with logo header & watermark.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            disabled={drugsList.length === 0}
            className="bg-white hover:bg-[#FAF6FB] disabled:opacity-50 text-slate-700 border border-[#73308A]/15 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center shadow-xs transition-all"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Prescriptions CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Builder Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="elite-card p-6 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-[#73308A]/10 pb-2">Rx Details</h4>
            
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Select Patient *</label>
              <select 
                value={selectedPatientId} 
                onChange={(e) => setSelectedPatientId(e.target.value)} 
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#73308A] focus:ring-2 focus:ring-[#73308A]/20"
              >
                <option value="">-- Select Saved Patient ({patients.length}) --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Clinical Diagnosis</label>
              <input 
                type="text" 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Pulpitis 46, Deep Dental Caries"
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-medium focus:border-[#73308A]"
              />
            </div>
            
            {/* Add / Edit Medication Form */}
            <div className={`pt-4 border-t border-slate-100 space-y-3 transition-all ${editingIndex !== null ? 'p-3 bg-[#FAF6FB] rounded-2xl border border-[#DCB6EC]/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                    {editingIndex !== null ? `Edit Medicine #${editingIndex + 1}` : 'Add Medication'}
                  </h5>
                  {editingIndex !== null && (
                    <span className="bg-[#F5EBF9] text-[#73308A] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center border border-[#DCB6EC]/40">
                      <Edit2 className="w-2.5 h-2.5 mr-1" /> Editing
                    </span>
                  )}
                </div>
                {editingIndex !== null && (
                  <button 
                    onClick={cancelEditDrug}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center"
                  >
                    <X className="w-3.5 h-3.5 mr-0.5" /> Cancel
                  </button>
                )}
              </div>

              {/* Dental Quick Presets */}
              {editingIndex === null && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Quick Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_DENTAL_MEDS.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuickMed(m)}
                        className="text-[10px] font-medium bg-slate-100 hover:bg-[#FAF6FB] hover:text-[#73308A] hover:border-[#DCB6EC] border border-slate-200 text-slate-600 px-2 py-1 rounded-lg transition-all"
                      >
                        {m.name.split(' ')[1] || m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Medicine Name *</label>
                  <input 
                    type="text" placeholder="e.g. Tab. Augmentin 625mg" 
                    value={drugName} onChange={(e) => {
                      setDrugName(e.target.value);
                      if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, medicineName: e.target.value });
                    }}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-medium focus:bg-white focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Dosage</label>
                  <input 
                    type="text" placeholder="e.g. 1 Tab" 
                    value={dosage} onChange={(e) => {
                      setDosage(e.target.value);
                      if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, dosage: e.target.value });
                    }}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Frequency (Type or Select)</label>
                  <input 
                    type="text"
                    list="frequency-presets"
                    placeholder="e.g. 1-0-1 or custom"
                    value={frequency} 
                    onChange={(e) => {
                      setFrequency(e.target.value);
                      if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, frequency: e.target.value });
                    }}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold focus:bg-white focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Duration (Type or Select)</label>
                  <input 
                    type="text"
                    list="duration-presets"
                    placeholder="e.g. 5 Days or custom"
                    value={duration} 
                    onChange={(e) => {
                      setDuration(e.target.value);
                      if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, duration: e.target.value });
                    }}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold focus:bg-white focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Remarks</label>
                  <input 
                    type="text" placeholder="e.g. After Food" 
                    value={remarks} onChange={(e) => {
                      setRemarks(e.target.value);
                      if (inlineEditItem) setInlineEditItem({ ...inlineEditItem, remarks: e.target.value });
                    }}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-[#73308A]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                {editingIndex !== null ? (
                  <>
                    <button 
                      onClick={handleAddOrUpdateDrug}
                      disabled={!drugName.trim()}
                      className="flex-1 bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 flex justify-center items-center"
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Save Changes
                    </button>
                    <button 
                      onClick={cancelEditDrug}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleAddOrUpdateDrug}
                    disabled={!drugName.trim()}
                    className="w-full bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 flex justify-center items-center disabled:opacity-50 border border-[#DCB6EC]/20"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Medication to Rx
                  </button>
                )}
              </div>
            </div>

            {/* List of current medications in builder panel for quick overview & edit */}
            {drugsList.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    Added Medications ({drugsList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      cancelEditDrug();
                    }}
                    className="text-[10px] text-[#73308A] hover:text-[#5D2471] font-bold flex items-center space-x-1 hover:underline"
                    title="Add another medicine"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Another</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {drugsList.map((d, i) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        editingIndex === i ? 'bg-[#FAF6FB] border-[#DCB6EC] shadow-xs ring-2 ring-[#73308A]/20' : 'bg-slate-50 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 text-xs truncate">{d.medicineName}</p>
                          <p className="text-[10px] text-slate-500">{d.dosage} • {d.frequency} ({d.duration})</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button 
                          onClick={() => startEditDrug(i)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            editingIndex === i ? 'bg-[#73308A] text-white' : 'text-slate-400 hover:text-[#73308A] hover:bg-[#F5EBF9]'
                          }`}
                          title="Edit Medication"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => removeDrug(i)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Medication"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">General Instructions</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-medium focus:border-[#73308A]"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Printable PDF View */}
        <div className="lg:col-span-7 bg-[#FAF6FB] p-8 rounded-3xl flex flex-col items-center border border-[#73308A]/15">
          <div className="w-full flex justify-end mb-4 space-x-3">
             <button 
                onClick={handleSaveRecord}
                disabled={drugsList.length === 0 || !selectedPatientId}
                className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Clinical Rx</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print PDF</span>
              </button>
          </div>

          {/* Actual Printable Page A4 Aspect Ratio Box */}
          <div className="bg-white w-full max-w-2xl aspect-[1/1.414] shadow-md border border-[#73308A]/15 p-10 relative text-slate-800 rounded-3xl overflow-hidden print:p-0 print:border-none print:shadow-none print:aspect-auto">
            
            {/* Background Watermark Logo */}
            <div 
              className="absolute inset-0 pointer-events-none bg-center bg-no-repeat bg-contain opacity-[0.035]"
              style={{ backgroundImage: `url('/logo.png')` }}
            />

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#73308A] pb-4 relative z-10">
              <div className="flex items-center space-x-3 text-left">
                <img src="/logo.png" className="w-16 h-16 object-contain rounded-xl border border-slate-100 bg-white p-1" alt="Logo" />
                <div>
                  <h2 className="text-2xl font-black text-[#73308A] uppercase tracking-wide">Lakshmi Dental Care</h2>
                  <p className="text-xs text-slate-600 font-bold">Dr. Iswariya, BDS (Chief Dental Surgeon)</p>
                  <p className="text-[10px] text-slate-600 font-bold">Dr. Reg No: 1463</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 space-y-0.5 relative z-10">
                <p>No.72, Barathipuram Main Road,</p>
                <p>Govindasalai, Puducherry-605011</p>
                <p className="font-bold text-slate-700 mt-1">Phone: +91 86808 55897</p>
              </div>
            </div>

            {/* Patient Info Bar */}
            <div className="flex justify-between items-center py-4 text-xs font-bold border-b border-slate-100 relative z-10">
              <div>
                <span className="text-slate-400 mr-2 uppercase text-[10px]">Patient:</span> 
                {selectedPatient ? selectedPatient.name : 'Select Patient'} 
                {selectedPatient && <span className="ml-2 font-normal text-slate-500">({selectedPatient.age} Yrs / {selectedPatient.gender.charAt(0)})</span>}
              </div>
              <div>
                <span className="text-slate-400 mr-2 uppercase text-[10px]">Date:</span> 
                {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            {/* Diagnosis */}
            {diagnosis && (
              <div className="py-3 text-xs font-bold border-b border-slate-100 relative z-10">
                <span className="text-slate-400 text-[10px] uppercase mr-2">Clinical Diagnosis:</span>
                <span className="text-slate-900">{diagnosis}</span>
              </div>
            )}

            {/* Rx Symbol */}
            <div className="py-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-serif italic text-[#73308A] font-black">Rx</div>
                {drugsList.length > 0 && (
                  <span className="print:hidden text-[11px] text-slate-400 font-medium italic">
                    Hover medicine to edit or remove
                  </span>
                )}
              </div>
              
              {/* Drugs List */}
              <div className="space-y-4 min-h-[260px]">
                {drugsList.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 print:border-none print:bg-transparent space-y-3">
                    <p className="text-slate-400 text-xs italic">No medications listed yet on this prescription.</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
                      <button
                        type="button"
                        onClick={() => addNewMedicineRow()}
                        className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-[#73308A]/25 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Medicine to Prescription</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  drugsList.map((drug, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs border-b border-dashed transition-all pb-3 ${
                        editingIndex === idx 
                          ? 'bg-[#FAF6FB] p-3.5 rounded-2xl border border-[#DCB6EC] shadow-xs -mx-2' 
                          : 'border-slate-100 hover:bg-[#FAF6FB]/60 rounded-xl p-1.5'
                      }`}
                    >
                      {editingIndex === idx && inlineEditItem ? (
                        /* Inline Edit Form directly on the Prescription */
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-[#DCB6EC]">
                            <span className="font-extrabold text-[#73308A] text-[11px] uppercase tracking-wide flex items-center">
                              <Edit2 className="w-3 h-3 mr-1 text-[#73308A]" /> Editing Medicine #{idx + 1}
                            </span>
                            <div className="flex items-center space-x-1.5 print:hidden">
                              <button 
                                onClick={saveInlineEdit}
                                className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 shadow-sm transition-all"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button 
                                onClick={cancelEditDrug}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-2 py-1 rounded-lg text-[11px] flex items-center space-x-1 transition-all"
                              >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <input 
                                type="text"
                                autoFocus
                                value={inlineEditItem.medicineName}
                                onChange={(e) => {
                                  const updated = { ...inlineEditItem, medicineName: e.target.value };
                                  setInlineEditItem(updated);
                                  setDrugName(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveInlineEdit();
                                  }
                                }}
                                placeholder="Medicine Name (e.g. Tab. Augmentin 625mg)"
                                className="w-full bg-white border border-brand-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 shadow-sm"
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                value={inlineEditItem.dosage}
                                onChange={(e) => {
                                  const updated = { ...inlineEditItem, dosage: e.target.value };
                                  setInlineEditItem(updated);
                                  setDosage(e.target.value);
                                }}
                                placeholder="Dosage (e.g. 1 Tab)"
                                className="w-full bg-white border border-brand-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-brand-500"
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                list="frequency-presets"
                                value={inlineEditItem.frequency}
                                onChange={(e) => {
                                  const updated = { ...inlineEditItem, frequency: e.target.value };
                                  setInlineEditItem(updated);
                                  setFrequency(e.target.value);
                                }}
                                placeholder="Frequency (e.g. 1-0-1)"
                                className="w-full bg-white border border-brand-200 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-brand-500"
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                list="duration-presets"
                                value={inlineEditItem.duration}
                                onChange={(e) => {
                                  const updated = { ...inlineEditItem, duration: e.target.value };
                                  setInlineEditItem(updated);
                                  setDuration(e.target.value);
                                }}
                                placeholder="Duration (e.g. 5 Days)"
                                className="w-full bg-white border border-brand-200 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-brand-500"
                              />
                            </div>
                            <div>
                              <input 
                                type="text"
                                value={inlineEditItem.remarks}
                                onChange={(e) => {
                                  const updated = { ...inlineEditItem, remarks: e.target.value };
                                  setInlineEditItem(updated);
                                  setRemarks(e.target.value);
                                }}
                                placeholder="Remarks (e.g. After food)"
                                className="w-full bg-white border border-brand-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Normal display mode: Directly editable fields */
                        <div className="flex justify-between items-start group/row">
                          <div className="flex-1 mr-3 space-y-0.5">
                            <div className="font-bold flex items-center text-slate-900 text-sm">
                              <span className="text-slate-400 mr-1.5 font-mono text-xs select-none">{idx + 1}.</span> 
                              <input 
                                type="text"
                                value={drug.medicineName}
                                onChange={(e) => {
                                  const updated = [...drugsList];
                                  updated[idx] = { ...updated[idx], medicineName: e.target.value };
                                  setDrugsList(updated);
                                  if (editingIndex === idx) setDrugName(e.target.value);
                                }}
                                className="font-bold text-slate-900 text-sm bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-500 rounded-lg px-1.5 py-0.5 outline-none transition-all w-full max-w-sm print:border-none print:bg-transparent print:p-0"
                                placeholder="Medicine Name"
                                title="Click to edit medicine name"
                              />
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] ml-5">
                              <input 
                                type="text"
                                value={drug.dosage}
                                onChange={(e) => {
                                  const updated = [...drugsList];
                                  updated[idx] = { ...updated[idx], dosage: e.target.value };
                                  setDrugsList(updated);
                                  if (editingIndex === idx) setDosage(e.target.value);
                                }}
                                className="text-slate-600 font-semibold text-[11px] bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-500 rounded px-1 py-0.5 outline-none transition-all w-24 print:border-none print:bg-transparent print:p-0"
                                placeholder="Dosage"
                                title="Click to edit dosage"
                              />
                              <span className="text-slate-400 select-none">•</span>
                              <input 
                                type="text"
                                value={drug.remarks}
                                onChange={(e) => {
                                  const updated = [...drugsList];
                                  updated[idx] = { ...updated[idx], remarks: e.target.value };
                                  setDrugsList(updated);
                                  if (editingIndex === idx) setRemarks(e.target.value);
                                }}
                                className="text-slate-500 italic text-[11px] bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-500 rounded px-1 py-0.5 outline-none transition-all flex-1 max-w-xs print:border-none print:bg-transparent print:p-0"
                                placeholder="Remarks (e.g. After food)"
                                title="Click to edit remarks"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-right font-mono text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 flex items-center space-x-1 print:bg-transparent print:border-none">
                              <input 
                                type="text"
                                list="frequency-presets"
                                value={drug.frequency}
                                onChange={(e) => {
                                  const updated = [...drugsList];
                                  updated[idx] = { ...updated[idx], frequency: e.target.value };
                                  setDrugsList(updated);
                                  if (editingIndex === idx) setFrequency(e.target.value);
                                }}
                                className="bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-500 rounded px-1.5 py-0.5 outline-none text-right font-mono font-bold w-28 sm:w-36 min-w-[70px] print:border-none print:bg-transparent print:p-0"
                                title="Click to edit frequency (or pick suggestion)"
                                placeholder="Frequency"
                              />
                              <span className="text-slate-400 font-normal">for</span>
                              <input 
                                type="text"
                                list="duration-presets"
                                value={drug.duration}
                                onChange={(e) => {
                                  const updated = [...drugsList];
                                  updated[idx] = { ...updated[idx], duration: e.target.value };
                                  setDrugsList(updated);
                                  if (editingIndex === idx) setDuration(e.target.value);
                                }}
                                className="bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-brand-500 rounded px-1.5 py-0.5 outline-none font-mono font-bold w-20 print:border-none print:bg-transparent print:p-0"
                                title="Click to edit duration"
                                placeholder="Duration"
                              />
                            </div>
                            
                            {/* Action Buttons (Excluded from Print) */}
                            <div className="flex items-center space-x-1 print:hidden ml-2">
                              <button 
                                onClick={() => startEditDrug(idx)} 
                                title="Edit in builder panel"
                                className="p-1.5 text-slate-400 hover:text-[#73308A] hover:bg-[#F5EBF9] rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removeDrug(idx)} 
                                title="Remove medicine"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Direct Action Bar to Add New Medicine in Prescription List (print:hidden) */}
                <div className="pt-3 border-t border-dashed border-slate-200 print:hidden space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addNewMedicineRow()}
                      className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Medicine to Prescription</span>
                    </button>
                    
                    <span className="text-[11px] text-slate-400 font-medium">Quick add:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_DENTAL_MEDS.map((med, mIdx) => (
                        <button
                          key={mIdx}
                          type="button"
                          onClick={() => addNewMedicineRow(med)}
                          className="bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 hover:border-brand-200 text-[11px] font-medium px-2 py-1 rounded-lg transition-all shadow-2xs"
                          title={`Add ${med.name} directly to prescription`}
                        >
                          + {med.name.replace('Tab. ', '').replace('Chlorhexidine 0.2% ', 'CHX ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="absolute bottom-8 left-10 right-10 relative z-10">
              <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 mb-6">
                <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase">Doctor Instructions:</span>
                {instructions}
              </div>
              
              <div className="flex justify-end">
                <div className="text-center">
                  <div className="h-12 w-32 border-b border-slate-300 mb-1 flex items-end justify-center">
                    <span className="font-serif italic text-brand-900 text-xl font-bold opacity-75">Dr. Iswariya</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">Clinician Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Autocomplete datalists */}
      <datalist id="frequency-presets">
        {FREQUENCY_PRESETS.map((f, i) => (
          <option key={i} value={f} />
        ))}
      </datalist>

      <datalist id="duration-presets">
        {DURATION_PRESETS.map((d, i) => (
          <option key={i} value={d} />
        ))}
      </datalist>
    </div>
  );
}
