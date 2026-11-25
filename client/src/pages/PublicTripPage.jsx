import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripService } from '../services/tripService';
import DayTabList from '../components/itinerary/DayTabList';
import DayTimeline from '../components/itinerary/DayTimeline';
import TripMapView from '../components/maps/TripMapView';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import {
  Calendar,
  MapPin,
  Wallet,
  Compass,
  Map as MapIcon,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDateRange, formatCurrency } from '../utils/formatters';

export const PublicTripPage = () => {
  const { shareToken } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'map'

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const data = await tripService.getPublicTrip(shareToken);
        setTrip(data);
      } catch (err) {
        setError(err.message || 'Shared itinerary is not available.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-charcoal-500 font-medium">Loading shared itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sand-200 text-charcoal-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-charcoal-900">
          Trip Unavailable
        </h2>
        <p className="text-xs text-charcoal-600 leading-relaxed">
          {error || 'This shared itinerary has either expired or the owner has disabled public access.'}
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-forest-800 underline"
          >
            Explore TripMate Home
          </Link>
        </div>
      </div>
    );
  }

  const defaultCover =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Public Top Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-sand-200 bg-sand-200 min-h-[260px] md:min-h-[300px] flex flex-col justify-end">
        <img
          src={trip.coverUrl || defaultCover}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <Badge variant="purple" className="flex items-center gap-1">
            <Globe className="w-3 h-3" /> Shared Itinerary (Read-Only)
          </Badge>
        </div>

        <div className="relative p-6 sm:p-8 z-10 text-white space-y-3">
          <div className="flex items-center gap-2 text-sand-200 text-xs sm:text-sm font-medium">
            <MapPin className="w-4 h-4 text-sand-300 shrink-0" />
            <span>{trip.destination}</span>
            <span>•</span>
            <Calendar className="w-4 h-4 text-sand-300 shrink-0" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            <span>•</span>
            <span className="font-bold">{trip.totalDays} Days</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight">
            {trip.title}
          </h1>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 text-xs text-sand-200">
            <div className="flex items-center gap-2 font-semibold">
              <span>Organized by {trip.owner?.name || 'Travel Host'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white font-semibold">
              <Wallet className="w-3.5 h-3.5 text-sand-300" />
              <span>Budget: {formatCurrency(trip.budget, trip.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-sand-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'itinerary'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-sand-100'
          }`}
        >
          <Compass className="w-4 h-4" /> Daily Schedule
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'map'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-sand-100'
          }`}
        >
          <MapIcon className="w-4 h-4" /> Map View
        </button>
      </div>

      {/* Day Selector */}
      <DayTabList
        days={trip.days || []}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      {/* Content */}
      {activeTab === 'itinerary' ? (
        <DayTimeline
          days={trip.days || []}
          activities={trip.activities || []}
          selectedDay={selectedDay}
          currency={trip.currency}
          canEdit={false} // Read-only
        />
      ) : (
        <TripMapView
          activities={trip.activities || []}
          selectedDay={selectedDay}
          currency={trip.currency}
          destination={trip.destination}
        />
      )}
    </div>
  );
};

export default PublicTripPage;
