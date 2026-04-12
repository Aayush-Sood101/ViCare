'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  Award,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { vc, vcNavItem } from '@/lib/vicare-ui';

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/health-profile', label: 'Health Profile', icon: Activity },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/patient/certificates', label: 'Certificates', icon: Award },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={vc.mobileMenuBtn}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileOpen ? <X className="h-6 w-6 text-[#001e40]" /> : <Menu className="h-6 w-6 text-[#001e40]" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="border-b border-slate-100 px-6 py-5">
            <Link href="/patient/dashboard" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001e40] text-white shadow-md shadow-[#001e40]/20">
                <Activity className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-[#001e40]">ViCare</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0060ac]">Patient Portal</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 p-4">
            <p className="mb-2 px-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#001e40] text-white shadow-md shadow-[#001e40]/20'
                      : 'text-[#43474f] hover:bg-[#001e40]/5 hover:text-[#001e40]'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <UserButton />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#191c1d] truncate">My account</p>
                <p className="text-xs text-[#43474f]">Patient</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen && <div className={vc.overlay} onClick={() => setIsMobileOpen(false)} aria-hidden />}
    </>
  );
}
