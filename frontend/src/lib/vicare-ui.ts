import { cn } from '@/lib/utils';

/** Shared ViCare visual language (navy / slate) — use for classNames only; no logic. */
export const vc = {
  pageCanvas: 'min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased',
  shell: 'flex h-screen bg-[#f3f4f5]',
  main: 'flex-1 overflow-auto p-6 pt-20 sm:p-8 lg:pt-6',
  card: 'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(0,30,64,0.04)]',
  cardPad: 'p-6',
  cardHeader: 'border-b border-slate-200/80 px-5 py-4',
  tableWrap: 'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(0,30,64,0.04)]',
  tableHead: 'bg-slate-50',
  th: 'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
  h1: 'font-vicare-display text-2xl font-semibold tracking-tight text-[#191c1d] sm:text-[1.75rem]',
  h2: 'font-vicare-display text-lg font-semibold text-[#191c1d]',
  h3: 'font-vicare-display text-base font-semibold text-[#191c1d]',
  muted: 'text-[#43474f]',
  link: 'font-medium text-[#0060ac] hover:text-[#004883] hover:underline',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#001e40] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#001e40]/15 ring-2 ring-[#001e40]/25 transition hover:bg-[#0060ac] disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimarySm: 'rounded-lg px-3 py-2 text-sm',
  btnPrimaryBlock: 'w-full justify-center py-3',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#c3c6d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#191c1d] shadow-sm transition hover:border-[#0060ac] hover:bg-[#f3f4f5] disabled:cursor-not-allowed disabled:opacity-50',
  btnDanger:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50',
  btnDangerSoft: 'rounded-xl bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:opacity-50',
  btnIconNavy:
    'rounded-xl bg-[#001e40] p-2 text-white shadow-sm transition hover:bg-[#0060ac] disabled:opacity-50',
  btnSuccess:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#001e40] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#001e40]/15 ring-2 ring-[#001e40]/25 transition hover:bg-[#0060ac]',
  input:
    'w-full rounded-xl border border-[#c3c6d1] bg-white px-3 py-2 text-[#191c1d] shadow-sm outline-none transition focus:border-[#0060ac] focus:ring-2 focus:ring-[#0060ac]/25',
  textarea:
    'w-full rounded-xl border border-[#c3c6d1] bg-white px-3 py-2 text-[#191c1d] shadow-sm outline-none transition focus:border-[#0060ac] focus:ring-2 focus:ring-[#0060ac]/25',
  label: 'mb-1 block text-sm font-medium text-[#43474f]',
  readOnlyBox: 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[#191c1d]',
  filterActive:
    'rounded-xl bg-[#001e40] px-4 py-2 text-sm font-semibold text-white shadow-sm ring-2 ring-[#001e40]/25',
  filterIdle:
    'rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50',
  loadingBox: 'py-12 text-center text-slate-500',
  emptyCard: 'rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-[0_1px_0_rgba(0,30,64,0.04)]',
  quickLink:
    'group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_0_rgba(0,30,64,0.04)] transition hover:border-[#0060ac]/20 hover:shadow-md hover:ring-1 hover:ring-[#001e40]/5',
  statCard: 'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm',
  calloutInfo: 'rounded-2xl border border-[#0060ac]/20 bg-[#001e40]/5 p-4 text-sm text-[#001e40]',
  calloutWarn: 'rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950',
  iconTile:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001e40] text-white shadow-md shadow-[#001e40]/15 ring-2 ring-[#001e40]/25',
  iconTileLg:
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#001e40] text-white shadow-md shadow-[#001e40]/15 ring-2 ring-[#001e40]/25',
  iconAvatar: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600',
  mobileMenuBtn:
    'fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-md ring-1 ring-[#001e40]/5 lg:hidden',
  overlay: 'fixed inset-0 z-30 bg-[#001e40]/40 lg:hidden',
  sidebarAside:
    'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/90 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
  sidebarBrand: 'border-b border-slate-200/80 p-6',
  sidebarFooter: 'border-t border-slate-200/80 p-4',
  listRow: 'flex items-center justify-between gap-4 border-slate-100 p-4 transition hover:bg-slate-50/80',
  divideCard: 'divide-y divide-slate-100',
  barChart: 'rounded-t bg-[#0060ac]',
  subtleHighlight: 'bg-[#001e40]/5 ring-1 ring-[#001e40]/10',
} as const;

export function vcNavItem(active: boolean) {
  return cn(
    'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors',
    active
      ? 'bg-[#001e40]/5 text-[#001e40] ring-1 ring-[#001e40]/20'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  );
}
