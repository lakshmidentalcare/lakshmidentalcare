'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  Menu, 
  X, 
  RefreshCw, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Receipt, 
  Settings, 
  Cloud, 
  CheckCircle2 
} from 'lucide-react';
import { syncLoadFromCloud } from '@/utils/cloudSync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ldc_settings_updated'));
      }
      await syncLoadFromCloud('LDC_CLINIC_CONFIG', {});
      await syncLoadFromCloud('LDC_PATIENTS', []);
      await syncLoadFromCloud('LDC_APPOINTMENTS', []);
      await syncLoadFromCloud('LDC_INVOICES', []);
      await syncLoadFromCloud('LDC_STAFF', []);
      await syncLoadFromCloud('LDC_LAB_CASES', []);
      await syncLoadFromCloud('LDC_INVENTORY_ITEMS', []);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const mobileNavItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appts', href: '/appointments', icon: Calendar },
    { name: 'Billing', href: '/billing', icon: Receipt },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6FB] relative">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-[#120417]/85 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#1E0726] h-full shadow-2xl z-10 border-r border-[#32113E]">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#DCB6EC] hover:text-white rounded-full bg-[#32113E]"
            >
              <X className="w-6 h-6" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#FAF6FB]">
        
        {/* Mobile Header Top Bar (ALWAYS VISIBLE ON PHONES) */}
        <div className="md:hidden bg-[#1E0726] text-white px-4 py-3 flex items-center justify-between border-b border-[#32113E] shrink-0 z-30 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#EBD5F3] hover:text-white rounded-xl bg-[#32113E] active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" className="w-8 h-8 rounded-xl object-contain border border-[#DCB6EC]/30 shadow-sm bg-white p-0.5" alt="Logo" />
              <div>
                <h1 className="font-extrabold text-xs text-white leading-tight">Lakshmi Dental</h1>
                <p className="text-[9px] text-[#DCB6EC] font-bold uppercase tracking-wider">Cloud App</p>
              </div>
            </div>
          </div>

          {/* Prominent Glowing Sync Button */}
          <button 
            onClick={handleGlobalSync}
            className="bg-gradient-to-r from-[#73308A] to-[#5D2471] active:from-[#5D2471] active:to-[#471A57] text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-[#73308A]/40 border border-[#DCB6EC]/30 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-white' : ''}`} />
            <span className="font-extrabold tracking-wide uppercase text-[11px]">Sync Cloud</span>
          </button>
        </div>

        {/* Mobile Sync Success Notification Banner */}
        {syncSuccess && (
          <div className="md:hidden bg-emerald-600 text-white text-[11px] font-extrabold py-2 px-4 flex items-center justify-center space-x-2 shadow-md animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cloud Data Synced Live Across All Devices!</span>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Scrollable View Area (with padding bottom for mobile nav bar) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 md:pb-8 bg-[#FAF6FB]">
          {children}
        </main>
      </div>

      {/* Floating Sync Button for Mobile (Fixed at bottom right for easy thumb tap) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={handleGlobalSync}
          className="bg-gradient-to-tr from-[#73308A] to-[#903EB0] hover:from-[#5D2471] hover:to-[#73308A] active:scale-90 text-white p-4 rounded-full shadow-2xl shadow-[#73308A]/50 flex items-center justify-center border-2 border-white/40 transition-all"
          title="Tap to Sync Cloud Data"
        >
          <RefreshCw className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS / Android App Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E0726]/95 backdrop-blur-md border-t border-[#32113E] h-16 flex items-center justify-around px-2 z-40 shadow-2xl">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                isActive 
                  ? 'text-[#DCB6EC] font-black' 
                  : 'text-[#DCB6EC]/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#DCB6EC] scale-110' : 'text-[#DCB6EC]/50'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
