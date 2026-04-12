/** Clerk components styled to match ViCare (navy / slate). */
export const vicareClerkAppearance = {
  variables: {
    colorPrimary: '#001e40',
    colorText: '#191c1d',
    colorTextSecondary: '#43474f',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#191c1d',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'mx-auto w-full max-w-md',
    card: 'rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(0,30,64,0.04)]',
    headerTitle: 'font-vicare-display text-[#191c1d]',
    headerSubtitle: 'text-[#43474f]',
    socialButtonsBlockButton:
      'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-xl',
    formButtonPrimary:
      'rounded-xl bg-[#001e40] font-semibold text-white shadow-md shadow-[#001e40]/15 ring-2 ring-[#001e40]/25 hover:bg-[#0060ac]',
    formFieldInput:
      'rounded-xl border-[#c3c6d1] shadow-sm focus:border-[#0060ac] focus:ring-[#0060ac]/25',
    formFieldLabel: 'text-[#43474f] font-medium',
    footerActionLink: 'text-[#0060ac] hover:text-[#004883] font-medium',
    identityPreviewText: 'text-[#191c1d]',
    formFieldSuccessText: 'text-[#0060ac]',
    formFieldErrorText: 'text-red-700',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-500',
    alertText: 'text-[#43474f]',
  },
} as const;
