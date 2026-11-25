import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/tripService';
import TripForm from '../components/trips/TripForm';
import Spinner from '../components/common/Spinner';
import { ArrowLeft, Edit3 } from 'lucide-react';

export const EditTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripService.getTripById(id);
        if (data.userRole !== 'owner') {
          navigate(`/trips/${id}`);
          return;
        }
        setTrip(data);
      } catch (err) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    setError(null);
    try {
      await tripService.updateTrip(id, formData);
      navigate(`/trips/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update trip');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-red-600">Trip not found or access denied.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-forest-800 underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/trips/${id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-forest-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Trip Details
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
          <Edit3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-forest-950">
            Edit Trip Settings
          </h1>
          <p className="text-xs text-charcoal-500">
            Modify destination, travel dates, or currency budget.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-sm">
        <TripForm
          initialValues={trip}
          onSubmit={handleUpdate}
          loading={saving}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
};

export default EditTripPage;
