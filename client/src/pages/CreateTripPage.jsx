import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import TripForm from '../components/trips/TripForm';
import { ArrowLeft, Compass } from 'lucide-react';

export const CreateTripPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const trip = await tripService.createTrip(formData);
      navigate(`/trips/${trip._id || trip.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-forest-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-forest-800 text-sand-200 flex items-center justify-center shadow-md">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-forest-950">
            Create New Trip
          </h1>
          <p className="text-xs text-charcoal-500">
            Set your travel window, destination, and budget to generate your itinerary days.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Trip Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-sm">
        <TripForm onSubmit={handleCreate} loading={loading} submitLabel="Generate Itinerary" />
      </div>
    </div>
  );
};

export default CreateTripPage;
