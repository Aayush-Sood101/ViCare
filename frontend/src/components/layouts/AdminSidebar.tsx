'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  UserPlus,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { vc, vcNavItem } from '@/lib/vicare-ui';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'Approvals', icon: UserCheck },
  { href: '/admin/doctors', label: 'Doctors', icon: Users },
  { href: '/admin/patients', label: 'Patients', icon: UserPlus },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
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
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001e40] text-white shadow-md shadow-[#001e40]/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-[#001e40]">ViCare</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0060ac]">Admin Console</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 p-4">
            <p className="mb-2 px-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
                <p className="text-sm font-semibold text-[#191c1d] truncate">Administrator</p>
                <p className="text-xs text-[#43474f]">Full access</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen && <div className={vc.overlay} onClick={() => setIsMobileOpen(false)} aria-hidden />}
    </>
  );
}
