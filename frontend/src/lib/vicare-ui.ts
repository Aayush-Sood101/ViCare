import { cn } from '@/lib/utils';

/** Shared ViCare visual language (teal / slate) — use for classNames only; no logic. */
export const vc = {
  pageCanvas: 'min-h-screen bg-[#f7f8f9] text-slate-900 antialiased',
  shell: 'flex h-screen bg-[#f7f8f9]',
  main: 'flex-1 overflow-auto p-6 pt-20 sm:p-8 lg:pt-8',
  card: 'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]',
  cardPad: 'p-6',
  cardHeader: 'border-b border-slate-200/80 px-5 py-4',
  tableWrap: 'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]',
  tableHead: 'bg-slate-50',
  th: 'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
  h1: 'font-vicare-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]',
  h2: 'font-vicare-display text-lg font-semibold text-slate-900',
  h3: 'font-vicare-display text-base font-semibold text-slate-900',
  muted: 'text-slate-600',
  link: 'font-medium text-teal-800 hover:text-teal-900 hover:underline',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimarySm: 'rounded-lg px-3 py-2 text-sm',
  btnPrimaryBlock: 'w-full justify-center py-3',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40 disabled:cursor-not-allowed disabled:opacity-50',
  btnDanger:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50',
  btnDangerSoft: 'rounded-xl bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:opacity-50',
  btnIconTeal:
    'rounded-xl bg-teal-700 p-2 text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-50',
  btnSuccess:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25 transition hover:bg-teal-800',
  input:
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/25',
  textarea:
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/25',
  label: 'mb-1 block text-sm font-medium text-slate-700',
  readOnlyBox: 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900',
  filterActive:
    'rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-2 ring-teal-600/25',
  filterIdle:
    'rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50',
  loadingBox: 'py-12 text-center text-slate-500',
  emptyCard: 'rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-[0_1px_0_rgba(15,23,42,0.04)]',
  quickLink:
    'group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-teal-200 hover:shadow-md hover:ring-1 hover:ring-teal-900/5',
  statCard: 'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm',
  calloutInfo: 'rounded-2xl border border-teal-100 bg-teal-50/80 p-4 text-sm text-teal-950',
  calloutWarn: 'rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950',
  iconTile:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25',
  iconTileLg:
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25',
  iconAvatar: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600',
  mobileMenuBtn:
    'fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-md ring-1 ring-slate-900/5 lg:hidden',
  overlay: 'fixed inset-0 z-30 bg-slate-900/40 lg:hidden',
  sidebarAside:
    'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/90 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
  sidebarBrand: 'border-b border-slate-200/80 p-6',
  sidebarFooter: 'border-t border-slate-200/80 p-4',
  listRow: 'flex items-center justify-between gap-4 border-slate-100 p-4 transition hover:bg-slate-50/80',
  divideCard: 'divide-y divide-slate-100',
  barChart: 'rounded-t bg-teal-600',
  subtleHighlight: 'bg-teal-50/80 ring-1 ring-teal-100',
} as const;

export function vcNavItem(active: boolean) {
  return cn(
    'flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors',
    active
      ? 'bg-teal-50 text-teal-900 ring-1 ring-teal-200/80'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  );
}
