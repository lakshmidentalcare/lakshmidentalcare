'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Clock,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  UserPlus,
  Stethoscope,
  BrainCircuit,
  CreditCard,
  Package,
  RefreshCw,
  Edit3,
  CheckCircle,
  Check,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import PatientModal from '@/components/patients/PatientModal';
import { syncLoadFromCloud, syncSaveToCloud } from '@/utils/cloudSync';
import { generateNextPatientCode } from '@/utils/patientUtils';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [labCases, setLabCases] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const defaultChairs = [
    { id: '1', code: 'C1', name: 'Chair 1 (Premium)', type: 'General & Scaling', status: 'Available', patient: '' },
    { id: '2', code: 'C2', name: 'Chair 2 (Surgical)', type: 'Surgical & RCT', status: 'Available', patient: '' },
    { id: '3', code: 'C3', name: 'Chair 3 (Orthodontics)', type: 'Orthodontics & Hygiene', status: 'Available', patient: '' },
  ];
  const [chairs, setChairs] = useState<any[]>(defaultChairs);
  const [editingChair, setEditingChair] = useState<any | null>(null);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const toggleChairStatus = async (chairId: string) => {
    const updated = chairs.map(c => {
      if (String(c.id) === String(chairId)) {
        const isBusy = (c.status || '').toLowerCase() === 'busy';
        return {
          ...c,
          status: isBusy ? 'Available' : 'Busy',
          patient: isBusy ? '' : 'In Treatment'
        };
      }
      return c;
    });
    setChairs(updated);
    await syncSaveToCloud('LDC_CHAIRS', updated);
  };

  const handleSaveChair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChair) return;
    const updated = chairs.map(c => String(c.id) === String(editingChair.id) ? editingChair : c);
    setChairs(updated);
    await syncSaveToCloud('LDC_CHAIRS', updated);
    setEditingChair(null);
  };

  const loadAllCloudData = async () => {
    try {
      const loadedP = await syncLoadFromCloud('LDC_PATIENTS', []);
      setPatients(loadedP);

      const loadedA = await syncLoadFromCloud('LDC_APPOINTMENTS', []);
      setAppointments(loadedA);

      const loadedI = await syncLoadFromCloud('LDC_INVOICES', []);
      setInvoices(loadedI);

      const loadedL = await syncLoadFromCloud('LDC_LAB_CASES', []);
      setLabCases(loadedL);

      const loadedInv = await syncLoadFromCloud('LDC_INVENTORY_ITEMS', []);
      setInventoryItems(loadedInv);

      const loadedChairs = await syncLoadFromCloud('LDC_CHAIRS', defaultChairs);
      setChairs(loadedChairs && loadedChairs.length > 0 ? loadedChairs : defaultChairs);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadAllCloudData();
    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', loadAllCloudData);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', loadAllCloudData);
      }
    };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalPatients = patients.length;
  const todayVisits = appointments.filter(a => a.date === todayStr).length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const lowStockAlerts = inventoryItems.filter(i => i.currentStock <= i.minStock).length;
  const pendingLabCases = labCases.filter(c => c.status === 'SENT' || c.status === 'IN_TRANSIT').length;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: Record<string, { revenue: number; visits: number }> = {
    Mon: { revenue: 0, visits: 0 },
    Tue: { revenue: 0, visits: 0 },
    Wed: { revenue: 0, visits: 0 },
    Thu: { revenue: 0, visits: 0 },
    Fri: { revenue: 0, visits: 0 },
    Sat: { revenue: 0, visits: 0 },
    Sun: { revenue: 0, visits: 0 },
  };

  appointments.forEach(a => {
    if (a && a.date) {
      const d = new Date(a.date);
      if (!isNaN(d.getTime())) {
        const dayName = daysOfWeek[d.getDay()];
        if (dayStats[dayName]) {
          dayStats[dayName].visits += 1;
        }
      }
    }
  });

  invoices.forEach(inv => {
    if (inv && inv.date) {
      const d = new Date(inv.date);
      if (!isNaN(d.getTime())) {
        const dayName = daysOfWeek[d.getDay()];
        if (dayStats[dayName]) {
          dayStats[dayName].revenue += (Number(inv.total) || 0);
        }
      }
    }
  });

  const chartData = [
    { name: 'Mon', revenue: dayStats['Mon'].revenue, visits: dayStats['Mon'].visits },
    { name: 'Tue', revenue: dayStats['Tue'].revenue, visits: dayStats['Tue'].visits },
    { name: 'Wed', revenue: dayStats['Wed'].revenue, visits: dayStats['Wed'].visits },
    { name: 'Thu', revenue: dayStats['Thu'].revenue, visits: dayStats['Thu'].visits },
    { name: 'Fri', revenue: dayStats['Fri'].revenue, visits: dayStats['Fri'].visits },
    { name: 'Sat', revenue: dayStats['Sat'].revenue, visits: dayStats['Sat'].visits },
    { name: 'Sun', revenue: dayStats['Sun'].revenue, visits: dayStats['Sun'].visits },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#73308A]/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {session?.user?.name || 'Dr. Iswariya'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Here's what's happening at Lakshmi Dental Care today.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsPatientModalOpen(true)}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-bold py-2.5 px-4 sm:px-5 rounded-xl text-xs flex items-center justify-center shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/30 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Patient
          </button>
          
          <button 
            onClick={() => router.push('/appointments')}
            className="flex-1 sm:flex-initial bg-white hover:bg-[#FAF6FB] text-slate-700 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center shadow-xs transition-all"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-[#73308A]" />
            Appointments
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Card 1: Today's Appointments */}
        <div 
          onClick={() => router.push('/appointments')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl elite-card flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Today's Visits</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{todayVisits}</h3>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Active
            </p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/60 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Registered Patients */}
        <div 
          onClick={() => router.push('/patients')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl elite-card flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Total Patients</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{totalPatients}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">CRM Records</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/60 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div 
          onClick={() => router.push('/billing')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl elite-card flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Total Revenue</span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono truncate">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-bold">Invoices</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div 
          onClick={() => router.push('/inventory')}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl elite-card flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer transition-all group"
        >
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wide uppercase">Low Stock</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">{lowStockAlerts}</h3>
            <p className="text-[10px] sm:text-xs text-rose-500 font-bold">Reorder Alerts</p>
          </div>
          <div className="mt-2 sm:mt-0 p-2.5 sm:p-3.5 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-xl sm:rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Quick Navigation Tiles & Chair Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Quick Nav Shortcuts */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#73308A]/10 elite-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#73308A]/10 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Clinic Module Shortcuts</h3>
            <span className="text-[10px] font-bold text-[#73308A] bg-[#F5EBF9] px-2.5 py-0.5 rounded-full border border-[#DCB6EC]/50">Fast Access</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <button onClick={() => router.push('/xrays')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <BrainCircuit className="w-5 h-5 text-[#73308A] group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">X-Ray & AI Suite</h4>
              <p className="text-[10px] text-slate-500">Pathology Markers</p>
            </button>

            <button onClick={() => router.push('/treatments')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <Stethoscope className="w-5 h-5 text-[#73308A] group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Treatments Fee</h4>
              <p className="text-[10px] text-slate-500">150+ Dental Services</p>
            </button>

            <button onClick={() => router.push('/prescriptions')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <Plus className="w-5 h-5 text-[#73308A] group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Rx Prescriptions</h4>
              <p className="text-[10px] text-slate-500">Printable A4 Sheet</p>
            </button>

            <button onClick={() => router.push('/lab')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <Activity className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Lab Tracking</h4>
              <p className="text-[10px] text-slate-500">{pendingLabCases} Active Cases</p>
            </button>

            <button onClick={() => router.push('/billing')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <CreditCard className="w-5 h-5 text-[#73308A] group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Billing Invoices</h4>
              <p className="text-[10px] text-slate-500">PDF & JPG Image</p>
            </button>

            <button onClick={() => router.push('/inventory')} className="p-3.5 sm:p-4 rounded-2xl border border-[#73308A]/10 bg-[#FAF6FB]/60 hover:bg-[#F5EBF9] hover:border-[#DCB6EC] hover:shadow-md transition-all text-left space-y-1.5 group">
              <Package className="w-5 h-5 text-[#5D2471] group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900 text-xs">Inventory Stock</h4>
              <p className="text-[10px] text-slate-500">Supply Reordering</p>
            </button>
          </div>
        </div>

        {/* Chair Tracker */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#73308A]/10 elite-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#73308A]/10 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Operatory Chairs</h3>
              <p className="text-[11px] text-slate-400">Click to toggle Free/Busy</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/60">
              {chairs.filter(c => (c.status || '').toLowerCase() !== 'busy').length} Free
            </span>
          </div>
          
          <div className="space-y-3">
            {chairs.map(chair => {
              const isBusy = (chair.status || '').toLowerCase() === 'busy';
              return (
                <div 
                  key={chair.id} 
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isBusy 
                      ? 'border-rose-200 bg-rose-50/60 shadow-xs' 
                      : 'border-[#73308A]/15 bg-[#FAF6FB]/70 hover:border-[#DCB6EC] hover:bg-[#F5EBF9]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl text-white font-bold flex items-center justify-center shadow-xs ${
                        isBusy ? 'bg-rose-600' : 'bg-gradient-to-br from-[#73308A] to-[#5D2471]'
                      }`}>
                        {chair.code || `C${chair.id}`}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">{chair.name}</h5>
                        <p className={`text-[10px] font-semibold ${isBusy ? 'text-rose-700' : 'text-[#73308A]'}`}>
                          {isBusy ? (chair.patient ? `Occupied: ${chair.patient}` : 'In Treatment') : 'Available / Free'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isBusy ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-[#F5EBF9] text-[#73308A] border border-[#DCB6EC]/50'
                    }`}>
                      {isBusy ? 'BUSY' : 'FREE'}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleChairStatus(chair.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center space-x-1 ${
                        isBusy 
                          ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50' 
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {isBusy ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{isBusy ? 'Mark Free' : 'Mark Busy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingChair({ ...chair })}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-[#FAF6FB] text-slate-600 border border-slate-200 transition-all flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3 text-[#73308A]" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Revenue & Visits Analytics Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#73308A]/10 elite-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Weekly Clinic Revenue & Patient Visits Analytics</h3>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">Real-time Cloud Aggregated</span>
        </div>
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e6f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #DCB6EC', boxShadow: '0 4px 20px -2px rgba(115, 48, 138, 0.12)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#73308A" radius={[6, 6, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="visits" name="Patient Visits" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Edit Chair Operatory Modal */}
      {editingChair && (
        <div className="fixed inset-0 bg-[#1E0726]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#73308A]/20 p-6 w-full max-w-md space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#73308A]/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#73308A] to-[#5D2471] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {editingChair.code || `C${editingChair.id}`}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Edit Chair Operatory</h4>
                  <p className="text-[11px] text-slate-400">Update availability and active treatment</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingChair(null)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChair} className="space-y-3.5">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingChair({ ...editingChair, status: 'Available', patient: '' })}
                    className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      editingChair.status !== 'Busy' 
                        ? 'border-[#73308A] bg-[#F5EBF9] text-[#73308A]' 
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#73308A]"></span>
                    <span>Available / Free</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingChair({ ...editingChair, status: 'Busy', patient: editingChair.patient || 'In Treatment' })}
                    className={`p-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      editingChair.status === 'Busy' 
                        ? 'border-rose-500 bg-rose-50 text-rose-800' 
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Busy / In Use</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Chair Name</label>
                <input
                  type="text"
                  value={editingChair.name || ''}
                  onChange={e => setEditingChair({ ...editingChair, name: e.target.value })}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:border-[#73308A]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Operatory Type</label>
                <input
                  type="text"
                  value={editingChair.type || ''}
                  onChange={e => setEditingChair({ ...editingChair, type: e.target.value })}
                  className="w-full bg-[#FAF6FB] border border-slate-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-[#73308A]"
                />
              </div>

              {editingChair.status === 'Busy' && (
                <div>
                  <label className="block text-[#73308A] font-bold mb-1">Patient Name / Procedure</label>
                  <input
                    type="text"
                    value={editingChair.patient || ''}
                    onChange={e => setEditingChair({ ...editingChair, patient: e.target.value })}
                    placeholder="e.g. Rahul Sharma (Scaling)"
                    className="w-full bg-[#F5EBF9]/50 border border-[#DCB6EC] rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:border-[#73308A]"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingChair(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white rounded-xl font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Chair</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PatientModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
        onSave={async (data) => {
          const nextCode = generateNextPatientCode(patients);
          const newP = { id: 'p-' + Date.now(), patientCode: nextCode, name: data.name, phone: data.phone, gender: data.gender, age: data.age, lastVisit: new Date().toISOString().slice(0, 10), medicalHistory: data.medicalHistory };
          const updated = [newP, ...patients];
          setPatients(updated);
          await syncSaveToCloud('LDC_PATIENTS', updated);
          setIsPatientModalOpen(false);
        }}
      />
    </div>
  );
}
