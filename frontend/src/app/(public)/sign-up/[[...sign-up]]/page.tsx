import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';
import { vicareClerkAppearance } from '@/lib/clerk-appearance';
import { vc } from '@/lib/vicare-ui';

export const dynamic = 'force-dynamic';

function SignUpForm() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/complete-signup"
      appearance={vicareClerkAppearance}
    />
  );
}

export default function SignUpPage() {
  return (
    <div className={`flex min-h-screen items-center justify-center py-12 ${vc.pageCanvas} px-4 sm:px-6 lg:px-8`}>
      <Suspense
        fallback={
          <div className={`${vc.card} px-8 py-12 text-center text-slate-600`}>Loading sign up…</div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  );
}
