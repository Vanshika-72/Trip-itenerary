import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  PieChart,
  FileDown,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 lg:pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/70 border border-forest-200 text-xs font-semibold text-forest-800">
                <Compass className="w-4 h-4 text-forest-800" />
                <span>Next-Generation Travel Organizer</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif text-forest-950 tracking-tight leading-[1.15]">
                Plan trips together. <br className="hidden sm:inline" />
                <span className="text-forest-700 italic font-normal">Travel with confidence.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                TripMate combines day-by-day itinerary planning, smooth drag-and-drop scheduling, real-time collaboration with friends, route maps, and budget estimation into one elegant journal.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                  size="lg"
                  icon={ArrowRight}
                  className="w-full sm:w-auto shadow-md"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Planning Free'}
                </Button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-sand-300 text-sm font-semibold text-charcoal-700 hover:bg-sand-100 text-center transition"
                >
                  Sign In to Account
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>Role-Based Permissions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-forest-700" />
                  <span>Interactive OpenStreetMap</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-forest-700" />
                  <span>Downloadable PDF Export</span>
                </div>
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"
                  alt="Scenic travel destination"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Featured Itinerary</span>
                      <h3 className="font-serif font-bold text-xl text-charcoal-900">Bali Tropical Odyssey</h3>
                    </div>
                    <span className="text-xs bg-forest-100 text-forest-800 font-bold px-2.5 py-1 rounded-full">
                      5 Days
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-sand-100 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50">
                      <span className="font-semibold text-charcoal-800">Day 1: Ubud Sacred Forest</span>
                      <span className="text-forest-800 font-bold">$25</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50">
                      <span className="font-semibold text-charcoal-800">Day 2: Mount Batur Sunrise Trek</span>
                      <span className="text-forest-800 font-bold">$40</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50">
                      <span className="font-semibold text-charcoal-800">Day 3: Uluwatu Cliff Temple</span>
                      <span className="text-forest-800 font-bold">$15</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-charcoal-500 font-medium">
                    <span>Collaborating with 3 friends</span>
                    <span className="text-forest-800 font-bold">Budget: $1,200</span>
                  </div>
                </div>
              </div>

              {/* Decorative Blur Background Element */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-sage-200/50 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-sand-300/40 rounded-full blur-3xl -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Engineered for Explorers
          </h2>
          <p className="text-3xl font-bold font-serif text-forest-950">
            Everything your travel group needs in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Auto Day-by-Day Generation
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Pick your departure and return dates. TripMate automatically generates all inclusive days and keeps schedules organized across timezones.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Drag-and-Drop Reordering
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Reorder activities effortlessly within a day or move activities between different days using intuitive dnd-kit drag-and-drop.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Granular Role Permissions
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Invite friends via email with explicit Owner, Editor, or Viewer access. Complete backend validation protects your trips against IDOR.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Interactive Leaflet Maps
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Visualize each day’s stops on an interactive OpenStreetMap with numbered markers, activity timings, and location details.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Real-Time Budget Analytics
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Track planned costs against your trip limit. Dynamic Recharts visualize category distributions across food, accommodation, and transport.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-7 rounded-2xl border border-sand-200 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-forest-900 font-serif">
              Downloadable PDF Itinerary
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Export your full schedule, notes, budget summary, and packing checklist into a clean, printable PDF ready for offline travel.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-forest-900 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
              Ready to start your next adventure?
            </h2>
            <p className="text-sand-200 text-sm sm:text-base leading-relaxed">
              Join thousands of travelers who organize memorable trips with TripMate. No clutter, just seamless itineraries.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-sand-200 text-forest-900 hover:bg-white focus:ring-white"
              >
                Create Your First Trip
              </Button>
            </div>
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-forest-800/60 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-forest-800/60 pointer-events-none" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
