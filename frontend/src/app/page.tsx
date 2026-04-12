import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Calendar,
  ClipboardList,
  FileText,
  Lock,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8f9] text-slate-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm ring-1 ring-teal-800/20">
              <Activity className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <div className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight text-slate-900">ViCare</span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:block">
                Campus health
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25 transition hover:bg-teal-800"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(15, 118, 110, 0.08), transparent 45%), radial-gradient(circle at 85% 10%, rgba(51, 65, 85, 0.06), transparent 40%)',
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900 shadow-sm">
                University health services
              </p>
              <h1
                className="font-vicare-display text-[2.25rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.35rem]"
              >
                Care that fits{' '}
                <span className="relative inline-block text-teal-800">
                  <span className="relative z-10">your campus schedule</span>
                  <span
                    className="absolute -inset-x-1 bottom-1 z-0 h-3 rounded-sm bg-teal-200/70 sm:bottom-1.5 sm:h-3.5"
                    aria-hidden
                  />
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed">
                <span className="font-medium text-slate-800">ViCare</span> connects students and clinicians for
                appointments, prescriptions, and records—clear workflows, less paperwork, and one place to stay on top of
                your health.
              </p>
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/30 transition hover:bg-teal-800 hover:ring-teal-700/40"
                >
                  Register as student
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
                >
                  Clinician registration
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <li className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                  <Lock className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                  Secure sign-in
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                  Role-based access
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                  <ClipboardList className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                  Digital records
                </li>
              </ul>
            </div>

            <aside className="relative mx-auto mt-14 max-w-md">
              <div className="rounded-2xl border-2 border-teal-100 bg-gradient-to-b from-white to-slate-50/90 p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_48px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Today</p>
                <p className="font-vicare-display mt-2 text-center text-2xl font-semibold text-slate-900">
                  Health desk
                </p>
                <p className="mt-1 text-center text-sm text-slate-600">
                  A calm snapshot of what ViCare helps you manage.
                </p>
                <dl className="mt-6 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-teal-100 bg-white px-4 py-3 shadow-sm ring-1 ring-teal-900/5">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Queue</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-900">Consultations in order</dd>
                    </div>
                    <span className="shrink-0 rounded-md bg-teal-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                      Live
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-900">Prescriptions & certificates</dd>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      Synced
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-900">Allergies & medications</dd>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      Updated
                    </span>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">Platform</p>
            <h2
              className="font-vicare-display mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]"
            >
              Built for how{' '}
              <span className="text-teal-800">clinics and students</span> actually work
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              <span className="font-medium text-slate-800">One platform</span> for scheduling, documentation, and
              follow-up—consistent for patients, efficient for staff.
            </p>
            <div
              className="mx-auto mt-6 h-1 w-16 rounded-full bg-teal-600"
              aria-hidden
            />
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Appointments"
              description="Book with available clinicians and keep visit details in one timeline."
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Prescriptions"
              description="Access issued prescriptions digitally when you need them for pharmacy or records."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Certificates"
              description="Request and receive medical certificates through the same secure channel."
            />
            <FeatureCard
              icon={<Stethoscope className="h-5 w-5" />}
              title="Clinical workflow"
              description="Queue management and consultation tools designed for busy campus practices."
            />
            <FeatureCard
              icon={<UserRound className="h-5 w-5" />}
              title="Health profile"
              description="Keep allergies, medications, and emergency context accurate and easy to update."
            />
            <FeatureCard
              icon={<Activity className="h-5 w-5" />}
              title="Continuity"
              description="A single view of consultations and treatments so nothing important gets lost."
            />
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-gradient-to-b from-teal-50/50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h2 className="font-vicare-display text-2xl font-semibold text-slate-900 sm:text-[1.65rem]">
              Ready to <span className="text-teal-800">get started?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              Sign in if you already have access, or create an account to join as a student or clinician.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-in"
                className="inline-flex min-w-[10rem] justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-teal-400 hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-w-[10rem] justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25 transition hover:bg-teal-800"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600/20 text-teal-300 ring-1 ring-teal-500/30">
                <Activity className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">ViCare</p>
                <p className="text-xs text-slate-500">Campus healthcare platform</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 sm:text-right">
              © {new Date().getFullYear()} ViCare. For authorized university patients and clinical staff.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-teal-200 hover:shadow-md hover:ring-1 hover:ring-teal-900/5">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-900/20 ring-2 ring-teal-600/30 transition group-hover:bg-teal-800">
        {icon}
      </div>
      <h3 className="font-vicare-display mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}
