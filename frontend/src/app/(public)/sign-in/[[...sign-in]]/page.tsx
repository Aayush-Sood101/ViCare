import { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

function SignInForm() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/patient/dashboard"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    />
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="rounded-lg border bg-white px-8 py-12 text-center text-gray-600 shadow-sm">
            Loading sign in…
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
