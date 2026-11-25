import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-sand-200 text-forest-800 flex items-center justify-center shadow-inner">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-forest-950">
        404
      </h1>
      <h2 className="text-xl font-bold font-serif text-charcoal-800">
        Page Not Found
      </h2>
      <p className="text-xs text-charcoal-500 max-w-sm leading-relaxed">
        It seems you've wandered off the itinerary. The page you are looking for does not exist or may have been moved.
      </p>
      <div className="pt-2">
        <Link to="/dashboard">
          <Button size="md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
