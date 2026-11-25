import React from 'react';
import { Compass, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-900 text-sand-100 py-12 border-t border-charcoal-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-white flex items-center justify-center">
                <Compass className="w-4 h-4 text-sand-200" />
              </div>
              <span className="text-xl font-bold font-serif text-white tracking-wide">TripMate</span>
            </div>
            <p className="text-sm text-charcoal-400 max-w-sm leading-relaxed">
              Plan, collaborate, and explore the world with clarity. Day-by-day itineraries, interactive route maps, collaborative sharing, and smart budget tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-charcoal-400">
              <li><span className="hover:text-white transition cursor-pointer">Itinerary Planner</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Interactive Maps</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Budget Estimator</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Packing Checklist</span></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-300 mb-3">Collaboration</h4>
            <ul className="space-y-2 text-sm text-charcoal-400">
              <li><span className="hover:text-white transition cursor-pointer">Role-Based Access</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Email Invitations</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Public Read-Only Links</span></li>
              <li><span className="hover:text-white transition cursor-pointer">PDF Itinerary Export</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>&copy; {new Date().getFullYear()} TripMate. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for seamless travels</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
