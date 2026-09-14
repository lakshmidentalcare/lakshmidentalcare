'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Receipt, 
  Stethoscope, 
  FileText, 
  FlaskConical, 
  Package, 
  Settings, 
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { syncLoadFromCloud } from '@/utils/cloudSync';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients CRM', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
  { name: 'Treatments Catalog', href: '/treatments', icon: Stethoscope },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
  { name: 'Dental Lab Cases', href: '/lab', icon: FlaskConical },
  { name: 'Inventory Supplies', href: '/inventory', icon: Package },
  { name: 'Doctors & Staff', href: '/doctors', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [doctorName, setDoctorName] = useState('Dr. Iswariya');

  useEffect(() => {
    async function refreshName() {
      try {
        const config = await syncLoadFromCloud('LDC_CLINIC_CONFIG', { superAdminName: 'Dr. Iswariya' });
        if (config && config.superAdminName) {
          setDoctorName(config.superAdminName);
        } else {
          setDoctorName('Dr. Iswariya');
        }
      } catch (e) {
        setDoctorName('Dr. Iswariya');
      }
    }

    refreshName();

    if (typeof window !== 'undefined') {
      window.addEventListener('ldc_settings_updated', refreshName);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ldc_settings_updated', refreshName);
      }
    };
  }, []);

  return (
    <aside className="w-64 bg-[#1E0726] text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20 border-r border-[#32113E]">
      <div>
        
        {/* Brand Header */}
        <div 
          className="h-16 flex items-center px-6 border-b border-[#32113E] space-x-3 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(18, 4, 23, 0.95), rgba(93, 36, 113, 0.85)), url('/brand-bg.jpg') center/cover`
          }}
        >
          <img src="/logo-emblem.png" className="w-9 h-9 rounded-xl object-contain border border-[#DCB6EC]/40 shadow-md p-1 bg-white" alt="Logo" />
          <span className="font-extrabold text-sm tracking-tight text-white">Lakshmi Dental</span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#73308A] to-[#5D2471] text-white shadow-lg shadow-[#1E0726]/60 border border-[#DCB6EC]/30 font-extrabold scale-[1.02]'
                    : 'text-[#EBD5F3]/80 hover:bg-[#32113E] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DCB6EC]/70'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#32113E] bg-[#120417]/90">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E0726] border border-[#32113E]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#73308A] text-white flex items-center justify-center font-extrabold text-xs shadow-md shrink-0">
              {doctorName.charAt(0) || 'I'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">{doctorName}</p>
              <p className="text-[10px] text-[#DCB6EC] font-semibold uppercase">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 text-[#DCB6EC]/70 hover:text-rose-400 rounded-lg hover:bg-[#32113E] transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
