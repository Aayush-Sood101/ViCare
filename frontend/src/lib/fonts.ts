import { Source_Serif_4 } from 'next/font/google';

/** Display serif for headings; add `variable` to root layout and use `font-vicare-display` in className. */
export const vicareDisplay = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-vicare-display',
});
