import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tripService } from '../services/tripService';
import TripCard from '../components/trips/TripCard';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Plus, Compass, Calendar, Users, Briefcase } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'owned', 'shared'

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const ownedTrips = trips.filter((t) => t.userRole === 'owner');
  const sharedTrips = trips.filter((t) => t.userRole !== 'owner');

  const displayedTrips =
    activeTab === 'owned'
      ? ownedTrips
      : activeTab === 'shared'
      ? sharedTrips
      : trips;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
            Travel Dashboard
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-forest-950 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Organize upcoming journeys, view shared itineraries, and track travel spending.
          </p>
        </div>

        <Button
          onClick={() => navigate('/trips/new')}
          icon={Plus}
          size="md"
          className="shrink-0 shadow-sm"
        >
          Create New Trip
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-charcoal-500">Total Trips</div>
            <div className="text-2xl font-bold font-serif text-forest-950 mt-0.5">
              {trips.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-charcoal-500">Trips You Own</div>
            <div className="text-2xl font-bold font-serif text-forest-950 mt-0.5">
              {ownedTrips.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-charcoal-500">Shared With You</div>
            <div className="text-2xl font-bold font-serif text-forest-950 mt-0.5">
              {sharedTrips.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'all'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-sand-100'
          }`}
        >
          All Trips ({trips.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('owned')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'owned'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-sand-100'
          }`}
        >
          My Trips ({ownedTrips.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'shared'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-sand-100'
          }`}
        >
          Shared Trips ({sharedTrips.length})
        </button>
      </div>

      {/* Trips Content */}
      {loading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-xs text-charcoal-500">Loading your travel plans...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button onClick={fetchTrips} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : displayedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTrips.map((trip) => (
            <TripCard key={trip._id || trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={
            activeTab === 'shared'
              ? 'No shared trips yet'
              : activeTab === 'owned'
              ? 'No trips created yet'
              : 'Start your journey'
          }
          description={
            activeTab === 'shared'
              ? "You haven't been invited to any collaborator trips yet. When friends invite you, their trips will appear here."
              : 'Begin by creating your first trip itinerary. Set destinations, schedule activities, and invite friends.'
          }
          actionLabel="Create a Trip"
          onAction={() => navigate('/trips/new')}
        />
      )}
    </div>
  );
};

export default DashboardPage;
