'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope, CheckCircle2, Download, Trash2, UserPlus, RefreshCw, Check } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { Patient } from '../patients/page';
import { syncSaveToCloud, syncLoadFromCloud } from '@/utils/cloudSync';

type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  dentistName: string;
  chairName: string;
  treatment: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'IN_CHAIR' | 'COMPLETED' | 'CANCELLED';
};
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('NEW');
  const [customPatientName, setCustomPatientName] = useState('');
  const [customPatientPhone, setCustomPatientPhone] = useState('');
  const [dentistName, setDentistName] = useState('Dr. Iswariya');
  const [chairName, setChairName] = useState('Chair 1 (Premium Operatory)');
  const [treatment, setTreatment] = useState('General Dental Consultation & Cleaning');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00 AM');

  const loadData = async () => {
    try {
      const loadedAppts = await syncLoadFromCloud('LDC_APPOINTMENTS', []);
      setAppointments(Array.isArray(loadedAppts) ? loadedAppts : []);

      const loadedPatients = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(Array.isArray(loadedPatients) ? loadedPatients : []);
    } catch (e) {}
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const saveAppointmentsToStorage = async (updated: Appointment[]) => {
    setAppointments(updated);
    await syncSaveToCloud('LDC_APPOINTMENTS', updated);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPatientName = '';
    let finalPatientPhone = '';

    if (patientId === 'NEW') {
      finalPatientName = customPatientName.trim() || 'Walk-in Patient';
      finalPatientPhone = customPatientPhone.trim() || '9840000000';

      // Auto add new patient to CRM
      const newP: Patient = {
        id: 'p-' + Date.now(),
        patientCode: `LDC-P-00${patients.length + 1}`,
        name: finalPatientName,
        phone: finalPatientPhone,
        gender: 'MALE',
        age: 30,
        lastVisit: date,
        medicalHistory: 'None'
      };
      const updatedP = [newP, ...patients];
      setPatients(updatedP);
      await syncSaveToCloud('LDC_PATIENTS', updatedP);
    } else {
      const selectedPatient = patients.find(p => p.id === patientId) || patients[0];
      finalPatientName = selectedPatient ? selectedPatient.name : (customPatientName || 'Walk-in Patient');
      finalPatientPhone = selectedPatient ? selectedPatient.phone : '9840000000';
    }

    const newAppt: Appointment = {
      id: 'app-' + Date.now(),
      patientName: finalPatientName,
      patientPhone: finalPatientPhone,
      dentistName,
      chairName,
      treatment,
      date,
      time,
      status: 'SCHEDULED'
    };

    await saveAppointmentsToStorage([newAppt, ...appointments]);
    setIsModalOpen(false);
    setCustomPatientName('');
    setCustomPatientPhone('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Cancel and remove this appointment?')) {
      const updated = appointments.filter(a => a.id !== id);
      await saveAppointmentsToStorage(updated);
    }
  };

  const handleStatusToggle = async (id: string) => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'SCHEDULED' ? 'IN_CHAIR' : a.status === 'IN_CHAIR' ? 'COMPLETED' : 'SCHEDULED';
        return { ...a, status: nextStatus as any };
      }
      return a;
    });
    await saveAppointmentsToStorage(updated);
  };

  const handleExportCSV = () => {
    const data = appointments.map(a => ({
      'Patient Name': a.patientName,
      'Phone': a.patientPhone,
      'Dentist': a.dentistName,
      'Chair': a.chairName,
      'Treatment': a.treatment,
      'Date': a.date,
      'Time': a.time,
      'Status': a.status
    }));
    exportToCSV('Lakshmi_Dental_Appointments', data);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#73308A]" />
            Smart Appointment Scheduler & Chair Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Book patient visits, allocate operatory chairs, and sync in real-time across devices.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
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
            onClick={() => {
              if (patients.length > 0) setPatientId(patients[0].id);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-md shadow-[#73308A]/25 transition-all active:scale-95 border border-[#DCB6EC]/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {appointments.length === 0 ? (
          <div className="col-span-full elite-card p-12 text-center flex flex-col items-center justify-center space-y-4 border border-[#73308A]/15 bg-gradient-to-b from-[#FAF6FB] to-white rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-[#F5EBF9] text-[#73308A] flex items-center justify-center border border-[#DCB6EC]/50 shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-extrabold text-slate-900 text-base">No Appointments Scheduled</h3>
              <p className="text-xs text-slate-500">Book patient visits, assign dental chairs, and allocate attending clinicians in real-time.</p>
            </div>
            <button 
              onClick={() => {
                if (patients.length > 0) setPatientId(patients[0].id);
                else setPatientId('NEW');
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule First Appointment
            </button>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="elite-card p-5 sm:p-6 space-y-4 hover:shadow-lg transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase text-[#73308A] tracking-wide bg-[#F5EBF9] px-2.5 py-0.5 rounded-full border border-[#DCB6EC]/40">
                    {appt.chairName}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base pt-1">{appt.patientName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{appt.patientPhone}</p>
                </div>

                <button 
                  onClick={() => handleStatusToggle(appt.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                    appt.status === 'IN_CHAIR' ? 'bg-[#FAF6FB] text-[#73308A] border border-[#DCB6EC] animate-pulse' :
                    appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {appt.status.replaceAll('_', ' ')}
                </button>
              </div>

              <div className="bg-[#FAF6FB]/80 p-3 rounded-2xl border border-[#73308A]/10 space-y-1 text-xs text-slate-700">
                <p className="font-bold text-[#73308A]">{appt.treatment}</p>
                <p className="text-slate-500 font-medium">Clinician: {appt.dentistName}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center text-slate-500 font-mono font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {appt.date} • {appt.time}
                </div>

                <button onClick={() => handleDelete(appt.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="elite-card bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20">
            <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#73308A]" />
                Book Clinic Appointment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4 text-xs">
              
              {/* Select Patient Section */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Select Patient *</label>
                
                {/* Mobile Quick Selection Chips (Tap to select patient instantly) */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPatientId(p.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 border transition-all ${
                        patientId === p.id 
                          ? 'bg-gradient-to-r from-[#73308A] to-[#5D2471] text-white border-[#73308A] shadow-xs scale-105' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#FAF6FB]'
                      }`}
                    >
                      <span>{p.name}</span>
                      {patientId === p.id && <Check className="w-3 h-3 ml-1" />}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setPatientId('NEW')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] border transition-all ${
                      patientId === 'NEW'
                        ? 'bg-gradient-to-r from-[#1E0726] to-[#5D2471] text-white border-[#32113E] shadow-xs scale-105'
                        : 'bg-[#F5EBF9] text-[#73308A] border-[#DCB6EC] hover:bg-[#EBD5F3]'
                    }`}
                  >
                    <span>➕ New / Walk-in</span>
                  </button>
                </div>

                {/* Dropdown fallback */}
                <select 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode || p.phone})
                    </option>
                  ))}
                  <option value="NEW">➕ Add New / Walk-in Patient</option>
                </select>
              </div>

              {/* Custom New Patient Fields if NEW is selected */}
              {patientId === 'NEW' && (
                <div className="p-3.5 bg-[#FAF6FB] rounded-2xl border border-[#DCB6EC]/60 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block font-bold text-[#73308A] mb-1">Patient Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Anitha Ramesh"
                      value={customPatientName} 
                      onChange={e => setCustomPatientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#73308A] mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 9840123456"
                      value={customPatientPhone} 
                      onChange={e => setCustomPatientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                    />
                  </div>
                </div>
              )}

              {/* Chair Allocation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dental Chair Allocation *</label>
                <select 
                  value={chairName} 
                  onChange={e => setChairName(e.target.value)}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                >
                  <option value="Chair 1 (Premium Operatory)">Chair 1 (Premium Operatory)</option>
                  <option value="Chair 2 (Surgical Suite)">Chair 2 (Surgical Suite)</option>
                  <option value="Chair 3 (Orthodontics & Hygiene)">Chair 3 (Orthodontics & Hygiene)</option>
                </select>
              </div>

              {/* Attending Clinician */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Clinician *</label>
                <select 
                  value={dentistName} 
                  onChange={e => setDentistName(e.target.value)}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-3 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                >
                  <option value="Dr. Iswariya">Dr. Iswariya (Chief Dental Surgeon)</option>
                  <option value="Dr. Ramana Krishnamurthy">Dr. Ramana Krishnamurthy (Endodontist)</option>
                  <option value="Dr. Shruti Viswanathan">Dr. Shruti Viswanathan (Associate Dentist)</option>
                </select>
              </div>

              {/* Treatment Procedure */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment Procedure</label>
                <input 
                  type="text" 
                  value={treatment} 
                  onChange={e => setTreatment(e.target.value)}
                  placeholder="e.g. Scaling & Polishing, Root Canal"
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-medium text-slate-900 focus:border-[#73308A]"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#73308A]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#73308A]/10 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900">Cancel</button>
                <button type="submit" className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95 transition-all">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
