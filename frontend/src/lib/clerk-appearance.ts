/** Clerk components styled to match ViCare (teal / slate). */
export const vicareClerkAppearance = {
  variables: {
    colorPrimary: '#0f766e',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'mx-auto w-full max-w-md',
    card: 'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]',
    headerTitle: 'font-vicare-display text-slate-900',
    headerSubtitle: 'text-slate-600',
    socialButtonsBlockButton:
      'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-xl',
    formButtonPrimary:
      'rounded-xl bg-teal-700 font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25 hover:bg-teal-800',
    formFieldInput:
      'rounded-xl border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500/25',
    formFieldLabel: 'text-slate-700 font-medium',
    footerActionLink: 'text-teal-800 hover:text-teal-900 font-medium',
    identityPreviewText: 'text-slate-800',
    formFieldSuccessText: 'text-teal-800',
    formFieldErrorText: 'text-red-700',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-500',
    alertText: 'text-slate-700',
  },
} as const;
