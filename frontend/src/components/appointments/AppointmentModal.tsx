import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
}

export default function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/patients');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/doctors');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    startTime: '',
    duration: 30,
    type: 'REGULAR',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    if (appointment) {
      // For datetime-local input, format needs to be YYYY-MM-DDThh:mm
      const start = new Date(appointment.startTime);
      // Adjust for timezone offset for local viewing
      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(start.getTime() - tzOffset)).toISOString().slice(0, 16);
      
      setFormData({
        patientId: appointment.patientId || '',
        doctorId: appointment.doctorId || '',
        startTime: localISOTime,
        duration: appointment.duration || 30,
        type: appointment.type || 'REGULAR',
        status: appointment.status || 'SCHEDULED'
      });
    } else {
      setFormData({
        patientId: '',
        doctorId: '',
        startTime: '',
        duration: 30,
        type: 'REGULAR',
        status: 'SCHEDULED'
      });
    }
  }, [appointment, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert local time back to UTC for saving
      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(new Date(data.startTime).getTime() + data.duration * 60000).toISOString(),
      };
      
      if (appointment) {
        return apiClient.put(`/appointments/${appointment.id}`, payload);
      } else {
        return apiClient.post('/appointments', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] }); // Update live queue
      onClose();
    }
  });

  if (!isOpen) return null;

  const patientList = Array.isArray(patients) ? patients : (patients as any)?.patients || [];
  const doctorList = Array.isArray(doctors) ? doctors : (doctors as any)?.doctors || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E0726]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="elite-card bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[#73308A]/20">
        <div className="flex items-center justify-between p-5 border-b border-[#73308A]/10 bg-[#FAF6FB]/70">
          <h2 className="text-base font-extrabold text-slate-900">
            {appointment ? 'Edit Appointment' : 'Book Appointment'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Patient</label>
            <select 
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              disabled={!!appointment}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all disabled:opacity-60 font-bold text-slate-800"
            >
              <option value="">Select Patient</option>
              {patientList.map((patient: any) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.patientCode || patient.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Assigned Doctor</label>
            <select 
              value={formData.doctorId}
              onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold text-slate-800"
            >
              <option value="">Select Doctor</option>
              {doctorList.map((doctor: any) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization || 'Dentist'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Start Time</label>
            <input 
              type="datetime-local" 
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Duration (mins)</label>
              <input 
                type="number" 
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                step="15"
                min="15"
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Appointment Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
              >
                <option value="REGULAR">Regular Consultation</option>
                <option value="ROOT_CANAL">Root Canal Treatment</option>
                <option value="EXTRACTION">Tooth Extraction</option>
                <option value="CLEANING">Scaling & Polishing</option>
                <option value="BRACES">Orthodontic Adjustment</option>
                <option value="EMERGENCY">Emergency Care</option>
              </select>
            </div>
          </div>

          {appointment && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] transition-all font-bold"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="WAITING">Waiting Room</option>
                <option value="IN_PROGRESS">In Progress (Chair)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#73308A]/10 bg-[#FAF6FB]/70 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending || !formData.patientId || !formData.startTime}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] disabled:opacity-50 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/20 active:scale-95"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
