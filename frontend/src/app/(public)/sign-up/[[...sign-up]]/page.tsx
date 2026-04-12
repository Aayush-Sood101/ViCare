import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

function SignUpForm() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/complete-signup"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="rounded-lg border bg-white px-8 py-12 text-center text-gray-600 shadow-sm">
            Loading sign up…
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
