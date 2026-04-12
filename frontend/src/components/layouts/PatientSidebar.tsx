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
        {isMobileOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
      </button>

      <aside
        className={cn(vc.sidebarAside, isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}
      >
        <div className="flex h-full flex-col">
          <div className={vc.sidebarBrand}>
            <Link href="/patient/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm ring-1 ring-teal-800/20">
                <Activity className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </span>
              <div className="leading-tight">
                <span className="block text-[15px] font-semibold tracking-tight text-slate-900">ViCare</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Patient</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={vcNavItem(isActive)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={vc.sidebarFooter}>
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-sm text-slate-600">My account</span>
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen && <div className={vc.overlay} onClick={() => setIsMobileOpen(false)} aria-hidden />}
    </>
  );
}
