import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthTokenProvider from '@/components/providers/AuthTokenProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: 'ViCare - Campus Healthcare',
  description: 'University Campus Healthcare Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {!publishableKey && (
          <div
            role="alert"
            className="border-b border-amber-600 bg-amber-500 px-4 py-3 text-center text-sm font-medium text-amber-950"
          >
            Missing <code className="rounded bg-amber-400/80 px-1">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in{' '}
            <code className="rounded bg-amber-400/80 px-1">frontend/.env.local</code>. Clerk will not work until you add
            your Clerk publishable key (same app as backend) and restart{' '}
            <code className="rounded bg-amber-400/80 px-1">npm run dev</code>.
          </div>
        )}
        <ClerkProvider {...(publishableKey ? { publishableKey } : {})}>
          <QueryProvider>
            <AuthTokenProvider>
              {children}
              <Toaster />
            </AuthTokenProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
