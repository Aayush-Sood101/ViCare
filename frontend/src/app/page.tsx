import Link from 'next/link';
import { Heart, Calendar, FileText, Shield, Stethoscope, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ViCare</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Campus Healthcare,{' '}
            <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            ViCare is your one-stop platform for university health services.
            Book appointments, access prescriptions, and manage your health
            records seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              Register as Student
            </Link>
            <Link
              href="/sign-up"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
            >
              Register as Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-blue-600" />}
            title="Easy Appointments"
            description="Book appointments with available doctors in just a few clicks. Get your token number instantly."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-purple-600" />}
            title="Digital Prescriptions"
            description="Access and download your prescriptions anytime, anywhere. No more paper clutter."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-green-600" />}
            title="Medical Certificates"
            description="Request and receive medical certificates digitally for your academic needs."
          />
          <FeatureCard
            icon={<Stethoscope className="h-8 w-8 text-red-600" />}
            title="For Doctors"
            description="Manage your patient queue, conduct consultations, and issue prescriptions efficiently."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-orange-600" />}
            title="Health Records"
            description="Your complete health history in one place. Track consultations and treatments."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-pink-600" />}
            title="Health Profile"
            description="Maintain your health profile including allergies, medications, and emergency contacts."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold">ViCare</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ViCare. University Campus Healthcare Platform.
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
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
