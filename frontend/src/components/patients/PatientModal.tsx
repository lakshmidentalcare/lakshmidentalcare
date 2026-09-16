import { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, HeartPulse } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: any;
  onSave?: (data: any) => void;
}

export default function PatientModal({ isOpen, onClose, patient, onSave }: PatientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'MALE',
    age: '',
    medicalHistory: 'None'
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        gender: patient.gender || 'MALE',
        age: patient.age?.toString() || '',
        medicalHistory: patient.medicalHistory || 'None'
      });
    } else {
      setFormData({ name: '', phone: '', gender: 'MALE', age: '', medicalHistory: 'None' });
    }
  }, [patient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in Patient Name and Phone Number.');
      return;
    }

    if (onSave) {
      onSave({
        ...formData,
        age: parseInt(formData.age, 10) || 30
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="elite-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20 bg-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#73308A]" />
            {patient ? 'Edit Patient Record' : 'Register New Patient'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
              placeholder="e.g. 9840112233"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
                placeholder="e.g. 34"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Medical History / Allergies</label>
            <input 
              type="text" 
              value={formData.medicalHistory}
              onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all"
              placeholder="e.g. Diabetes, Hypertension, Penicillin Allergy"
            />
          </div>

          <div className="p-4 border-t border-[#73308A]/10 bg-[#FAF6FB]/70 flex justify-end space-x-3 -mx-6 -mb-6 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95"
            >
              Save Patient Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
