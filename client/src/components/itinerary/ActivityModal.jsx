import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Clock, Wallet, MapPin, AlignLeft } from 'lucide-react';

const CATEGORIES = [
  'Sightseeing',
  'Food',
  'Accommodation',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Other',
];

export const ActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  activity = null,
  dayNumber = 1,
  totalDays = 1,
  currency = 'USD',
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      dayNumber: dayNumber || 1,
      category: 'Sightseeing',
      time: '',
      locationName: '',
      lat: '',
      lng: '',
      cost: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title || '',
        dayNumber: activity.dayNumber || dayNumber || 1,
        category: activity.category || 'Sightseeing',
        time: activity.time || '',
        locationName: activity.location?.name || '',
        lat: activity.location?.lat !== null && activity.location?.lat !== undefined ? activity.location.lat : '',
        lng: activity.location?.lng !== null && activity.location?.lng !== undefined ? activity.location.lng : '',
        cost: activity.cost !== undefined ? activity.cost : '',
        notes: activity.notes || '',
      });
    } else {
      reset({
        title: '',
        dayNumber: dayNumber || 1,
        category: 'Sightseeing',
        time: '',
        locationName: '',
        lat: '',
        lng: '',
        cost: '',
        notes: '',
      });
    }
  }, [activity, dayNumber, reset]);

  const onFormSubmit = (data) => {
    const payload = {
      title: data.title,
      dayNumber: Number(data.dayNumber),
      category: data.category,
      time: data.time || '',
      location: {
        name: data.locationName || '',
        lat: data.lat !== '' ? Number(data.lat) : null,
        lng: data.lng !== '' ? Number(data.lng) : null,
      },
      cost: data.cost !== '' ? Number(data.cost) : 0,
      notes: data.notes || '',
    };
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Activity' : 'Add Activity'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title */}
        <Input
          label="Activity Title"
          placeholder="e.g. Visit Senso-ji Temple"
          required
          {...register('title', {
            required: 'Activity title is required',
            maxLength: { value: 140, message: 'Max 140 characters' },
          })}
          error={errors.title?.message}
        />

        {/* Day & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Itinerary Day
            </label>
            <select
              {...register('dayNumber', { required: true })}
              className="w-full rounded-lg border border-sand-300 bg-white py-2.5 px-3 text-sm text-charcoal-900 focus:border-forest-700"
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full rounded-lg border border-sand-300 bg-white py-2.5 px-3 text-sm text-charcoal-900 focus:border-forest-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time & Estimated Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Time (Optional)"
            placeholder="09:30 or 14:00"
            icon={Clock}
            {...register('time')}
          />

          <Input
            label={`Estimated Cost (${currency})`}
            type="number"
            placeholder="0"
            step="any"
            icon={Wallet}
            {...register('cost', {
              min: { value: 0, message: 'Cost cannot be negative' },
            })}
            error={errors.cost?.message}
          />
        </div>

        {/* Location Name */}
        <Input
          label="Location Name"
          placeholder="e.g. Asakusa, Tokyo"
          icon={MapPin}
          {...register('locationName')}
        />

        {/* Optional Coordinates for Leaflet Map */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-sand-50 rounded-xl border border-sand-200">
          <div className="col-span-2 text-xs font-semibold text-charcoal-600">
            Map Coordinates (Optional, for Leaflet pin)
          </div>
          <Input
            placeholder="Latitude (e.g. 35.7148)"
            type="number"
            step="any"
            {...register('lat')}
          />
          <Input
            placeholder="Longitude (e.g. 139.7967)"
            type="number"
            step="any"
            {...register('lng')}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            Notes & Details
          </label>
          <textarea
            rows={3}
            placeholder="Booking confirmation, tips, what to bring..."
            className="w-full rounded-lg border border-sand-300 bg-white p-3 text-sm text-charcoal-900 focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
            {...register('notes', { maxLength: { value: 1000, message: 'Max 1000 characters' } })}
          />
          {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes.message}</p>}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-sand-200 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {activity ? 'Save Changes' : 'Add Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ActivityModal;
