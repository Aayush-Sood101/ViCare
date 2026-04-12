import Link from 'next/link';
import { LandingWithLoader } from '@/components/ui/LandingWithLoader';
import {
  Calendar,
  FileText,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Activity,
  BarChart3,
  Video,
  PenLine,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  return (
    <LandingWithLoader>
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="flex justify-between items-center px-8 md:px-12 py-4 w-full max-w-[1440px] mx-auto">
          <div className="text-2xl font-extrabold text-[#001e40] tracking-tighter">
            ViCare
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-[#001e40] font-bold tracking-tight text-sm uppercase tracking-widest" href="#features">Features</a>
            <a className="text-[#43474f] font-medium hover:text-[#001e40] transition-colors text-sm uppercase tracking-widest" href="#whats-in-it">Why ViCare</a>
          </div>
          <div className="flex items-center gap-6">
            <Link className="text-[#43474f] font-semibold hover:text-[#001e40] transition-all text-sm" href="/sign-in">Sign In</Link>
            <Link className="bg-[#001e40] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#001e40]/20 transition-all active:scale-95" href="/sign-up">Register</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2GBu0y81oYjsMjybO5C0WmSbDCC7x3eTc7--eVf1iu-u45mqpOh1twksaRkV2g-XN27y97npgvAsVuWS3adeVPjBD-QKZ03lmybczUz9yZq7JjX28MMx-YD5-SbBazYrHTRAMbpgUQWmBwDKGZB0umZ5yNnxjV_BVItF-hY4WT6fS8R8G7BqndJ35_VBKXIcfe1YZtnphB6pFeFGmeteFpBX1fedeFcXqhBmGulCueYIO9XHAhEElmJ_7xRqmhIkYrju2CBbAbiXH"
              alt="Sophisticated modern architectural detail of a medical research facility"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] via-[#f8f9fa]/80 to-[#f8f9fa]"></div>
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001e40]/5 border border-[#001e40]/10 text-[#001e40] text-[10px] font-extrabold tracking-[0.2em] uppercase">
                <ShieldCheck className="h-4 w-4" />
                VIT Academic Sanctuary
              </div>

              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] vicare-text-premium">
                Digitizing <br />
                Campus <span className="text-[#0060ac]">Care</span>
              </h1>

              <p className="text-xl md:text-2xl text-[#43474f] max-w-xl leading-relaxed opacity-90">
                A premium digital gateway for campus healthcare, merging clinical excellence with seamless technology for the entire VIT community.
              </p>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link
                  className="bg-[#001e40] text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-[#001e40]/20 hover:bg-[#0060ac] transition-all"
                  href="/sign-up"
                >
                  Get Started
                </Link>
                <Link
                  className="bg-white border border-[#c3c6d1]/50 text-[#001e40] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#f8f9fa] transition-all"
                  href="/sign-in"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="absolute -inset-10 bg-[#0060ac]/5 rounded-full blur-[100px]"></div>
              <div className="relative vicare-glass-panel rounded-[2.5rem] p-4 shadow-2xl border-white/50">
                <div className="overflow-hidden rounded-[2rem]">
                  <img
                    className="w-full aspect-[4/5] object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXsD9jcyGdH88wDILuw2tvNr261KSoMI7xQf8mLr8vaMyOkNDoy2C33O5w248dBzQ39o18zq3S4-WrJ1xioyxYhkTYxh9_GyQPzWfDNYI3JFMQ-r21XgTz3NJdtly52NJYJexGFXTUKgsto-7n9D8OfnuzMEF26DHrI2GFhmb_dOfeaHKpKHbe7HxXFvkfc1IVuzMV1fWWlWvpYxwzD_CcAxj7pcRVUETkBX-eX88-d5jPqZm3XunamZ8ASikucm_fgVAd_Yrj31T7"
                    alt="Refined healthcare interface on a tablet showing clean typography and medical data visualization"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 vicare-glass-panel p-6 rounded-3xl shadow-xl flex items-center gap-5 border-white/60">
                  <div className="w-14 h-14 bg-[#001e40] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#001e40]/30">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#43474f] font-extrabold uppercase tracking-widest opacity-70">Status</p>
                    <p className="text-lg font-bold text-[#001e40]">Real-time tracking active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tailored Experience Section */}
        <section id="features" className="py-40 bg-white">
          <div className="max-w-[1440px] mx-auto px-8 md:px-12">
            <div className="mb-24 text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#001e40] tracking-tight">Tailored for the Community</h2>
              <p className="text-[#43474f] text-lg">Bespoke digital toolsets designed specifically for students and healthcare professionals at VIT.</p>
              <div className="w-16 h-1 bg-[#0060ac] mx-auto rounded-full mt-8"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Students Card */}
              <div className="group bg-[#f3f4f5] p-12 rounded-[3rem] border border-transparent hover:border-[#001e40]/5 hover:shadow-2xl hover:shadow-[#001e40]/5 transition-all duration-700">
                <div className="flex items-center justify-between mb-16">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-extrabold text-[#001e40] tracking-tight">For Students</h3>
                    <p className="text-[#43474f] font-medium">Empowering your health journey</p>
                  </div>
                  <div className="w-20 h-20 bg-[#001e40]/5 rounded-[2rem] flex items-center justify-center group-hover:bg-[#001e40]/10 transition-colors">
                    <UserRound className="h-10 w-10 text-[#001e40]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-8 bg-white rounded-3xl flex items-start gap-6 border border-black/5 hover:border-[#001e40]/20 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#0060ac]/5 flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-[#0060ac]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#001e40] text-lg mb-1">Appointment Booking</h4>
                      <p className="text-[#43474f] text-sm leading-relaxed">Schedule physical or digital consultations with campus specialists in just a few taps.</p>
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-3xl flex items-start gap-6 border border-black/5 hover:border-[#001e40]/20 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#0060ac]/5 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-6 w-6 text-[#0060ac]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#001e40] text-lg mb-1">Health Dashboard</h4>
                      <p className="text-[#43474f] text-sm leading-relaxed">Monitor your medical history, vitals, and wellness trends through an intuitive personal portal.</p>
                    </div>
                  </div>

                  <div className="p-8 bg-white rounded-3xl flex items-start gap-6 border border-black/5 hover:border-[#001e40]/20 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-[#0060ac]/5 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-[#0060ac]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#001e40] text-lg mb-1">Prescription Access</h4>
                      <p className="text-[#43474f] text-sm leading-relaxed">Instant secure access to all digital prescriptions and medical records anytime, anywhere.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctors Card */}
              <div className="group bg-[#001e40] p-12 rounded-[3rem] shadow-2xl shadow-[#001e40]/20 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0060ac]/20 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-16">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-extrabold tracking-tight">For Doctors</h3>
                      <p className="text-[#a4c9ff] font-medium">Precision medical management</p>
                    </div>
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center">
                      <Stethoscope className="h-10 w-10 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 bg-white/5 rounded-3xl flex items-start gap-6 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="h-6 w-6 text-[#68abff]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">Patient Management</h4>
                        <p className="text-[#799dd6] text-sm leading-relaxed">Comprehensive profiles and intelligent medical logging for streamlined patient care.</p>
                      </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-3xl flex items-start gap-6 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <Video className="h-6 w-6 text-[#68abff]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">Digital Consultations</h4>
                        <p className="text-[#799dd6] text-sm leading-relaxed">Secure, high-definition virtual visits integrated directly within the clinical workflow.</p>
                      </div>
                    </div>

                    <div className="p-8 bg-white/5 rounded-3xl flex items-start gap-6 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <PenLine className="h-6 w-6 text-[#68abff]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">E-Prescriptions</h4>
                        <p className="text-[#799dd6] text-sm leading-relaxed">Automated, error-free digital prescription generation with immediate patient delivery.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's In It For You Section */}
        <section id="whats-in-it" className="py-32 bg-[#f8f9fa]">
          <div className="max-w-[1440px] mx-auto px-8 md:px-12">
            <div className="mb-16 text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#001e40] tracking-tight">
                What&apos;s In It <span className="text-[#0060ac]">For You?</span>
              </h2>
              <p className="text-[#43474f] text-lg leading-relaxed">
                ViCare gives the VIT community a single, secure place to manage every aspect of campus healthcare — from booking to records to real-time status.
              </p>
              <div className="w-16 h-1 bg-[#0060ac] mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: 'Instant Appointments',
                  desc: 'Book consultations with campus doctors in seconds — no queues, no paperwork.'
                },
                {
                  title: 'Digital Prescriptions',
                  desc: 'Access and download your prescriptions anytime, directly from your portal.'
                },
                {
                  title: 'Real-time Queue',
                  desc: 'Track your position in the consultation queue live, so you never waste time waiting.'
                },
                {
                  title: 'Medical Certificates',
                  desc: 'Request and receive official medical certificates through a fully digital flow.'
                },
                {
                  title: 'Health Profile',
                  desc: 'Maintain a complete digital record of allergies, medications, and medical history.'
                },
                {
                  title: 'Doctor Tools',
                  desc: 'Clinicians get a full patient management suite — queue, notes, and e-prescriptions.'
                },
                {
                  title: 'Secure & Private',
                  desc: 'Role-based access and encrypted data ensure your information stays confidential.'
                },
                {
                  title: 'Always Accessible',
                  desc: 'Available on any device, anytime — your health records follow you everywhere.'
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="group bg-white rounded-3xl p-7 border border-slate-100 hover:border-[#001e40]/20 hover:shadow-lg hover:shadow-[#001e40]/5 transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-[#0060ac] mb-5 group-hover:scale-125 transition-transform" />
                  <h3 className="font-extrabold text-[#001e40] text-lg mb-2 leading-snug">{title}</h3>
                  <p className="text-[#43474f] text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-8 md:px-12">
          <div className="max-w-[1200px] mx-auto bg-[#001e40] rounded-[4rem] overflow-hidden relative py-24 px-12 md:px-24">
            <div className="absolute top-0 left-0 w-full h-full"
              style={{ background: 'radial-gradient(circle at top right, rgba(0, 96, 172, 0.3), transparent)' }}>
            </div>
            <div className="relative z-10 text-center space-y-12 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tighter">
                Step into the Ecosystem.
              </h2>
              <p className="text-xl md:text-2xl text-[#a4c9ff] leading-relaxed font-medium">
                Simplified campus healthcare is a click away. Select your role to begin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Link
                  className="w-full sm:w-auto bg-white text-[#001e40] px-12 py-6 rounded-full font-bold text-xl hover:bg-[#d5e3ff] hover:scale-105 transition-all shadow-2xl"
                  href="/sign-up"
                >
                  Join as Student
                </Link>
                <Link
                  className="w-full sm:w-auto border-2 border-white/20 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white/10 hover:scale-105 transition-all"
                  href="/sign-up"
                >
                  Join as Doctor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-5 space-y-8">
              <div className="text-2xl font-black text-[#001e40] tracking-tighter">ViCare</div>
              <p className="text-[#43474f] text-lg leading-relaxed max-w-sm">
                Elevating the campus medical experience through clinical precision and digital harmony at VIT.
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-extrabold text-[#001e40] uppercase tracking-[0.2em] text-xs mb-8">Platform</h4>
              <ul className="space-y-5">
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#features">Features</a></li>
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#whats-in-it">Why ViCare</a></li>
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#">Privacy &amp; Ethics</a></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="font-extrabold text-[#001e40] uppercase tracking-[0.2em] text-xs mb-8">Support</h4>
              <ul className="space-y-5">
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#">Technical Desk</a></li>
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#">Data Protection</a></li>
                <li><a className="text-[#43474f] hover:text-[#001e40] transition-colors font-medium text-sm" href="#">Medical Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[#43474f] text-xs font-semibold uppercase tracking-widest opacity-60">
            <div>© {new Date().getFullYear()} ViCare — Campus Healthcare Platform</div>
            <div className="flex gap-10">
              <a className="hover:text-[#001e40] hover:opacity-100 transition-colors" href="#">Privacy</a>
              <a className="hover:text-[#001e40] hover:opacity-100 transition-colors" href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </LandingWithLoader>
  );
}
